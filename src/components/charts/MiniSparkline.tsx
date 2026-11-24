'use client';

import React from 'react';

interface MiniSparklineProps {
  color?: 'mint' | 'aqua' | 'rose' | 'lavender' | 'peach';
}

export function MiniSparkline({ color = 'mint' }: MiniSparklineProps) {
  // Styles matching the 4 vertical bars in Image 2
  const bars = {
    mint: {
      light: ['bg-emerald-400/40', 'bg-emerald-400/60', 'bg-emerald-500/80', 'bg-[#0E493F]'],
      dark: ['bg-emerald-400/30', 'bg-emerald-400/50', 'bg-emerald-400/70', 'bg-emerald-300'],
    },
    aqua: {
      light: ['bg-teal-400/40', 'bg-teal-400/60', 'bg-teal-500/80', 'bg-[#0A4743]'],
      dark: ['bg-teal-400/30', 'bg-teal-400/50', 'bg-teal-400/70', 'bg-teal-300'],
    },
    rose: {
      light: ['bg-rose-400/40', 'bg-rose-400/60', 'bg-rose-500/80', 'bg-[#5B101B]'],
      dark: ['bg-rose-400/30', 'bg-rose-400/50', 'bg-rose-400/70', 'bg-rose-300'],
    },
    lavender: {
      light: ['bg-purple-400/40', 'bg-purple-400/60', 'bg-purple-500/80', 'bg-[#3B196C]'],
      dark: ['bg-purple-400/30', 'bg-purple-400/50', 'bg-purple-400/70', 'bg-purple-300'],
    },
    peach: {
      light: ['bg-amber-400/40', 'bg-amber-400/60', 'bg-amber-500/80', 'bg-[#6D300B]'],
      dark: ['bg-amber-400/30', 'bg-amber-400/50', 'bg-amber-400/70', 'bg-amber-300'],
    },
  }[color];

  // Heights matching the step up in Image 2: e.g. 35%, 50%, 40%, 100%
  const heights = [35, 52, 42, 100];

  return (
    <div className="flex items-end gap-1.5 h-11 px-1 shrink-0">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-2 rounded-full transition-all duration-200 ${bars.light[i]} dark:${bars.dark[i]}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}
