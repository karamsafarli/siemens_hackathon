import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get irrigation events for a plant batch
export const getIrrigationEvents = async (req: Request, res: Response) => {
    try {
        const { plantBatchId } = req.query;

        if (!plantBatchId) {
            return res.status(400).json({ error: 'plantBatchId is required' });
        }

        const events = await prisma.irrigation_events.findMany({
            where: {
                plant_batch_id: plantBatchId as string,
            },
            include: {
                users: {
                    select: { name: true, email: true },
                },
            },
            orderBy: { scheduled_date: 'desc' },
        });

        res.json(events);
    } catch (error) {
        console.error('Error fetching irrigation events:', error);
        res.status(500).json({ error: 'Failed to fetch irrigation events' });
    }
};

// Create irrigation event
export const createIrrigationEvent = async (req: Request, res: Response) => {
    try {
        const {
            plant_batch_id,
            scheduled_date,
            executed_date,
            water_amount_liters,
            method,
            notes,
            user_id,
            status,
        } = req.body;

        if (!plant_batch_id || !scheduled_date || !user_id) {
            return res.status(400).json({
                error: 'plant_batch_id, scheduled_date, and user_id are required',
            });
        }

        // Determine if this is an immediate watering (has executed_date) or a scheduled one
        const isCompleted = !!executed_date || status === 'completed';
        const finalStatus = isCompleted ? 'completed' : 'planned';
        const finalExecutedDate = executed_date ? new Date(executed_date) : (isCompleted ? new Date() : null);

        const event = await prisma.irrigation_events.create({
            data: {
                plant_batch_id,
                scheduled_date: new Date(scheduled_date),
                executed_date: finalExecutedDate,
                water_amount_liters,
                method,
                notes,
                created_by: user_id,
                status: finalStatus,
            },
        });

        // If this is a completed irrigation, update the plant's last_irrigation_date
        if (isCompleted && finalExecutedDate) {
            await prisma.plant_batches.update({
                where: { id: plant_batch_id },
                data: {
                    last_irrigation_date: finalExecutedDate,
                },
            });
        }

        res.status(201).json(event);
    } catch (error) {
        console.error('Error creating irrigation event:', error);
        res.status(500).json({ error: 'Failed to create irrigation event' });
    }
};

// Mark irrigation as completed
export const completeIrrigation = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { executed_date, water_amount_liters, notes } = req.body;

        const event = await prisma.irrigation_events.update({
            where: { id },
            data: {
                executed_date: executed_date ? new Date(executed_date) : new Date(),
                status: 'completed',
                water_amount_liters,
                notes,
            },
        });

        // Update plant batch last irrigation date
        await prisma.plant_batches.update({
            where: { id: event.plant_batch_id },
            data: {
                last_irrigation_date: event.executed_date,
            },
        });

        res.json(event);
    } catch (error) {
        console.error('Error completing irrigation:', error);
        res.status(500).json({ error: 'Failed to complete irrigation' });
    }
};

// Get overdue irrigation list
export const getOverdueIrrigation = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        // Get all active plant batches with their plant types
        const batches = await prisma.plant_batches.findMany({
            where: {
                deleted_at: null,
                ...(userId && {
                    fields: {
                        user_id: userId as string,
                        deleted_at: null,
                    },
                }),
            },
            include: {
                fields: true,
                plant_types: true,
            },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdueBatches = batches
            .map((batch: any) => {
                if (!batch.last_irrigation_date) {
                    return {
                        ...batch,
                        days_overdue: 999, // Never irrigated
                        severity: 'critical' as const,
                    };
                }

                const nextDueDate = new Date(batch.last_irrigation_date);
                nextDueDate.setDate(
                    nextDueDate.getDate() + batch.plant_types.irrigation_frequency_days
                );
                nextDueDate.setHours(0, 0, 0, 0);

                const daysOverdue = Math.floor(
                    (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysOverdue <= 0) return null;

                return {
                    ...batch,
                    days_overdue: daysOverdue,
                    severity: daysOverdue > 2 ? ('critical' as const) : ('overdue' as const),
                };
            })
            .filter((batch: any) => batch !== null)
            .sort((a: any, b: any) => b!.days_overdue - a!.days_overdue);

        res.json(overdueBatches);
    } catch (error) {
        console.error('Error fetching overdue irrigation:', error);
        res.status(500).json({ error: 'Failed to fetch overdue irrigation' });
    }
};
