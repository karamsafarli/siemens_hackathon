import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get dashboard statistics
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Total plant batches
        const totalPlants = await prisma.plant_batches.count({
            where: {
                deleted_at: null,
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
        });

        // Plants by status
        const plantsByStatus = await prisma.plant_batches.groupBy({
            by: ['current_status'],
            where: {
                deleted_at: null,
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
            _count: true,
        });

        // Plants by field
        const plantsByField = await prisma.plant_batches.groupBy({
            by: ['field_id'],
            where: {
                deleted_at: null,
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
            _count: true,
        });

        // Get field names
        const fields = await prisma.fields.findMany({
            where: {
                user_id: userId as string,
                deleted_at: null,
            },
            select: {
                id: true,
                name: true,
            },
        });

        const fieldMap = new Map(fields.map((f: any) => [f.id, f.name]));

        const plantsByFieldWithNames = plantsByField.map((item: any) => ({
            field_id: item.field_id,
            field_name: fieldMap.get(item.field_id) || 'Unknown',
            count: item._count,
        }));

        // Calculate overdue irrigation
        const batches = await prisma.plant_batches.findMany({
            where: {
                deleted_at: null,
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
            include: {
                plant_types: true,
            },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let overdueCount = 0;
        let criticalCount = 0;

        batches.forEach((batch: any) => {
            if (!batch.last_irrigation_date) {
                criticalCount++;
                return;
            }

            const nextDueDate = new Date(batch.last_irrigation_date);
            nextDueDate.setDate(
                nextDueDate.getDate() + batch.plant_types.irrigation_frequency_days
            );
            nextDueDate.setHours(0, 0, 0, 0);

            const daysOverdue = Math.floor(
                (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysOverdue > 0 && daysOverdue <= 2) {
                overdueCount++;
            } else if (daysOverdue > 2) {
                criticalCount++;
            }
        });

        // Problem plants (not healthy)
        const problemPlants = await prisma.plant_batches.count({
            where: {
                deleted_at: null,
                current_status: {
                    not: 'healthy',
                },
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
        });

        // Recent activity
        const recentNotes = await prisma.notes.count({
            where: {
                deleted_at: null,
                created_at: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                },
                plant_batches: {
                    fields: {
                        user_id: userId as string,
                    },
                },
            },
        });

        res.json({
            total_plants: totalPlants,
            plants_by_status: plantsByStatus,
            plants_by_field: plantsByFieldWithNames,
            irrigation: {
                overdue: overdueCount,
                critical: criticalCount,
                total_overdue: overdueCount + criticalCount,
            },
            problem_plants: problemPlants,
            recent_activity: {
                notes_last_7_days: recentNotes,
            },
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// Get recent alerts
export const getRecentAlerts = async (req: Request, res: Response) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const alerts: any[] = [];

        // Get overdue irrigation
        const batches = await prisma.plant_batches.findMany({
            where: {
                deleted_at: null,
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
            include: {
                plant_types: true,
                fields: true,
            },
            take: 50,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        batches.forEach((batch: any) => {
            if (!batch.last_irrigation_date) {
                alerts.push({
                    type: 'irrigation',
                    severity: 'critical',
                    message: `${batch.batch_name} in ${batch.fields.name} has never been irrigated`,
                    plant_batch_id: batch.id,
                    batch_name: batch.batch_name,
                    field_name: batch.fields.name,
                });
                return;
            }

            const nextDueDate = new Date(batch.last_irrigation_date);
            nextDueDate.setDate(
                nextDueDate.getDate() + batch.plant_types.irrigation_frequency_days
            );
            nextDueDate.setHours(0, 0, 0, 0);

            const daysOverdue = Math.floor(
                (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysOverdue > 2) {
                alerts.push({
                    type: 'irrigation',
                    severity: 'critical',
                    message: `${batch.batch_name} in ${batch.fields.name} is ${daysOverdue} days overdue for irrigation`,
                    plant_batch_id: batch.id,
                    batch_name: batch.batch_name,
                    field_name: batch.fields.name,
                    days_overdue: daysOverdue,
                });
            } else if (daysOverdue > 0) {
                alerts.push({
                    type: 'irrigation',
                    severity: 'warning',
                    message: `${batch.batch_name} in ${batch.fields.name} is ${daysOverdue} days overdue for irrigation`,
                    plant_batch_id: batch.id,
                    batch_name: batch.batch_name,
                    field_name: batch.fields.name,
                    days_overdue: daysOverdue,
                });
            }
        });

        // Get problem plants
        const problemBatches = await prisma.plant_batches.findMany({
            where: {
                deleted_at: null,
                current_status: {
                    in: ['at_risk', 'critical', 'diseased'],
                },
                fields: {
                    user_id: userId as string,
                    deleted_at: null,
                },
            },
            include: {
                fields: true,
            },
            take: 20,
        });

        problemBatches.forEach((batch: any) => {
            alerts.push({
                type: 'status',
                severity: batch.current_status === 'critical' || batch.current_status === 'diseased' ? 'critical' : 'warning',
                message: `${batch.batch_name} in ${batch.fields.name} has status: ${batch.current_status}`,
                plant_batch_id: batch.id,
                batch_name: batch.batch_name,
                field_name: batch.fields.name,
                status: batch.current_status,
            });
        });

        // Sort by severity
        const severityOrder: any = { critical: 0, warning: 1, info: 2 };
        alerts.sort((a: any, b: any) => severityOrder[a.severity] - severityOrder[b.severity]);

        res.json(alerts.slice(0, 20)); // Return top 20 alerts
    } catch (error) {
        console.error('Error fetching recent alerts:', error);
        res.status(500).json({ error: 'Failed to fetch recent alerts' });
    }
};
