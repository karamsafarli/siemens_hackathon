import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get all fields for a user
export const getFields = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const fields = await prisma.fields.findMany({
            where: {
                user_id: userId,
                deleted_at: null, // Only active fields
            },
            include: {
                plant_batches: {
                    where: { deleted_at: null },
                    select: { id: true },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        // Add plant count to each field
        const fieldsWithCount = fields.map((field: any) => ({
            ...field,
            plant_count: field.plant_batches.length,
            plant_batches: undefined, // Remove the array, just keep count
        }));

        res.json(fieldsWithCount);
    } catch (error) {
        console.error('Error fetching fields:', error);
        res.status(500).json({ error: 'Failed to fetch fields' });
    }
};

// Get single field by ID
export const getFieldById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const field = await prisma.fields.findUnique({
            where: { id },
            include: {
                plant_batches: {
                    where: { deleted_at: null },
                    include: {
                        plant_types: true,
                    },
                },
            },
        });

        if (!field || field.deleted_at) {
            return res.status(404).json({ error: 'Field not found' });
        }

        res.json(field);
    } catch (error) {
        console.error('Error fetching field:', error);
        res.status(500).json({ error: 'Failed to fetch field' });
    }
};

// Create new field
export const createField = async (req: Request, res: Response) => {
    try {
        const { user_id, name, location, size_hectares } = req.body;

        if (!user_id || !name) {
            return res.status(400).json({ error: 'user_id and name are required' });
        }

        const field = await prisma.fields.create({
            data: {
                user_id,
                name,
                location,
                size_hectares,
            },
        });

        res.status(201).json(field);
    } catch (error) {
        console.error('Error creating field:', error);
        res.status(500).json({ error: 'Failed to create field' });
    }
};

// Update field
export const updateField = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, location, size_hectares } = req.body;

        const field = await prisma.fields.update({
            where: { id },
            data: {
                name,
                location,
                size_hectares,
                updated_at: new Date(),
            },
        });

        res.json(field);
    } catch (error) {
        console.error('Error updating field:', error);
        res.status(500).json({ error: 'Failed to update field' });
    }
};

// Soft delete field
export const deleteField = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const field = await prisma.fields.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });

        res.json({ message: 'Field deleted successfully', field });
    } catch (error) {
        console.error('Error deleting field:', error);
        res.status(500).json({ error: 'Failed to delete field' });
    }
};
