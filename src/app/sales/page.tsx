'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Receipt,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Calendar,
  Building,
  DollarSign,
  ChevronRight,
  RotateCcw,
  BadgeCheck,
  ShoppingBag,
  TrendingUp,
} from 'lucide-react';
import { SalesOrder } from '@/types';
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

export default function SalesPage() {
  const { openCreateSale, refreshVersion, triggerRefresh } = useAppActions();
  const { toast } = useToast();

  const [sales, setSales] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer / Inspection
  const [selectedSale, setSelectedSale] = useState<SalesOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSales = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/orders/sales');
      if (res.ok) {
        const data = await res.json();
        setSales(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales, refreshVersion]);

  // Confirm / Fulfill Draft Sale
  const handleConfirmSale = async (saleId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/sales/${saleId}/confirm`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm sale');

      toast({
        type: 'success',
        title: 'Sale Confirmed & Stock Deducted',
        message: `${data.sale.invoiceNumber} fulfilled! Quantities deducted from warehouse.`,
      });

      setSelectedSale(data.sale);
      triggerRefresh();
      fetchSales();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Fulfillment Blocked',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Mark Sale Paid
  const handleMarkPaid = async (saleId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/orders/sales/${saleId}/pay`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark sale as paid');

      toast({
        type: 'success',
        title: 'Payment Received',
        message: `${data.invoiceNumber} marked as Paid. Revenue logged to monthly KPIs.`,
      });

      setSelectedSale(data);
      triggerRefresh();
      fetchSales();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Payment Update Failed',
        message: err.message,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDrawer = (sale: SalesOrder) => {
    setSelectedSale(sale);
    setDrawerOpen(true);
  };

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      const matchSearch =
        !search ||
        s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.customerName.toLowerCase().includes(search.toLowerCase()) ||
        s.items.some((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [sales, search, statusFilter]);

  // Paginated slice
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  const draftCount = sales.filter((s) => s.status === 'draft').length;
  const confirmedCount = sales.filter((s) => s.status === 'confirmed').length;
  const paidCount = sales.filter((s) => s.status === 'paid').length;
  const totalBilled = sales.filter((s) => s.status !== 'draft').reduce((acc, s) => acc + s.totalAmount, 0);
  const awaitingAmount = sales.filter((s) => s.status === 'confirmed').reduce((acc, s) => acc + s.totalAmount, 0);
  const paidAmount = sales.filter((s) => s.status === 'paid').reduce((acc, s) => acc + s.totalAmount, 0);
  const collectionPct = totalBilled > 0 ? Math.round((paidAmount / totalBilled) * 100) : 0;

  const statusOptions = [
    { value: 'all', label: `All Invoices (${sales.length})` },
    { value: 'draft', label: `Draft (${draftCount})` },
    { value: 'confirmed', label: `Confirmed (${confirmedCount})` },
    { value: 'paid', label: `Paid (${paidCount})` },
  ];

  if (loading && sales.length === 0) {
    return (
      <Loader
        variant="page"
        label="Loading sales orders & invoices..."
        sublabel="Synchronizing client billing & fulfillment status"
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
              Sales Orders & Invoices
            </h1>
            <HelpTooltip
              title="Sales & Invoicing"
              text="Client order fulfillment. Confirming an order deducts items from stock in real-time. System prevents selling items beyond live available quantity."
              tip="Marking Paid increments monthly recognized revenue."
            />
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Outbound client fulfillment and invoicing. Fulfilling orders deducts live warehouse inventory and checks threshold rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateSale}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#093A3E] hover:bg-[#0D4B50] dark:bg-teal-500 dark:hover:bg-teal-400 text-white dark:text-zinc-950 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Sales Order</span>
          </button>
        </div>
      </div>

      {/* Redesigned Interactive Pastel KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Invoices */}
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
                <Receipt className="w-4 h-4 text-teal-700 dark:text-teal-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Total Invoices
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-teal-900 dark:text-teal-200 shrink-0">
              All
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {sales.length}{' '}
                <span className="text-sm font-semibold opacity-75">orders</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                <span>{draftCount} draft awaiting fulfill</span>
              </div>
            </div>
            <MiniSparkline color="aqua" />
          </div>
        </div>

        {/* KPI 2: Awaiting Payment */}
        <div
          onClick={() => {
            setStatusFilter('confirmed');
            setCurrentPage(1);
          }}
          role="button"
          tabIndex={0}
          className={`metric-card-lavender p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group transition-all ${
            statusFilter === 'confirmed' ? 'ring-2 ring-purple-500/40 dark:ring-purple-400/40' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <Clock className="w-4 h-4 text-purple-700 dark:text-purple-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Awaiting Payment
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-purple-900 dark:text-purple-200 shrink-0">
              Pending
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {confirmedCount}{' '}
                <span className="text-sm font-semibold opacity-75">orders</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold tabular-nums">
                <span>{formatCurrency(awaitingAmount)} receivable</span>
              </div>
            </div>
            <MiniSparkline color="lavender" />
          </div>
        </div>

        {/* KPI 3: Paid & Settled */}
        <div
          onClick={() => {
            setStatusFilter('paid');
            setCurrentPage(1);
          }}
          role="button"
          tabIndex={0}
          className={`metric-card-mint p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group transition-all ${
            statusFilter === 'paid' ? 'ring-2 ring-emerald-500/40 dark:ring-emerald-400/40' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <BadgeCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Paid &amp; Settled
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-emerald-900 dark:text-emerald-200 shrink-0">
              Settled
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {paidCount}{' '}
                <span className="text-sm font-semibold opacity-75">orders</span>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold tabular-nums">
                <span>{formatCurrency(paidAmount)} collected</span>
              </div>
            </div>
            <MiniSparkline color="mint" />
          </div>
        </div>

        {/* KPI 4: Billed Revenue */}
        <div
          onClick={() => {
            setStatusFilter('all');
            setCurrentPage(1);
          }}
          role="button"
          tabIndex={0}
          className="metric-card-peach p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between gap-4 cursor-pointer group transition-all"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white/80 dark:bg-black/25 shadow-2xs shrink-0">
                <TrendingUp className="w-4 h-4 text-amber-800 dark:text-amber-300" />
              </div>
              <span className="text-[13px] font-bold tracking-tight truncate">
                Billed Revenue
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/75 dark:bg-black/25 text-amber-950 dark:text-amber-200 shrink-0 tabular-nums">
              {collectionPct}% Paid
            </span>
          </div>

          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="text-2xl sm:text-[28px] font-extrabold tabular-nums tracking-tight leading-none">
                {formatCurrency(totalBilled)}
              </div>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20 text-[11px] font-semibold">
                <span>Confirmed + Paid total</span>
              </div>
            </div>
            <MiniSparkline color="peach" />
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
              placeholder="Search by invoice number, customer, or SKU..."
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
            Total: <strong className="text-zinc-900 dark:text-zinc-100 font-mono">{filteredSales.length}</strong> matching sales orders (Page {currentPage} of {Math.max(1, Math.ceil(filteredSales.length / pageSize))})
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

      {/* Sales Orders Table via Common DataTable */}
      <DataTable
        data={paginatedSales}
        rowKey={(sale) => sale.id}
        onRowClick={(sale) => openDrawer(sale)}
        emptyMessage="No sales orders or invoices match the selected filter."
        columns={[
          {
            key: 'invoiceNumber',
            header: 'Invoice #',
            render: (sale) => (
              <span className="inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-[#EFF8F6] dark:bg-[#0A262C] text-[#093E3B] dark:text-teal-300 border border-[#D4EAE5] dark:border-[#14434B]">
                {sale.invoiceNumber}
              </span>
            ),
          },
          {
            key: 'customerName',
            header: 'Customer & Account',
            render: (sale) => {
              const match = sale.customerName.match(/^([^(]+)\(([^)]+)\)$/);
              if (match) {
                return (
                  <div>
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {match[1].trim()}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {match[2].trim()}
                    </div>
                  </div>
                );
              }
              return (
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {sale.customerName}
                </div>
              );
            },
          },
          {
            key: 'orderDate',
            header: 'Order Date',
            render: (sale) => (
              <span className="text-zinc-500 dark:text-zinc-400 font-medium tabular-nums">
                {formatDate(sale.orderDate)}
              </span>
            ),
          },
          {
            key: 'itemsSummary',
            header: 'Items Summary',
            nowrap: false,
            render: (sale) => {
              const itemsSummary = sale.items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
              return (
                <div className="flex items-center gap-2 max-w-[260px]">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 dark:bg-[#092026] text-zinc-700 dark:text-zinc-300 shrink-0">
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'items'}
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
            header: 'Invoice Total',
            align: 'right',
            render: (sale) => (
              <span className="font-extrabold tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatCurrency(sale.totalAmount)}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            align: 'center',
            render: (sale) => <StatusBadge status={sale.status} />,
          },
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (sale) => {
              const isDraft = sale.status === 'draft';
              const isConfirmed = sale.status === 'confirmed';
              return (
                <div onClick={(e) => e.stopPropagation()} className="inline-flex items-center justify-end">
                  {isDraft ? (
                    <button
                      type="button"
                      onClick={() => handleConfirmSale(sale.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#093A3E] to-[#0E595F] hover:from-[#0B464B] hover:to-[#116C73] dark:from-teal-500 dark:to-emerald-400 text-white dark:text-zinc-950 font-semibold text-xs shadow-xs transition-all whitespace-nowrap"
                    >
                      <span>Confirm & Fulfill</span>
                    </button>
                  ) : isConfirmed ? (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(sale.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all whitespace-nowrap"
                    >
                      <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>Mark Paid</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDrawer(sale)}
                      aria-label="Inspect invoice details"
                      className="p-1.5 rounded-full bg-[#EFF8F6] dark:bg-[#0A262C] border border-[#D4EAE5] dark:border-[#14434B] text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 group-hover:translate-x-0.5 transition-all"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            },
          },
        ] as DataTableColumn<SalesOrder>[]}
        pagination={{
          currentPage,
          totalItems: filteredSales.length,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
      />

      {/* Sales Order / Invoice Detail Drawer */}
      <Sheet
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedSale ? `Invoice ${selectedSale.invoiceNumber}` : 'Invoice Details'}
        subtitle={selectedSale ? `Billed to ${selectedSale.customerName}` : ''}
        width="lg"
      >
        {selectedSale && (
          <div className="space-y-6">
            {/* Status & Total */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/70 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Invoice Status
                </span>
                <StatusBadge status={selectedSale.status} />
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Total Billed Amount
                </span>
                <span className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {formatCurrency(selectedSale.totalAmount)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Order Date
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {formatDate(selectedSale.orderDate)}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Settlement
                </span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {selectedSale.paidAt ? formatDateTime(selectedSale.paidAt) : 'Pending Settlement'}
                </span>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Invoice Line Items ({selectedSale.items.length})
              </h4>

              <div className="space-y-2">
                {selectedSale.items.map((item, idx) => (
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
                        {item.quantity} units @ {formatCurrency(item.unitPrice)}
                      </div>
                      <div className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(item.totalPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedSale.notes && (
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-xs">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block mb-0.5">
                  Client PO / Notes
                </span>
                <p className="text-zinc-700 dark:text-zinc-300">{selectedSale.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Invoice</span>
              </button>

              {selectedSale.status === 'draft' && (
                <button
                  onClick={() => handleConfirmSale(selectedSale.id)}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <span>{actionLoading ? 'Deducting Stock...' : 'Confirm & Deduct Stock'}</span>
                </button>
              )}

              {selectedSale.status === 'confirmed' && (
                <button
                  onClick={() => handleMarkPaid(selectedSale.id)}
                  disabled={actionLoading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
                >
                  <BadgeCheck className="w-4 h-4" />
                  <span>{actionLoading ? 'Updating...' : 'Mark as Paid'}</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
