'use client';

import React from 'react';
import { Boxes } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  label?: string;
  sublabel?: string;
  variant?: 'page' | 'chart' | 'inline';
  className?: string;
}

export function Loader({
  label = 'Loading workspace data...',
  sublabel,
  variant = 'page',
  className = '',
}: LoaderProps) {
  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-3 py-6 px-4 rounded-2xl bg-[#F5FBF9] dark:bg-[#081D22] border border-[#DCECE8] dark:border-[#123940]',
          className
        )}
      >
        <div className="relative w-6 h-6 shrink-0">
          <span className="absolute inset-0 rounded-full border-2 border-teal-200 dark:border-teal-900" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-600 dark:border-t-teal-400 border-r-emerald-400 animate-spin" />
        </div>
        <span className="text-xs font-semibold text-teal-900 dark:text-teal-200">{label}</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-bounce [animation-delay:300ms]" />
        </span>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div
        className={cn(
          'h-[270px] w-full flex flex-col items-center justify-center gap-4 rounded-2xl bg-[#F8FCFB]/70 dark:bg-[#081B20]/60 border border-dashed border-[#D4EAE5] dark:border-[#123940]',
          className
        )}
      >
        {/* Mini animated capsule equalizer bars echoing CapsuleBarChart */}
        <div className="flex items-end gap-2 h-12 px-4 py-2 rounded-2xl bg-white dark:bg-[#0A2228] border border-[#DCECE8] dark:border-[#143E46] shadow-2xs">
          <span className="w-2.5 rounded-full bg-amber-400/85 animate-pulse h-5 [animation-delay:0ms]" />
          <span className="w-2.5 rounded-full bg-pink-400/85 animate-pulse h-8 [animation-delay:150ms]" />
          <span className="w-2.5 rounded-full bg-lime-400/90 animate-pulse h-10 [animation-delay:300ms]" />
          <span className="w-2.5 rounded-full bg-teal-400/90 animate-pulse h-7 [animation-delay:450ms]" />
          <span className="w-2.5 rounded-full bg-rose-400/85 animate-pulse h-6 [animation-delay:600ms]" />
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
        </div>
      </div>
    );
  }

  // Default 'page' variant: Smart casual orbital emblem + progress sweep
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 px-4 text-center',
        className
      )}
    >
      <div className="relative p-6 rounded-3xl bg-white/90 dark:bg-[#091F25]/90 border border-[#D4EAE5] dark:border-[#133D45] shadow-xl shadow-teal-950/5 dark:shadow-black/30 flex flex-col items-center gap-4 max-w-xs w-full backdrop-blur-sm">
        {/* Orbital Dual Ring Emblem */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Soft ambient halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-400/20 via-emerald-300/20 to-lime-300/20 blur-md animate-pulse" />
          {/* Outer spinning arc */}
          <div className="absolute inset-0 rounded-full border-[3px] border-[#E1F2EE] dark:border-[#123940]" />
          <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-teal-600 dark:border-t-teal-400 border-r-emerald-400 animate-spin" />
          {/* Inner counter-spinning accent arc */}
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-lime-500/80 dark:border-b-lime-400/80 animate-spin [animation-direction:reverse] [animation-duration:1.6s]" />
          {/* Center Icon Badge */}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#093E3B] to-teal-600 dark:from-teal-400 dark:to-emerald-400 flex items-center justify-center shadow-sm">
            <Boxes className="w-4 h-4 text-white dark:text-zinc-950" />
          </div>
        </div>

        {/* Copy */}
        <div className="space-y-1">
          <p className="text-sm font-extrabold text-zinc-900 dark:text-white tracking-tight">
            {label}
          </p>
          {sublabel && (
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
              {sublabel}
            </p>
          )}
        </div>

        {/* Sleek Shimmer Sweep Bar */}
        <div className="w-44 h-1.5 rounded-full bg-[#E6F4F1] dark:bg-[#0D2B31] overflow-hidden relative">
          <div className="h-full w-20 rounded-full bg-gradient-to-r from-teal-500 via-emerald-400 to-lime-400 animate-loader-sweep" />
        </div>
      </div>
    </div>
  );
}
