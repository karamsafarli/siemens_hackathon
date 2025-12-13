'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Upload, ArrowLeft, FileJson, CheckCircle2, XCircle, AlertTriangle, Loader2, History, Clock, RefreshCw } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';
import { DEMO_USER_ID } from '@/lib/api';
import MobileNav from '@/components/MobileNav';

interface ImportResult {
    import_job_id: string;
    total_records: number;
    successful_records: number;
    failed_records: number;
    errors: Array<{ record_index: number; error: string }>;
}

interface ImportJob {
    id: string;
    status: string;
    total_records: number;
    successful_records: number;
    failed_records: number;
    created_at: string;
    completed_at: string | null;
    error_log: any[];
}

const SAMPLE_DATA = `[
  {
    "date": "2024-12-01",
    "field_name": "North Field",
    "plant_name": "Spring Tomatoes",
    "plant_type": "Tomato",
    "event_type": "irrigation",
    "note": "Morning watering completed"
  },
  {
    "date": "2024-12-02",
    "field_name": "North Field",
    "plant_name": "Spring Tomatoes",
    "plant_type": "Tomato",
    "event_type": "observation",
    "note": "Plants showing healthy growth"
  },
  {
    "date": "2024-12-03",
    "field_name": "South Field",
    "plant_name": "Winter Wheat",
    "plant_type": "Wheat",
    "event_type": "status_change",
    "status": "at_risk",
    "note": "Some yellowing observed in leaves"
  }
]`;

export default function ImportPage() {
    const [jsonInput, setJsonInput] = useState('');
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [importHistory, setImportHistory] = useState<ImportJob[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    // Fetch import history on mount and after each import
    const fetchHistory = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import/jobs?userId=${DEMO_USER_ID}`);
            if (response.ok) {
                const data = await response.json();
                setImportHistory(data.slice(0, 10)); // Show last 10 jobs
            }
        } catch (error) {
            console.error('Error fetching import history:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const validateJson = (input: string) => {
        try {
            const data = JSON.parse(input);
            if (!Array.isArray(data)) {
                return { valid: false, error: 'JSON must be an array of records' };
            }
            return { valid: true, data };
        } catch (e) {
            return { valid: false, error: 'Invalid JSON format' };
        }
    };

    const handleImport = async () => {
        setParseError(null);
        setResult(null);

        const validation = validateJson(jsonInput);
        if (!validation.valid) {
            setParseError(validation.error || 'Invalid JSON');
            showToast('error', validation.error || 'Invalid JSON');
            return;
        }

        setIsImporting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/import`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: DEMO_USER_ID,
                    records: validation.data,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Import failed');
            }

            setResult(data);

            if (data.failed_records === 0) {
                showToast('success', `Successfully imported ${data.successful_records} records!`);
            } else {
                showToast('info', `Imported ${data.successful_records} records with ${data.failed_records} failures`);
            }

            // Refresh import history after successful import
            fetchHistory();
        } catch (error: any) {
            console.error('Import error:', error);
            showToast('error', error.message || 'Failed to import data');
        } finally {
            setIsImporting(false);
        }
    };

    const loadSampleData = () => {
        setJsonInput(SAMPLE_DATA);
        setParseError(null);
        setResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                                <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-3xl font-bold text-slate-900">Import</h1>
                                <p className="text-slate-600 text-xs sm:text-base hidden sm:block">Import farm data from JSON</p>
                            </div>
                        </div>
                        <Link href="/" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg sm:rounded-xl transition-colors text-xs sm:text-sm">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                {/* Instructions */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <FileJson className="w-5 h-5 text-orange-500" />
                        JSON Format
                    </h2>
                    <p className="text-sm text-slate-600 mb-4">
                        Each record should include these fields:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="font-semibold text-slate-900">date</p>
                            <p className="text-slate-600 text-xs">YYYY-MM-DD format</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="font-semibold text-slate-900">field_name</p>
                            <p className="text-slate-600 text-xs">Field name (required)</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="font-semibold text-slate-900">plant_name</p>
                            <p className="text-slate-600 text-xs">Batch name (optional)</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                            <p className="font-semibold text-slate-900">event_type</p>
                            <p className="text-slate-600 text-xs">irrigation, observation, problem, status_change</p>
                        </div>
                    </div>
                    <button
                        onClick={loadSampleData}
                        className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium"
                    >
                        Load sample data →
                    </button>
                </div>

                {/* JSON Input */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-3">
                        JSON Data
                    </label>
                    <textarea
                        value={jsonInput}
                        onChange={(e) => {
                            setJsonInput(e.target.value);
                            setParseError(null);
                        }}
                        placeholder="Paste your JSON array here..."
                        rows={15}
                        className={`w-full px-4 py-3 bg-slate-50 border-2 rounded-xl font-mono text-sm outline-none transition-all resize-none ${parseError
                            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                            : 'border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                            } text-slate-900 placeholder:text-slate-400`}
                    />
                    {parseError && (
                        <p className="mt-2 text-sm text-rose-600 flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            {parseError}
                        </p>
                    )}
                </div>

                {/* Import Button */}
                <div className="flex justify-center mb-8">
                    <button
                        onClick={handleImport}
                        disabled={isImporting || !jsonInput.trim()}
                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Importing...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                Import Data
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                {result && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Import Results</h2>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="p-4 bg-slate-50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-slate-900">{result.total_records}</p>
                                <p className="text-sm text-slate-600">Total Records</p>
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-emerald-600">{result.successful_records}</p>
                                <p className="text-sm text-slate-600">Successful</p>
                            </div>
                            <div className="p-4 bg-rose-50 rounded-xl text-center">
                                <p className="text-3xl font-bold text-rose-600">{result.failed_records}</p>
                                <p className="text-sm text-slate-600">Failed</p>
                            </div>
                        </div>

                        {result.failed_records === 0 ? (
                            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                <p className="text-emerald-700 font-medium">All records imported successfully!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    Errors:
                                </p>
                                <div className="max-h-48 overflow-y-auto space-y-2">
                                    {result.errors.map((err, i) => (
                                        <div key={i} className="p-3 bg-rose-50 rounded-lg text-sm">
                                            <p className="text-rose-700">{err.error}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Import History - Audit Trail */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <History className="w-5 h-5 text-orange-500" />
                            Import History (Audit Trail)
                        </h2>
                        <button
                            onClick={fetchHistory}
                            disabled={loadingHistory}
                            className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Refresh history"
                        >
                            <RefreshCw className={`w-4 h-4 ${loadingHistory ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {loadingHistory ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        </div>
                    ) : importHistory.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <Clock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                            <p>No import history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {importHistory.map((job) => (
                                <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-lg ${job.status === 'completed'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : job.status === 'completed_with_errors'
                                                        ? 'bg-amber-100 text-amber-700'
                                                        : 'bg-slate-100 text-slate-700'
                                                }`}>
                                                {job.status === 'completed' ? '✓ Success' :
                                                    job.status === 'completed_with_errors' ? '⚠ Partial' :
                                                        job.status}
                                            </span>
                                            <span className="text-xs text-slate-500 font-mono">
                                                {job.id.slice(0, 8)}...
                                            </span>
                                        </div>
                                        <span className="text-xs text-slate-500">
                                            {new Date(job.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="text-slate-600">
                                            Total: <strong>{job.total_records}</strong>
                                        </span>
                                        <span className="text-emerald-600">
                                            ✓ {job.successful_records}
                                        </span>
                                        {job.failed_records > 0 && (
                                            <span className="text-rose-600">
                                                ✗ {job.failed_records}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileNav />
        </div>
    );
}
