'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export function Sheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'lg',
}: SheetProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const widthClass = {
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[width];

  const sheetContent = (
    <div className="fixed inset-0 z-[100] overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/55 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex pl-8 sm:pl-10">
        <div
          className={cn(
            'w-screen bg-white dark:bg-[#07181D] border-l border-[#CCE3DF] dark:border-[#14434B] rounded-l-3xl shadow-2xl flex flex-col overflow-hidden transition-all animate-in slide-in-from-right duration-300',
            widthClass
          )}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#E1ECE9] dark:border-[#102B30] flex items-start justify-between bg-gradient-to-r from-[#EEF8F6] via-[#F5FBF9] to-[#E6F6F2] dark:from-[#092228] dark:to-[#071B20]">
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/80 dark:bg-[#0D2E36] border border-[#CCE3DF] dark:border-[#14434B] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:scale-105 transition-all shadow-2xs shrink-0 ml-3"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );

  return createPortal(sheetContent, document.body);
}
