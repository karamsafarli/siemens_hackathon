'use client';

import { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { showToast } from '../ToastContainer';
import { plantBatchesApi, DEMO_USER_ID } from '@/lib/api';
import { Activity, Save } from 'lucide-react';

interface StatusUpdateFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plantBatchId: string;
    currentStatus: string;
    batchName: string;
}

const STATUS_OPTIONS = [
    { value: 'healthy', label: 'Healthy', color: 'bg-emerald-500' },
    { value: 'at_risk', label: 'At Risk', color: 'bg-amber-500' },
    { value: 'critical', label: 'Critical', color: 'bg-rose-500' },
    { value: 'diseased', label: 'Diseased', color: 'bg-red-600' },
];

export default function StatusUpdateForm({
    isOpen,
    onClose,
    onSuccess,
    plantBatchId,
    currentStatus,
    batchName
}: StatusUpdateFormProps) {
    const [status, setStatus] = useState(currentStatus);
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setStatus(currentStatus);
            setReason('');
        }
    }, [isOpen, currentStatus]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!status) {
            showToast('error', 'Please select a status');
            return;
        }

        if (status !== currentStatus && !reason.trim()) {
            showToast('error', 'Please provide a reason for the status change');
            return;
        }

        setIsLoading(true);
        try {
            await plantBatchesApi.updateStatus(plantBatchId, {
                status,
                reason: reason.trim(),
                user_id: DEMO_USER_ID,
            });

            showToast('success', 'Plant status updated successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error updating status:', error);
            showToast('error', error.response?.data?.error || 'Failed to update status');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Update Plant Status"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-600">Updating status for:</p>
                    <p className="font-semibold text-slate-900">{batchName}</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                        New Status *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setStatus(option.value)}
                                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${status === option.value
                                        ? 'border-emerald-500 bg-emerald-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full ${option.color}`} />
                                <span className={`font-medium ${status === option.value ? 'text-emerald-700' : 'text-slate-700'
                                    }`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {status !== currentStatus && (
                    <div>
                        <label className="block text-sm font-semibold text-slate-900 mb-2">
                            Reason for Change *
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Describe why the status is changing..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-none"
                            required={status !== currentStatus}
                        />
                    </div>
                )}

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
                        disabled={isLoading || (status === currentStatus)}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Updating...
                            </>
                        ) : (
                            <>
                                <Activity className="w-4 h-4" />
                                Update Status
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
