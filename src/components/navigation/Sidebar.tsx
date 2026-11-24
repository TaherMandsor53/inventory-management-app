'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ReceiptText,
  BarChart3,
  Warehouse,
  Boxes,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  Sliders,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Layers,
  ArrowRightLeft,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen, collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [pendingPoCount, setPendingPoCount] = useState<number>(0);
  const [mounted, setMounted] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState<{
    title: string;
    badge?: string | null;
    badgeColor?: string;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setHoveredTooltip(null);
  }, [collapsed, pathname]);

  // Fetch count badges
  useEffect(() => {
    const fetchBadges = () => {
      fetch('/api/dashboard')
        .then((res) => res.json())
        .then((data) => {
          if (data?.kpis) {
            setLowStockCount(data.kpis.lowStockCount || 0);
            setPendingPoCount(data.kpis.pendingPurchaseOrders || 0);
          }
        })
        .catch(() => {});
    };

    fetchBadges();
    const interval = setInterval(fetchBadges, 8000);
    return () => clearInterval(interval);
  }, []);

  const navSections = [
    {
      group: 'MAIN MENU',
      items: [
        {
          title: 'Dashboard',
          href: '/',
          icon: LayoutDashboard,
          badge: null,
          color: 'text-teal-600 dark:text-teal-400',
        },
        {
          title: 'Stock & Godowns',
          href: '/stock',
          icon: Package,
          badge: lowStockCount > 0 ? `${lowStockCount} low` : null,
          badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300',
          color: 'text-emerald-600 dark:text-emerald-400',
        },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        {
          title: 'Purchase Orders',
          href: '/purchases',
          icon: ShoppingCart,
          badge: pendingPoCount > 0 ? `${pendingPoCount} pending` : null,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300',
          color: 'text-blue-600 dark:text-blue-400',
        },
        {
          title: 'Sales & Invoices',
          href: '/sales',
          icon: ReceiptText,
          badge: null,
          color: 'text-violet-600 dark:text-violet-400',
        },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        {
          title: 'Reports & Analytics',
          href: '/reports',
          icon: BarChart3,
          badge: null,
          color: 'text-amber-600 dark:text-amber-400',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile / Tablet Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 bg-[#F5FAF8] dark:bg-[#07161B] text-[#113236] dark:text-zinc-100 border-r border-[#DCECE8] dark:border-[#12333A] flex flex-col transition-all duration-300 ease-in-out shadow-sm dark:shadow-xl',
          // Desktop collapsed vs expanded
          collapsed ? 'lg:w-[72px]' : 'lg:w-64',
          // Mobile open vs closed
          mobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-[#E3F0ED] dark:border-[#12333A]',
            collapsed && !mobileOpen ? 'px-2 justify-center gap-1' : 'px-4 justify-between'
          )}
        >
          <Link
            href="/"
            onMouseEnter={(e) => {
              if (!collapsed || mobileOpen) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredTooltip({
                title: 'Inventory System',
                top: rect.top + rect.height / 2,
                left: rect.right + 12,
              });
            }}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={cn(
              'flex items-center gap-3 font-semibold text-sm tracking-tight text-[#093E3B] dark:text-white group min-w-0',
              collapsed && !mobileOpen && 'justify-center'
            )}
          >
            {/* Logo Badge matching the circular logo in the reference image */}
            <div
              className={cn(
                'rounded-full bg-gradient-to-br from-[#093E3B] via-teal-700 to-emerald-500 dark:from-emerald-400 dark:via-teal-500 dark:to-teal-700 flex items-center justify-center shadow-md shadow-teal-900/15 shrink-0 group-hover:scale-105 transition-transform border border-teal-200/50 dark:border-emerald-300/40',
                collapsed && !mobileOpen ? 'w-8 h-8 min-w-[32px] min-h-[32px]' : 'w-9 h-9 min-w-[36px] min-h-[36px]'
              )}
            >
              <Boxes className="w-4 h-4 text-white dark:text-zinc-950 font-bold" />
            </div>

            {(!collapsed || mobileOpen) && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <span className="font-extrabold tracking-tight text-sm text-[#093E3B] dark:text-white flex items-center gap-1.5 truncate">
                  Inventory System
                </span>
                <span className="text-[10px] text-[#5B7E82] dark:text-teal-300/80 truncate font-medium">
                  Warehouse & Order OS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle Button */}
          <button
            type="button"
            onClick={() => setCollapsed((prev) => !prev)}
            onMouseEnter={(e) => {
              if (!collapsed || mobileOpen) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredTooltip({
                title: 'Expand Sidebar',
                top: rect.top + rect.height / 2,
                left: rect.right + 12,
              });
            }}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={cn(
              'hidden lg:flex rounded-lg text-[#5B7E82] dark:text-teal-300 hover:text-[#093E3B] dark:hover:text-white hover:bg-[#E4F2EE] dark:hover:bg-teal-900/60 transition-colors shrink-0',
              collapsed && !mobileOpen ? 'p-1' : 'p-1.5'
            )}
            aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 px-3 py-5 space-y-6 overflow-y-auto overflow-x-hidden">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1.5">
              {(!collapsed || mobileOpen) && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#6D8F93] dark:text-teal-300/60">
                  {section.group}
                </div>
              )}

              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isCollapsedDesktop = collapsed && !mobileOpen;

                return (
                  <div key={item.href} className="relative group">
                    <Link
                      href={item.href}
                      onClick={() => {
                        setMobileOpen(false);
                        setHoveredTooltip(null);
                      }}
                      onMouseEnter={(e) => {
                        if (!isCollapsedDesktop) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredTooltip({
                          title: item.title,
                          badge: item.badge,
                          badgeColor: item.badgeColor,
                          top: rect.top + rect.height / 2,
                          left: rect.right + 14,
                        });
                      }}
                      onMouseLeave={() => setHoveredTooltip(null)}
                      onFocus={(e) => {
                        if (!isCollapsedDesktop) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredTooltip({
                          title: item.title,
                          badge: item.badge,
                          badgeColor: item.badgeColor,
                          top: rect.top + rect.height / 2,
                          left: rect.right + 14,
                        });
                      }}
                      onBlur={() => setHoveredTooltip(null)}
                      className={cn(
                        'flex items-center rounded-2xl text-xs font-semibold transition-all relative',
                        isCollapsedDesktop
                          ? 'justify-center h-10 w-10 mx-auto'
                          : 'justify-between px-3 py-2.5',
                        isActive
                          ? 'bg-[#093E3B] dark:bg-teal-500/25 text-white dark:text-teal-100 shadow-md shadow-teal-950/15 dark:border dark:border-teal-500/40'
                          : isCollapsedDesktop
                          ? 'bg-white/90 dark:bg-[#0D272D] text-teal-700 dark:text-teal-300 border border-[#DCECE8] dark:border-[#143C44] shadow-2xs hover:bg-[#E7F3F0] hover:text-[#093E3B] dark:hover:bg-[#11333B] hover:scale-105'
                          : 'text-[#436468] dark:text-teal-100/70 hover:text-[#093E3B] dark:hover:text-white hover:bg-[#E7F3F0] dark:hover:bg-[#0C2B32]'
                      )}
                    >
                      {isCollapsedDesktop ? (
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                      ) : (
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              'p-1.5 rounded-xl transition-transform shrink-0',
                              isActive
                                ? 'bg-emerald-400/20 dark:bg-emerald-400 text-emerald-200 dark:text-zinc-950 font-bold'
                                : 'bg-white/80 dark:bg-[#0D272D] text-teal-700 dark:text-teal-300 shadow-2xs group-hover:scale-105'
                            )}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="truncate">{item.title}</span>
                        </div>
                      )}

                      {!isCollapsedDesktop && item.badge && (
                        <span
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full font-bold tracking-tight shadow-2xs shrink-0',
                            item.badgeColor
                          )}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Subtle alert dot ONLY for items carrying live count badges when collapsed */}
                      {isCollapsedDesktop && item.badge && (
                        <span className="absolute -right-0.5 -top-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-[#F5FAF8] dark:ring-[#07161B]" />
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User / Session Section */}
        <div className="p-3 border-t border-[#E3F0ED] dark:border-[#12333A] bg-[#EFF7F5] dark:bg-[#051216]">
          <div
            onMouseEnter={(e) => {
              if (!collapsed || mobileOpen) return;
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredTooltip({
                title: 'Operations Lead · Admin Verified',
                top: rect.top + rect.height / 2,
                left: rect.right + 14,
              });
            }}
            onMouseLeave={() => setHoveredTooltip(null)}
            className={cn(
              'flex items-center rounded-2xl bg-white dark:bg-[#0A2228] border border-[#DCECE8] dark:border-[#143C44] p-2 shadow-2xs',
              collapsed && !mobileOpen ? 'justify-center' : 'justify-between'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#093E3B] to-teal-500 dark:from-teal-400 dark:to-emerald-300 text-white dark:text-zinc-950 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                OP
              </div>
              {(!collapsed || mobileOpen) && (
                <div className="truncate">
                  <p className="text-xs font-bold text-[#093E3B] dark:text-white truncate">Operations Lead</p>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 truncate flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Admin Verified
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Portaled Fixed Tooltip for Collapsed Sidebar (bypasses overflow clipping) */}
      {mounted &&
        hoveredTooltip &&
        collapsed &&
        !mobileOpen &&
        createPortal(
          <div
            style={{
              top: hoveredTooltip.top,
              left: hoveredTooltip.left,
              transform: 'translateY(-50%)',
            }}
            className="fixed z-[120] pointer-events-none px-3 py-1.5 bg-[#093E3B] dark:bg-[#0B252B] text-white text-xs rounded-xl shadow-xl border border-teal-700/50 dark:border-teal-700/60 whitespace-nowrap flex items-center gap-2 animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="font-semibold">{hoveredTooltip.title}</span>
            {hoveredTooltip.badge && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.5 rounded-full font-bold',
                  hoveredTooltip.badgeColor
                )}
              >
                {hoveredTooltip.badge}
              </span>
            )}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-[#093E3B] dark:border-r-[#0B252B]" />
          </div>,
          document.body
        )}
    </>
  );
}
