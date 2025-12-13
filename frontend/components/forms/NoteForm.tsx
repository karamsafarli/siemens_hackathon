'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { showToast } from '../ToastContainer';
import { notesApi, plantBatchesApi, DEMO_USER_ID } from '@/lib/api';
import type { Note, PlantBatch } from '@/lib/types';
import { FileText, Save } from 'lucide-react';

interface NoteFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    note?: Note | null;
    preselectedPlantBatchId?: string;
}

const NOTE_TYPES = [
    { value: 'observation', label: 'General Observation' },
    { value: 'irrigation', label: 'Irrigation' },
    { value: 'disease', label: 'Disease/Pest' },
    { value: 'fertilizer', label: 'Fertilizer' },
    { value: 'harvest', label: 'Harvest' },
    { value: 'weather', label: 'Weather' },
    { value: 'maintenance', label: 'Maintenance' },
];

export default function NoteForm({
    isOpen,
    onClose,
    onSuccess,
    note,
    preselectedPlantBatchId
}: NoteFormProps) {
    const [plantBatchId, setPlantBatchId] = useState('');
    const [noteType, setNoteType] = useState('observation');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [plantBatches, setPlantBatches] = useState<PlantBatch[]>([]);

    const isEditing = !!note;

    useEffect(() => {
        if (isOpen) {
            loadPlantBatches();
        }
    }, [isOpen]);

    useEffect(() => {
        if (note) {
            setPlantBatchId(note.plant_batch_id);
            setNoteType(note.note_type);
            setContent(note.content);
        } else {
            setPlantBatchId(preselectedPlantBatchId || '');
            setNoteType('observation');
            setContent('');
        }
    }, [note, isOpen, preselectedPlantBatchId]);

    const loadPlantBatches = async () => {
        try {
            const response = await plantBatchesApi.getAll({ userId: DEMO_USER_ID });
            setPlantBatches(response.data);
        } catch (error) {
            console.error('Error loading plant batches:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!plantBatchId || !noteType || !content.trim()) {
            showToast('error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                plant_batch_id: plantBatchId,
                note_type: noteType,
                content: content.trim(),
                user_id: DEMO_USER_ID,
            };

            if (isEditing && note) {
                await notesApi.update(note.id, data);
                showToast('success', 'Note updated successfully!');
            } else {
                await notesApi.create(data);
                showToast('success', 'Note created successfully!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving note:', error);
            showToast('error', error.response?.data?.error || 'Failed to save note');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Note' : 'Add New Note'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Plant Batch *
                        </label>
                        <select
                            value={plantBatchId}
                            onChange={(e) => setPlantBatchId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                            required
                            disabled={isEditing}
                        >
                            <option value="">Select a plant batch...</option>
                            {plantBatches.map((batch) => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.batch_name} ({batch.fields?.name})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Note Type *
                        </label>
                        <select
                            value={noteType}
                            onChange={(e) => setNoteType(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                            required
                        >
                            {NOTE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Content *
                    </label>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your observation or note here..."
                        rows={5}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                        required
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:from-violet-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Update Note' : 'Add Note'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
