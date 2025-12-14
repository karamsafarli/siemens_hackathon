'use client';

import { useEffect, useState } from 'react';
import { fieldsApi, DEMO_USER_ID } from '@/lib/api';
import type { Field } from '@/lib/types';
import Link from 'next/link';
import { MapPin, Sprout, Ruler, Calendar, Plus, Edit3, Trash2, ChevronRight, LayoutGrid, List } from 'lucide-react';
import FieldForm from '@/components/forms/FieldForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ToastContainer';
import DashboardLayout from '@/components/DashboardLayout';

export default function FieldsPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFieldForm, setShowFieldForm] = useState(false);
    const [editingField, setEditingField] = useState<Field | null>(null);
    const [deletingField, setDeletingField] = useState<Field | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const fetchFields = async () => {
        try {
            const response = await fieldsApi.getAll(DEMO_USER_ID);
            setFields(response.data);
        } catch (error) {
            console.error('Error fetching fields:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFields();
    }, []);

    const handleDelete = async () => {
        if (!deletingField) return;

        setIsDeleting(true);
        try {
            await fieldsApi.delete(deletingField.id);
            showToast('success', 'Field deleted successfully!');
            setDeletingField(null);
            fetchFields();
        } catch (error: any) {
            showToast('error', error.response?.data?.error || 'Failed to delete field');
        } finally {
            setIsDeleting(false);
        }
    };

    const headerActions = (
        <>
            <div className="hidden sm:flex items-center bg-slate-100 rounded-lg p-1">
                <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <List className="w-4 h-4" />
                </button>
            </div>
            <button
                onClick={() => {
                    setEditingField(null);
                    setShowFieldForm(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-500/20 btn-press"
            >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Field</span>
            </button>
        </>
    );

    if (loading) {
        return (
            <DashboardLayout title="Fields" subtitle="Manage your farm fields" headerActions={headerActions}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                            <div className="h-6 bg-slate-200 rounded-lg w-3/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-12 bg-slate-100 rounded-xl"></div>
                                <div className="h-12 bg-slate-100 rounded-xl"></div>
                                <div className="h-12 bg-slate-100 rounded-xl"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Fields" subtitle="Manage your farm fields" headerActions={headerActions}>
            {fields.length > 0 ? (
                <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                    {fields.map((field, index) => (
                        <div
                            key={field.id}
                            className={`
                                bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden 
                                card-hover animate-fadeIn group
                                ${viewMode === 'list' ? 'flex items-center p-4 gap-6' : ''}
                            `}
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            {viewMode === 'grid' ? (
                                // Grid View
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                                                <MapPin className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{field.name}</h3>
                                                <p className="text-sm text-slate-500">{field.location || 'No location'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingField(field);
                                                    setShowFieldForm(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Edit field"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingField(field)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                title="Delete field"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Ruler className="w-4 h-4" />
                                                <span className="text-sm font-medium">Size</span>
                                            </div>
                                            <span className="font-semibold text-slate-900">{field.size_hectares || 'N/A'} ha</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <Sprout className="w-4 h-4" />
                                                <span className="text-sm font-medium">Plants</span>
                                            </div>
                                            <span className="font-bold text-emerald-700">{field.plant_count || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Calendar className="w-4 h-4" />
                                                <span className="text-sm font-medium">Created</span>
                                            </div>
                                            <span className="font-semibold text-slate-900 text-sm">
                                                {new Date(field.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={`/plants?fieldId=${field.id}`}
                                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium group/btn"
                                    >
                                        View Plants
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            ) : (
                                // List View
                                <>
                                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-slate-900 truncate">{field.name}</h3>
                                        <p className="text-sm text-slate-500 truncate">{field.location || 'No location'}</p>
                                    </div>
                                    <div className="hidden md:flex items-center gap-6 text-sm">
                                        <div className="text-center">
                                            <p className="text-slate-500">Size</p>
                                            <p className="font-semibold text-slate-900">{field.size_hectares || 'N/A'} ha</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-500">Plants</p>
                                            <p className="font-bold text-emerald-600">{field.plant_count || 0}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-slate-500">Created</p>
                                            <p className="font-semibold text-slate-900">{new Date(field.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/plants?fieldId=${field.id}`}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm"
                                        >
                                            View Plants
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setEditingField(field);
                                                setShowFieldForm(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingField(field)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/10">
                        <MapPin className="w-12 h-12 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No fields yet</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Create your first field to start organizing your farm and tracking plants.
                    </p>
                    <button
                        onClick={() => setShowFieldForm(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-lg shadow-emerald-500/20"
                    >
                        <Plus className="w-5 h-5" />
                        Add Your First Field
                    </button>
                </div>
            )}

            {/* Field Form Modal */}
            <FieldForm
                isOpen={showFieldForm}
                onClose={() => {
                    setShowFieldForm(false);
                    setEditingField(null);
                }}
                onSuccess={fetchFields}
                field={editingField}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingField}
                onClose={() => setDeletingField(null)}
                onConfirm={handleDelete}
                title="Delete Field"
                message={`Are you sure you want to delete "${deletingField?.name}"? This will also delete all plants in this field.`}
                confirmText="Delete Field"
                confirmVariant="danger"
                isLoading={isDeleting}
            />
        </DashboardLayout>
    );
}
