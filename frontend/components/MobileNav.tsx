'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Sprout, Droplets, MessageSquare } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Home', color: 'emerald' },
    { href: '/fields', icon: MapPin, label: 'Fields', color: 'teal' },
    { href: '/plants', icon: Sprout, label: 'Plants', color: 'green' },
    { href: '/irrigation', icon: Droplets, label: 'Water', color: 'blue' },
    { href: '/chat', icon: MessageSquare, label: 'AI', color: 'violet' },
];

export default function MobileNav() {
    const pathname = usePathname();

    const getActiveColor = (color: string) => {
        const colors: Record<string, string> = {
            emerald: 'text-emerald-600 bg-emerald-50',
            teal: 'text-teal-600 bg-teal-50',
            green: 'text-green-600 bg-green-50',
            blue: 'text-blue-600 bg-blue-50',
            violet: 'text-violet-600 bg-violet-50',
        };
        return colors[color] || colors.emerald;
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 lg:hidden z-50">
            {/* Gradient fade effect */}
            <div className="absolute inset-x-0 -top-6 h-6 bg-gradient-to-t from-white to-transparent pointer-events-none" />

            {/* Nav container */}
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-around py-2 pb-safe max-w-md mx-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                                    transition-all duration-200 btn-press
                                    ${isActive
                                        ? getActiveColor(item.color)
                                        : 'text-slate-400 hover:text-slate-600 active:bg-slate-50'
                                    }
                                `}
                            >
                                <div className={`
                                    relative p-1 rounded-lg
                                    ${isActive ? 'scale-110' : 'scale-100'}
                                    transition-transform duration-200
                                `}>
                                    <Icon className={`w-5 h-5 ${isActive ? '' : ''}`} />
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-current rounded-full" />
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
