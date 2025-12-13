'use client';

import { useEffect, useState } from 'react';
import { plantBatchesApi, DEMO_USER_ID } from '@/lib/api';
import type { PlantBatch } from '@/lib/types';
import Link from 'next/link';
import { Sprout, MapPin, Calendar, Package, Droplets, ArrowLeft, AlertCircle, CheckCircle2, Plus, Edit3, Trash2, Activity } from 'lucide-react';
import PlantBatchForm from '@/components/forms/PlantBatchForm';
import StatusUpdateForm from '@/components/forms/StatusUpdateForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ToastContainer';
import { useSearchParams } from 'next/navigation';
import MobileNav from '@/components/MobileNav';

export default function PlantsPage() {
    const [plants, setPlants] = useState<PlantBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlantForm, setShowPlantForm] = useState(false);
    const [editingPlant, setEditingPlant] = useState<PlantBatch | null>(null);
    const [deletingPlant, setDeletingPlant] = useState<PlantBatch | null>(null);
    const [statusPlant, setStatusPlant] = useState<PlantBatch | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const searchParams = useSearchParams();
    const fieldId = searchParams.get('fieldId');

    const fetchPlants = async () => {
        try {
            const response = await plantBatchesApi.getAll({
                userId: DEMO_USER_ID,
                fieldId: fieldId || undefined
            });
            setPlants(response.data);
        } catch (error) {
            console.error('Error fetching plants:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlants();
    }, [fieldId]);

    const handleDelete = async () => {
        if (!deletingPlant) return;

        setIsDeleting(true);
        try {
            await plantBatchesApi.delete(deletingPlant.id);
            showToast('success', 'Plant batch deleted successfully!');
            setDeletingPlant(null);
            fetchPlants();
        } catch (error: any) {
            showToast('error', error.response?.data?.error || 'Failed to delete plant batch');
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-slate-700">Loading plants...</span>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; icon: any }> = {
            healthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
            at_risk: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
            critical: { bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertCircle },
            diseased: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
        };
        const badge = badges[status] || badges.healthy;
        const Icon = badge.icon;
        return { ...badge, Icon };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-3xl font-bold text-slate-900">Plants</h1>
                                <p className="text-slate-600 text-xs sm:text-base hidden sm:block">Monitor your plant batches</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setEditingPlant(null);
                                    setShowPlantForm(true);
                                }}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-sm text-xs sm:text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Plant</span>
                            </button>
                            <Link href="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm">
                                <ArrowLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Dashboard</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {plants.map((plant) => {
                        const statusBadge = getStatusBadge(plant.current_status);
                        const StatusIcon = statusBadge.Icon;

                        return (
                            <div key={plant.id} className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{plant.batch_name}</h3>
                                        <p className="text-sm text-slate-600">{plant.plant_types?.name || 'Unknown type'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setStatusPlant(plant)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${statusBadge.bg} ${statusBadge.text} font-semibold text-sm hover:opacity-80 transition-opacity`}
                                            title="Click to update status"
                                        >
                                            <StatusIcon className="w-4 h-4" />
                                            {plant.current_status.replace('_', ' ')}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingPlant(plant);
                                                setShowPlantForm(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            title="Edit plant batch"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingPlant(plant)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete plant batch"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-medium">Field</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">{plant.fields?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                                            <Package className="w-4 h-4" />
                                            <span className="text-xs font-medium">Quantity</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">{plant.quantity || 'N/A'} plants</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-medium">Planted</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">{new Date(plant.planting_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                                            <Droplets className="w-4 h-4" />
                                            <span className="text-xs font-medium">Last Watered</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">
                                            {plant.last_irrigation_date
                                                ? new Date(plant.last_irrigation_date).toLocaleDateString()
                                                : 'Never'}
                                        </p>
                                    </div>
                                </div>

                                {plant.irrigation_status && (
                                    <div className={`p-4 rounded-xl border-l-4 ${plant.irrigation_status.status === 'critical'
                                        ? 'bg-rose-50 border-rose-500'
                                        : plant.irrigation_status.status === 'overdue'
                                            ? 'bg-amber-50 border-amber-500'
                                            : 'bg-emerald-50 border-emerald-500'
                                        }`}>
                                        <div className="flex items-center gap-2">
                                            <Droplets className={`w-4 h-4 ${plant.irrigation_status.status === 'critical'
                                                ? 'text-rose-600'
                                                : plant.irrigation_status.status === 'overdue'
                                                    ? 'text-amber-600'
                                                    : 'text-emerald-600'
                                                }`} />
                                            <span className="font-semibold text-slate-900 text-sm">
                                                {plant.irrigation_status.status === 'on_time' ? '✓ Irrigation On Time' :
                                                    plant.irrigation_status.status === 'overdue' ? '⚠️ Irrigation Overdue' : '🚨 Critical - Needs Water'}
                                            </span>
                                        </div>
                                        {plant.irrigation_status.days_overdue > 0 && (
                                            <p className="text-xs text-slate-600 mt-1 ml-6">{plant.irrigation_status.days_overdue} days overdue</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {plants.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Sprout className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-slate-600 text-lg font-medium">No plant batches found</p>
                        <p className="text-slate-500 text-sm mt-1 mb-4">Add your first plant batch to start monitoring</p>
                        <button
                            onClick={() => setShowPlantForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Plant Batch
                        </button>
                    </div>
                )}
            </div>

            {/* Plant Batch Form Modal */}
            <PlantBatchForm
                isOpen={showPlantForm}
                onClose={() => {
                    setShowPlantForm(false);
                    setEditingPlant(null);
                }}
                onSuccess={fetchPlants}
                plantBatch={editingPlant}
                preselectedFieldId={fieldId || undefined}
            />

            {/* Status Update Form Modal */}
            {statusPlant && (
                <StatusUpdateForm
                    isOpen={!!statusPlant}
                    onClose={() => setStatusPlant(null)}
                    onSuccess={fetchPlants}
                    plantBatchId={statusPlant.id}
                    currentStatus={statusPlant.current_status}
                    batchName={statusPlant.batch_name}
                />
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingPlant}
                onClose={() => setDeletingPlant(null)}
                onConfirm={handleDelete}
                title="Delete Plant Batch"
                message={`Are you sure you want to delete "${deletingPlant?.batch_name}"? This action cannot be undone.`}
                confirmText="Delete Plant Batch"
                confirmVariant="danger"
                isLoading={isDeleting}
            />

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
