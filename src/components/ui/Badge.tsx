import React from 'react';
import { cn } from '@/lib/utils';
import { StockStatus, POStatus, SalesStatus } from '@/types';

type BadgeVariant = StockStatus | POStatus | SalesStatus | 'default' | 'neutral' | 'info';

interface StatusBadgeProps {
  status: BadgeVariant | string;
  className?: string;
  dot?: boolean;
}

export function StatusBadge({ status, className, dot = true }: StatusBadgeProps) {
  let label = status;
  let styleClasses = 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
  let dotClasses = 'bg-zinc-500';

  switch (status) {
    // Healthy / Paid / Received / Success (Emerald)
    case 'in_stock':
      label = 'In Stock';
      styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80';
      dotClasses = 'bg-emerald-500';
      break;
    case 'paid':
      label = 'Paid';
      styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80';
      dotClasses = 'bg-emerald-500';
      break;
    case 'received':
      label = 'Received';
      styleClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800/80';
      dotClasses = 'bg-emerald-500';
      break;

    // Amber / Pending / Low Stock
    case 'low_stock':
      label = 'Low Stock';
      styleClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/80';
      dotClasses = 'bg-amber-500 animate-pulse';
      break;
    case 'pending':
      label = 'Pending';
      styleClasses = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800/80';
      dotClasses = 'bg-amber-500';
      break;
    case 'draft':
      label = 'Draft';
      styleClasses = 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700';
      dotClasses = 'bg-zinc-400';
      break;
    case 'confirmed':
      label = 'Confirmed';
      styleClasses = 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800/80';
      dotClasses = 'bg-blue-500';
      break;

    // Rose / Out of Stock / Cancelled / Overdue
    case 'out_of_stock':
      label = 'Out of Stock';
      styleClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/80';
      dotClasses = 'bg-rose-500';
      break;
    case 'cancelled':
      label = 'Cancelled';
      styleClasses = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-400 dark:border-rose-800/80';
      dotClasses = 'bg-rose-500';
      break;

    default:
      label = status;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-tight whitespace-nowrap',
        styleClasses,
        className
      )}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotClasses)} />}
      <span className="capitalize">{label}</span>
    </span>
  );
}
