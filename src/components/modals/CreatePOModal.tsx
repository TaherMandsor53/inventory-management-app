'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Supplier, Product } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { Plus, Trash2, Calendar, ShoppingCart } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { CustomDatePicker } from '@/components/ui/CustomDatePicker';

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillProductId?: string;
  prefillQuantity?: number;
}

export function CreatePOModal({
  isOpen,
  onClose,
  onSuccess,
  prefillProductId,
  prefillQuantity,
}: CreatePOModalProps) {
  const { toast } = useToast();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<
    { productId: string; quantity: number; unitCost: number }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Default expected date 7 days from now
      const defaultDate = new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0];
      setExpectedDate(defaultDate);
      setNotes('');

      Promise.all([
        fetch('/api/suppliers').then((r) => r.json()),
        fetch('/api/products').then((r) => r.json()),
      ])
        .then(([sups, prods]) => {
          if (Array.isArray(sups)) {
            setSuppliers(sups);
            if (sups.length > 0 && !selectedSupplierId) {
              setSelectedSupplierId(sups[0].id);
            }
          }
          if (Array.isArray(prods)) {
            setProducts(prods);

            // Handle prefill item if passed from low stock alert
            if (prefillProductId) {
              const matched = prods.find((p) => p.id === prefillProductId);
              if (matched) {
                setItems([
                  {
                    productId: matched.id,
                    quantity: prefillQuantity || Math.max(matched.minLevel * 2, 10),
                    unitCost: matched.costPrice,
                  },
                ]);
                return;
              }
            }

            // Default first item
            if (prods.length > 0) {
              setItems([
                {
                  productId: prods[0].id,
                  quantity: 15,
                  unitCost: prods[0].costPrice,
                },
              ]);
            }
          }
        })
        .catch(console.error);
    }
  }, [isOpen, prefillProductId, prefillQuantity]);

  const handleProductChange = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    const updated = [...items];
    updated[index].productId = productId;
    if (prod) {
      updated[index].unitCost = prod.costPrice;
    }
    setItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const updated = [...items];
    updated[index].quantity = Math.max(1, qty);
    setItems(updated);
  };

  const handleUnitCostChange = (index: number, cost: number) => {
    const updated = [...items];
    updated[index].unitCost = Math.max(0, cost);
    setItems(updated);
  };

  const addItemRow = () => {
    if (products.length === 0) return;
    setItems((prev) => [
      ...prev,
      {
        productId: products[0].id,
        quantity: 10,
        unitCost: products[0].costPrice,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      toast({ type: 'error', title: 'Supplier Required', message: 'Please select a supplier.' });
      return;
    }
    if (items.length === 0) {
      toast({ type: 'error', title: 'No Line Items', message: 'Please add at least one line item.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplierId,
          expectedDate,
          notes,
          items,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create Purchase Order');

      toast({
        type: 'success',
        title: 'Purchase Order Created',
        message: `${data.poNumber} submitted as Pending. Stock will increment upon receiving.`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Order Creation Failed',
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
      title="Create Inbound Purchase Order"
      description="Issue a new purchase order to a supplier. Quantities will be received into the assigned godown."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Supplier & Delivery Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="min-w-0">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Select Supplier *
            </label>
            <CustomSelect
              value={selectedSupplierId}
              onChange={(val) => setSelectedSupplierId(val)}
              options={suppliers.map((sup) => ({
                value: sup.id,
                label: `${sup.name} (${sup.category})`,
              }))}
              placeholder="Choose a supplier..."
            />
          </div>

          <div className="min-w-0">
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Expected Delivery Date
            </label>
            <CustomDatePicker
              value={expectedDate}
              onChange={(date) => setExpectedDate(date)}
              placeholder="Pick expected delivery date..."
              required
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-[#D5EAE6] dark:border-[#133D45] rounded-2xl p-4 bg-[#F5FBF9]/80 dark:bg-[#081D22]/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-900 dark:text-teal-200 uppercase tracking-wider">
              Purchase Line Items ({items.length})
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
              const lineTotal = item.quantity * item.unitCost;
              return (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2.5 items-end bg-white dark:bg-[#0A2228] p-3 rounded-2xl border border-[#DCECE8] dark:border-[#14434B] shadow-2xs"
                >
                  <div className="col-span-12 sm:col-span-5 min-w-0">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Item / SKU
                    </label>
                    <CustomSelect
                      size="sm"
                      value={item.productId}
                      onChange={(val) => handleProductChange(idx, val)}
                      options={products.map((p) => ({
                        value: p.id,
                        label: `${p.sku} - ${p.name}`,
                      }))}
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 min-w-0">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Order Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(idx, parseInt(e.target.value) || 1)}
                      className="w-full h-8 text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-2 text-zinc-900 dark:text-zinc-100 tabular-nums text-center focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2 min-w-0">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Cost/Unit ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => handleUnitCostChange(idx, parseFloat(e.target.value) || 0)}
                      className="w-full h-8 text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-2 text-zinc-900 dark:text-zinc-100 tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-2 min-w-0 text-right pb-1">
                    <label className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1">
                      Line Total
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

          <div className="flex justify-between items-center pt-3 border-t border-[#DCECE8] dark:border-[#133D45] text-xs">
            <span className="font-semibold text-zinc-600 dark:text-zinc-400">Total PO Value:</span>
            <span className="text-base font-extrabold text-[#093E3B] dark:text-teal-300 tabular-nums">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Order Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Q4 batch restock, dock inspection required"
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
            disabled={submitting}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#093A3E] to-[#0E595F] hover:from-[#0B464B] hover:to-[#116C73] dark:from-teal-500 dark:to-emerald-400 dark:hover:from-teal-400 dark:hover:to-emerald-300 text-white dark:text-zinc-950 text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {submitting ? 'Submitting PO...' : 'Submit Purchase Order (Pending)'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
