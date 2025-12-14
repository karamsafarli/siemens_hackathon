'use client';

import { useEffect, useState } from 'react';
import { plantBatchesApi, DEMO_USER_ID } from '@/lib/api';
import type { PlantBatch } from '@/lib/types';
import { Sprout, MapPin, Calendar, Package, Droplets, AlertCircle, CheckCircle2, Plus, Edit3, Trash2, Filter, X } from 'lucide-react';
import PlantBatchForm from '@/components/forms/PlantBatchForm';
import StatusUpdateForm from '@/components/forms/StatusUpdateForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ToastContainer';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';

export default function PlantsPage() {
    const [plants, setPlants] = useState<PlantBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPlantForm, setShowPlantForm] = useState(false);
    const [editingPlant, setEditingPlant] = useState<PlantBatch | null>(null);
    const [deletingPlant, setDeletingPlant] = useState<PlantBatch | null>(null);
    const [statusPlant, setStatusPlant] = useState<PlantBatch | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

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

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; icon: any; gradient: string }> = {
            healthy: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2, gradient: 'from-emerald-500 to-teal-500' },
            at_risk: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, gradient: 'from-amber-500 to-orange-500' },
            critical: { bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertCircle, gradient: 'from-rose-500 to-pink-500' },
            diseased: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, gradient: 'from-red-500 to-rose-500' },
        };
        const badge = badges[status] || badges.healthy;
        return { ...badge, Icon: badge.icon };
    };

    const filteredPlants = statusFilter === 'all'
        ? plants
        : plants.filter(p => p.current_status === statusFilter);

    const statusCounts = plants.reduce((acc, plant) => {
        acc[plant.current_status] = (acc[plant.current_status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const headerActions = (
        <button
            onClick={() => {
                setEditingPlant(null);
                setShowPlantForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-500/20 btn-press"
        >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Plant</span>
        </button>
    );

    if (loading) {
        return (
            <DashboardLayout title="Plants" subtitle="Monitor your plant batches" headerActions={headerActions}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-slate-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="h-16 bg-slate-100 rounded-xl"></div>
                                <div className="h-16 bg-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Plants" subtitle="Monitor your plant batches" headerActions={headerActions}>
            {/* Filter Chips */}
            {plants.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>
                    <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${statusFilter === 'all'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        All ({plants.length})
                    </button>
                    {Object.entries(statusCounts).map(([status, count]) => {
                        const badge = getStatusBadge(status);
                        return (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${statusFilter === status
                                        ? `bg-gradient-to-r ${badge.gradient} text-white shadow-lg`
                                        : `${badge.bg} ${badge.text} hover:opacity-80`
                                    }`}
                            >
                                <span className="capitalize">{status.replace('_', ' ')}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${statusFilter === status ? 'bg-white/20' : 'bg-white/60'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                    {statusFilter !== 'all' && (
                        <button
                            onClick={() => setStatusFilter('all')}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {filteredPlants.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredPlants.map((plant, index) => {
                        const statusBadge = getStatusBadge(plant.current_status);
                        const StatusIcon = statusBadge.Icon;

                        return (
                            <div
                                key={plant.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 lg:p-6 card-hover animate-fadeIn group"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${statusBadge.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                                            <Sprout className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{plant.batch_name}</h3>
                                            <p className="text-sm text-slate-500">{plant.plant_types?.name || 'Unknown type'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setStatusPlant(plant)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${statusBadge.bg} ${statusBadge.text} font-semibold text-sm hover:opacity-80 transition-all btn-press`}
                                            title="Click to update status"
                                        >
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="capitalize">{plant.current_status.replace('_', ' ')}</span>
                                        </button>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-xs font-medium">Field</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm truncate">{plant.fields?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <Package className="w-4 h-4" />
                                            <span className="text-xs font-medium">Quantity</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">{plant.quantity || 'N/A'} plants</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-xs font-medium">Planted</span>
                                        </div>
                                        <p className="font-semibold text-slate-900 text-sm">{new Date(plant.planting_date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-2 text-slate-500 mb-1">
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
                                    <div className={`
                                        p-4 rounded-xl border-l-4 flex items-center justify-between
                                        ${plant.irrigation_status.status === 'critical'
                                            ? 'bg-rose-50 border-rose-500'
                                            : plant.irrigation_status.status === 'overdue'
                                                ? 'bg-amber-50 border-amber-500'
                                                : 'bg-emerald-50 border-emerald-500'
                                        }
                                    `}>
                                        <div className="flex items-center gap-3">
                                            <Droplets className={`w-5 h-5 ${plant.irrigation_status.status === 'critical'
                                                    ? 'text-rose-600'
                                                    : plant.irrigation_status.status === 'overdue'
                                                        ? 'text-amber-600'
                                                        : 'text-emerald-600'
                                                }`} />
                                            <div>
                                                <span className="font-semibold text-slate-900 text-sm">
                                                    {plant.irrigation_status.status === 'on_time' ? '✓ Irrigation On Time' :
                                                        plant.irrigation_status.status === 'overdue' ? '⚠️ Irrigation Overdue' : '🚨 Critical - Needs Water'}
                                                </span>
                                                {plant.irrigation_status.days_overdue > 0 && (
                                                    <p className="text-xs text-slate-600 mt-0.5">{plant.irrigation_status.days_overdue} days overdue</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/10">
                        <Sprout className="w-12 h-12 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {statusFilter !== 'all' ? 'No plants with this status' : 'No plant batches yet'}
                    </h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        {statusFilter !== 'all'
                            ? 'Try selecting a different filter to see more plants.'
                            : 'Add your first plant batch to start monitoring your crops.'
                        }
                    </p>
                    {statusFilter === 'all' && (
                        <button
                            onClick={() => setShowPlantForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-500/20"
                        >
                            <Plus className="w-5 h-5" />
                            Add Your First Plant Batch
                        </button>
                    )}
                </div>
            )}

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
        </DashboardLayout>
    );
}
