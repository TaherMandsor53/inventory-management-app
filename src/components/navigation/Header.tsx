'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  RotateCcw,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useToast } from '@/components/ui/Toast';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenMobileSidebar: () => void;
  onOpenCreatePO?: () => void;
  onOpenCreateSale?: () => void;
  onOpenCreateProduct?: () => void;
  onDataMutated?: () => void;
  sidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export function Header({
  onOpenSearch,
  onOpenMobileSidebar,
  onDataMutated,
  sidebarCollapsed,
  onToggleSidebarCollapse,
}: HeaderProps) {
  const pathname = usePathname();
  const { toast } = useToast();
  const [resetting, setResetting] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (pathname) {
      case '/':
        return 'Executive Overview & Live Analytics';
      case '/stock':
        return 'Stock & Godowns Ledger';
      case '/purchases':
        return 'Purchase Orders (Inbound)';
      case '/sales':
        return 'Sales Orders & Invoices (Outbound)';
      case '/reports':
        return 'Valuation, Sales & Spend Reports';
      default:
        return 'Inventory System';
    }
  };

  const handleResetData = async () => {
    if (resetting) return;
    setResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset demo data');
      toast({
        type: 'success',
        title: 'Demo Data Reset',
        message: 'All inventory quantities, sample POs, and sales orders restored to initial seed state.',
      });
      if (onDataMutated) {
        onDataMutated();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Reset Failed',
        message: err.message,
      });
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/85 dark:bg-[#08171B]/90 backdrop-blur-md border-b border-[#E1ECE9] dark:border-[#102B30] px-3.5 sm:px-6 flex items-center justify-between transition-colors shadow-2xs">
      {/* Left: Mobile Toggle, Desktop Collapse Toggle & Breadcrumbs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile menu trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-teal-800 dark:text-teal-200 hover:bg-teal-50 dark:hover:bg-teal-950/60 border border-teal-200/60 dark:border-teal-900/60 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          onClick={onToggleSidebarCollapse}
          className="hidden lg:flex p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center text-xs text-zinc-400 gap-1.5 font-medium">
          <span className="text-zinc-500 hidden md:inline">Workspace</span>
          <ChevronRight className="w-3.5 h-3.5 hidden md:inline opacity-50" />
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold tracking-tight text-xs sm:text-sm">
            {getBreadcrumbTitle()}
          </span>
        </nav>
      </div>

      {/* Right: Search bar, Reset, Theme */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Bar matching Image 2 */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-200/80 dark:border-[#1A3D44] bg-[#F4F9F8] dark:bg-[#0A2026] text-zinc-500 dark:text-zinc-400 hover:border-teal-400 dark:hover:border-teal-600 text-xs transition-all shadow-2xs group"
          title="Search inventory (Cmd+K)"
        >
          <Search className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline text-zinc-600 dark:text-zinc-300">
            Search items, SKUs, POs...
          </span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 bg-white dark:bg-zinc-800 text-[10px] font-mono text-zinc-500">
            ⌘K
          </kbd>
        </button>

        {/* Reset Demo Data Button */}
        <button
          onClick={handleResetData}
          disabled={resetting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-300/80 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-semibold transition-colors shadow-2xs disabled:opacity-50"
          title="Reset in-memory inventory to original demo state"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span className="hidden xl:inline">Reset Demo</span>
        </button>

        {/* Theme Toggle */}
        <div className="pl-1 border-l border-teal-200 dark:border-teal-900">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
