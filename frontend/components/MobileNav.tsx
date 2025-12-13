'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Sprout, Droplets, MessageSquare } from 'lucide-react';

const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/fields', icon: MapPin, label: 'Fields' },
    { href: '/plants', icon: Sprout, label: 'Plants' },
    { href: '/irrigation', icon: Droplets, label: 'Water' },
    { href: '/chat', icon: MessageSquare, label: 'AI' },
];

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 md:hidden z-50">
            <div className="flex items-center justify-around py-2 pb-safe">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-3 py-1 transition-colors ${isActive
                                    ? 'text-emerald-600'
                                    : 'text-slate-500 active:text-emerald-600'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
