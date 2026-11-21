'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Receipt, ArrowRight, AlertTriangle } from 'lucide-react';
import { ActiveSessionView } from '@/types/cafe';
import { cafeRepo } from '@/lib/cafe-repository';
import { calculateGamingBilling } from '@/lib/pricing';
import { formatCurrency } from '@/lib/utils';
import { formatDateTimeIST, formatTimeIST } from '@/lib/date-utils';

interface CheckoutModalProps {
  session: ActiveSessionView;
  onClose: () => void;
  onCheckoutComplete: (invoiceId: string) => void;
}

export function CheckoutModal({ session, onClose, onCheckoutComplete }: CheckoutModalProps) {
  const [discount, setDiscount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Billing calculation simulation preview
  const now = new Date();
  const pricingSnapshot = {
    hourly_rate: session.hourly_rate,
    minimum_duration: 30,
    billing_interval: 15,
    rounding_rule: 'ceil' as const,
  };

  const billing = calculateGamingBilling(session.start_at, now, pricingSnapshot);
  const discountVal = Math.max(0, parseFloat(discount) || 0);
  const gamingCharge = billing.gamingCharge;
  const snacksCharge = session.orders_total;
  const subtotal = gamingCharge + snacksCharge;
  const grandTotal = Math.max(0, subtotal - discountVal);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await cafeRepo.checkoutSession({
        sessionId: session.id,
        discount: discountVal,
        notes: notes.trim() || undefined,
      });

      const invoiceId = (res as any)?.invoice_id || (res as any)?.invoice?.id;
      onCheckoutComplete(invoiceId);
    } catch (err: any) {
      setError(err?.message || 'Failed to complete session checkout.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Complete Session Checkout</h3>
              <p className="text-xs text-zinc-400">{session.screen_name} • {session.customer_name}</p>
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

        <form onSubmit={handleCheckout} className="mt-5 space-y-4">
          {/* Time & Billing Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-[#161922] p-4 space-y-2.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Session Started:</span>
              <span className="text-zinc-200 font-mono">{formatTimeIST(session.start_at)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Checkout Time (Now):</span>
              <span className="text-zinc-200 font-mono">{formatTimeIST(now)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Actual Elapsed Time:</span>
              <span className="text-zinc-200 font-semibold">{billing.actualMinutes} minutes</span>
            </div>
            <div className="flex justify-between text-zinc-300 border-t border-zinc-800 pt-2 font-medium">
              <span>Billable Gaming Duration:</span>
              <span className="text-blue-400 font-bold">{billing.billableMinutes} mins (@ ₹{session.hourly_rate}/hr)</span>
            </div>
          </div>

          {/* Charges Itemized Breakdown */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Gaming Charges:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(gamingCharge)}</span>
            </div>
            <div className="flex justify-between text-zinc-300">
              <span>Snacks &amp; Drinks Purchases:</span>
              <span className="font-mono font-bold text-white">{formatCurrency(snacksCharge)}</span>
            </div>
            <div className="flex justify-between text-zinc-400 pt-1 border-t border-zinc-800/80">
              <span>Subtotal:</span>
              <span className="font-mono text-zinc-200">{formatCurrency(subtotal)}</span>
            </div>

            {/* Discount field */}
            <div className="flex items-center justify-between pt-2">
              <label className="text-xs text-zinc-400">Discount (₹):</label>
              <input
                type="number"
                min="0"
                step="5"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 py-1 px-2 text-right font-mono text-xs text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Grand Total */}
            <div className="flex justify-between border-t border-zinc-800 pt-2.5 text-base font-extrabold text-white">
              <span>Final Billable Total:</span>
              <span className="text-emerald-400 font-mono">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
              Checkout Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via UPI, discount applied for tournament"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <span>{submitting ? 'Finalizing...' : 'Finalize & Free Screen'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

