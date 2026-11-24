'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  prefixIcon?: React.ReactNode;
  align?: 'left' | 'right';
}

interface MenuCoords {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  minWidth: number;
  maxHeight: number;
  openUp: boolean;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  label,
  disabled = false,
  className = '',
  size = 'md',
  prefixIcon,
  align = 'left',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuCoords, setMenuCoords] = useState<MenuCoords | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const desiredHeight = Math.min(240, Math.max(88, options.length * 36 + 16));
    const openUp = spaceBelow < desiredHeight && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(240, openUp ? spaceAbove : spaceBelow));

    const maxMenuWidth = Math.min(380, window.innerWidth - 24);
    const minWidth = Math.min(rect.width, maxMenuWidth);

    if (align === 'right') {
      const rightEdge = Math.max(12, window.innerWidth - rect.right);
      setMenuCoords({
        top: openUp ? undefined : rect.bottom + 6,
        bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
        right: rightEdge,
        minWidth,
        maxHeight,
        openUp,
      });
    } else {
      const clampedLeft = Math.min(rect.left, Math.max(12, window.innerWidth - minWidth - 12));
      setMenuCoords({
        top: openUp ? undefined : rect.bottom + 6,
        bottom: openUp ? window.innerHeight - rect.top + 6 : undefined,
        left: Math.max(12, clampedLeft),
        minWidth,
        maxHeight,
        openUp,
      });
    }
  }, [align, options.length]);

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();

    const handleScrollOrResize = () => updateMenuPosition();
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isOpen, updateMenuPosition]);

  // Close when clicking outside both trigger container and portaled menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inTrigger = containerRef.current && containerRef.current.contains(target);
      const inMenu = menuRef.current && menuRef.current.contains(target);
      if (!inTrigger && !inMenu) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const sizeClasses =
    size === 'sm'
      ? 'h-8 px-2.5 text-xs'
      : 'h-10 px-3.5 text-xs sm:text-sm';

  const dropdownMenu =
    isOpen && mounted && menuCoords
      ? createPortal(
          <div
            ref={menuRef}
            style={{
              position: 'fixed',
              top: menuCoords.top,
              bottom: menuCoords.bottom,
              left: menuCoords.left,
              right: menuCoords.right,
              minWidth: menuCoords.minWidth,
              maxWidth: 'min(380px, calc(100vw - 24px))',
              maxHeight: menuCoords.maxHeight,
            }}
            className={`z-[130] overflow-y-auto rounded-2xl p-1.5
              bg-white dark:bg-[#081B20] border border-[#CCE3DF] dark:border-[#14434B]
              shadow-2xl shadow-teal-950/20 dark:shadow-black/60 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150`}
          >
            {options.length === 0 ? (
              <div className="py-2.5 px-3 text-xs text-zinc-400 text-center">No options available</div>
            ) : (
              options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-xs sm:text-[13px] rounded-xl transition-colors text-left
                      ${
                        isSelected
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 font-semibold'
                          : 'text-zinc-700 dark:text-zinc-300 hover:bg-[#F0F8F6] dark:hover:bg-[#0D2D35]'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      <span className="truncate">{option.label}</span>
                      {option.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                          {option.badge}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div className={`relative block w-full min-w-0 text-left ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            if (!isOpen) updateMenuPosition();
            setIsOpen(!isOpen);
          }
        }}
        className={`w-full min-w-0 overflow-hidden flex items-center justify-between gap-2 rounded-xl border transition-all duration-200 outline-none
          ${sizeClasses}
          ${
            disabled
              ? 'opacity-50 cursor-not-allowed bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
              : 'cursor-pointer'
          }
          ${
            isOpen
              ? 'border-teal-500 ring-2 ring-teal-500/20 bg-white dark:bg-[#0B2329]'
              : 'border-[#CCE3DF] dark:border-[#14434B] hover:border-teal-400 dark:hover:border-teal-600 bg-white dark:bg-[#091D22]'
          }
          text-zinc-900 dark:text-zinc-100 shadow-2xs
        `}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
          {prefixIcon && <span className="text-zinc-400 shrink-0">{prefixIcon}</span>}
          {selectedOption?.icon && <span className="shrink-0">{selectedOption.icon}</span>}
          <span className="truncate font-medium block">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.badge && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 shrink-0">
              {selectedOption.badge}
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-teal-600 dark:text-teal-400' : ''
          }`}
        />
      </button>

      {dropdownMenu}
    </div>
  );
}
