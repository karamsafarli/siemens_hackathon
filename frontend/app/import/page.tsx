'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Upload, ArrowLeft, FileJson, CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { showToast } from '@/components/ToastContainer';
import { DEMO_USER_ID } from '@/lib/api';

interface ImportResult {
    import_job_id: string;
    total_records: number;
    successful_records: number;
    failed_records: number;
    errors: Array<{ record_index: number; error: string }>;
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
                                    <Upload className="w-6 h-6 text-white" />
                                </div>
                                Import Data
                            </h1>
                            <p className="text-slate-600 mt-1">Import farm data from JSON format</p>
                        </div>
                        <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
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
            </div>
        </div>
    );
}
