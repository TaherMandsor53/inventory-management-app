'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Warehouse,
  Boxes,
  Plus,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Sparkles,
  Receipt,
  FileText,
  MousePointerClick,
} from 'lucide-react';
import { DashboardKPIs, Product, StockMovement, SalesOrder } from '@/types';
import { formatCurrency, formatNumber, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { useAppActions } from '@/components/layout/AppLayout';
import dynamic from 'next/dynamic';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { computeSalesOverviewByDateRange } from '@/lib/salesOverview';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { DateRangePicker, DateRangeSelection, DATE_PRESETS } from '@/components/ui/DateRangePicker';
import { SevenDayRangePicker, SevenDayRange } from '@/components/ui/SevenDayRangePicker';
import { KPIDetailModal, KPIType } from '@/components/modals/KPIDetailModal';
import { Loader } from '@/components/ui/Loader';

const DonutReportChart = dynamic(
  () => import('@/components/charts/DonutReportChart'),
  {
    ssr: false,
    loading: () => (
      <Loader
        variant="chart"
        label="Loading chart telemetry..."
        className="h-[280px]"
      />
    ),
  }
);

const CapsuleBarChart = dynamic(
  () => import('@/components/charts/CapsuleBarChart'),
  {
    ssr: false,
    loading: () => (
      <Loader
        variant="chart"
        label="Loading sales overview..."
        className="h-[280px]"
      />
    ),
  }
);

const FacilityCapacityChart = dynamic(
  () => import('@/components/charts/FacilityCapacityChart'),
  {
    ssr: false,
    loading: () => (
      <Loader
        variant="chart"
        label="Loading active facilities chart..."
        className="h-[260px]"
      />
    ),
  }
);

export default function DashboardPage() {
  const { openCreatePO, openCreateSale, refreshVersion } = useAppActions();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [recentActivity, setRecentActivity] = useState<StockMovement[]>([]);
  const [godownStats, setGodownStats] = useState<
    { name: string; count: number; totalQty: number; value: number }[]
  >([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);

  // Date Range state for global dashboard + dedicated 7-day range for Total Sales Overview
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeSelection>(DATE_PRESETS[2]);
  const [salesRange, setSalesRange] = useState<SevenDayRange>({
    startDate: '2026-11-19',
    endDate: '2026-11-25',
  });

  // KPI Detail Modal state
  const [kpiModalType, setKpiModalType] = useState<KPIType | null>(null);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashRes, salesRes] = await Promise.all([
        fetch('/api/dashboard'),
        fetch('/api/orders/sales'),
      ]);
      if (!dashRes.ok) throw new Error('Failed to load dashboard data');
      const data = await dashRes.json();
      setKpis(data.kpis);
      setLowStockItems(data.lowStockItems || []);
      setRecentActivity(data.recentActivity || []);
      setGodownStats(data.godownStats || []);
      if (salesRes.ok) {
        const salesList = await salesRes.json();
        if (Array.isArray(salesList)) setSalesOrders(salesList);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshVersion]);

  const handleOpenKpi = (type: KPIType) => {
    setKpiModalType(type);
    setIsKpiModalOpen(true);
  };

  if (loading && !kpis) {
    return (
      <Loader
        variant="page"
        label="Synchronizing live warehouse telemetry..."
        sublabel="Loading godown stock, sales metrics & recent activity"
      />
    );
  }

  const stockVal = kpis?.totalStockValue || 0;
  const salesVal = kpis?.monthlyRevenue || 0;
  const pendingPoSpend = 14875;
  const lowStockVal = lowStockItems.reduce((acc, p) => acc + p.availableQty * p.costPrice, 0);
  const salesOverviewMeta = computeSalesOverviewByDateRange(
    salesRange.startDate,
    salesRange.endDate,
    salesOrders
  );

  return (
    <div className="space-y-6 animate-slide-fade-up">
      {/* Top Welcome Bar matching reference images */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1ECE9] dark:border-[#102B30]">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Welcome, Operations Lead!
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time multi-godown stock valuation, demand alerts, and connected fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Integrated DateRangePicker */}
          <DateRangePicker
            value={selectedDateRange.id}
            onChange={(sel) => setSelectedDateRange(sel)}
          />

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-teal-400 transition-all shadow-sm"
            title="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Interactive Pastel Metric Cards - Casual & Spacious */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Revenue (Mint Pastel) */}
        <div
          onClick={() => handleOpenKpi('monthly_revenue')}
          role="button"
          tabIndex={0}
          className="metric-card-mint p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Monthly Revenue
              </span>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/25 flex items-center justify-center text-emerald-900 dark:text-emerald-200 shadow-2xs group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-black/45 transition-all shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {formatCurrency(salesVal * selectedDateRange.multiplier)}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                <ArrowUpRight className="w-3 h-3" /> +{kpis?.revenueTrend}% · {selectedDateRange.shortLabel}
              </div>
            </div>
            <MiniSparkline color="mint" />
          </div>
        </div>

        {/* Card 2: Stock Valuation (Aqua Pastel) */}
        <div
          onClick={() => handleOpenKpi('stock_value')}
          role="button"
          tabIndex={0}
          className="metric-card-aqua p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <Boxes className="w-4 h-4 text-teal-700 dark:text-teal-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Total Stock Value
              </span>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/25 flex items-center justify-center text-teal-900 dark:text-teal-200 shadow-2xs group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-black/45 transition-all shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {formatCurrency(stockVal)}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                <ArrowUpRight className="w-3 h-3" /> +{kpis?.stockValueTrend}% vs last mo
              </div>
            </div>
            <MiniSparkline color="aqua" />
          </div>
        </div>

        {/* Card 3: Low Stock Alerts (Coral/Rose Pastel) */}
        <div
          onClick={() => handleOpenKpi('total_skus')}
          role="button"
          tabIndex={0}
          className="metric-card-rose p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Low Stock Alerts
              </span>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/25 flex items-center justify-center text-rose-900 dark:text-rose-200 shadow-2xs group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-black/45 transition-all shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {kpis?.lowStockCount}{' '}
                <span className="text-sm font-semibold opacity-75">SKUs</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                <span>At or below safety min</span>
              </div>
            </div>
            <MiniSparkline color="rose" />
          </div>
        </div>

        {/* Card 4: Inbound POs (Lavender Pastel) */}
        <div
          onClick={() => handleOpenKpi('pending_pos')}
          role="button"
          tabIndex={0}
          className="metric-card-lavender p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <ShoppingCart className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Pending POs
              </span>
            </div>
            <span className="w-7 h-7 rounded-full bg-white/80 dark:bg-black/25 flex items-center justify-center text-purple-900 dark:text-purple-200 shadow-2xs group-hover:scale-110 group-hover:bg-white dark:group-hover:bg-black/45 transition-all shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {kpis?.pendingPurchaseOrders}{' '}
                <span className="text-sm font-semibold opacity-75">Orders</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                <span>Inbound dock delivery</span>
              </div>
            </div>
            <MiniSparkline color="lavender" />
          </div>
        </div>
      </div>

      {/* Highcharts Section matching reference images */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Graph Report Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] p-4 sm:p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                Graph Report
              </h2>
              <HelpTooltip
                title="Graph Report (Donut Chart)"
                text="Proportional segmentation of stock valuation, fulfilled sales orders, pending purchase orders, and buffer reserves."
                tip="Hover over any slice to inspect values with preserved theme highlights (never black)."
              />
            </div>
            <span className="text-[11px] font-semibold text-zinc-500 font-mono">
              {selectedDateRange.shortLabel}
            </span>
          </div>

          {/* Highcharts Donut Chart with Protected Hover Colors */}
          <div className="py-2">
            <DonutReportChart
              totalValue={stockVal}
              stockValue={stockVal}
              salesValue={salesVal}
              purchaseValue={pendingPoSpend}
              lowStockValue={lowStockVal}
              dateRangeLabel={selectedDateRange.shortLabel}
              dataMultiplier={selectedDateRange.multiplier}
            />
          </div>
        </div>

        {/* Right: Total Sales Overview Capsule Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] p-4 sm:p-5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                Total Sales Overview
              </h2>
              <HelpTooltip
                title="Daily Capsule Breakdown"
                text="Daily order volumes visualized with capsule pill containers and diagonal striped hatching textures."
                tip="Use the chart date picker to inspect weekly, monthly, or custom date spans."
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 whitespace-nowrap">
                Peak: {salesOverviewMeta.peakDay} ({salesOverviewMeta.peakLabel})
              </span>
              <SevenDayRangePicker
                startDate={salesRange.startDate}
                endDate={salesRange.endDate}
                onChange={setSalesRange}
              />
            </div>
          </div>

          {/* Highcharts Capsule Bar Chart with Protected Palette Hover Colors */}
          <div className="pt-2">
            <CapsuleBarChart
              salesRevenue={salesVal}
              stockValuation={stockVal}
              startDate={salesRange.startDate}
              endDate={salesRange.endDate}
              salesOrders={salesOrders}
            />
          </div>
        </div>
      </div>

      {/* Active Facilities Line & Area Chart Card (moved from Sidebar) */}
      <div className="rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
              <Warehouse className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">
                  Active Facilities — Capacity & Utilization
                </h2>
                <HelpTooltip
                  title="Active Godown Utilization"
                  text="Weekly storage capacity utilization across Main Hub (HUB-01) and West Warehouse (WH-02) with live unit and valuation distribution."
                />
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Real-time multi-godown storage utilization and inventory flow
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold">
            <span className="inline-flex items-center gap-1.5 text-teal-700 dark:text-teal-300">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Main Hub (HUB-01)
            </span>
            <span className="inline-flex items-center gap-1.5 text-lime-700 dark:text-lime-300">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-500" />
              West Warehouse (WH-02)
            </span>
          </div>
        </div>

        <FacilityCapacityChart
          godownStats={godownStats}
          dateRangeLabel={selectedDateRange.shortLabel}
          dataMultiplier={selectedDateRange.multiplier}
        />
      </div>

      {/* Main Grid: Low Stock Alerts + Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Actionable Low Stock Alerts (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-[#0B1D22]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                    Low Stock & Reorder Alerts
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold">
                      {lowStockItems.length} Critical
                    </span>
                    <HelpTooltip
                      title="Reorder Automation"
                      text="Items that are below the warehouse safety threshold. Clicking 'Restock SKU' instantly opens a pre-filled Purchase Order modal."
                    />
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Items at or below safety threshold. Click Restock to issue a pre-filled PO.
                  </p>
                </div>
              </div>

              <Link
                href="/stock?status=low_stock"
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {lowStockItems.length === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    All inventory items are healthy!
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    No SKU is currently at or below minimum threshold levels.
                  </p>
                </div>
              ) : (
                lowStockItems.map((item) => {
                  const percentage = Math.min(
                    100,
                    Math.round((item.availableQty / item.minLevel) * 100)
                  );
                  const isZero = item.availableQty === 0;

                  return (
                    <div
                      key={item.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                            {item.sku}
                          </span>
                          <span className="text-xs text-zinc-600 dark:text-zinc-300 font-medium truncate max-w-[240px]">
                            {item.name}
                          </span>
                          <StatusBadge status={item.status} />
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Warehouse className="w-3.5 h-3.5 text-zinc-400" />
                            {item.godown}
                          </span>
                          <span>•</span>
                          <span className="font-mono tabular-nums">
                            Available:{' '}
                            <strong className={isZero ? 'text-rose-600 font-bold' : 'text-amber-600 font-bold'}>
                              {item.availableQty}
                            </strong>{' '}
                            / Min: {item.minLevel}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full max-w-xs bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isZero ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.max(percentage, isZero ? 0 : 8)}%` }}
                          />
                        </div>
                      </div>

                      {/* One-click Restock */}
                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => openCreatePO(item.id, Math.max(item.minLevel * 2, 15))}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#093A3E] hover:bg-[#0D4B50] dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-950 text-xs font-semibold shadow-2xs transition-all"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Restock SKU</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time Recent Activity Feed (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] shadow-2xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between bg-zinc-50/50 dark:bg-[#0B1D22]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-1.5">
                    Recent Movements
                    <HelpTooltip
                      title="Audit Ledger Feed"
                      text="Chronological stream of inbound PO receipts, outbound customer fulfillments, and manual physical audits."
                    />
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Real-time audit log of stock movements
                  </p>
                </div>
              </div>

              <Link
                href="/stock"
                className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold inline-flex items-center gap-1"
              >
                Stock ledger <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[580px] overflow-y-auto">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  No recent stock movements recorded.
                </div>
              ) : (
                recentActivity.map((mov) => {
                  const isInbound = mov.quantityChanged > 0;

                  return (
                    <div
                      key={mov.id}
                      className="p-3.5 hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                              {mov.sku}
                            </span>
                            {mov.referenceNumber && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                                {mov.referenceNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{mov.reason}</p>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`font-mono text-xs font-bold tabular-nums inline-flex items-center ${
                              isInbound
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isInbound ? `+${mov.quantityChanged}` : mov.quantityChanged} units
                          </span>
                          <span className="block text-[10px] text-zinc-400 mt-0.5">
                            {formatDateTime(mov.timestamp)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                        <span>{mov.godown}</span>
                        <span>
                          {mov.previousQty} → <strong className="text-zinc-700 dark:text-zinc-200">{mov.newQty}</strong> on hand
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Detail Modal Dialog */}
      <KPIDetailModal
        isOpen={isKpiModalOpen}
        onClose={() => setIsKpiModalOpen(false)}
        type={kpiModalType}
        kpis={kpis}
        lowStockItems={lowStockItems}
        recentActivity={recentActivity}
        godownStats={godownStats}
      />
    </div>
  );
}
