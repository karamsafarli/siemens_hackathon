'use client';

import { useEffect, useState } from 'react';
import { notesApi } from '@/lib/api';
import type { Note } from '@/lib/types';
import Link from 'next/link';
import { FileText, ArrowLeft, Calendar, Edit3, MapPin, Sprout, Plus, Trash2 } from 'lucide-react';
import NoteForm from '@/components/forms/NoteForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { showToast } from '@/components/ToastContainer';

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNoteForm, setShowNoteForm] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [deletingNote, setDeletingNote] = useState<Note | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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

    const getNoteTypeStyle = (type: string) => {
        const styles: Record<string, { bg: string; text: string; border: string }> = {
            irrigation: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
            disease: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
            fertilizer: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
            observation: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
            harvest: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
            weather: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
            maintenance: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
            general: { bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
        };
        return styles[type] || styles.general;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg font-medium text-slate-700">Loading notes...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                Notes Journal
                            </h1>
                            <p className="text-slate-600 mt-1">Track observations and activities for your plants</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setEditingNote(null);
                                    setShowNoteForm(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Note
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
                {notes.length > 0 ? (
                    <div className="space-y-4">
                        {notes.map((note) => {
                            const typeStyle = getNoteTypeStyle(note.note_type);
                            return (
                                <div key={note.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                                                {note.note_type.toUpperCase()}
                                            </span>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(note.created_at).toLocaleDateString()} at{' '}
                                                    {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {note.edited_at && (
                                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                                    <Edit3 className="w-3 h-3" />
                                                    <span>Edited</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
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

                                    <p className="text-slate-900 leading-relaxed mb-4 whitespace-pre-wrap">{note.content}</p>

                                    {note.plant_batches && (
                                        <div className="flex items-center gap-4 pt-4 border-t border-slate-100 text-sm">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <Sprout className="w-4 h-4" />
                                                <span className="font-medium">Plant:</span>
                                                <span className="text-slate-900 font-semibold">{note.plant_batches.batch_name}</span>
                                            </div>
                                            {note.plant_batches.fields && (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="font-medium">Field:</span>
                                                    <span className="text-slate-900 font-semibold">{note.plant_batches.fields.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
                        <div className="w-20 h-20 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-violet-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">No Notes Yet</h2>
                        <p className="text-slate-600 mb-1">Start adding notes to track your farm activities</p>
                        <p className="text-sm text-slate-500 mb-6">Document observations, treatments, and important events</p>
                        <button
                            onClick={() => setShowNoteForm(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:from-violet-600 hover:to-purple-700 transition-all font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            Add Your First Note
                        </button>
                    </div>
                )}
            </div>

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
        </div>
    );
}
