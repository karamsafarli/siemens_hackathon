'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { showToast } from '../ToastContainer';
import { fieldsApi, DEMO_USER_ID } from '@/lib/api';
import type { Field } from '@/lib/types';
import { MapPin, Save } from 'lucide-react';

interface FieldFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    field?: Field | null; // If provided, we're editing
}

export default function FieldForm({ isOpen, onClose, onSuccess, field }: FieldFormProps) {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [sizeHectares, setSizeHectares] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isEditing = !!field;

    useEffect(() => {
        if (field) {
            setName(field.name);
            setLocation(field.location || '');
            setSizeHectares(field.size_hectares?.toString() || '');
        } else {
            setName('');
            setLocation('');
            setSizeHectares('');
        }
    }, [field, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            showToast('error', 'Field name is required');
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                name: name.trim(),
                location: location.trim() || undefined,
                size_hectares: sizeHectares ? parseFloat(sizeHectares) : undefined,
                user_id: DEMO_USER_ID,
            };

            if (isEditing && field) {
                await fieldsApi.update(field.id, data);
                showToast('success', 'Field updated successfully!');
            } else {
                await fieldsApi.create(data);
                showToast('success', 'Field created successfully!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving field:', error);
            showToast('error', error.response?.data?.error || 'Failed to save field');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Field' : 'Add New Field'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Field Name *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., North Field, Greenhouse A"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Location
                    </label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., East side of property"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Size (hectares)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={sizeHectares}
                        onChange={(e) => setSizeHectares(e.target.value)}
                        placeholder="e.g., 2.5"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
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
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                {isEditing ? 'Update Field' : 'Create Field'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
