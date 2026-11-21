'use client';

import React, { useState } from 'react';
import { X, CreditCard, Check, AlertCircle } from 'lucide-react';
import { Invoice, Payment } from '@/types/cafe';
import { cafeRepo } from '@/lib/cafe-repository';
import { formatCurrency } from '@/lib/utils';

interface RecordPaymentModalProps {
  invoice: Invoice;
  onClose: () => void;
  onSuccess: () => void;
}

export function RecordPaymentModal({ invoice, onClose, onSuccess }: RecordPaymentModalProps) {
  const [amount, setAmount] = useState<string>(String(invoice.total_amount));
  const [paymentMethod, setPaymentMethod] = useState<Payment['payment_method']>('UPI');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountVal = parseFloat(amount) || 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amountVal <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await cafeRepo.recordPayment({
        invoiceId: invoice.id,
        amount: amountVal,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600/10 border border-emerald-500/20 text-emerald-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Manual Payment</h3>
              <p className="text-xs text-zinc-400">Invoice {invoice.invoice_number}</p>
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

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['UPI', 'Cash', 'Card', 'Other'] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    paymentMethod === method
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Amount Received ({formatCurrency(invoice.total_amount)} Total)
            </label>
            <input
              type="number"
              step="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-base font-mono text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Transaction / Reference ID (Optional)
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g. UPI Ref / Card Last 4 / Receipt #"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3 text-[11px] text-zinc-400 leading-relaxed">
            Payment records are stored permanently in audit logs. Manual payments must only be recorded after confirming receipt of funds at the counter.
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || amountVal <= 0}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              {submitting ? 'Recording...' : `Record ${formatCurrency(amountVal)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

