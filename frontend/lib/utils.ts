import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        healthy: 'bg-green-100 text-green-800 border-green-200',
        at_risk: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        critical: 'bg-red-100 text-red-800 border-red-200',
        diseased: 'bg-orange-100 text-orange-800 border-orange-200',
        harvested: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
}

export function getIrrigationStatusColor(status: 'on_time' | 'overdue' | 'critical'): string {
    const colors = {
        on_time: 'bg-green-100 text-green-800',
        overdue: 'bg-yellow-100 text-yellow-800',
        critical: 'bg-red-100 text-red-800',
    };
    return colors[status];
}
