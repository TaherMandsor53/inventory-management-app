'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Boxes,
  Warehouse,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardKPIs, Product, StockMovement } from '@/types';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';

export type KPIType = 'stock_value' | 'total_skus' | 'pending_pos' | 'monthly_revenue';

interface KPIDetailModalProps {
  type: KPIType | null;
  isOpen: boolean;
  onClose: () => void;
  kpis: DashboardKPIs | null;
  lowStockItems: Product[];
  recentActivity: StockMovement[];
  godownStats: { name: string; count: number; totalQty: number; value: number }[];
}

export function KPIDetailModal({
  type,
  isOpen,
  onClose,
  kpis,
  lowStockItems,
  recentActivity,
  godownStats,
}: KPIDetailModalProps) {
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

  if (!isOpen || !type || !kpis || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#07181D] border border-[#CCE3DF] dark:border-[#14434B] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E1ECE9] dark:border-[#102B30] flex items-center justify-between bg-gradient-to-r from-teal-50/70 to-emerald-50/70 dark:from-[#092228] dark:to-[#071B20]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-[#0D2E36] border border-[#CCE3DF] dark:border-[#14434B] shadow-sm">
              {type === 'stock_value' && <Boxes className="w-5 h-5 text-teal-600 dark:text-teal-400" />}
              {type === 'total_skus' && <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
              {type === 'pending_pos' && <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
              {type === 'monthly_revenue' && <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                {type === 'stock_value' && 'Total Stock Valuation Audit'}
                {type === 'total_skus' && 'Safety Stock & Low Stock Health'}
                {type === 'pending_pos' && 'Pending Purchase Orders & Inbound Pipeline'}
                {type === 'monthly_revenue' && 'Monthly Revenue & Fulfillment Telemetry'}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Detailed telemetry breakdown and connected operational metrics
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* 1. STOCK VALUE MODAL */}
          {type === 'stock_value' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Total Asset Value</span>
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 font-mono mt-1 block">
                    {formatCurrency(kpis.totalStockValue)}
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                    +12.4% vs last audit
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Godowns Evaluated</span>
                  <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono mt-1 block">
                    2 Godowns
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium mt-0.5 block">Main Hub & West Hub</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Healthy Stock Ratio</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                    {Math.round(((kpis.totalSKUs - kpis.lowStockCount) / kpis.totalSKUs) * 100)}%
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium mt-0.5 block">Target &gt; 80%</span>
                </div>
              </div>

              {/* Godown breakdown */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                  <Warehouse className="w-3.5 h-3.5 text-teal-600" />
                  Valuation by Godown Location
                </h3>
                <div className="space-y-2.5">
                  {godownStats.map((g) => (
                    <div
                      key={g.name}
                      className="p-3.5 rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091F25] flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm">{g.name}</div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          {g.count} SKUs • {formatNumber(g.totalQty)} total units on hand
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                          {formatCurrency(g.value)}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {Math.round((g.value / (kpis.totalStockValue || 1)) * 100)}% of total
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. TOTAL SKUs MODAL */}
          {type === 'total_skus' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Catalog SKUs</span>
                  <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono mt-1 block">
                    {kpis.totalSKUs} Products
                  </span>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5 block">
                    Active Catalog
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Healthy SKUs</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                    {kpis.totalSKUs - kpis.lowStockCount}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Sufficient Buffer</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FDF2F2] dark:bg-[#341117] border border-[#FBCFE8] dark:border-[#4C0519]">
                  <span className="text-xs text-rose-600 dark:text-rose-400 block font-medium">Low / Depleted</span>
                  <span className="text-2xl font-black text-rose-700 dark:text-rose-300 font-mono mt-1 block">
                    {kpis.lowStockCount} SKUs
                  </span>
                  <span className="text-[10px] text-rose-600 font-semibold mt-0.5 block">Requires Restock</span>
                </div>
              </div>

              {/* Low stock items priority */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Items Requiring Attention
                </h3>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">{item.name}</div>
                        <div className="text-[10px] text-zinc-500">
                          SKU: {item.sku} • {item.godown}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {item.availableQty} / {item.minLevel} min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. PENDING POs MODAL */}
          {type === 'pending_pos' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#FEF3C7] dark:bg-[#3F2B06] border border-[#FDE68A] dark:border-[#78350F]">
                  <span className="text-xs text-amber-800 dark:text-amber-300 block font-medium">Pending Inbound</span>
                  <span className="text-2xl font-black text-amber-900 dark:text-amber-200 font-mono mt-1 block">
                    {kpis.pendingPurchaseOrders} Orders
                  </span>
                  <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5 block">
                    Awaiting warehouse dock
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Committed Spend</span>
                  <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono mt-1 block">
                    $14,875
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold mt-0.5 block">Payable on receipt</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Average Lead Time</span>
                  <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100 font-mono mt-1 block">
                    3.2 Days
                  </span>
                  <span className="text-[10px] text-zinc-400 font-medium mt-0.5 block">Within supplier SLA</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-3">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Autonomous Receiving Workflow</div>
                  <div className="text-[11px] text-teal-800/80 dark:text-teal-300/80 mt-0.5">
                    When goods arrive at the dock, click <b>Mark as Received</b> on the Purchase Orders page.
                    The system will automatically increment warehouse quantities and log the audit entry.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. MONTHLY REVENUE MODAL */}
          {type === 'monthly_revenue' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-[#EDE9FE] dark:bg-[#2E1065] border border-[#DDD6FE] dark:border-[#5B21B6]">
                  <span className="text-xs text-purple-800 dark:text-purple-300 block font-medium">Monthly Revenue</span>
                  <span className="text-2xl font-black text-purple-950 dark:text-purple-200 font-mono mt-1 block">
                    {formatCurrency(kpis.monthlyRevenue)}
                  </span>
                  <span className="text-[10px] text-purple-700 dark:text-purple-400 font-semibold mt-0.5 block">
                    +18.7% vs last month
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Estimated Gross Margin</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-1 block">
                    42.8%
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Strong profitability</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F0F8F6] dark:bg-[#092228] border border-[#CCE3DF] dark:border-[#14434B]">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-medium">Orders Fulfilled</span>
                  <span className="text-2xl font-black text-teal-700 dark:text-teal-400 font-mono mt-1 block">
                    24 Orders
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold mt-0.5 block">Zero stockouts</span>
                </div>
              </div>

              {/* Recent activity snippet */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Recent Revenue Movements
                </h3>
                <div className="space-y-2">
                  {recentActivity.slice(0, 3).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091F25] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-zinc-100">{act.productName}</div>
                        <div className="text-[10px] text-zinc-500">
                          {act.type} • {formatDateTime(act.timestamp)}
                        </div>
                      </div>
                      <div className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {act.quantityChanged > 0 ? `+${act.quantityChanged}` : act.quantityChanged} units
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with deep-link navigation */}
        <div className="px-6 py-4 border-t border-[#E1ECE9] dark:border-[#102B30] bg-[#F8FCFB] dark:bg-[#06161A] flex items-center justify-between">
          <span className="text-xs text-zinc-500">Press Esc or click outside to dismiss</span>
          {type === 'stock_value' || type === 'total_skus' ? (
            <Link
              href="/stock"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#093A3E] to-[#0E595F] hover:from-[#0B464B] hover:to-[#116C73] dark:from-teal-500 dark:to-emerald-400 text-white dark:text-zinc-950 font-bold text-xs shadow-sm transition-all"
            >
              Open Stock Inventory
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : type === 'pending_pos' ? (
            <Link
              href="/purchases"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-sm transition-all"
            >
              Manage Purchase Orders
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/sales"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              View Sales & Invoices
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
