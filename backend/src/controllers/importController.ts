import { Request, Response } from 'express';
import prisma from '../config/prisma';

interface ImportRecord {
    date: string;
    field_name: string;
    plant_name?: string;
    plant_type?: string;
    event_type: 'irrigation' | 'observation' | 'problem' | 'status_change';
    note?: string;
    status?: string;
}

// Helper function to parse date string as local time with current time
function parseLocalDateTime(dateStr: string): Date {
    const now = new Date();
    // Parse the date parts
    const [year, month, day] = dateStr.split('-').map(Number);
    // Create date with current local time
    return new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());
}

export const importData = async (req: Request, res: Response) => {
    try {
        const { user_id, records } = req.body;

        if (!user_id || !records || !Array.isArray(records)) {
            return res.status(400).json({
                error: 'user_id and records array are required',
            });
        }

        // Create import job
        const importJob = await prisma.import_jobs.create({
            data: {
                created_by: user_id,
                status: 'processing',
                total_records: records.length,
                successful_records: 0,
                failed_records: 0,
                error_log: [],
            },
        });

        const errors: any[] = [];
        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < records.length; i++) {
            const record: ImportRecord = records[i];

            try {
                // Validate required fields
                if (!record.date || !record.field_name || !record.event_type) {
                    throw new Error(`Record ${i + 1}: Missing required fields (date, field_name, event_type)`);
                }

                // Find or create field
                let field = await prisma.fields.findFirst({
                    where: {
                        user_id,
                        name: record.field_name,
                        deleted_at: null,
                    },
                });

                if (!field) {
                    field = await prisma.fields.create({
                        data: {
                            user_id,
                            name: record.field_name,
                        },
                    });
                }

                // Find or create plant batch if plant info provided
                let plantBatch = null;
                if (record.plant_name || record.plant_type) {
                    // Find plant type
                    let plantType = await prisma.plant_types.findFirst({
                        where: {
                            name: record.plant_type || 'Unknown',
                        },
                    });

                    if (!plantType) {
                        plantType = await prisma.plant_types.create({
                            data: {
                                name: record.plant_type || 'Unknown',
                                irrigation_frequency_days: 7, // Default
                            },
                        });
                    }

                    // Check for existing plant batch with same name, field, and type (conflict resolution)
                    plantBatch = await prisma.plant_batches.findFirst({
                        where: {
                            field_id: field.id,
                            batch_name: record.plant_name || `${record.plant_type} Batch`,
                            plant_type_id: plantType.id,
                            deleted_at: null,
                        },
                    });

                    if (!plantBatch) {
                        plantBatch = await prisma.plant_batches.create({
                            data: {
                                field_id: field.id,
                                plant_type_id: plantType.id,
                                batch_name: record.plant_name || `${record.plant_type} Batch`,
                                planting_date: parseLocalDateTime(record.date),
                            },
                        });
                    }
                }

                // Process based on event type
                switch (record.event_type) {
                    case 'irrigation':
                        if (plantBatch) {
                            // Check for duplicate irrigation on same date
                            const existingIrrigation = await prisma.irrigation_events.findFirst({
                                where: {
                                    plant_batch_id: plantBatch.id,
                                    scheduled_date: parseLocalDateTime(record.date),
                                },
                            });

                            if (!existingIrrigation) {
                                await prisma.irrigation_events.create({
                                    data: {
                                        plant_batch_id: plantBatch.id,
                                        created_by: user_id,
                                        scheduled_date: parseLocalDateTime(record.date),
                                        executed_date: parseLocalDateTime(record.date),
                                        status: 'completed',
                                        method: 'imported',
                                        notes: record.note,
                                    },
                                });

                                // Update last irrigation date
                                await prisma.plant_batches.update({
                                    where: { id: plantBatch.id },
                                    data: { last_irrigation_date: parseLocalDateTime(record.date) },
                                });
                            } else {
                                throw new Error(`Record ${i + 1}: Duplicate irrigation event for ${plantBatch.batch_name} on ${record.date}`);
                            }
                        }
                        break;

                    case 'observation':
                    case 'problem':
                        if (plantBatch) {
                            await prisma.notes.create({
                                data: {
                                    plant_batch_id: plantBatch.id,
                                    created_by: user_id,
                                    note_type: record.event_type === 'problem' ? 'disease' : 'observation',
                                    content: record.note || 'Imported observation',
                                    created_at: parseLocalDateTime(record.date),
                                },
                            });
                        }
                        break;

                    case 'status_change':
                        if (plantBatch && record.status) {
                            const previousStatus = plantBatch.current_status;

                            // Only update if status is different
                            if (previousStatus !== record.status) {
                                await prisma.plant_batches.update({
                                    where: { id: plantBatch.id },
                                    data: { current_status: record.status },
                                });

                                await prisma.status_history.create({
                                    data: {
                                        plant_batch_id: plantBatch.id,
                                        changed_by: user_id,
                                        status: record.status,
                                        previous_status: previousStatus,
                                        reason: record.note || 'Imported status change',
                                        changed_at: parseLocalDateTime(record.date),
                                    },
                                });
                            }
                        }
                        break;
                }

                successCount++;
            } catch (error: any) {
                failCount++;
                errors.push({
                    record_index: i,
                    record,
                    error: error.message,
                });
            }
        }

        // Update import job with results
        await prisma.import_jobs.update({
            where: { id: importJob.id },
            data: {
                status: errors.length === 0 ? 'completed' : 'completed_with_errors',
                successful_records: successCount,
                failed_records: failCount,
                error_log: errors,
                completed_at: new Date(),
            },
        });

        res.json({
            import_job_id: importJob.id,
            total_records: records.length,
            successful_records: successCount,
            failed_records: failCount,
            errors: errors.slice(0, 10), // Return first 10 errors
        });
    } catch (error) {
        console.error('Error importing data:', error);
        res.status(500).json({ error: 'Failed to import data' });
    }
};

export const getImportJobs = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        const jobs = await prisma.import_jobs.findMany({
            where: {
                ...(userId && { created_by: userId as string }),
            },
            orderBy: { created_at: 'desc' },
            include: {
                users: {
                    select: { name: true, email: true },
                },
            },
        });

        res.json(jobs);
    } catch (error) {
        console.error('Error fetching import jobs:', error);
        res.status(500).json({ error: 'Failed to fetch import jobs' });
    }
};

export const getImportJobById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const job = await prisma.import_jobs.findUnique({
            where: { id },
            include: {
                users: {
                    select: { name: true, email: true },
                },
            },
        });

        if (!job) {
            return res.status(404).json({ error: 'Import job not found' });
        }

        res.json(job);
    } catch (error) {
        console.error('Error fetching import job:', error);
        res.status(500).json({ error: 'Failed to fetch import job' });
    }
};
