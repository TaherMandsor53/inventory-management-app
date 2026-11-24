'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from 'lucide-react';

export interface SevenDayRange {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

interface SevenDayRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (range: SevenDayRange) => void;
  className?: string;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function addDays(str: string, days: number): string {
  const d = parseLocalDate(str);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
}

function diffDaysInclusive(start: string, end: string): number {
  const s = parseLocalDate(start).getTime();
  const e = parseLocalDate(end).getTime();
  return Math.round((e - s) / 86400000) + 1;
}

function formatShort(str: string): string {
  const d = parseLocalDate(str);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function SevenDayRangePicker({
  startDate,
  endDate,
  onChange,
  className = '',
}: SevenDayRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const [selectingEnd, setSelectingEnd] = useState(false);

  const initialView = parseLocalDate(endDate || startDate);
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraftStart(startDate);
    setDraftEnd(endDate);
  }, [startDate, endDate]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectingEnd(false);
        setDraftStart(startDate);
        setDraftEnd(endDate);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, startDate, endDate]);

  const quickPresets: { label: string; start: string; end: string }[] = [
    { label: 'Nov 19 – Nov 25', start: '2026-11-19', end: '2026-11-25' },
    { label: 'Nov 12 – Nov 18', start: '2026-11-12', end: '2026-11-18' },
    { label: 'Nov 05 – Nov 11', start: '2026-11-05', end: '2026-11-11' },
  ];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (dateStr: string) => {
    if (!selectingEnd) {
      // First click picks start date and automatically previews a 7-day range [start .. start+6]
      const autoEnd = addDays(dateStr, 6);
      setDraftStart(dateStr);
      setDraftEnd(autoEnd);
      setSelectingEnd(true);
    } else {
      // Second click customizes end date (clamped to max 7 days if >= start, otherwise restarts)
      if (dateStr < draftStart) {
        const autoEnd = addDays(dateStr, 6);
        setDraftStart(dateStr);
        setDraftEnd(autoEnd);
        setSelectingEnd(true);
      } else {
        const span = diffDaysInclusive(draftStart, dateStr);
        const clampedEnd = span > 7 ? addDays(draftStart, 6) : dateStr;
        setDraftEnd(clampedEnd);
        setSelectingEnd(false);
        onChange({ startDate: draftStart, endDate: clampedEnd });
        setIsOpen(false);
      }
    }
  };

  const handleApply = () => {
    onChange({ startDate: draftStart, endDate: draftEnd });
    setSelectingEnd(false);
    setIsOpen(false);
  };

  // Build calendar cells
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    cells.push({
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      isCurrentMonth: true,
      dateStr: `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    cells.push({
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    });
  }

  const activeSpan = diffDaysInclusive(draftStart, draftEnd);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Trigger Pill displaying actual date range */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-teal-400 dark:hover:border-teal-600 shadow-2xs transition-all outline-none whitespace-nowrap"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span>
          {formatShort(startDate)} – {formatShort(endDate)}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {/* Popover Calendar for 7-Day Range Selection */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-3xl p-4 z-50 bg-white dark:bg-[#081B20] border border-[#CCE3DF] dark:border-[#14434B] shadow-2xl shadow-teal-950/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 space-y-3">
          {/* Header & Hint */}
          <div className="flex items-center justify-between border-b border-[#E1ECE9] dark:border-[#102B30] pb-2">
            <div>
              <p className="text-xs font-extrabold text-zinc-900 dark:text-white">
                Select Date Range (Up to 7 Days)
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {selectingEnd
                  ? 'Pick an end date (max 7 days) or click Apply'
                  : 'Click a start date to select a 7-day window'}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {activeSpan}d
            </span>
          </div>

          {/* Quick 7-Day Presets */}
          <div className="flex flex-wrap gap-1.5">
            {quickPresets.map((preset) => {
              const isCurrent = startDate === preset.start && endDate === preset.end;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setDraftStart(preset.start);
                    setDraftEnd(preset.end);
                    setSelectingEnd(false);
                    onChange({ startDate: preset.start, endDate: preset.end });
                    setIsOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all border ${
                    isCurrent
                      ? 'bg-[#093E3B] dark:bg-teal-500 text-white dark:text-zinc-950 border-transparent'
                      : 'bg-[#F4FAF8] dark:bg-[#0B2329] text-teal-800 dark:text-teal-300 border-[#D4EAE5] dark:border-[#14434B] hover:border-teal-400'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((wd) => (
              <span
                key={wd}
                className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase py-0.5"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {cells.map((cell, idx) => {
              const isStart = cell.dateStr === draftStart;
              const isEnd = cell.dateStr === draftEnd;
              const isInRange = cell.dateStr > draftStart && cell.dateStr < draftEnd;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(cell.dateStr)}
                  className={`h-8 w-full text-xs flex items-center justify-center font-semibold transition-all ${
                    isStart && isEnd
                      ? 'bg-teal-600 text-white rounded-xl font-extrabold shadow-xs'
                      : isStart
                      ? 'bg-teal-600 text-white rounded-l-xl font-extrabold shadow-xs'
                      : isEnd
                      ? 'bg-teal-600 text-white rounded-r-xl font-extrabold shadow-xs'
                      : isInRange
                      ? 'bg-teal-100/90 dark:bg-teal-900/50 text-teal-900 dark:text-teal-200'
                      : cell.isCurrentMonth
                      ? 'text-zinc-800 dark:text-zinc-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-xl'
                      : 'text-zinc-300 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl'
                  }`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Selected Range Summary & Apply */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E1ECE9] dark:border-[#102B30]">
            <div className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300">
              {formatShort(draftStart)} – {formatShort(draftEnd)}
            </div>
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#093A3E] to-[#0E595F] dark:from-teal-500 dark:to-emerald-400 text-white dark:text-zinc-950 text-xs font-bold shadow-sm hover:opacity-95 transition-opacity"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
