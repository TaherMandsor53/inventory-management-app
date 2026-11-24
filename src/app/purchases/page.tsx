'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Warehouse,
  ArrowRight,
  PackageCheck,
  Calendar,
  Building,
  DollarSign,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { PurchaseOrder } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { useToast } from '@/components/ui/Toast';
import { useAppActions } from '@/components/layout/AppLayout';
import { HelpTooltip } from '@/components/ui/HelpTooltip';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { DataTable, DataTableColumn } from '@/components/ui/DataTable';
import { MiniSparkline } from '@/components/charts/MiniSparkline';
import { Loader } from '@/components/ui/Loader';

export default function PurchasesPage() {
  const { openCreatePO, refreshVersion, triggerRefresh } = useAppActions();
  const { toast } = useToast();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Inspection Drawer
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/purchase');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshVersion]);

  // Handle Mark as Received trigger
  const handleMarkReceived = async (poId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/purchase/${poId}/receive`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to receive purchase order');

      toast({
        type: 'success',
        title: 'Purchase Order Received & Stock Inwarded',
        message: `${data.po.poNumber} stock received. Item quantities in warehouses incremented instantly!`,
      });

      // Update local state and trigger global refresh
      setSelectedPO(data.po);
      triggerRefresh();
      fetchOrders();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Receipt Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Cancel PO
  const handleCancelPO = async (poId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/purchase/${poId}/cancel`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to cancel purchase order');

      toast({
        type: 'info',
        title: 'Purchase Order Cancelled',
        message: `${data.poNumber} has been cancelled.`,
      });

      setSelectedPO(data);
      triggerRefresh();
      fetchOrders();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Cancel Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDrawer = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setDrawerOpen(true);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !search ||
        o.poNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.supplierName.toLowerCase().includes(search.toLowerCase()) ||
        o.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  // Paginated slice
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const receivedCount = orders.filter((o) => o.status === 'received').length;
  const pendingSpend = orders
    .filter((o) => o.status === 'pending')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const receivedSpend = orders
    .filter((o) => o.status === 'received')
    .reduce((acc, o) => acc + o.totalAmount, 0);
  const totalSpend = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const statusOptions = [
    { value: 'all', label: `All Statuses (${orders.length})` },
    { value: 'pending', label: `Pending Receipt (${pendingCount})` },
    { value: 'received', label: `Received (${receivedCount})` },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  if (loading && orders.length === 0) {
    return (
      <Loader
        variant="page"
        label="Loading purchase orders..."
        sublabel="Fetching supplier procurement & inbound dock status"
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
              Inbound Purchase Orders
            </h1>
            <HelpTooltip
              title="Purchase Orders (Inbound)"
              text="Procurement workflow for ordering items from suppliers. Click 'Mark as Received' when items reach the dock to automatically increase warehouse stock."
              tip="Connected trigger clears low stock alerts immediately."
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Procure stock from trusted suppliers. Receiving orders automatically updates available inventory and logs audit ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => openCreatePO()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#093A3E] hover:bg-[#0D4B50] dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-950 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Redesigned Interactive Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Total POs Issued */}
        <div
          onClick={() => {
            setStatusFilter('all');
            setCurrentPage(1);
          }}
          role="button"
          tabIndex={0}
          className={`metric-card-aqua p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group transition-all ${
            statusFilter === 'all' ? 'ring-2 ring-teal-500/40 dark:ring-teal-400/40' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <ShoppingCart className="w-4 h-4 text-teal-700 dark:text-teal-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Total POs Issued
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-teal-900 dark:text-teal-200 shrink-0">
              All
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {orders.length}{' '}
                <span className="text-sm font-semibold opacity-75">orders</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold tabular-nums">
                <span>{formatCurrency(totalSpend)} total volume</span>
              </div>
            </div>
            <MiniSparkline color="aqua" />
          </div>
        </div>

        {/* KPI 2: Pending Receipt */}
        <div
          onClick={() => {
            setStatusFilter('pending');
            setCurrentPage(1);
          }}
          role="button"
          tabIndex={0}
          className={`metric-card-lavender p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group transition-all ${
            statusFilter === 'pending' ? 'ring-2 ring-purple-500/40 dark:ring-purple-400/40' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <Clock className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Pending Receipt
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-purple-900 dark:text-purple-200 shrink-0">
              Inbound
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {pendingCount}{' '}
                <span className="text-sm font-semibold opacity-75">shipments</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold tabular-nums">
                <span>{formatCurrency(pendingSpend)} in transit</span>
              </div>
            </div>
            <MiniSparkline color="lavender" />
          </div>
        </div>

        {/* KPI 3: Fulfilled & Inwarded */}
        <div
          onClick={() => {
            setStatusFilter('received');
            setCurrentPage(1);
          }}
          role="button"
          tabIndex={0}
          className={`metric-card-mint p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group transition-all ${
            statusFilter === 'received' ? 'ring-2 ring-emerald-500/40 dark:ring-emerald-400/40' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <PackageCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Fulfilled &amp; Inwarded
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-emerald-900 dark:text-emerald-200 shrink-0">
              Received
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {receivedCount}{' '}
                <span className="text-sm font-semibold opacity-75">orders</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold tabular-nums">
                <span>{formatCurrency(receivedSpend)} stocked</span>
              </div>
            </div>
            <MiniSparkline color="mint" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl border border-[#E1ECE9] dark:border-[#102B30] bg-white dark:bg-[#0D2026] shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PO number, supplier, or SKU..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-teal-200/80 dark:border-teal-900/80 bg-[#F4F9F8] dark:bg-[#091B20] text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <CustomSelect
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              }}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
          <span>
            Total: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{filteredOrders.length}</strong> matching purchase orders (Page {currentPage} of {Math.max(1, Math.ceil(filteredOrders.length / pageSize))})
          </span>
          {(search || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Purchase Orders Table via Common DataTable */}
      <DataTable
        data={paginatedOrders}
        rowKey={(po) => po.id}
        onRowClick={(po) => openDrawer(po)}
        emptyMessage="No purchase orders found matching the filter."
        columns={[
          {
            key: 'poNumber',
            header: 'PO #',
            render: (po) => (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EFF8F6] dark:bg-[#0A262C] text-[#093E3B] dark:text-teal-300 border border-[#D4EAE5] dark:border-[#14434B]">
                {po.poNumber}
              </span>
            ),
          },
          {
            key: 'supplier',
            header: 'Supplier',
            render: (po) => (
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {po.supplierName}
              </span>
            ),
          },
          {
            key: 'orderDate',
            header: 'Order Date',
            render: (po) => (
              <span className="text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                {formatDate(po.orderDate)}
              </span>
            ),
          },
          {
            key: 'itemsSummary',
            header: 'Items Summary',
            nowrap: false,
            render: (po) => {
              const itemsSummary = po.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
              return (
                <div className="flex items-center gap-2 max-w-[260px]">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-[#092026] text-zinc-700 dark:text-zinc-300 shrink-0">
                    {po.items.length} {po.items.length === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-zinc-500 dark:text-zinc-400 truncate text-xs">
                    {itemsSummary}
                  </span>
                </div>
              );
            },
          },
          {
            key: 'totalAmount',
            header: 'Total Amount',
            align: 'right',
            render: (po) => (
              <span className="font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatCurrency(po.totalAmount)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (po) => <StatusBadge status={po.status} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (po) => {
              const isPending = po.status === 'pending';
              return (
                <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-end">
                  {isPending ? (
                    <button
                      type="button"
                      onClick={() => handleMarkReceived(po.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all whitespace-nowrap"
                    >
                      <PackageCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Mark Received</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDrawer(po)}
                      aria-label="Inspect details"
                      className="p-1.5 rounded-full bg-[#EFF8F6] dark:bg-[#0A262C] border border-[#D4EAE5] dark:border-[#14434B] text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 group-hover:translate-x-0.5 transition-all"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            },
          },
        ] as DataTableColumn<PurchaseOrder>[]}
        pagination={{
          currentPage,
          totalItems: filteredOrders.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* PO Detail Drawer (Sheet) */}
      <Sheet
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPO ? `Purchase Order ${selectedPO.poNumber}` : 'PO Details'}
        subtitle={selectedPO ? `Issued to ${selectedPO.supplierName}` : ''}
        width="lg"
      >
        {selectedPO && (
          <div className="space-y-6">
            {/* Order Status & Key Dates */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Order Status
                </span>
                <StatusBadge status={selectedPO.status} />
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Total Spend Value
                </span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatCurrency(selectedPO.totalAmount)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Issued Date
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {formatDate(selectedPO.orderDate)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Expected Delivery
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {formatDate(selectedPO.expectedDate)}
                </span>
              </div>
            </div>

            {/* Inbound Received Banner */}
            {selectedPO.status === 'received' && (
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                    Shipment Received & Stock Inwarded
                  </p>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                    Processed at {formatDateTime(selectedPO.receivedAt || selectedPO.orderDate)}
                  </p>
                </div>
              </div>
            )}

            {/* Line Items List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Purchase Order Line Items ({selectedPO.items.length})
              </h4>

              <div className="space-y-2">
                {selectedPO.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                        {item.sku}
                      </div>
                      <div className="text-zinc-500 text-[11px]">{item.name}</div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        {item.quantity} units @ {formatCurrency(item.unitCost)}
                      </div>
                      <div className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {formatCurrency(item.totalCost)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPO.notes && (
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Order Notes
                </span>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedPO.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            {selectedPO.status === 'pending' && (
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCancelPO(selectedPO.id)}
                  disabled={actionLoading}
                  className="px-3 py-2 rounded-lg border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors disabled:opacity-50"
                >
                  Cancel Order
                </button>

                <button
                  onClick={() => handleMarkReceived(selectedPO.id)}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{actionLoading ? 'Receiving...' : 'Mark as Received & Update Stock'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
