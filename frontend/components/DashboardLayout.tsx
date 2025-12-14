'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import ProtectedRoute from './ProtectedRoute';

interface DashboardLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
    alerts?: number;
    headerActions?: ReactNode;
    fullWidth?: boolean;
}

export default function DashboardLayout({
    children,
    title,
    subtitle,
    alerts = 0,
    headerActions,
    fullWidth = false
}: DashboardLayoutProps) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
                {/* Sidebar */}
                <Sidebar alerts={alerts} />

                {/* Main Content */}
                <main className="lg:ml-[280px] min-h-screen pb-20 lg:pb-0 transition-all duration-300">
                    {/* Page Header */}
                    {(title || headerActions) && (
                        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
                            <div className={`${fullWidth ? 'px-4 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} py-4 lg:py-6`}>
                                <div className="flex items-center justify-between">
                                    <div className="pl-12 lg:pl-0">
                                        {title && (
                                            <h1 className="text-xl lg:text-2xl font-bold text-slate-900">{title}</h1>
                                        )}
                                        {subtitle && (
                                            <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
                                        )}
                                    </div>
                                    {headerActions && (
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            {headerActions}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </header>
                    )}

                    {/* Page Content */}
                    <div className={`${fullWidth ? 'px-4 lg:px-8' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} py-4 lg:py-6`}>
                        {children}
                    </div>
                </main>

                {/* Mobile Navigation */}
                <MobileNav />
            </div>
        </ProtectedRoute>
    );
}
