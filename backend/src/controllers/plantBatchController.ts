import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get all plant types
export const getPlantTypes = async (req: Request, res: Response) => {
    try {
        const types = await prisma.plant_types.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(types);
    } catch (error) {
        console.error('Error fetching plant types:', error);
        res.status(500).json({ error: 'Failed to fetch plant types' });
    }
};

// Get all plant batches with filters
export const getPlantBatches = async (req: Request, res: Response) => {
    try {
        const { userId, fieldId, plantTypeId, status } = req.query;

        const where: any = {
            deleted_at: null,
        };

        if (fieldId) {
            where.field_id = fieldId as string;
        }

        if (plantTypeId) {
            where.plant_type_id = plantTypeId as string;
        }

        if (status) {
            where.current_status = status as string;
        }

        // If userId provided, filter by user's fields
        if (userId) {
            where.fields = {
                user_id: userId as string,
                deleted_at: null,
            };
        }

        const batches = await prisma.plant_batches.findMany({
            where,
            include: {
                fields: true,
                plant_types: true,
            },
            orderBy: { created_at: 'desc' },
        });

        res.json(batches);
    } catch (error) {
        console.error('Error fetching plant batches:', error);
        res.status(500).json({ error: 'Failed to fetch plant batches' });
    }
};

// Get single plant batch by ID
export const getPlantBatchById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const batch = await prisma.plant_batches.findUnique({
            where: { id },
            include: {
                fields: true,
                plant_types: true,
                status_history: {
                    orderBy: { changed_at: 'desc' },
                    take: 10,
                    include: {
                        users: {
                            select: { name: true, email: true },
                        },
                    },
                },
                irrigation_events: {
                    orderBy: { scheduled_date: 'desc' },
                    take: 10,
                },
                notes: {
                    where: { deleted_at: null },
                    orderBy: { created_at: 'desc' },
                    take: 10,
                    include: {
                        users: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
        });

        if (!batch || batch.deleted_at) {
            return res.status(404).json({ error: 'Plant batch not found' });
        }

        // Calculate irrigation status
        const irrigationStatus = calculateIrrigationStatus(
            batch.last_irrigation_date,
            batch.plant_types.irrigation_frequency_days
        );

        res.json({
            ...batch,
            irrigation_status: irrigationStatus,
        });
    } catch (error) {
        console.error('Error fetching plant batch:', error);
        res.status(500).json({ error: 'Failed to fetch plant batch' });
    }
};

// Create new plant batch
export const createPlantBatch = async (req: Request, res: Response) => {
    try {
        const {
            field_id,
            plant_type_id,
            batch_name,
            planting_date,
            quantity,
            user_id,
        } = req.body;

        if (!field_id || !plant_type_id || !batch_name || !planting_date) {
            return res.status(400).json({
                error: 'field_id, plant_type_id, batch_name, and planting_date are required',
            });
        }

        const batch = await prisma.plant_batches.create({
            data: {
                field_id,
                plant_type_id,
                batch_name,
                planting_date: new Date(planting_date),
                quantity,
                current_status: 'healthy',
            },
            include: {
                fields: true,
                plant_types: true,
            },
        });

        // Create initial status history entry
        if (user_id) {
            await prisma.status_history.create({
                data: {
                    plant_batch_id: batch.id,
                    status: 'healthy',
                    changed_by: user_id,
                    reason: 'Initial planting',
                },
            });
        }

        res.status(201).json(batch);
    } catch (error) {
        console.error('Error creating plant batch:', error);
        res.status(500).json({ error: 'Failed to create plant batch' });
    }
};

// Update plant batch
export const updatePlantBatch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { batch_name, quantity, planting_date } = req.body;

        const batch = await prisma.plant_batches.update({
            where: { id },
            data: {
                batch_name,
                quantity,
                planting_date: planting_date ? new Date(planting_date) : undefined,
                updated_at: new Date(),
            },
            include: {
                fields: true,
                plant_types: true,
            },
        });

        res.json(batch);
    } catch (error) {
        console.error('Error updating plant batch:', error);
        res.status(500).json({ error: 'Failed to update plant batch' });
    }
};

// Update plant batch status
export const updatePlantBatchStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, user_id, reason, severity } = req.body;

        if (!status || !user_id) {
            return res.status(400).json({ error: 'status and user_id are required' });
        }

        // Get current batch
        const currentBatch = await prisma.plant_batches.findUnique({
            where: { id },
        });

        if (!currentBatch) {
            return res.status(404).json({ error: 'Plant batch not found' });
        }

        // Update batch status
        const batch = await prisma.plant_batches.update({
            where: { id },
            data: {
                current_status: status,
                updated_at: new Date(),
            },
        });

        // Create status history entry
        await prisma.status_history.create({
            data: {
                plant_batch_id: id,
                status,
                previous_status: currentBatch.current_status,
                changed_by: user_id,
                reason,
                severity,
            },
        });

        res.json(batch);
    } catch (error) {
        console.error('Error updating plant batch status:', error);
        res.status(500).json({ error: 'Failed to update plant batch status' });
    }
};

// Soft delete plant batch
export const deletePlantBatch = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const batch = await prisma.plant_batches.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });

        res.json({ message: 'Plant batch deleted successfully', batch });
    } catch (error) {
        console.error('Error deleting plant batch:', error);
        res.status(500).json({ error: 'Failed to delete plant batch' });
    }
};

// Helper function to calculate irrigation status
function calculateIrrigationStatus(
    lastIrrigationDate: Date | null,
    frequencyDays: number
): {
    next_due_date: Date | null;
    days_overdue: number;
    status: 'on_time' | 'overdue' | 'critical';
} {
    if (!lastIrrigationDate) {
        return {
            next_due_date: null,
            days_overdue: 0,
            status: 'critical',
        };
    }

    const nextDueDate = new Date(lastIrrigationDate);
    nextDueDate.setDate(nextDueDate.getDate() + frequencyDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    nextDueDate.setHours(0, 0, 0, 0);

    const daysOverdue = Math.floor(
        (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let status: 'on_time' | 'overdue' | 'critical' = 'on_time';
    if (daysOverdue > 0 && daysOverdue <= 2) {
        status = 'overdue';
    } else if (daysOverdue > 2) {
        status = 'critical';
    }

    return {
        next_due_date: nextDueDate,
        days_overdue: Math.max(0, daysOverdue),
        status,
    };
}
