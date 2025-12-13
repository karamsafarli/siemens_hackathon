'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react';

interface Toast {
    id: number;
    type: 'success' | 'error' | 'info';
    message: string;
}

let toastId = 0;
let addToastFn: ((type: Toast['type'], message: string) => void) | null = null;

export function showToast(type: Toast['type'], message: string) {
    if (addToastFn) {
        addToastFn(type, message);
    }
}

export default function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        addToastFn = (type, message) => {
            const id = toastId++;
            setToasts((prev) => [...prev, { id, type, message }]);

            // Auto remove after 4 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        };

        return () => {
            addToastFn = null;
        };
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
            {toasts.map((toast) => {
                const icons = {
                    success: { Icon: CheckCircle2, color: 'bg-emerald-500' },
                    error: { Icon: XCircle, color: 'bg-rose-500' },
                    info: { Icon: AlertCircle, color: 'bg-blue-500' },
                };
                const { Icon, color } = icons[toast.type];

                return (
                    <div
                        key={toast.id}
                        className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-3 animate-in slide-in-from-right duration-300"
                    >
                        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-slate-900 font-medium flex-1 text-sm">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
