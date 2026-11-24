'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { PackagePlus } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateProductModal({ isOpen, onClose, onSuccess }: CreateProductModalProps) {
  const { toast } = useToast();
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [godown, setGodown] = useState('Main Hub');
  const [availableQty, setAvailableQty] = useState(20);
  const [minLevel, setMinLevel] = useState(10);
  const [unitPrice, setUnitPrice] = useState(199);
  const [costPrice, setCostPrice] = useState(120);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      toast({ type: 'error', title: 'Missing fields', message: 'SKU and item name are required.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: sku.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          category,
          godown,
          availableQty: Number(availableQty),
          minLevel: Number(minLevel),
          unitPrice: Number(unitPrice),
          costPrice: Number(costPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product SKU');

      toast({
        type: 'success',
        title: 'New SKU Created',
        message: `${data.sku} added with ${data.availableQty} units in ${data.godown}.`,
      });

      // Reset
      setSku('');
      setName('');
      setDescription('');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'SKU Creation Failed',
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
      title="Create New Inventory SKU"
      description="Add a new catalog product with warehouse allocation, pricing, and reorder thresholds."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              SKU Identifier *
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. EL-DISP-4K"
              className="w-full text-xs uppercase rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Category *
            </label>
            <CustomSelect
              value={category}
              onChange={(val) => setCategory(val)}
              options={[
                { value: 'Electronics', label: 'Electronics' },
                { value: 'Office Furniture', label: 'Office Furniture' },
                { value: 'Accessories', label: 'Accessories' },
                { value: 'Networking', label: 'Networking' },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Item Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ergonomic Split Wireless Keyboard"
            className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief specification or details"
            className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Godown / Warehouse *
            </label>
            <CustomSelect
              value={godown}
              onChange={(val) => setGodown(val)}
              options={[
                { value: 'Main Hub', label: 'Main Hub (North)' },
                { value: 'West Warehouse', label: 'West Warehouse (Dock 14)' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Min Stock Alert Level
            </label>
            <input
              type="number"
              min="1"
              value={minLevel}
              onChange={(e) => setMinLevel(parseInt(e.target.value) || 1)}
              className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3.5 py-2.5 text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#F5FBF9]/80 dark:bg-[#081D22]/80 border border-[#D5EAE6] dark:border-[#133D45]">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Initial Stock Qty
            </label>
            <input
              type="number"
              min="0"
              value={availableQty}
              onChange={(e) => setAvailableQty(parseInt(e.target.value) || 0)}
              className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3 py-2 text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Procure Cost ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3 py-2 text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Selling Price ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitPrice}
              onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
              className="w-full text-xs rounded-xl border border-[#CCE3DF] dark:border-[#14434B] bg-white dark:bg-[#091D22] px-3 py-2 text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>
        </div>

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
            <PackagePlus className="w-3.5 h-3.5" />
            {submitting ? 'Creating SKU...' : 'Create SKU Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
