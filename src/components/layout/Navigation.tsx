'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/schedule', label: 'Schedule', icon: '📅' },
  { href: '/staff', label: 'Staff', icon: '👥' },
  { href: '/shifts', label: 'Shifts', icon: '⏰' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="w-56 bg-white border-r border-[var(--border)] flex flex-col shrink-0">
      <div className="p-4 border-b border-[var(--border)]">
        <h1 className="text-lg font-bold text-[var(--primary)]">Staff Scheduler</h1>
        <p className="text-xs text-[var(--muted)]">Spa / Café / Bar</p>
      </div>
      <div className="flex-1 p-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--primary-light)] text-[var(--primary)]'
                  : 'text-[var(--secondary)] hover:bg-[var(--secondary-light)] hover:text-[var(--foreground)]'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
