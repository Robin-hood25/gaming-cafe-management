'use client';

import React, { useState, useEffect } from 'react';
import { X, Coffee, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { ActiveSessionView, Product } from '@/types/cafe';
import { cafeRepo } from '@/lib/cafe-repository';
import { formatCurrency } from '@/lib/utils';

interface AddSnacksModalProps {
  session: ActiveSessionView;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddSnacksModal({ session, onClose, onSuccess }: AddSnacksModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const list = await cafeRepo.getProducts();
        setProducts(list.filter((p) => p.is_available));
      } catch (err: any) {
        setError('Failed to load menu products.');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = ['ALL', 'Cold Drinks', 'Snacks', 'Fast Food', 'Other'];

  const filteredProducts = products.filter(
    (p) => selectedCategory === 'ALL' || p.category === selectedCategory
  );

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const cartItems = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find((p) => p.id === productId)!;
    return {
      product,
      quantity,
      subtotal: (product?.selling_price || 0) * quantity,
    };
  }).filter((item) => item.product);

  const totalCartAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) return;
    setError(null);
    setSubmitting(true);

    try {
      const orderPayload = cartItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.product_name,
        unitPrice: item.product.selling_price,
        quantity: item.quantity,
      }));

      await cafeRepo.addOrderToSession({
        sessionId: session.id,
        items: orderPayload,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add items to session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add Snacks &amp; Cold Drinks</h3>
              <p className="text-xs text-zinc-400">To {session.screen_name} • {session.customer_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto py-3 border-b border-zinc-800/80 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body Grid: Menu on Left, Cart on Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4 flex-1 overflow-y-auto">
          {/* Menu Items */}
          <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
            {filteredProducts.map((p) => {
              const inCart = cart[p.id] || 0;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 hover:border-zinc-700"
                >
                  <div className="overflow-hidden pr-2">
                    <p className="text-xs font-bold text-white truncate">{p.product_name}</p>
                    <span className="text-[11px] text-blue-400 font-semibold">{formatCurrency(p.selling_price)}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {inCart > 0 ? (
                      <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, -1)}
                          className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold w-4 text-center text-white">{inCart}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(p.id, 1)}
                          className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateQuantity(p.id, 1)}
                        className="rounded-lg bg-zinc-800 hover:bg-blue-600 text-zinc-200 hover:text-white px-2.5 py-1 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart View */}
          <div className="rounded-xl border border-zinc-800 bg-[#161922] p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <ShoppingBag className="h-4 w-4 text-blue-400" />
                  <span>Selected Items ({cartItems.length})</span>
                </span>
                {cartItems.length > 0 && (
                  <button
                    onClick={() => setCart({})}
                    className="text-[11px] text-zinc-400 hover:text-red-400"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-10 text-xs text-zinc-400">
                    No items selected yet. Tap &apos;Add&apos; on any product from the menu.
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-zinc-200 truncate max-w-[140px]">{item.product.product_name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-400">×{item.quantity}</span>
                        <span className="font-mono font-bold text-white">{formatCurrency(item.subtotal)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 shrink-0">
              <div className="flex items-center justify-between text-sm font-bold text-white mb-3">
                <span>Items Subtotal:</span>
                <span className="text-emerald-400 font-mono text-base">{formatCurrency(totalCartAmount)}</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submitting || cartItems.length === 0}
                  onClick={handleConfirmOrder}
                  className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Confirm Items'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

