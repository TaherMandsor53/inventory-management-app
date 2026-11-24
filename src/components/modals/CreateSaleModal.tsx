'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Customer, Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface CreateSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateSaleModal({ isOpen, onClose, onSuccess }: CreateSaleModalProps) {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [notes, setNotes] = useState('');
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [items, setItems] = useState<
    { productId: string; quantity: number; unitPrice: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes('');
      Promise.all([
        fetch('/api/customers').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
      ])
        .then(([custs, prods]) => {
          if (Array.isArray(custs)) {
            setCustomers(custs);
            if (custs.length > 0 && !selectedCustomerId) {
              setSelectedCustomerId(custs[0].id);
            }
          }
          if (Array.isArray(prods)) {
            setProducts(prods);
            // Default first available product with stock > 0
            const inStock = prods.find((p) => p.availableQty > 0) || prods[0];
            if (inStock) {
              setItems([
                {
                  productId: inStock.id,
                  quantity: 1,
                  unitPrice: inStock.unitPrice,
                },
              ]);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index].productId = productId;
    if (prod) {
      updated[index].unitPrice = prod.unitPrice;
    }
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, qty);
    setItems(updated);
  };

  const addItemRow = () => {
    const available = products.find((p) => p.availableQty > 0) || products[0];
    if (!available) return;
    setItems((prev) => [
      ...prev,
      {
        productId: available.id,
        quantity: 1,
        unitPrice: available.unitPrice,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);

  // Check overselling violations
  const stockErrors: string[] = [];
  items.forEach((item) => {
    const prod = products.find((p) => p.id === item.productId);
    if (prod && autoConfirm && item.quantity > prod.availableQty) {
      stockErrors.push(
        `Insufficient stock for ${prod.name} (${prod.sku}): requested ${item.quantity}, only ${prod.availableQty} available.`
      );
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      toast({ type: 'error', title: 'Customer Required', message: 'Please select a customer.' });
      return;
    }
    if (items.length === 0) {
      toast({ type: 'error', title: 'No Line Items', message: 'Please add at least one line item.' });
      return;
    }
    if (stockErrors.length > 0) {
      toast({
        type: 'error',
        title: 'Overselling Prevented',
        message: stockErrors[0],
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          notes,
          items,
          autoConfirm,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create sales order');

      toast({
        type: 'success',
        title: autoConfirm ? 'Sale Confirmed & Fulfilled' : 'Draft Sale Created',
        message: autoConfirm
          ? `Invoice ${data.invoiceNumber} confirmed. Stock quantities deducted in real-time.`
          : `Invoice ${data.invoiceNumber} saved as draft.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Sale Failed',
        message: err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Outbound Sales Order & Invoice"
      description="Create an invoice for client fulfillment. Live available stock is validated to prevent overselling."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer & Fulfillment Option */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select Customer *
            </label>
            <CustomSelect
              value={selectedCustomerId}
              onChange={(val) => setSelectedCustomerId(val)}
              options={customers.map((c) => ({
                value: c.id,
                label: `${c.name} (${c.company})`,
              }))}
              placeholder="Choose a customer..."
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-[#F5FBF9] dark:bg-[#081D22] cursor-pointer hover:border-teal-400 transition-colors">
              <input
                type="checkbox"
                checked={autoConfirm}
                onChange={(e) => setAutoConfirm(e.target.checked)}
                className="rounded border-teal-300 text-teal-600 accent-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                Confirm & Deduct Stock Immediately
              </span>
            </label>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-[#D5EAE6] dark:border-[#133D45] rounded-2xl p-4 bg-[#F5FBF9]/80 dark:bg-[#081D22]/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
              Sales Line Items ({items.length})
            </span>
            <button
              type="button"
              onClick={addItemRow}
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/70 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200/80 dark:border-teal-800 rounded-full transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map((item, idx) => {
              const prod = products.find((p) => p.id === item.productId);
              const available = prod?.availableQty ?? 0;
              const isOverLimit = autoConfirm && item.quantity > available;
              const lineTotal = item.quantity * item.unitPrice;

              return (
                <div
                  key={idx}
                  className={`grid grid-cols-12 gap-2.5 items-end bg-white dark:bg-[#0A2228] p-3 rounded-2xl border shadow-2xs transition-all ${
                    isOverLimit
                      ? 'border-rose-400 dark:border-rose-800 bg-rose-50/20'
                      : 'border-[#DCECE8] dark:border-[#14434B]'
                  }`}
                >
                  <div className="col-span-12 sm:col-span-5 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                        Product / SKU
                      </label>
                      <span
                        className={`text-[10px] font-semibold tabular-nums shrink-0 ${
                          available === 0
                            ? 'text-rose-500'
                            : available <= 5
                            ? 'text-amber-500'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {available} in stock
                      </span>
                    </div>
                    <CustomSelect
                      size="sm"
                      value={item.productId}
                      onChange={(val) => handleProductChange(idx, val)}
                      options={products.map((p) => ({
                        value: p.id,
                        label: `${p.sku} - ${p.name}`,
                        badge: `${p.availableQty} avail`,
                      }))}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 min-w-0">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Sale Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                      className={`w-full h-8 text-xs rounded-xl border px-2 tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${
                        isOverLimit
                          ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40'
                          : 'border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] text-zinc-900 dark:text-zinc-100 focus:border-teal-500'
                      }`}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 min-w-0">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Unit Price ($)
                    </label>
                    <span className="w-full h-8 flex items-center justify-end text-xs rounded-xl border border-[#DCECE8] dark:border-[#14434B] bg-[#F5FBF9] dark:bg-[#081D22] px-2.5 text-zinc-800 dark:text-zinc-200 tabular-nums">
                      {formatCurrency(item.unitPrice)}
                    </span>
                  </div>

                  <div className="col-span-3 sm:col-span-2 min-w-0 text-right pb-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Total
                    </label>
                    <span className="text-xs font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                      {formatCurrency(lineTotal)}
                    </span>
                  </div>

                  <div className="col-span-1 flex justify-end pb-1">
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 disabled:opacity-30 transition-colors"
                      title="Remove row"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {stockErrors.length > 0 && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{stockErrors[0]}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-[#DCECE8] dark:border-[#133D45] text-xs">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Total Invoice Amount:</span>
            <span className="text-base font-extrabold text-[#093E3B] dark:text-teal-300 tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Notes / PO Reference
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Workstation upgrades for design sprint"
            className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E1ECE9] dark:border-[#102B30]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full border border-[#CCE3DF] dark:border-[#14434B] text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-teal-50/60 dark:hover:bg-[#0D2E36] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || (autoConfirm && stockErrors.length > 0)}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#093A3E] to-[#0E595F] hover:from-[#0B464B] hover:to-[#116C73] dark:from-teal-500 dark:to-emerald-400 dark:hover:from-teal-400 dark:hover:to-emerald-300 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            <Receipt className="w-3.5 h-3.5" />
            {submitting
              ? 'Processing...'
              : autoConfirm
              ? 'Confirm & Fulfill Sale'
              : 'Save as Draft Invoice'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
