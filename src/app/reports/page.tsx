'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  BarChart3,
  Download,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Calendar,
  Building,
  Filter,
  ArrowUpRight,
  PieChart,
  ShoppingBag,
  ShoppingCart,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import {
  StockValuationReportItem,
  SalesReportSummary,
  PurchaseReportSummary,
} from '@/types';
import { formatCurrency, formatNumber, downloadCSV } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { useAppActions } from '@/components/layout/AppLayout';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { Loader } from '@/components/ui/Loader';

type TabType = 'valuation' | 'sales' | 'purchases';

export default function ReportsPage() {
  const { refreshVersion } = useAppActions();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<TabType>('valuation');
  const [loading, setLoading] = useState(true);

  const [valuationData, setValuationData] = useState<StockValuationReportItem[]>([]);
  const [salesData, setSalesData] = useState<SalesReportSummary | null>(null);
  const [purchaseData, setPurchaseData] = useState<PurchaseReportSummary | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGodown, setSelectedGodown] = useState('all');

  // Pagination for Valuation table
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setValuationData(data.valuation || []);
        setSalesData(data.sales || null);
        setPurchaseData(data.purchases || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshVersion]);

  // Categories
  const categories = useMemo(() => {
    const set = new Set(valuationData.map((v) => v.category));
    return Array.from(set);
  }, [valuationData]);

  // Filtered valuation items
  const filteredValuation = useMemo(() => {
    return valuationData.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchGodown = selectedGodown === 'all' || item.godown === selectedGodown;
      return matchCat && matchGodown;
    });
  }, [valuationData, selectedCategory, selectedGodown]);

  // Paginated slice for valuation report
  const paginatedValuation = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredValuation.slice(start, start + pageSize);
  }, [filteredValuation, currentPage, pageSize]);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.map((c) => ({ value: c, label: c })),
    ];
  }, [categories]);

  const godownOptions = [
    { value: 'all', label: 'All Godowns' },
    { value: 'Main Hub', label: 'Main Hub' },
    { value: 'West Warehouse', label: 'West Warehouse' },
  ];

  // Valuation summary stats
  const totalCostValuation = filteredValuation.reduce((acc, i) => acc + i.totalCostValue, 0);
  const totalRetailValuation = filteredValuation.reduce((acc, i) => acc + i.totalSalesValue, 0);
  const totalPotentialMargin = totalRetailValuation - totalCostValuation;
  const marginPercentage = totalRetailValuation > 0 ? Math.round((totalPotentialMargin / totalRetailValuation) * 100) : 0;

  // Export handlers
  const handleExportValuation = () => {
    if (filteredValuation.length === 0) return;
    const rows = filteredValuation.map((item) => ({
      SKU: item.sku,
      Name: item.name,
      Category: item.category,
      Godown: item.godown,
      AvailableQty: item.availableQty,
      CostPrice: item.costPrice,
      UnitPrice: item.unitPrice,
      TotalCostValuation: item.totalCostValue,
      TotalSalesValuation: item.totalSalesValue,
      PotentialMargin: item.potentialMargin,
      Status: item.status,
    }));
    downloadCSV(`Stock_Valuation_Report_${new Date().toISOString().split('T')[0]}`, rows);
    toast({
      type: 'success',
      title: 'Report Exported',
      message: 'Stock valuation report CSV downloaded.',
    });
  };

  const handleExportSales = () => {
    if (!salesData || !salesData.topSellingProducts) return;
    const rows = salesData.topSellingProducts.map((p) => ({
      SKU: p.sku,
      ProductName: p.name,
      UnitsSold: p.quantity,
      RevenueGenerated: p.revenue,
    }));
    downloadCSV(`Sales_Product_Summary_${new Date().toISOString().split('T')[0]}`, rows);
    toast({
      type: 'success',
      title: 'Report Exported',
      message: 'Sales product summary CSV downloaded.',
    });
  };

  const handleExportPurchases = () => {
    if (!purchaseData || !purchaseData.bySupplier) return;
    const rows = purchaseData.bySupplier.map((s) => ({
      SupplierName: s.supplierName,
      OrdersPlaced: s.orderCount,
      TotalSpend: s.totalPurchased,
    }));
    downloadCSV(`Supplier_Spend_Report_${new Date().toISOString().split('T')[0]}`, rows);
    toast({
      type: 'success',
      title: 'Report Exported',
      message: 'Supplier spend report CSV downloaded.',
    });
  };

  if (loading && !salesData && !purchaseData && valuationData.length === 0) {
    return (
      <Loader
        variant="page"
        label="Generating financial analytics..."
        sublabel="Computing stock valuation, sales & procurement reports"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E1ECE9] dark:border-[#102B30]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Reports & Financial Analytics
            </h1>
            <HelpTooltip
              title="Reports & Analytics"
              text="Audited financial summaries covering inventory cost valuation, customer sales revenue, and supplier procurement spend."
              tip="Click 'Export CSV' to download complete structured reports at any time."
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Audited stock valuation, procurement spend breakdown, and client sales revenue summaries.
          </p>
        </div>

        {/* Global Export for current tab */}
        <div className="flex items-center gap-2">
          {activeTab === 'valuation' && (
            <button
              onClick={handleExportValuation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 bg-white dark:bg-[#0D242A] hover:bg-teal-50 dark:hover:bg-teal-950 text-zinc-800 dark:text-zinc-100 text-xs font-semibold shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Export CSV</span>
            </button>
          )}
          {activeTab === 'sales' && (
            <button
              onClick={handleExportSales}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 bg-white dark:bg-[#0D242A] hover:bg-teal-50 dark:hover:bg-teal-950 text-zinc-800 dark:text-zinc-100 text-xs font-semibold shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Export CSV</span>
            </button>
          )}
          {activeTab === 'purchases' && (
            <button
              onClick={handleExportPurchases}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800 bg-white dark:bg-[#0D242A] hover:bg-teal-50 dark:hover:bg-teal-950 text-zinc-800 dark:text-zinc-100 text-xs font-semibold shadow-2xs transition-all"
            >
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E1ECE9] dark:border-[#102B30]">
        <button
          onClick={() => setActiveTab('valuation')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'valuation'
              ? 'border-teal-600 dark:border-teal-400 text-teal-900 dark:text-teal-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Valuation Report</span>
        </button>

        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'sales'
              ? 'border-teal-600 dark:border-teal-400 text-teal-900 dark:text-teal-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sales & Revenue Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('purchases')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'purchases'
              ? 'border-teal-600 dark:border-teal-400 text-teal-900 dark:text-teal-300'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Purchase Spend Report</span>
        </button>
      </div>

      {/* TAB 1: STOCK VALUATION REPORT */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          {/* Redesigned Pastel Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card-aqua p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <DollarSign className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Cost Valuation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-teal-900 dark:text-teal-200 shrink-0">
                  Capital
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(totalCostValuation)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Capital invested</span>
                  </div>
                </div>
                <MiniSparkline color="aqua" />
              </div>
            </div>

            <div className="metric-card-lavender p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <TrendingUp className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Retail Valuation
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-purple-900 dark:text-purple-200 shrink-0">
                  Gross
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(totalRetailValuation)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Potential realization</span>
                  </div>
                </div>
                <MiniSparkline color="lavender" />
              </div>
            </div>

            <div className="metric-card-mint p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <PieChart className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Gross Margin
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-emerald-900 dark:text-emerald-200 shrink-0 tabular-nums">
                  +{marginPercentage}%
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(totalPotentialMargin)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Average markup</span>
                  </div>
                </div>
                <MiniSparkline color="mint" />
              </div>
            </div>

            <div className="metric-card-peach p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <Package className="w-4 h-4 text-amber-800 dark:text-amber-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Catalog SKUs
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-amber-950 dark:text-amber-200 shrink-0">
                  Active
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {filteredValuation.length}{' '}
                    <span className="text-sm font-semibold opacity-75">SKUs</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Selected godowns</span>
                  </div>
                </div>
                <MiniSparkline color="peach" />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>
              <div className="w-44">
                <CustomSelect
                  size="sm"
                  value={selectedCategory}
                  onChange={(val) => {
                    setSelectedCategory(val);
                    setCurrentPage(1);
                  }}
                  options={categoryOptions}
                />
              </div>

              <div className="w-44">
                <CustomSelect
                  size="sm"
                  value={selectedGodown}
                  onChange={(val) => {
                    setSelectedGodown(val);
                    setCurrentPage(1);
                  }}
                  options={godownOptions}
                />
              </div>
            </div>

            {(selectedCategory !== 'all' || selectedGodown !== 'all') && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedGodown('all');
                  setCurrentPage(1);
                }}
                className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3 h-3" /> Reset filters
              </button>
            )}
          </div>

          {/* Detailed Valuation Table via Common DataTable */}
          <DataTable
            data={paginatedValuation}
            rowKey={(item) => item.sku}
            emptyMessage="No valuation records match the filters."
            columns={[
              {
                key: 'sku',
                header: 'SKU',
                render: (item) => (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EFF8F6] dark:bg-[#0A262C] text-[#093E3B] dark:text-teal-300 border border-[#D4EAE5] dark:border-[#14434B]">
                    {item.sku}
                  </span>
                ),
              },
              {
                key: 'name',
                header: 'Item Name',
                nowrap: false,
                render: (item) => (
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 min-w-[160px] block">
                    {item.name}
                  </span>
                ),
              },
              {
                key: 'category',
                header: 'Category',
                render: (item) => (
                  <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-[#092026] text-zinc-600 dark:text-zinc-300">
                    {item.category}
                  </span>
                ),
              },
              {
                key: 'godown',
                header: 'Godown',
                render: (item) => (
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium">{item.godown}</span>
                ),
              },
              {
                key: 'availableQty',
                header: 'Available Units',
                align: 'center',
                render: (item) => (
                  <span className="font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                    {item.availableQty}
                  </span>
                ),
              },
              {
                key: 'totalCostValue',
                header: 'Cost Value',
                align: 'right',
                render: (item) => (
                  <span className="tabular-nums text-zinc-600 dark:text-zinc-400 font-medium">
                    {formatCurrency(item.totalCostValue)}
                  </span>
                ),
              },
              {
                key: 'totalSalesValue',
                header: 'Retail Value',
                align: 'right',
                render: (item) => (
                  <span className="tabular-nums text-zinc-900 dark:text-zinc-100 font-bold">
                    {formatCurrency(item.totalSalesValue)}
                  </span>
                ),
              },
              {
                key: 'potentialMargin',
                header: 'Potential Margin',
                align: 'right',
                render: (item) => (
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                    +{formatCurrency(item.potentialMargin)}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                align: 'center',
                render: (item) => <StatusBadge status={item.status} />,
              },
            ] as DataTableColumn<StockValuationReportItem>[]}
            pagination={{
              currentPage,
              totalItems: filteredValuation.length,
              pageSize,
              onPageChange: setCurrentPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </div>
      )}

      {/* TAB 2: SALES SUMMARY REPORT */}
      {activeTab === 'sales' && salesData && (
        <div className="space-y-6">
          {/* Redesigned Pastel Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card-aqua p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <ShoppingBag className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Orders Billed
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-teal-900 dark:text-teal-200 shrink-0">
                  Invoices
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {salesData.totalOrders}{' '}
                    <span className="text-sm font-semibold opacity-75">invoices</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Customer engagements</span>
                  </div>
                </div>
                <MiniSparkline color="aqua" />
              </div>
            </div>

            <div className="metric-card-peach p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <TrendingUp className="w-4 h-4 text-amber-800 dark:text-amber-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Active Revenue
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-amber-950 dark:text-amber-200 shrink-0">
                  Billed
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(salesData.totalRevenue)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Confirmed + Settled</span>
                  </div>
                </div>
                <MiniSparkline color="peach" />
              </div>
            </div>

            <div className="metric-card-mint p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Paid &amp; Settled
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-emerald-900 dark:text-emerald-200 shrink-0">
                  Verified
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(salesData.paidRevenue)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Deposits verified</span>
                  </div>
                </div>
                <MiniSparkline color="mint" />
              </div>
            </div>

            <div className="metric-card-lavender p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <Calendar className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Awaiting Payment
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-purple-900 dark:text-purple-200 shrink-0">
                  Receivable
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(salesData.pendingPaymentRevenue)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Accounts receivable</span>
                  </div>
                </div>
                <MiniSparkline color="lavender" />
              </div>
            </div>
          </div>

          {/* Top Selling Products Breakdown & Customer Spend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Top Performing SKUs by Revenue
                </h3>
                <span className="text-[11px] text-zinc-400">Product Volume</span>
              </div>

              <div className="space-y-3">
                {salesData.topSellingProducts.map((p) => {
                  const maxRevenue = salesData.topSellingProducts[0]?.revenue || 1;
                  const barPct = Math.round((p.revenue / maxRevenue) * 100);

                  return (
                    <div key={p.sku} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[260px]">
                          <span className="font-mono text-zinc-500 mr-1.5">{p.sku}</span>
                          {p.name}
                        </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {formatCurrency(p.revenue)} ({p.quantity} units)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full rounded-full"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Revenue Accounts */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Client Account Spend
                </h3>
                <span className="text-[11px] text-zinc-400">Portfolio Distribution</span>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {salesData.byCustomer.map((c) => (
                  <div key={c.customerName} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-zinc-800 dark:text-zinc-200">
                        {c.customerName}
                      </div>
                      <div className="text-[11px] text-zinc-400">{c.orderCount} total orders</div>
                    </div>
                    <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                      {formatCurrency(c.totalSpent)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE SPEND REPORT */}
      {activeTab === 'purchases' && purchaseData && (
        <div className="space-y-6">
          {/* Redesigned Pastel Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="metric-card-aqua p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <DollarSign className="w-4 h-4 text-teal-700 dark:text-teal-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Purchase Spend
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-teal-900 dark:text-teal-200 shrink-0">
                  Total
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(purchaseData.totalSpend)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Total PO allocation</span>
                  </div>
                </div>
                <MiniSparkline color="aqua" />
              </div>
            </div>

            <div className="metric-card-mint p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <Package className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Received Spend
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-emerald-900 dark:text-emerald-200 shrink-0">
                  Inwarded
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(purchaseData.receivedSpend)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>In warehouse stock</span>
                  </div>
                </div>
                <MiniSparkline color="mint" />
              </div>
            </div>

            <div className="metric-card-lavender p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <ShoppingCart className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    Pending Dock
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-purple-900 dark:text-purple-200 shrink-0">
                  Transit
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {formatCurrency(purchaseData.pendingSpend)}
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Inbound transit orders</span>
                  </div>
                </div>
                <MiniSparkline color="lavender" />
              </div>
            </div>

            <div className="metric-card-peach p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                    <Layers className="w-4 h-4 text-amber-800 dark:text-amber-300" />
                  </div>
                  <span className="text-[13px] font-bold tracking-tight truncate">
                    POs Issued
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-amber-950 dark:text-amber-200 shrink-0">
                  Orders
                </span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-2xl sm:text-[26px] font-extrabold tabular-nums tracking-tight leading-none">
                    {purchaseData.totalOrders}{' '}
                    <span className="text-sm font-semibold opacity-75">POs</span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                    <span>Verified suppliers</span>
                  </div>
                </div>
                <MiniSparkline color="peach" />
              </div>
            </div>
          </div>

          {/* Supplier Breakdown & Category Spend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Supplier Breakdown */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Procurement by Supplier
                </h3>
                <span className="text-[11px] text-zinc-400">Vendor Volume</span>
              </div>

              <div className="space-y-3">
                {purchaseData.bySupplier.map((s) => {
                  const maxSpend = purchaseData.bySupplier[0]?.totalPurchased || 1;
                  const barPct = Math.round((s.totalPurchased / maxSpend) * 100);

                  return (
                    <div key={s.supplierName} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[260px]">
                          {s.supplierName}
                        </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {formatCurrency(s.totalPurchased)} ({s.orderCount} POs)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Spend */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Spend by Product Category
                </h3>
                <span className="text-[11px] text-zinc-400">Procurement Budget</span>
              </div>

              <div className="space-y-3">
                {purchaseData.byCategory.map((cat) => {
                  const total = purchaseData.totalSpend || 1;
                  const pct = Math.round((cat.spend / total) * 100);

                  return (
                    <div key={cat.category} className="space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                          {cat.category}
                        </span>
                        <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                          {formatCurrency(cat.spend)} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
