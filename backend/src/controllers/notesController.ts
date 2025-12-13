import { Request, Response } from 'express';
import prisma from '../config/prisma';

// Get notes for a plant batch
export const getNotes = async (req: Request, res: Response) => {
    try {
        const { plantBatchId, noteType } = req.query;

        const where: any = {
            deleted_at: null,
        };

        if (plantBatchId) {
            where.plant_batch_id = plantBatchId as string;
        }

        if (noteType) {
            where.note_type = noteType as string;
        }

        const notes = await prisma.notes.findMany({
            where,
            include: {
                users: {
                    select: { name: true, email: true },
                },
                plant_batches: {
                    select: {
                        batch_name: true,
                        fields: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: { created_at: 'desc' },
        });

        res.json(notes);
    } catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

// Create note
export const createNote = async (req: Request, res: Response) => {
    try {
        const {
            plant_batch_id,
            note_type,
            content,
            linked_event_type,
            linked_event_id,
            user_id,
        } = req.body;

        if (!plant_batch_id || !note_type || !content || !user_id) {
            return res.status(400).json({
                error: 'plant_batch_id, note_type, content, and user_id are required',
            });
        }

        const note = await prisma.notes.create({
            data: {
                plant_batch_id,
                note_type,
                content,
                linked_event_type,
                linked_event_id,
                created_by: user_id,
            },
            include: {
                users: {
                    select: { name: true, email: true },
                },
            },
        });

        res.status(201).json(note);
    } catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
};

// Update note
export const updateNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { content, note_type } = req.body;

        const note = await prisma.notes.update({
            where: { id },
            data: {
                content,
                note_type,
                edited_at: new Date(),
            },
        });

        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

// Soft delete note
export const deleteNote = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const note = await prisma.notes.update({
            where: { id },
            data: {
                deleted_at: new Date(),
            },
        });

        res.json({ message: 'Note deleted successfully', note });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};
