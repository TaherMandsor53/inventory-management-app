'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const selectOptions = pageSizeOptions.map((opt) => ({
    value: opt.toString(),
    label: `${opt} / page`,
  }));

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-4 bg-[#F8FCFB] dark:bg-[#07191E] border-t border-[#D9ECE7] dark:border-[#123940] rounded-b-3xl ${className}`}
    >
      {/* Showing entries info & Page size selector */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span>Showing</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {startRecord}
          </span>
          <span>to</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {endRecord}
          </span>
          <span>of</span>
          <span className="font-bold text-teal-700 dark:text-teal-400 font-mono">
            {totalItems}
          </span>
          <span>records</span>
        </div>

        <div className="h-4 w-px bg-zinc-300 dark:bg-zinc-700 hidden sm:block" />

        {/* Rows per page dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Rows:</span>
          <div className="w-28">
            <CustomSelect
              size="sm"
              value={pageSize.toString()}
              onChange={(val) => {
                onPageSizeChange(Number(val));
                onPageChange(1); // Reset to page 1 on page size change
              }}
              options={selectOptions}
            />
          </div>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1.5 self-center sm:self-auto">
        {/* Jump First */}
        <button
          type="button"
          disabled={safePage === 1}
          onClick={() => onPageChange(1)}
          title="First Page"
          className="p-1.5 rounded-lg border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Prev */}
        <button
          type="button"
          disabled={safePage === 1}
          onClick={() => onPageChange(safePage - 1)}
          title="Previous Page"
          className="p-1.5 rounded-lg border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Buttons */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-zinc-400 font-mono">
                  ...
                </span>
              );
            }
            const isCurrent = p === safePage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(p as number)}
                className={`min-w-[30px] h-[30px] px-2 text-xs font-semibold rounded-lg transition-all font-mono
                  ${
                    isCurrent
                      ? 'bg-teal-700 dark:bg-teal-500 text-white shadow-sm shadow-teal-900/30 font-bold scale-105'
                      : 'border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-700 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950/50'
                  }
                `}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next */}
        <button
          type="button"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(safePage + 1)}
          title="Next Page"
          className="p-1.5 rounded-lg border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Jump Last */}
        <button
          type="button"
          disabled={safePage === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last Page"
          className="p-1.5 rounded-lg border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-600 dark:text-zinc-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
