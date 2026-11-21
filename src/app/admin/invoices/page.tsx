'use client';

import React, { useEffect, useState } from 'react';
import { 
  Receipt, Search, Download, Printer, Share2, 
  CreditCard, Eye, RefreshCw, Filter, CheckCircle2 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { Invoice, Payment, Customer, Screen } from '@/types/cafe';
import { formatCurrency } from '@/lib/utils';
import { formatDateTimeIST } from '@/lib/date-utils';
import { downloadInvoicePDF, printInvoicePDF, shareInvoiceNative } from '@/lib/invoice-pdf';
import { RecordPaymentModal } from '@/components/admin/RecordPaymentModal';
import { InvoiceViewModal } from '@/components/admin/InvoiceViewModal';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  const loadInvoices = async () => {
    try {
      const list = await cafeRepo.getInvoices();
      setInvoices(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter((inv) => {
    if (filterStatus !== 'ALL' && inv.payment_status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNum = inv.invoice_number.toLowerCase().includes(q);
      const matchName = inv.customer?.full_name?.toLowerCase().includes(q);
      const matchPhone = inv.customer?.normalized_phone?.includes(q);
      return matchNum || matchName || matchPhone;
    }
    return true;
  });

  const handleQuickDownload = async (inv: any) => {
    try {
      const full = await cafeRepo.getInvoiceById(inv.id);
      if (full) downloadInvoicePDF(full as any);
    } catch (e) {
      console.error(e);
    }
  };

  const handleQuickPrint = async (inv: any) => {
    try {
      const full = await cafeRepo.getInvoiceById(inv.id);
      if (full) printInvoicePDF(full as any);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-blue-400" />
            <span>Invoices &amp; Payment Records</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Audit-safe billing history. Generate PDF receipts, record manual cash/UPI payments, and print invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              loadInvoices();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'unpaid', 'partially_paid', 'paid'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {status === 'ALL' ? 'All Invoices' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice or customer..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161922] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Station</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    {inv.invoice_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{inv.customer?.full_name || 'Walk-in'}</p>
                    <p className="text-[11px] text-zinc-400 font-mono">{inv.customer?.normalized_phone || '--'}</p>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-300">
                    {inv.screen?.screen_name || 'Gaming Station'}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {formatDateTimeIST(inv.created_at)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                    {formatCurrency(inv.total_amount)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      inv.payment_status === 'paid'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : inv.payment_status === 'partially_paid'
                        ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                        : 'bg-red-950 text-red-300 border border-red-500/30'
                    }`}>
                      {inv.payment_status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {inv.payment_status !== 'paid' && (
                        <button
                          onClick={() => setSelectedInvoiceForPayment(inv)}
                          title="Record Payment"
                          className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 px-2 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white"
                        >
                          Pay
                        </button>
                      )}

                      <button
                        onClick={() => setViewInvoiceId(inv.id)}
                        title="View Invoice"
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleQuickDownload(inv)}
                        title="Download PDF"
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleQuickPrint(inv)}
                        title="Print"
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Printer className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedInvoiceForPayment && (
        <RecordPaymentModal
          invoice={selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          onSuccess={() => {
            setSelectedInvoiceForPayment(null);
            loadInvoices();
          }}
        />
      )}

      {/* Invoice View Modal */}
      {viewInvoiceId && (
        <InvoiceViewModal
          invoiceId={viewInvoiceId}
          onClose={() => setViewInvoiceId(null)}
        />
      )}
    </div>
  );
}

