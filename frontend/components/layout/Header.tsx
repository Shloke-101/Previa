'use client';

import React from 'react';
import { Search, Bell, ShieldCheck, Activity } from 'lucide-react';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onSearch?: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Pre-Visit Financial Clearance',
  subtitle = 'Verify eligibility, identify risk, and eliminate claim denials before encounters',
  onSearch,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-5 sticky top-0 z-20 shadow-xs flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative w-72 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, ID, MRN, insurance..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>

        {/* System Status Indicator */}
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-emerald-700 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span className="hidden sm:inline">Clearance Engine Active</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            FC
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-bold text-slate-900 block leading-none">Front-Desk Registrar</span>
            <span className="text-[10px] font-medium text-slate-400">Hospital Operations</span>
          </div>
        </div>
      </div>
    </header>
  );
};
