'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}: ModalProps) {
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
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        className={cn(
          'relative w-full z-10 bg-white dark:bg-[#07181D] border border-[#CCE3DF] dark:border-[#14434B] rounded-3xl shadow-2xl overflow-hidden transition-all animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col',
          maxWidthClass
        )}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#E1ECE9] dark:border-[#102B30] bg-gradient-to-r from-[#EEF8F6] via-[#F5FBF9] to-[#E6F6F2] dark:from-[#092228] dark:to-[#071B20]">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/80 dark:bg-[#0D2E36] border border-[#CCE3DF] dark:border-[#14434B] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:scale-105 transition-all shadow-2xs shrink-0 ml-3"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
