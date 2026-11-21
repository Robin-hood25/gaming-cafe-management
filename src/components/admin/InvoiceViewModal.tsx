'use client';

import React, { useEffect, useState } from 'react';
import { X, Download, Printer, Share2, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { downloadInvoicePDF, printInvoicePDF, shareInvoiceNative, InvoiceFullData } from '@/lib/invoice-pdf';
import { formatCurrency } from '@/lib/utils';
import { formatDateTimeIST, formatTimeIST } from '@/lib/date-utils';
import { RecordPaymentModal } from './RecordPaymentModal';

interface InvoiceViewModalProps {
  invoiceId: string;
  onClose: () => void;
}

export function InvoiceViewModal({ invoiceId, onClose }: InvoiceViewModalProps) {
  const [data, setData] = useState<InvoiceFullData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadInvoice = async () => {
    try {
      const inv = await cafeRepo.getInvoiceById(invoiceId);
      setData(inv as any);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  if (loading || !data) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#12141a] p-8 text-center text-sm text-zinc-400">
          Loading invoice details...
        </div>
      </div>
    );
  }

  const { invoice, customer, screen, session, payments, cafeSettings } = data;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#12141a] p-6 sm:p-8 shadow-2xl my-8">
        {/* Top actions & close */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-blue-400">{invoice.invoice_number}</span>
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              invoice.payment_status === 'paid'
                ? 'bg-emerald-950 border border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950 border border-amber-500/30 text-amber-300'
            }`}>
              {invoice.payment_status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printInvoicePDF(data)}
              title="Print Invoice"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700"
            >
              <Printer className="h-4 w-4" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={() => downloadInvoicePDF(data)}
              title="Download PDF"
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={() => shareInvoiceNative(data)}
              title="Share Invoice"
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Preview Container */}
        <div className="mt-6 rounded-xl border border-zinc-800 bg-[#0d0f14] p-6 text-zinc-200">
          {/* Cafe Header */}
          <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-white">{cafeSettings.cafe_name}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">{cafeSettings.address}</p>
              <p className="text-xs text-zinc-400">Phone: {cafeSettings.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest block">Tax Invoice</span>
              <span className="text-xs text-zinc-400">{formatDateTimeIST(invoice.created_at)}</span>
            </div>
          </div>

          {/* Customer & Session Info */}
          <div className="grid grid-cols-2 gap-4 my-4 py-3 border-b border-zinc-800 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">Customer</span>
              <p className="font-semibold text-white">{customer?.full_name || 'Walk-in Guest'}</p>
              <p className="text-zinc-400">{customer?.normalized_phone || '--'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold block mb-1">Station Details</span>
              <p className="font-semibold text-white">{screen?.screen_name || 'Screen'}</p>
              <p className="text-zinc-400">
                {session ? `${session.original_duration_minutes}m • Started ${formatTimeIST(session.start_at)}` : ''}
              </p>
            </div>
          </div>

          {/* Line items summary */}
          <div className="space-y-2 py-2 text-xs">
            <div className="flex justify-between text-zinc-300">
              <span>Gaming Charges ({screen?.screen_name}):</span>
              <span className="font-mono font-bold text-white">{formatCurrency(invoice.gaming_amount)}</span>
            </div>
            {Number(invoice.snacks_amount) > 0 && (
              <div className="flex justify-between text-zinc-300">
                <span>Food &amp; Beverages:</span>
                <span className="font-mono font-bold text-white">{formatCurrency(invoice.snacks_amount)}</span>
              </div>
            )}
            {Number(invoice.discount) > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount:</span>
                <span className="font-mono font-bold">-{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-zinc-800 pt-3 text-base font-extrabold text-white">
              <span>Grand Total:</span>
              <span className="text-emerald-400 font-mono">{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>

          {/* Payment recorded status */}
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400">Payment Status: </span>
              <span className="font-bold text-white uppercase">{invoice.payment_status}</span>
              {payments.length > 0 && (
                <span className="text-zinc-400 block text-[11px] mt-0.5">
                  Paid via {payments[0].payment_method} {payments[0].payment_reference ? `(${payments[0].payment_reference})` : ''}
                </span>
              )}
            </div>

            {invoice.payment_status !== 'paid' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record Payment</span>
              </button>
            )}
          </div>
        </div>

        {showPaymentModal && (
          <RecordPaymentModal
            invoice={invoice}
            onClose={() => setShowPaymentModal(false)}
            onSuccess={() => {
              setShowPaymentModal(false);
              loadInvoice();
            }}
          />
        )}
      </div>
    </div>
  );
}

