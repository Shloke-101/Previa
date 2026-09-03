'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ListOrdered,
  BellAlert,
  BarChart3,
  ShieldCheck,
  Zap,
  Settings
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Clearance Engine', href: '/clearance', icon: ShieldCheck },
    { name: 'Priority Queue', href: '/priority-queue', icon: ListOrdered },
    { name: 'Alerts', href: '/alerts', icon: BellAlert },
    { name: 'Analytics & Root Cause', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 select-none z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 font-black text-xl">
            P
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block leading-none">PREVIA</span>
            <span className="text-[10px] font-semibold tracking-wider text-brand-400 uppercase">Financial Clearance</span>
          </div>
        </Link>
      </div>

      {/* Tagline */}
      <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
        <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Know before they go.</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
          Core Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Environment / System Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1">
          <span>Target Port</span>
          <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-1.5 py-0.5 rounded text-[11px]">
            8001
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>Data Engine</span>
          <span className="text-slate-300 font-mono text-[11px]">Synthetic Mock API</span>
        </div>
      </div>
    </aside>
  );
};
