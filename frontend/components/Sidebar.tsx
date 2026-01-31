'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    MapPin,
    Sprout,
    Droplets,
    FileText,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    Bell,
    Leaf
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface NavItem {
    href: string;
    icon: any;
    label: string;
    description: string;
    badge?: number;
    color: string;
}

const navItems: NavItem[] = [
    { href: '/', icon: Home, label: 'Dashboard', description: 'Overview & stats', color: 'emerald' },
    { href: '/fields', icon: MapPin, label: 'Fields', description: 'Manage farm fields', color: 'teal' },
    { href: '/plants', icon: Sprout, label: 'Plants', description: 'Plant batches', color: 'green' },
    { href: '/irrigation', icon: Droplets, label: 'Irrigation', description: 'Water schedule', color: 'blue' },
    { href: '/notes', icon: FileText, label: 'Notes', description: 'Activity journal', color: 'violet' },
    { href: '/chat', icon: MessageSquare, label: 'AI Assistant', description: 'Ask questions', color: 'purple' },
];

interface SidebarProps {
    alerts?: number;
}

export default function Sidebar({ alerts = 0 }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    // Handle escape key to close mobile sidebar
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const getColorClasses = (color: string, isActive: boolean) => {
        const colors: Record<string, { active: string; hover: string; icon: string }> = {
            emerald: {
                active: 'bg-emerald-50 text-emerald-700 border-emerald-500',
                hover: 'hover:bg-emerald-50/50 hover:text-emerald-600',
                icon: 'text-emerald-500'
            },
            teal: {
                active: 'bg-teal-50 text-teal-700 border-teal-500',
                hover: 'hover:bg-teal-50/50 hover:text-teal-600',
                icon: 'text-teal-500'
            },
            green: {
                active: 'bg-green-50 text-green-700 border-green-500',
                hover: 'hover:bg-green-50/50 hover:text-green-600',
                icon: 'text-green-500'
            },
            blue: {
                active: 'bg-blue-50 text-blue-700 border-blue-500',
                hover: 'hover:bg-blue-50/50 hover:text-blue-600',
                icon: 'text-blue-500'
            },
            violet: {
                active: 'bg-violet-50 text-violet-700 border-violet-500',
                hover: 'hover:bg-violet-50/50 hover:text-violet-600',
                icon: 'text-violet-500'
            },
            purple: {
                active: 'bg-purple-50 text-purple-700 border-purple-500',
                hover: 'hover:bg-purple-50/50 hover:text-purple-600',
                icon: 'text-purple-500'
            },
        };
        return isActive ? colors[color]?.active : colors[color]?.hover;
    };

    const sidebarContent = (
        <>
            {/* Logo Section */}
            <div className={`p-4 border-b border-slate-200/60 ${isCollapsed ? 'px-3' : 'px-5'}`}>
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    {!isCollapsed && (
                        <div className="animate-fadeIn">
                            <h1 className="font-bold text-slate-900 text-lg">Smart Farm</h1>
                            <p className="text-xs text-slate-500">Agricultural Management</p>
                        </div>
                    )}
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive
                                    ? `${getColorClasses(item.color, true)} border-l-4 font-medium`
                                    : `text-slate-600 border-l-4 border-transparent ${getColorClasses(item.color, false)}`
                                }
                ${isCollapsed ? 'justify-center px-2' : ''}
                group relative
              `}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center transition-all
                ${isActive ? 'bg-white shadow-sm' : 'group-hover:bg-white/60'}
              `}>
                                <Icon className={`w-5 h-5 ${isActive ? '' : 'text-slate-400 group-hover:text-current'}`} />
                            </div>

                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium truncate">{item.label}</span>
                                        {item.badge && item.badge > 0 && (
                                            <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                                </div>
                            )}

                            {/* Tooltip for collapsed state */}
                            {isCollapsed && (
                                <div className="
                  absolute left-full ml-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg
                  opacity-0 invisible group-hover:opacity-100 group-hover:visible
                  transition-all duration-200 whitespace-nowrap z-50 shadow-xl
                ">
                                    <div className="font-medium">{item.label}</div>
                                    <div className="text-xs text-slate-400">{item.description}</div>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className={`border-t border-slate-200/60 p-3 ${isCollapsed ? 'px-2' : ''}`}>
                {/* Alerts */}
                {alerts > 0 && !isCollapsed && (
                    <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-center gap-2 text-amber-700">
                            <Bell className="w-4 h-4" />
                            <span className="text-sm font-medium">{alerts} active alerts</span>
                        </div>
                    </div>
                )}

                {/* User Profile */}
                <div className={`
          flex items-center gap-3 p-3 rounded-xl bg-slate-50 mb-2
          ${isCollapsed ? 'justify-center p-2' : ''}
        `}>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-slate-900 text-sm truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.email || 'user@example.com'}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                    <button
                        onClick={logout}
                        className={`
              flex items-center justify-center gap-2 px-3 py-2 rounded-xl
              text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors
              ${isCollapsed ? 'w-full' : 'flex-1'}
            `}
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-full items-center justify-center gap-2 mt-3 px-3 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-4 h-4" />
                    ) : (
                        <>
                            <ChevronLeft className="w-4 h-4" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`
          hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white/80 backdrop-blur-xl
          border-r border-slate-200/60 z-40 sidebar-transition
          ${isCollapsed ? 'w-[80px]' : 'w-[280px]'}
        `}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`
          lg:hidden fixed left-0 top-0 h-screen w-[280px] bg-white z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          shadow-2xl
        `}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Toggle Button (visible when sidebar is closed) */}
            {!isMobileOpen && (
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-slate-600 hover:text-emerald-600 transition-colors"
                >
                    <Leaf className="w-5 h-5" />
                </button>
            )}
        </>
    );
}
