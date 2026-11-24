'use client';

import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Pagination } from './Pagination';

export interface DataTableColumn<T> {
  key: string;
  header: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  nowrap?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T, index: number) => React.ReactNode;
}

export interface DataTablePaginationConfig {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  rowKey: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  pagination?: DataTablePaginationConfig;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  onRowClick,
  emptyMessage = 'No records found matching your criteria.',
  emptyIcon,
  pagination,
  className = '',
}: DataTableProps<T>) {
  const alignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  return (
    <div
      className={cn(
        'rounded-3xl border border-[#DCECE8] dark:border-[#123940] bg-white dark:bg-[#0D2026] shadow-sm overflow-hidden transition-colors',
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-gradient-to-r from-[#EFF8F6] via-[#F5FBF9] to-[#EFF8F6] dark:from-[#091F25] dark:via-[#0A2329] dark:to-[#081D23] border-b border-[#DCECE8] dark:border-[#123940]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    'py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-[#436468] dark:text-teal-200/80 whitespace-nowrap select-none',
                    alignClass(col.align),
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#EDF6F4] dark:divide-[#102B30]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 px-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-zinc-400 dark:text-zinc-500">
                    <div className="p-3 rounded-2xl bg-[#F2F9F7] dark:bg-[#092026] border border-[#DCECE8] dark:border-[#143D45] text-teal-600/70 dark:text-teal-400/70">
                      {emptyIcon || <Inbox className="w-5 h-5" />}
                    </div>
                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {emptyMessage}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey(row, idx)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    'group transition-colors duration-150',
                    onRowClick
                      ? 'cursor-pointer hover:bg-[#F3FAF8] dark:hover:bg-[#102A31]'
                      : 'hover:bg-[#F7FCFA] dark:hover:bg-[#0F272E]'
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        'py-3.5 px-4 align-middle',
                        col.nowrap !== false && 'whitespace-nowrap',
                        alignClass(col.align),
                        col.cellClassName
                      )}
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
          pageSizeOptions={pagination.pageSizeOptions}
        />
      )}
    </div>
  );
}
