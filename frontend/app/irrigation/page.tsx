'use client';

import { useEffect, useState } from 'react';
import { irrigationApi, DEMO_USER_ID } from '@/lib/api';
import Link from 'next/link';
import { Droplets, ArrowLeft, AlertTriangle, CheckCircle2, Plus, History } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';
import ScheduleIrrigationForm from '@/components/forms/ScheduleIrrigationForm';

interface OverduePlant {
    id: string;
    batch_name: string;
    days_overdue: number;
    severity: 'overdue' | 'critical';
    fields: { name: string };
    plant_types: { name: string; irrigation_frequency_days: number };
    last_irrigation_date: string | null;
}

export default function IrrigationPage() {
    const [overduePlants, setOverduePlants] = useState<OverduePlant[]>([]);
    const [loading, setLoading] = useState(true);
    const [wateringPlant, setWateringPlant] = useState<string | null>(null);
    const [showScheduleForm, setShowScheduleForm] = useState(false);

    const fetchOverdue = async () => {
        try {
            const response = await irrigationApi.getOverdue(DEMO_USER_ID);
            setOverduePlants(response.data);
        } catch (error) {
            console.error('Error fetching overdue irrigation:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOverdue();
    }, []);

    const handleMarkAsWatered = async (plantBatchId: string) => {
        setWateringPlant(plantBatchId);
        try {
            await irrigationApi.create({
                plant_batch_id: plantBatchId,
                user_id: DEMO_USER_ID,
                scheduled_date: new Date().toISOString(),
                executed_date: new Date().toISOString(),
                water_amount_liters: 0,
                method: 'manual',
                status: 'completed',
            });

            await fetchOverdue();
            showToast('success', 'Plant watered successfully!');
        } catch (error: any) {
            console.error('Error marking as watered:', error);
            showToast('error', error.response?.data?.error || 'Failed to mark as watered.');
        } finally {
            setWateringPlant(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-slate-700">Loading irrigation schedule...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                                    <Droplets className="w-6 h-6 text-white" />
                                </div>
                                Irrigation Schedule
                            </h1>
                            <p className="text-slate-600 mt-1">Monitor irrigation status and water your plants on time</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowScheduleForm(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Schedule Irrigation
                            </button>
                            <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Overdue</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {overduePlants.filter(p => p.severity === 'overdue').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-rose-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Critical</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {overduePlants.filter(p => p.severity === 'critical').length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Needing Water</p>
                                <p className="text-2xl font-bold text-slate-900">{overduePlants.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {overduePlants.length > 0 ? (
                    <div className="space-y-4">
                        {overduePlants.map((plant) => (
                            <div
                                key={plant.id}
                                className={`bg-white rounded-2xl shadow-sm border-l-4 p-6 ${plant.severity === 'critical'
                                    ? 'border-rose-500'
                                    : 'border-amber-500'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plant.severity === 'critical'
                                                ? 'bg-rose-100'
                                                : 'bg-amber-100'
                                                }`}>
                                                <AlertTriangle className={`w-5 h-5 ${plant.severity === 'critical'
                                                    ? 'text-rose-600'
                                                    : 'text-amber-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900">{plant.batch_name}</h3>
                                                <p className="text-sm text-slate-600">{plant.plant_types.name}</p>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${plant.severity === 'critical'
                                                ? 'bg-rose-100 text-rose-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {plant.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ OVERDUE'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-600 mb-1">Field</p>
                                                <p className="font-semibold text-slate-900 text-sm">{plant.fields.name}</p>
                                            </div>
                                            <div className="p-3 bg-rose-50 rounded-xl">
                                                <p className="text-xs text-slate-600 mb-1">Days Overdue</p>
                                                <p className="font-bold text-rose-600 text-sm">{plant.days_overdue} days</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-600 mb-1">Frequency</p>
                                                <p className="font-semibold text-slate-900 text-sm">Every {plant.plant_types.irrigation_frequency_days}d</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                <p className="text-xs text-slate-600 mb-1">Last Watered</p>
                                                <p className="font-semibold text-slate-900 text-sm">
                                                    {plant.last_irrigation_date
                                                        ? new Date(plant.last_irrigation_date).toLocaleDateString()
                                                        : 'Never'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleMarkAsWatered(plant.id)}
                                        disabled={wateringPlant === plant.id}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-medium shadow-sm whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {wateringPlant === plant.id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Watering...
                                            </>
                                        ) : (
                                            <>
                                                <Droplets className="w-4 h-4" />
                                                Mark as Watered
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
                        <p className="text-slate-600 mb-1">No plants need irrigation at this time</p>
                        <p className="text-sm text-slate-500 mb-6">Your irrigation schedule is up to date</p>
                        <button
                            onClick={() => setShowScheduleForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Schedule Future Irrigation
                        </button>
                    </div>
                )}
            </div>

            {/* Schedule Irrigation Modal */}
            <ScheduleIrrigationForm
                isOpen={showScheduleForm}
                onClose={() => setShowScheduleForm(false)}
                onSuccess={fetchOverdue}
            />
        </div>
    );
}
