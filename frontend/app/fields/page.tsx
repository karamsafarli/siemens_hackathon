'use client';

import { useEffect, useState } from 'react';
import { fieldsApi, DEMO_USER_ID } from '@/lib/api';
import type { Field } from '@/lib/types';
import Link from 'next/link';
import { MapPin, Sprout, ArrowLeft, Ruler, Calendar, Plus, Edit3, Trash2 } from 'lucide-react';
import FieldForm from '@/components/forms/FieldForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ToastContainer';
import MobileNav from '@/components/MobileNav';

export default function FieldsPage() {
    const [fields, setFields] = useState<Field[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFieldForm, setShowFieldForm] = useState(false);
    const [editingField, setEditingField] = useState<Field | null>(null);
    const [deletingField, setDeletingField] = useState<Field | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-slate-700">Loading fields...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-3xl font-bold text-slate-900">Fields</h1>
                                <p className="text-slate-600 text-xs sm:text-base hidden sm:block">Manage your farm fields</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setEditingField(null);
                                    setShowFieldForm(true);
                                }}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-sm text-xs sm:text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add Field</span>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {fields.map((field) => (
                        <div key={field.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200 group">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">{field.name}</h3>
                                        <p className="text-sm text-slate-600 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {field.location || 'No location specified'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
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

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Ruler className="w-4 h-4" />
                                            <span className="text-sm font-medium">Size</span>
                                        </div>
                                        <span className="font-semibold text-slate-900">{field.size_hectares || 'N/A'} ha</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 text-slate-600">
                                            <Sprout className="w-4 h-4" />
                                            <span className="text-sm font-medium">Plants</span>
                                        </div>
                                        <span className="font-semibold text-emerald-600">{field.plant_count || 0}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
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
                                    className="block w-full text-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium shadow-sm"
                                >
                                    View Plants
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {fields.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-10 h-10 text-slate-400" />
                        </div>
                        <p className="text-slate-600 text-lg font-medium">No fields found</p>
                        <p className="text-slate-500 text-sm mt-1 mb-4">Create your first field to get started</p>
                        <button
                            onClick={() => setShowFieldForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Field
                        </button>
                    </div>
                )}
            </div>

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

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
