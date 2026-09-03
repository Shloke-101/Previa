import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { ClearanceStatus } from '../../types';

interface ClearanceBadgeProps {
  status: ClearanceStatus | string | undefined;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ClearanceBadge: React.FC<ClearanceBadgeProps> = ({
  status = 'NEEDS_ACTION',
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1 rounded-md',
    md: 'px-3 py-1 text-sm font-semibold gap-1.5 rounded-lg',
    lg: 'px-4 py-1.5 text-base font-bold gap-2 rounded-xl shadow-sm',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  switch (status) {
    case 'CLEARED':
      return (
        <span
          className={`inline-flex items-center bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 ${sizeClasses[size]}`}
        >
          {showIcon && <CheckCircle2 className={`${iconSizes[size]} text-emerald-600 dark:text-emerald-400`} />}
          <span>✓ CLEARED</span>
        </span>
      );

    case 'NEEDS_ACTION':
      return (
        <span
          className={`inline-flex items-center bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 ${sizeClasses[size]}`}
        >
          {showIcon && <AlertTriangle className={`${iconSizes[size]} text-amber-600 dark:text-amber-400`} />}
          <span>! NEEDS ACTION</span>
        </span>
      );

    case 'HIGH_RISK':
      return (
        <span
          className={`inline-flex items-center bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 ${sizeClasses[size]}`}
        >
          {showIcon && <AlertCircle className={`${iconSizes[size]} text-rose-600 dark:text-rose-400`} />}
          <span>⚠ HIGH RISK</span>
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center bg-slate-100 text-slate-700 border border-slate-200 ${sizeClasses[size]}`}
        >
          <span>{status}</span>
        </span>
      );
  }
};
