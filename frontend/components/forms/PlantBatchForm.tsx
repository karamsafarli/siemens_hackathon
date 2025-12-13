'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { showToast } from '../ToastContainer';
import { plantBatchesApi, fieldsApi, DEMO_USER_ID } from '@/lib/api';
import type { PlantBatch, Field } from '@/lib/types';
import { Sprout, Save } from 'lucide-react';

interface PlantType {
    id: string;
    name: string;
    irrigation_frequency_days: number;
}

interface PlantBatchFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plantBatch?: PlantBatch | null;
    preselectedFieldId?: string;
}

export default function PlantBatchForm({
    isOpen,
    onClose,
    onSuccess,
    plantBatch,
    preselectedFieldId
}: PlantBatchFormProps) {
    const [batchName, setBatchName] = useState('');
    const [fieldId, setFieldId] = useState('');
    const [plantTypeId, setPlantTypeId] = useState('');
    const [plantingDate, setPlantingDate] = useState('');
    const [quantity, setQuantity] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fields, setFields] = useState<Field[]>([]);
    const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);

    const isEditing = !!plantBatch;

    useEffect(() => {
        if (isOpen) {
            loadFieldsAndTypes();
        }
    }, [isOpen]);

    useEffect(() => {
        if (plantBatch && plantTypes.length > 0) {
            setBatchName(plantBatch.batch_name);
            setFieldId(plantBatch.field_id);
            setPlantTypeId(plantBatch.plant_type_id);
            setPlantingDate(plantBatch.planting_date.split('T')[0]);
            setQuantity(plantBatch.quantity?.toString() || '');
        } else if (!plantBatch) {
            setBatchName('');
            setFieldId(preselectedFieldId || '');
            setPlantTypeId('');
            setPlantingDate(new Date().toISOString().split('T')[0]);
            setQuantity('');
        }
    }, [plantBatch, isOpen, preselectedFieldId, plantTypes]);

    const loadFieldsAndTypes = async () => {
        try {
            const [fieldsRes, typesRes] = await Promise.all([
                fieldsApi.getAll(DEMO_USER_ID),
                fetch(`${process.env.NEXT_PUBLIC_API_URL}/plant-batches/types`).then(r => r.json()).catch(() => [])
            ]);
            setFields(fieldsRes.data);

            // Use API response, they are real plant types from the database
            if (typesRes && Array.isArray(typesRes) && typesRes.length > 0) {
                setPlantTypes(typesRes);
            }
        } catch (error) {
            console.error('Error loading fields/types:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!batchName.trim() || !fieldId || !plantTypeId || !plantingDate) {
            showToast('error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            const data = {
                batch_name: batchName.trim(),
                field_id: fieldId,
                plant_type_id: plantTypeId,
                planting_date: plantingDate,
                quantity: quantity ? parseInt(quantity) : undefined,
                user_id: DEMO_USER_ID,
            };

            if (isEditing && plantBatch) {
                await plantBatchesApi.update(plantBatch.id, data);
                showToast('success', 'Plant batch updated successfully!');
            } else {
                await plantBatchesApi.create(data);
                showToast('success', 'Plant batch created successfully!');
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error saving plant batch:', error);
            showToast('error', error.response?.data?.error || 'Failed to save plant batch');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Plant Batch' : 'Add New Plant Batch'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Batch Name *
                        </label>
                        <input
                            type="text"
                            value={batchName}
                            onChange={(e) => setBatchName(e.target.value)}
                            placeholder="e.g., Spring Tomatoes 2024"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Field *
                        </label>
                        <select
                            value={fieldId}
                            onChange={(e) => setFieldId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                            required
                        >
                            <option value="">Select a field...</option>
                            {fields.map((field) => (
                                <option key={field.id} value={field.id}>{field.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Plant Type *
                        </label>
                        <select
                            value={plantTypeId}
                            onChange={(e) => setPlantTypeId(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                            required
                        >
                            <option value="">Select plant type...</option>
                            {plantTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name} (water every {type.irrigation_frequency_days} days)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Planting Date *
                        </label>
                        <input
                            type="date"
                            value={plantingDate}
                            onChange={(e) => setPlantingDate(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Quantity (number of plants)
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g., 100"
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
                                {isEditing ? 'Update Plant Batch' : 'Create Plant Batch'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
