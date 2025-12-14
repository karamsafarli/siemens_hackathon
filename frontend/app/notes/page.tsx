'use client';

import { useEffect, useState } from 'react';
import { notesApi } from '@/lib/api';
import type { Note } from '@/lib/types';
import { FileText, Calendar, Edit3, MapPin, Sprout, Plus, Trash2, Filter, X } from 'lucide-react';
import NoteForm from '@/components/forms/NoteForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ToastContainer';
import DashboardLayout from '@/components/DashboardLayout';

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [deletingNote, setDeletingNote] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typeFilter, setTypeFilter] = useState<string>('all');

    const fetchNotes = async () => {
        try {
            const response = await notesApi.getAll();
            setNotes(response.data);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleDelete = async () => {
        if (!deletingNote) return;

        setIsDeleting(true);
        try {
            await notesApi.delete(deletingNote.id);
            showToast('success', 'Note deleted successfully!');
            setDeletingNote(null);
            fetchNotes();
        } catch (error: any) {
            showToast('error', error.response?.data?.error || 'Failed to delete note');
        } finally {
            setIsDeleting(false);
        }
    };

    const noteTypeStyles: Record<string, { bg: string; text: string; border: string; gradient: string; icon: string }> = {
        irrigation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', gradient: 'from-blue-500 to-cyan-500', icon: '💧' },
        disease: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', gradient: 'from-rose-500 to-pink-500', icon: '🦠' },
        fertilizer: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-500', icon: '🌱' },
        observation: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', gradient: 'from-violet-500 to-purple-500', icon: '👁️' },
        harvest: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-500', icon: '🌾' },
        weather: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', gradient: 'from-sky-500 to-blue-500', icon: '🌤️' },
        maintenance: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', gradient: 'from-cyan-500 to-teal-500', icon: '🔧' },
        general: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', gradient: 'from-slate-500 to-slate-600', icon: '📝' },
    };

    const getNoteTypeStyle = (type: string) => {
        return noteTypeStyles[type] || noteTypeStyles.general;
    };

    const filteredNotes = typeFilter === 'all'
        ? notes
        : notes.filter(n => n.note_type === typeFilter);

    const typeCounts = notes.reduce((acc, note) => {
        acc[note.note_type] = (acc[note.note_type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const headerActions = (
        <button
            onClick={() => {
                setEditingNote(null);
                setShowNoteForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-lg shadow-violet-500/20 btn-press"
        >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Note</span>
        </button>
    );

    if (loading) {
        return (
            <DashboardLayout title="Notes" subtitle="Track observations and activities" headerActions={headerActions}>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-6 w-24 bg-slate-200 rounded-full"></div>
                                <div className="h-4 w-32 bg-slate-100 rounded"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-100 rounded w-full"></div>
                                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Notes" subtitle="Track observations and activities" headerActions={headerActions}>
            {/* Filter Chips */}
            {notes.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-6 animate-fadeIn">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mr-2">
                        <Filter className="w-4 h-4" />
                        <span>Filter:</span>
                    </div>
                    <button
                        onClick={() => setTypeFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${typeFilter === 'all'
                                ? 'bg-slate-900 text-white shadow-lg'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                    >
                        All ({notes.length})
                    </button>
                    {Object.entries(typeCounts).map(([type, count]) => {
                        const style = getNoteTypeStyle(type);
                        return (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${typeFilter === type
                                        ? `bg-gradient-to-r ${style.gradient} text-white shadow-lg`
                                        : `${style.bg} ${style.text} hover:opacity-80`
                                    }`}
                            >
                                <span>{noteTypeStyles[type]?.icon}</span>
                                <span className="capitalize">{type}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${typeFilter === type ? 'bg-white/20' : 'bg-white/60'
                                    }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                    {typeFilter !== 'all' && (
                        <button
                            onClick={() => setTypeFilter('all')}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {filteredNotes.length > 0 ? (
                <div className="space-y-4">
                    {filteredNotes.map((note, index) => {
                        const typeStyle = getNoteTypeStyle(note.note_type);
                        return (
                            <div
                                key={note.id}
                                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 lg:p-6 card-hover animate-fadeIn group"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                                            <span>{noteTypeStyles[note.note_type]?.icon}</span>
                                            {note.note_type.toUpperCase()}
                                        </span>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {new Date(note.created_at).toLocaleDateString()} at{' '}
                                                {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        {note.edited_at && (
                                            <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                                <Edit3 className="w-3 h-3" />
                                                <span>Edited</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => {
                                                setEditingNote(note);
                                                setShowNoteForm(true);
                                            }}
                                            className="p-2 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                                            title="Edit note"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeletingNote(note)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="Delete note"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-700 leading-relaxed mb-4 whitespace-pre-wrap">{note.content}</p>

                                {note.plant_batches && (
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-lg">
                                            <Sprout className="w-4 h-4 text-emerald-600" />
                                            <span className="text-slate-600">Plant:</span>
                                            <span className="text-emerald-700 font-semibold">{note.plant_batches.batch_name}</span>
                                        </div>
                                        {note.plant_batches.fields && (
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg">
                                                <MapPin className="w-4 h-4 text-teal-600" />
                                                <span className="text-slate-600">Field:</span>
                                                <span className="text-teal-700 font-semibold">{note.plant_batches.fields.name}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 lg:p-16 text-center animate-fadeIn">
                    <div className="w-24 h-24 bg-gradient-to-br from-violet-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-violet-500/10">
                        <FileText className="w-12 h-12 text-violet-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        {typeFilter !== 'all' ? 'No notes of this type' : 'No Notes Yet'}
                    </h2>
                    <p className="text-slate-500 mb-1">
                        {typeFilter !== 'all'
                            ? 'Try selecting a different filter to see more notes.'
                            : 'Start adding notes to track your farm activities'
                        }
                    </p>
                    {typeFilter === 'all' && (
                        <>
                            <p className="text-sm text-slate-400 mb-8">Document observations, treatments, and important events</p>
                            <button
                                onClick={() => setShowNoteForm(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-lg shadow-violet-500/20"
                            >
                                <Plus className="w-5 h-5" />
                                Add Your First Note
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Note Form Modal */}
            <NoteForm
                isOpen={showNoteForm}
                onClose={() => {
                    setShowNoteForm(false);
                    setEditingNote(null);
                }}
                onSuccess={fetchNotes}
                note={editingNote}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deletingNote}
                onClose={() => setDeletingNote(null)}
                onConfirm={handleDelete}
                title="Delete Note"
                message="Are you sure you want to delete this note? This action cannot be undone."
                confirmText="Delete Note"
                confirmVariant="danger"
                isLoading={isDeleting}
            />
        </DashboardLayout>
    );
}
