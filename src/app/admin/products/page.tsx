'use client';

import React, { useEffect, useState } from 'react';
import { 
  Coffee, Plus, Edit2, Trash2, CheckCircle2, 
  X, AlertCircle, PackageCheck, PackageX, Sparkles 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { Product } from '@/types/cafe';
import { formatCurrency } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Product['category']>('Cold Drinks');
  const [sellingPrice, setSellingPrice] = useState('50');
  const [stockQuantity, setStockQuantity] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadProducts = async () => {
    try {
      const list = await cafeRepo.getProducts();
      setProducts(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setName('');
    setCategory('Cold Drinks');
    setSellingPrice('50');
    setStockQuantity('');
    setIsAvailable(true);
    setEditingProduct(null);
    setIsModalOpen(false);
    setError(null);
  };

  const openEdit = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.product_name);
    setCategory(prod.category);
    setSellingPrice(String(prod.selling_price));
    setStockQuantity(prod.stock_quantity !== null ? String(prod.stock_quantity) : '');
    setIsAvailable(prod.is_available);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    const price = parseFloat(sellingPrice);
    if (isNaN(price) || price < 0) {
      setError('Valid selling price is required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const stock = stockQuantity.trim() ? parseInt(stockQuantity, 10) : null;
      if (editingProduct) {
        await cafeRepo.updateProduct(editingProduct.id, {
          product_name: name.trim(),
          category,
          selling_price: price,
          stock_quantity: stock,
          is_available: isAvailable,
        });
        setSuccess(`Product "${name}" updated.`);
      } else {
        await cafeRepo.createProduct({
          product_name: name.trim(),
          category,
          selling_price: price,
          stock_quantity: stock,
          is_available: isAvailable,
        });
        setSuccess(`Product "${name}" created.`);
      }
      resetForm();
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || 'Failed to save product.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAvailability = async (prod: Product) => {
    try {
      await cafeRepo.updateProduct(prod.id, { is_available: !prod.is_available });
      setSuccess(`Status of "${prod.product_name}" updated.`);
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async (prod: Product) => {
    if (!confirm(`Are you sure you want to remove "${prod.product_name}"?`)) return;
    try {
      await cafeRepo.deleteProduct(prod.id);
      setSuccess(`Product "${prod.product_name}" deleted.`);
      await loadProducts();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete product.');
    }
  };

  const categories = ['ALL', 'Cold Drinks', 'Snacks', 'Fast Food', 'Other'];
  const filteredProducts = products.filter(
    (p) => categoryFilter === 'ALL' || p.category === categoryFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Coffee className="h-6 w-6 text-blue-400" />
            <span>Snacks &amp; Drinks Menu Management</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Manage food, chilled drinks, and gaming merchandise sold to active players.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === cat
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161922] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-white text-sm">
                    {p.product_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-200">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {formatCurrency(p.selling_price)}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 font-mono">
                    {p.stock_quantity !== null ? `${p.stock_quantity} units` : 'Untracked'}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleAvailability(p)}
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase transition-colors ${
                        p.is_available
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {p.is_available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-red-400 hover:border-red-500/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white">
                {editingProduct ? 'Edit Menu Product' : 'Add New Menu Item'}
              </h3>
              <button onClick={resetForm} className="rounded-lg p-1.5 text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Product Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Red Bull 250ml / Peri Peri Fries"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Cold Drinks">Cold Drinks</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Selling Price (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Stock Quantity (Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="rounded bg-zinc-900 border-zinc-700 text-blue-600 focus:ring-0"
                    />
                    <span>Available on Menu</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

