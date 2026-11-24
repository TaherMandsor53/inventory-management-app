'use client';

import React, { useEffect, useState, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  History,
  Sliders,
  Warehouse,
  Boxes,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Product, StockMovement, Godown } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useAppActions } from '@/components/layout/AppLayout';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { Loader } from '@/components/ui/Loader';

function StockContent() {
  const searchParams = useSearchParams();
  const { openCreateProduct, openCreatePO, refreshVersion, triggerRefresh } = useAppActions();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [godowns, setGodowns] = useState<Godown[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGodown, setSelectedGodown] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer / Inspection state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [historyMovements, setHistoryMovements] = useState<StockMovement[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Quick Adjust in drawer
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Initial sync from query params
  useEffect(() => {
    const skuParam = searchParams.get('sku');
    const statusParam = searchParams.get('status');
    if (skuParam) setSearch(skuParam);
    if (statusParam) setSelectedStatus(statusParam);
  }, [searchParams]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [prodsRes, godownsRes] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/godowns').then((r) => r.json()),
      ]);

      if (Array.isArray(prodsRes)) setProducts(prodsRes);
      if (Array.isArray(godownsRes)) setGodowns(godownsRes);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, refreshVersion]);

  // Handle open drawer
  const openProductDrawer = async (product: Product) => {
    setSelectedProduct(product);
    setDrawerOpen(true);
    setAdjustQty(0);
    setAdjustReason('');
    setLoadingHistory(true);

    try {
      const res = await fetch(`/api/products/${product.id}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryMovements(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Perform stock adjustment
  const handleStockAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustQty === 0) {
      toast({
        type: 'error',
        title: 'Adjustment required',
        message: 'Please enter a non-zero quantity to adjust.',
      });
      return;
    }

    setAdjusting(true);
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adjustmentQty: adjustQty,
          reason: adjustReason || (adjustQty > 0 ? 'Manual Stock Inward' : 'Manual Stock Deduction'),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust stock');

      toast({
        type: 'success',
        title: 'Stock Adjusted',
        message: `${selectedProduct.sku} on hand quantity updated to ${data.product.availableQty}.`,
      });

      setSelectedProduct(data.product);
      setHistoryMovements((prev) => [data.movement, ...prev]);
      setAdjustQty(0);
      setAdjustReason('');
      triggerRefresh();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Adjustment Failed',
        message: err.message,
      });
    } finally {
      setAdjusting(false);
    }
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !search ||
        p.sku.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchGodown = selectedGodown === 'all' || p.godown.toLowerCase() === selectedGodown.toLowerCase();
      const matchStatus = selectedStatus === 'all' || p.status === selectedStatus;

      return matchSearch && matchCategory && matchGodown && matchStatus;
    });
  }, [products, search, selectedCategory, selectedGodown, selectedStatus]);

  // Paginated slice
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  const categoryOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Categories' },
      ...categories.map((c) => ({ value: c, label: c })),
    ];
  }, [categories]);

  const godownOptions = useMemo(() => {
    return [
      { value: 'all', label: 'All Godowns' },
      ...godowns.map((g) => ({ value: g.name, label: g.name })),
    ];
  }, [godowns]);

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'in_stock', label: 'In Stock (Healthy)' },
    { value: 'low_stock', label: 'Low Stock (≤ Threshold)' },
    { value: 'out_of_stock', label: 'Out of Stock (Zero)' },
  ];

  if (loading && products.length === 0) {
    return (
      <Loader
        variant="page"
        label="Loading stock ledger..."
        sublabel="Fetching SKUs and godown balances"
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
              Stock & Godowns Ledger
            </h1>
            <HelpTooltip
              title="Stock Ledger"
              text="Centralized SKU catalog tracking available on-hand units, procurement and retail pricing, and warehouse locations."
              tip="Click any row to open the complete audit trail and make manual adjustments."
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Browse live SKU inventory across godowns, inspect real-time transaction ledger, and adjust levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#093A3E] hover:bg-[#0D4B50] dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-950 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by SKU, item, or category..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-teal-200/80 dark:border-teal-900/80 bg-[#F4F9F8] dark:bg-[#091B20] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <CustomSelect
              value={selectedCategory}
              onChange={(val) => {
                setSelectedCategory(val);
                setCurrentPage(1);
              }}
              options={categoryOptions}
            />
          </div>

          {/* Godown Filter */}
          <div>
            <CustomSelect
              value={selectedGodown}
              onChange={(val) => {
                setSelectedGodown(val);
                setCurrentPage(1);
              }}
              options={godownOptions}
            />
          </div>

          {/* Stock Status Filter */}
          <div>
            <CustomSelect
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span>
            Total: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{filteredProducts.length}</strong> matching SKUs (Page {currentPage} of {Math.max(1, Math.ceil(filteredProducts.length / pageSize))})
          </span>
          {(search || selectedCategory !== 'all' || selectedGodown !== 'all' || selectedStatus !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setSelectedGodown('all');
                setSelectedStatus('all');
                setCurrentPage(1);
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Stock Table via Common DataTable */}
      <DataTable
        data={paginatedProducts}
        rowKey={(p) => p.id}
        onRowClick={(p) => openProductDrawer(p)}
        emptyMessage="No products found matching the active filters."
        columns={[
          {
            key: 'sku',
            header: 'SKU',
            render: (p) => (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EFF8F6] dark:bg-[#0A262C] text-[#093E3B] dark:text-teal-300 border border-[#D4EAE5] dark:border-[#14434B]">
                {p.sku}
              </span>
            ),
          },
          {
            key: 'name',
            header: 'Item Name & Category',
            nowrap: false,
            render: (p) => (
              <div className="min-w-[180px]">
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-[#092026] text-zinc-500 dark:text-zinc-400">
                  {p.category}
                </span>
              </div>
            ),
          },
          {
            key: 'godown',
            header: 'Godown Location',
            render: (p) => (
              <span className="inline-flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                <Warehouse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                {p.godown}
              </span>
            ),
          },
          {
            key: 'availableQty',
            header: (
              <span className="inline-flex items-center gap-1 justify-center">
                Available Qty
                <HelpTooltip text="Current on-hand units in the warehouse available for sale." />
              </span>
            ),
            align: 'center',
            render: (p) => (
              <span
                className={`font-bold tabular-nums text-xs ${
                  p.availableQty === 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : p.availableQty <= p.minLevel
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-zinc-900 dark:text-zinc-100'
                }`}
              >
                {p.availableQty}
              </span>
            ),
          },
          {
            key: 'minLevel',
            header: (
              <span className="inline-flex items-center gap-1 justify-center">
                Safety Min
                <HelpTooltip text="Threshold below which Low Stock alerts are triggered." />
              </span>
            ),
            align: 'center',
            render: (p) => (
              <span className="text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                {p.minLevel}
              </span>
            ),
          },
          {
            key: 'unitPrice',
            header: 'Unit Price',
            align: 'right',
            render: (p) => (
              <span className="font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatCurrency(p.unitPrice)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (p) => <StatusBadge status={p.status} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (p) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openProductDrawer(p);
                }}
                aria-label="Inspect stock history"
                className="p-1.5 rounded-full bg-[#EFF8F6] dark:bg-[#0A262C] border border-[#D4EAE5] dark:border-[#14434B] text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 group-hover:translate-x-0.5 transition-all"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ),
          },
        ] as DataTableColumn<Product>[]}
        pagination={{
          currentPage,
          totalItems: filteredProducts.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* Slide-over Drawer (Sheet) for Stock History & Adjustments */}
      <Sheet
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedProduct ? `${selectedProduct.sku} - Stock Ledger` : 'Stock Ledger'}
        subtitle={selectedProduct ? `${selectedProduct.name} (${selectedProduct.godown})` : ''}
        width="lg"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Summary Highlights */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Available Stock
                </span>
                <span className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {selectedProduct.availableQty}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Reorder Threshold
                </span>
                <span className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {selectedProduct.minLevel}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Current Status
                </span>
                <StatusBadge status={selectedProduct.status} />
              </div>
            </div>

            {/* Pricing & Cost */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Procurement Cost:</span>
                <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(selectedProduct.costPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Selling Price:</span>
                <span className="font-mono tabular-nums font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(selectedProduct.unitPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-500">Gross Margin per Unit:</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedProduct.unitPrice - selectedProduct.costPrice)} (
                  {Math.round(
                    ((selectedProduct.unitPrice - selectedProduct.costPrice) / selectedProduct.unitPrice) * 100
                  )}
                  %)
                </span>
              </div>
            </div>

            {/* Quick Restock Action if Low Stock */}
            {selectedProduct.availableQty <= selectedProduct.minLevel && (
              <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/40 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Stock below safety threshold!
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">
                    Recommended reorder: {Math.max(selectedProduct.minLevel * 2, 10)} units
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDrawerOpen(false);
                    openCreatePO(selectedProduct.id, Math.max(selectedProduct.minLevel * 2, 10));
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-900 text-white dark:bg-amber-100 dark:text-amber-950 font-semibold text-xs shadow-2xs"
                >
                  Create PO
                </button>
              </div>
            )}

            {/* Quick Stock Adjustment Control */}
            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  Manual Stock Adjustment
                </h4>
                <span className="text-[10px] text-zinc-400">Audited in Real-time</span>
              </div>

              <form onSubmit={handleStockAdjustment} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">
                      Adjustment Qty (+/-)
                    </label>
                    <input
                      type="number"
                      value={adjustQty}
                      onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                      placeholder="+10 or -5"
                      className="w-full text-xs font-mono rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">
                      Reason / Reference
                    </label>
                    <input
                      type="text"
                      value={adjustReason}
                      onChange={(e) => setAdjustReason(e.target.value)}
                      placeholder="e.g. Physical count audit"
                      className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-500">
                    New on-hand will be:{' '}
                    <strong className="text-zinc-900 dark:text-zinc-100 font-mono">
                      {Math.max(0, selectedProduct.availableQty + adjustQty)}
                    </strong>
                  </span>
                  <button
                    type="submit"
                    disabled={adjusting || adjustQty === 0}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
                  >
                    {adjusting ? 'Updating...' : 'Apply Stock Adjustment'}
                  </button>
                </div>
              </form>
            </div>

            {/* Audit Ledger / Stock Movements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  Transaction Audit Ledger ({historyMovements.length})
                </h4>
                <span className="text-[10px] text-zinc-400">Chronological</span>
              </div>

              {loadingHistory ? (
                <Loader
                  variant="inline"
                  label="Loading audit ledger..."
                  className="py-6 justify-center"
                />
              ) : historyMovements.length === 0 ? (
                <div className="p-6 text-center text-xs text-zinc-400 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  No previous transactions recorded for this SKU.
                </div>
              ) : (
                <div className="space-y-2">
                  {historyMovements.map((mov) => {
                    const isInbound = mov.quantityChanged > 0;
                    return (
                      <div
                        key={mov.id}
                        className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isInbound ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            />
                            {mov.type.replace('_', ' ').toUpperCase()}
                          </span>
                          <span
                            className={`font-mono font-bold tabular-nums ${
                              isInbound ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isInbound ? `+${mov.quantityChanged}` : mov.quantityChanged} units
                          </span>
                        </div>

                        <p className="text-zinc-500 text-[11px]">{mov.reason}</p>

                        <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 font-mono">
                          <span>
                            {mov.previousQty} → {mov.newQty} on hand
                          </span>
                          <span>{formatDateTime(mov.timestamp)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}

export default function StockPage() {
  return (
    <Suspense
      fallback={
        <Loader
          variant="page"
          label="Loading stock ledger..."
          sublabel="Fetching SKUs and godown balances"
        />
      }
    >
      <StockContent />
    </Suspense>
  );
}
