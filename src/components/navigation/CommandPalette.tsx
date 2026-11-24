'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Search, Package, ShoppingCart, ShoppingBag, ArrowRight, CornerDownLeft, X } from 'lucide-react';
import { Product, PurchaseOrder, SalesOrder } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/Badge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreatePO?: () => void;
  onOpenCreateSale?: () => void;
  onOpenCreateProduct?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenCreatePO,
  onOpenCreateSale,
  onOpenCreateProduct,
}: CommandPaletteProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);
  const [products, setProducts] = useState<Product[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/orders/purchase').then((r) => r.json()),
        fetch('/api/orders/sales').then((r) => r.json()),
      ])
        .then(([prods, pos, sales]) => {
          if (Array.isArray(prods)) setProducts(prods);
          if (Array.isArray(pos)) setPurchaseOrders(pos);
          if (Array.isArray(sales)) setSalesOrders(sales);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const q = query.toLowerCase().trim();

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const filteredPOs = purchaseOrders
    .filter(
      (po) =>
        po.poNumber.toLowerCase().includes(q) ||
        po.supplierName.toLowerCase().includes(q)
    )
    .slice(0, 3);

  const filteredSales = salesOrders
    .filter(
      (so) =>
        so.invoiceNumber.toLowerCase().includes(q) ||
        so.customerName.toLowerCase().includes(q)
    )
    .slice(0, 3);

  const navigateTo = (path: string) => {
    onClose();
    router.push(path);
  };

  const content = (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-16 sm:pt-20 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Command Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#07181D] border border-[#CCE3DF] dark:border-[#14434B] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-5 py-4 border-b border-[#E1ECE9] dark:border-[#102B30] gap-3 bg-gradient-to-r from-[#EEF8F6]/80 to-[#F5FBF9]/80 dark:from-[#092228] dark:to-[#071B20]">
          <div className="p-1.5 rounded-xl bg-white dark:bg-[#0D2E36] border border-[#CCE3DF] dark:border-[#14434B] shrink-0">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SKUs, products, PO numbers, customers, or actions... (Cmd+K)"
            className="flex-1 bg-transparent border-0 text-sm font-medium focus:outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/80 dark:bg-[#0D2E36] border border-[#CCE3DF] dark:border-[#14434B] text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          {(!query || query.length < 2) && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Quick Navigation & Actions
              </p>
              <div className="space-y-0.5">
                <button
                  onClick={() => navigateTo('/')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg group text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Go to Dashboard & Overview
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigateTo('/stock')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg group text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="w-3.5 h-3.5 text-zinc-500" />
                    Go to Stock & Godowns Ledger
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigateTo('/purchases')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg group text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart className="w-3.5 h-3.5 text-zinc-500" />
                    Go to Purchase Orders
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => navigateTo('/sales')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg group text-left"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                    Go to Sales Orders & Invoices
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreatePO?.();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg group text-left"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <span>+</span> Create New Purchase Order
                  </span>
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCreateSale?.();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg group text-left"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <span>+</span> Create New Sales Order
                  </span>
                  <CornerDownLeft className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>
            </div>
          )}

          {/* Product Results */}
          {filteredProducts.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Products & Inventory ({filteredProducts.length})
              </p>
              <div className="space-y-1">
                {filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigateTo(`/stock?sku=${encodeURIComponent(p.sku)}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Package className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 mr-2 font-mono">
                          {p.sku}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400">{p.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0 ml-3">
                      <span className="text-zinc-500 font-mono tabular-nums">
                        {p.availableQty} units
                      </span>
                      <StatusBadge status={p.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PO Results */}
          {filteredPOs.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Purchase Orders ({filteredPOs.length})
              </p>
              <div className="space-y-1">
                {filteredPOs.map((po) => (
                  <button
                    key={po.id}
                    onClick={() => navigateTo('/purchases')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingCart className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div>
                        <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100 mr-2">
                          {po.poNumber}
                        </span>
                        <span className="text-zinc-500">{po.supplierName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                        {formatCurrency(po.totalAmount)}
                      </span>
                      <StatusBadge status={po.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sales Results */}
          {filteredSales.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Sales Orders & Invoices ({filteredSales.length})
              </p>
              <div className="space-y-1">
                {filteredSales.map((so) => (
                  <button
                    key={so.id}
                    onClick={() => navigateTo('/sales')}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-left text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-zinc-400 shrink-0" />
                      <div>
                        <span className="font-semibold font-mono text-zinc-900 dark:text-zinc-100 mr-2">
                          {so.invoiceNumber}
                        </span>
                        <span className="text-zinc-500">{so.customerName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono tabular-nums font-medium text-zinc-800 dark:text-zinc-200">
                        {formatCurrency(so.totalAmount)}
                      </span>
                      <StatusBadge status={so.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {query &&
            filteredProducts.length === 0 &&
            filteredPOs.length === 0 &&
            filteredSales.length === 0 && (
              <div className="text-center py-8 text-zinc-400 text-xs">
                No matching inventory items or orders found for &quot;{query}&quot;.
              </div>
            )}
        </div>

        <div className="px-5 py-2.5 bg-[#F8FCFB] dark:bg-[#06161A] border-t border-[#E1ECE9] dark:border-[#102B30] flex items-center justify-between text-[11px] text-zinc-400">
          <span>Tip: Press ESC or click outside to dismiss</span>
          <span>Press ↵ to select</span>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
