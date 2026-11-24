'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

export interface DateRangeSelection {
  id: string;
  label: string;
  shortLabel: string;
  multiplier: number; // For scaling chart stats realistically
  startDate?: string;
  endDate?: string;
}

interface DateRangePickerProps {
  value: string;
  onChange: (selection: DateRangeSelection) => void;
  className?: string;
}

export const DATE_PRESETS: DateRangeSelection[] = [
  { id: 'this_week', label: 'This Week', shortLabel: 'This Week', multiplier: 0.82 },
  { id: 'last_7_days', label: 'Last 7 Days', shortLabel: 'Last 7D', multiplier: 0.91 },
  { id: 'this_month', label: 'This Month (Nov 2026)', shortLabel: 'This Month', multiplier: 1.0 },
  { id: 'last_month', label: 'Last Month (Oct 2026)', shortLabel: 'Last Month', multiplier: 1.12 },
  { id: 'this_quarter', label: 'This Quarter (Q4 2026)', shortLabel: 'Q4 2026', multiplier: 1.28 },
  { id: 'custom', label: 'Custom Range', shortLabel: 'Custom', multiplier: 1.0 },
];

export function DateRangePicker({ value, onChange, className = '' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(value || 'this_month');
  const [customStart, setCustomStart] = useState('2026-11-01');
  const [customEnd, setCustomEnd] = useState('2026-11-25');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedId(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentPreset =
    DATE_PRESETS.find((p) => p.id === selectedId) || DATE_PRESETS[2];

  const triggerLabel =
    selectedId === 'custom' && customStart && customEnd
      ? `${customStart.slice(5)} – ${customEnd.slice(5)}`
      : currentPreset.shortLabel;

  const handleSelectPreset = (preset: DateRangeSelection) => {
    setSelectedId(preset.id);
    if (preset.id !== 'custom') {
      onChange(preset);
      setIsOpen(false);
    }
  };

      const handleApplyCustom = () => {
    const start = customStart <= customEnd ? customStart : customEnd;
    const end = customStart <= customEnd ? customEnd : customStart;
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const daysSpan = Math.max(1, Math.round((endMs - startMs) / 86400000) + 1);
    const dynamicMultiplier = Number(Math.min(1.45, Math.max(0.55, 0.72 + daysSpan * 0.018)).toFixed(2));

    const customSelection: DateRangeSelection = {
      id: 'custom',
      label: `${start} to ${end}`,
      shortLabel: `${start.slice(5)} – ${end.slice(5)}`,
      multiplier: dynamicMultiplier,
      startDate: start,
      endDate: end,
    };
    setSelectedId('custom');
    onChange(customSelection);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      {/* Date Picker Pill Trigger (styled exactly like "This Month" pill in reference image) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-teal-400 dark:hover:border-teal-600 shadow-sm transition-all duration-200 outline-none"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
        <span className="font-semibold truncate">{triggerLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {/* Date Picker Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl p-3 z-50 bg-white dark:bg-[#081B20] border border-[#CCE3DF] dark:border-[#14434B] shadow-2xl shadow-teal-950/20 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E1ECE9] dark:border-[#102B30]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Select Chart Timeframe
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1 mb-3">
            {DATE_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-900 dark:text-teal-200 font-bold'
                      : 'text-zinc-700 dark:text-zinc-300 hover:bg-[#F0F8F6] dark:hover:bg-[#0D2D35]'
                  }`}
                >
                  <span>{preset.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom Date Range Section */}
          {selectedId === 'custom' && (
            <div className="p-2.5 rounded-xl bg-[#F0F7F5] dark:bg-[#051417] border border-[#D0E5E1] dark:border-[#103036] space-y-2 mt-2 animate-in fade-in duration-150">
              <span className="text-[10px] font-bold uppercase text-zinc-500">Pick Custom Dates</span>
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">Start Date</label>
                  <CustomDatePicker
                    value={customStart}
                    onChange={(date) => setCustomStart(date)}
                    placeholder="Start date..."
                    align="right"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-500 mb-0.5">End Date</label>
                  <CustomDatePicker
                    value={customEnd}
                    onChange={(date) => setCustomEnd(date)}
                    placeholder="End date..."
                    align="right"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                Apply Custom Range
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
