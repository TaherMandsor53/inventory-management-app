'use client';

import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  title?: string;
  text: string;
  tip?: string;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  iconType?: 'help' | 'info';
}

export function HelpTooltip({
  title,
  text,
  tip,
  className,
  iconClassName,
  side = 'top',
  iconType = 'help',
}: HelpTooltipProps) {
  const [visible, setVisible] = useState(false);
  const Icon = iconType === 'info' ? Info : HelpCircle;

  const sidePosition = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }[side];

  return (
    <div
      className={cn('relative inline-flex items-center group', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={(e) => {
        e.stopPropagation();
        setVisible((prev) => !prev);
      }}
    >
      <button
        type="button"
        className={cn(
          'p-0.5 rounded-full text-zinc-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none cursor-help',
          iconClassName
        )}
        aria-label="Component Information"
      >
        <Icon className="w-3.5 h-3.5" />
      </button>

      {/* Floating Help Popover */}
      {visible && (
        <div
          className={cn(
            'absolute z-50 w-64 p-3 rounded-xl bg-white dark:bg-[#0A2026] text-zinc-800 dark:text-zinc-100 text-xs shadow-2xl border border-teal-200/90 dark:border-teal-800/80 animate-in fade-in zoom-in-95 duration-150 pointer-events-none sm:pointer-events-auto',
            sidePosition
          )}
        >
          {title && (
            <p className="font-bold text-[11px] uppercase tracking-wider text-teal-800 dark:text-teal-300 mb-1 flex items-center gap-1.5">
              <Icon className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              {title}
            </p>
          )}
          <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-300">{text}</p>
          {tip && (
            <div className="mt-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-teal-700 dark:text-teal-400 font-medium flex items-center gap-1">
              <span>💡 {tip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
