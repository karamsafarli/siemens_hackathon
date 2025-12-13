'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { showToast } from '../ToastContainer';
import { irrigationApi, plantBatchesApi, DEMO_USER_ID } from '@/lib/api';
import type { PlantBatch } from '@/lib/types';
import { Calendar, Droplets, Save } from 'lucide-react';

interface ScheduleIrrigationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preselectedPlantBatchId?: string;
}

export default function ScheduleIrrigationForm({
    isOpen,
    onClose,
    onSuccess,
    preselectedPlantBatchId
}: ScheduleIrrigationFormProps) {
    const [plantBatchId, setPlantBatchId] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [waterAmount, setWaterAmount] = useState('');
    const [method, setMethod] = useState('drip');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [plantBatches, setPlantBatches] = useState<PlantBatch[]>([]);

    useEffect(() => {
        if (isOpen) {
            loadPlantBatches();
            // Set default date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    useEffect(() => {
        setPlantBatchId(preselectedPlantBatchId || '');
        setWaterAmount('');
        setMethod('drip');
        setNotes('');
    }, [isOpen, preselectedPlantBatchId]);

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

        if (!plantBatchId || !scheduledDate) {
            showToast('error', 'Please select a plant batch and date');
            return;
        }

        setIsLoading(true);
        try {
            await irrigationApi.create({
                plant_batch_id: plantBatchId,
                user_id: DEMO_USER_ID,
                scheduled_date: scheduledDate,
                water_amount_liters: waterAmount ? parseFloat(waterAmount) : undefined,
                method,
                notes: notes.trim() || undefined,
            });

            showToast('success', 'Irrigation scheduled successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error scheduling irrigation:', error);
            showToast('error', error.response?.data?.error || 'Failed to schedule irrigation');
        } finally {
            setIsLoading(false);
        }
    };

    const METHODS = [
        { value: 'drip', label: 'Drip Irrigation' },
        { value: 'sprinkler', label: 'Sprinkler' },
        { value: 'manual', label: 'Manual Watering' },
        { value: 'flood', label: 'Flood Irrigation' },
        { value: 'other', label: 'Other' },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Schedule Irrigation"
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Plant Batch *
                    </label>
                    <select
                        value={plantBatchId}
                        onChange={(e) => setPlantBatchId(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900"
                        required
                    >
                        <option value="">Select a plant batch...</option>
                        {plantBatches.map((batch) => (
                            <option key={batch.id} value={batch.id}>
                                {batch.batch_name} ({batch.fields?.name})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Scheduled Date *
                        </label>
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            <Droplets className="w-4 h-4 inline mr-1" />
                            Water Amount (liters)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={waterAmount}
                            onChange={(e) => setWaterAmount(e.target.value)}
                            placeholder="e.g., 50"
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Irrigation Method
                    </label>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900"
                    >
                        {METHODS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional notes..."
                        rows={3}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none"
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
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Scheduling...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Schedule Irrigation
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
