'use client';

import { useEffect, useState } from 'react';
import { irrigationApi, DEMO_USER_ID } from '@/lib/api';
import { Droplets, AlertTriangle, CheckCircle2, Plus, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';
import ScheduleIrrigationForm from '@/components/forms/ScheduleIrrigationForm';
import DashboardLayout from '@/components/DashboardLayout';

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

    const criticalCount = overduePlants.filter(p => p.severity === 'critical').length;
    const overdueCount = overduePlants.filter(p => p.severity === 'overdue').length;

    const headerActions = (
        <button
            onClick={() => setShowScheduleForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-blue-500/20 btn-press"
        >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Schedule</span>
        </button>
    );

    if (loading) {
        return (
            <DashboardLayout title="Irrigation" subtitle="Water your plants on time" headerActions={headerActions}>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-lg"></div>
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
                                    <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Irrigation" subtitle="Water your plants on time" headerActions={headerActions}>
            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4 mb-8 animate-fadeIn">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Overdue</p>
                            <p className="text-2xl font-bold text-slate-900">{overdueCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-rose-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Critical</p>
                            <p className="text-2xl font-bold text-slate-900">{criticalCount}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Droplets className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 font-medium">Total Pending</p>
                            <p className="text-2xl font-bold text-slate-900">{overduePlants.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {overduePlants.length > 0 ? (
                <div className="space-y-4">
                    {overduePlants.map((plant, index) => (
                        <div
                            key={plant.id}
                            className={`
                                bg-white rounded-2xl shadow-sm border-l-4 p-5 lg:p-6 card-hover animate-fadeIn
                                ${plant.severity === 'critical' ? 'border-rose-500' : 'border-amber-500'}
                            `}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                        ${plant.severity === 'critical'
                                            ? 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg shadow-rose-500/20'
                                            : 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20'
                                        }
                                    `}>
                                        <Droplets className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 flex-wrap mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{plant.batch_name}</h3>
                                            <span className={`
                                                px-3 py-1 rounded-full text-xs font-bold
                                                ${plant.severity === 'critical'
                                                    ? 'bg-rose-100 text-rose-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                }
                                            `}>
                                                {plant.severity === 'critical' ? '🚨 CRITICAL' : '⚠️ OVERDUE'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">{plant.plant_types.name}</p>

                                        <div className="flex flex-wrap gap-2">
                                            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs">
                                                <span className="text-slate-500">Field:</span>
                                                <span className="font-semibold text-slate-700 ml-1">{plant.fields.name}</span>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-lg text-xs ${plant.severity === 'critical' ? 'bg-rose-100' : 'bg-amber-100'
                                                }`}>
                                                <span className="text-slate-500">Overdue:</span>
                                                <span className={`font-bold ml-1 ${plant.severity === 'critical' ? 'text-rose-700' : 'text-amber-700'
                                                    }`}>
                                                    {plant.days_overdue} days
                                                </span>
                                            </div>
                                            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs">
                                                <span className="text-slate-500">Frequency:</span>
                                                <span className="font-semibold text-slate-700 ml-1">Every {plant.plant_types.irrigation_frequency_days}d</span>
                                            </div>
                                            <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3 text-slate-400" />
                                                <span className="text-slate-500">Last:</span>
                                                <span className="font-semibold text-slate-700">
                                                    {plant.last_irrigation_date
                                                        ? new Date(plant.last_irrigation_date).toLocaleDateString()
                                                        : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleMarkAsWatered(plant.id)}
                                    disabled={wateringPlant === plant.id}
                                    className={`
                                        flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium
                                        transition-all shadow-lg btn-press whitespace-nowrap
                                        ${wateringPlant === plant.id
                                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:from-blue-600 hover:to-cyan-700 shadow-blue-500/20'
                                        }
                                    `}
                                >
                                    {wateringPlant === plant.id ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                                            Watering...
                                        </>
                                    ) : (
                                        <>
                                            <Droplets className="w-5 h-5" />
                                            Mark as Watered
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 lg:p-16 text-center animate-fadeIn">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">All Caught Up!</h2>
                    <p className="text-slate-500 mb-1">No plants need irrigation at this time</p>
                    <p className="text-sm text-slate-400 mb-8">Your irrigation schedule is up to date</p>
                    <button
                        onClick={() => setShowScheduleForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all font-medium shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Schedule Future Irrigation
                    </button>
                </div>
            )}

            {/* Schedule Irrigation Modal */}
            <ScheduleIrrigationForm
                isOpen={showScheduleForm}
                onClose={() => setShowScheduleForm(false)}
                onSuccess={fetchOverdue}
            />
        </DashboardLayout>
    );
}
