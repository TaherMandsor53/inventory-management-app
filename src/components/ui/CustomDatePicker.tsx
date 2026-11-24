'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Check,
} from 'lucide-react';

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  align?: 'left' | 'right';
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

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function CustomDatePicker({
  value,
  onChange,
  placeholder = 'Select date...',
  disabled = false,
  className = '',
  minDate,
  maxDate,
  required = false,
  align = 'left',
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month from value, or default to current date
  const parseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const [y, m, d] = dStr.split('-').map(Number);
    if (!y || !m || !d) return new Date();
    return new Date(y, m - 1, d);
  };

  const initialDate = parseDate(value);
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = parseDate(value);
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Generate calendar days for the current view
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const calendarDays: {
    year: number;
    month: number;
    day: number;
    isCurrentMonth: boolean;
    dateStr: string;
  }[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const m = viewMonth === 0 ? 11 : viewMonth - 1;
    const y = viewMonth === 0 ? viewYear - 1 : viewYear;
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    calendarDays.push({
      year: y,
      month: m,
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${mStr}-${dStr}`,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInCurrentMonth; day++) {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    calendarDays.push({
      year: viewYear,
      month: viewMonth,
      day,
      isCurrentMonth: true,
      dateStr: `${viewYear}-${mStr}-${dStr}`,
    });
  }

  // 3. Next month leading days (fill up to complete weeks, e.g. 35 or 42 cells)
  const remainingCells = (7 - (calendarDays.length % 7)) % 7;
  for (let day = 1; day <= remainingCells; day++) {
    const m = viewMonth === 11 ? 0 : viewMonth + 1;
    const y = viewMonth === 11 ? viewYear + 1 : viewYear;
    const mStr = String(m + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    calendarDays.push({
      year: y,
      month: m,
      day,
      isCurrentMonth: false,
      dateStr: `${y}-${mStr}-${dStr}`,
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSelectDay = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleSetToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(todayStr);
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  // Format display text
  const formatDisplay = (dStr: string) => {
    if (!dStr) return '';
    try {
      const [y, m, d] = dStr.split('-').map(Number);
      if (!y || !m || !d) return dStr;
      const date = new Date(y, m - 1, d);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dStr;
    }
  };

  return (
    <div className={`relative inline-block w-full ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
          isOpen
            ? 'border-teal-500 ring-2 ring-teal-500/15 bg-white dark:bg-[#07191E]'
            : 'border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#081D23] hover:border-teal-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          {value ? (
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold truncate">
              {formatDisplay(value)}
            </span>
          ) : (
            <span className="text-zinc-400 truncate">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 text-zinc-400">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              className="p-0.5 rounded-md hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-72 rounded-2xl p-3.5 z-[60] bg-white dark:bg-[#081B20] border border-[#CCE3DF] dark:border-[#14434B] shadow-2xl shadow-teal-950/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Month & Year Navigation Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E1ECE9] dark:border-[#102B30]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors"
              title="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-teal-50 dark:hover:bg-teal-950/60 transition-colors"
              title="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Names */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEKDAY_NAMES.map((day) => (
              <span
                key={day}
                className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider py-0.5"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((cd, idx) => {
              const isSelected = cd.dateStr === value;
              const isToday = cd.dateStr === todayStr;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(cd.dateStr)}
                  className={`h-8 w-8 mx-auto rounded-xl text-xs flex items-center justify-center font-medium transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white font-extrabold shadow-sm scale-105'
                      : isToday
                      ? 'border border-teal-500 text-teal-600 dark:text-teal-400 font-bold bg-teal-50/50 dark:bg-teal-950/40'
                      : cd.isCurrentMonth
                      ? 'text-zinc-800 dark:text-zinc-200 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300'
                      : 'text-zinc-300 dark:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {cd.day}
                </button>
              );
            })}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#E1ECE9] dark:border-[#102B30] text-[11px]">
            <button
              type="button"
              onClick={handleClear}
              className="text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-2 py-1 rounded-md transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleSetToday}
              className="text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 font-bold px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-800 transition-colors"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
