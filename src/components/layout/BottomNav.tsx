'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Dumbbell, BookOpen, Apple, TrendingUp } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',           icon: Home,       label: 'Home'      },
  { href: '/workout',    icon: Dumbbell,   label: 'Workout'   },
  { href: '/exercises',  icon: BookOpen,   label: 'Exercises' },
  { href: '/nutrition',  icon: Apple,      label: 'Nutrition' },
  { href: '/progress',   icon: TrendingUp, label: 'Progress'  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ background: 'rgba(7,11,20,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)' }}>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]"
              style={{
                color: active ? '#06b6d4' : '#475569',
                background: active ? 'rgba(6,182,212,0.1)' : 'transparent',
              }}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium tracking-wide">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
