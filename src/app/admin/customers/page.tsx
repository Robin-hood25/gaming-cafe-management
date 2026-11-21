'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, Search, User, Phone, Calendar, DollarSign, 
  History, Receipt, Edit2, X, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { Customer, Session, Invoice } from '@/types/cafe';
import { formatCurrency, normalizePhoneNumber } from '@/lib/utils';
import { formatDateTimeIST, formatDateOnlyIST } from '@/lib/date-utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Edit customer modal state
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCustomers = async () => {
    try {
      const list = await cafeRepo.getCustomers(searchQuery);
      setCustomers(list);
    } catch (err: any) {
      setError(err?.message || 'Failed to load customers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchQuery]);

  const viewCustomerProfile = async (id: string) => {
    setSelectedCustomerId(id);
    setDetailsLoading(true);
    try {
      const data = await cafeRepo.getCustomerProfile(id);
      setCustomerDetails(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load profile.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditName(customer.full_name);
    setEditPhone(customer.normalized_phone);
    setEditEmail(customer.email || '');
    setEditNotes(customer.notes || '');
    setError(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setError(null);

    try {
      await cafeRepo.updateCustomer(editingCustomer.id, {
        full_name: editName.trim(),
        normalized_phone: normalizePhoneNumber(editPhone.trim()),
        email: editEmail.trim() || null,
        notes: editNotes.trim() || null,
      });

      setSuccess('Customer record updated successfully.');
      setEditingCustomer(null);
      await loadCustomers();
      if (selectedCustomerId === editingCustomer.id) {
        await viewCustomerProfile(editingCustomer.id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to update customer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-400" />
            <span>Customer Database &amp; CRM</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Private player profiles, normalized phone records, session records, and lifetime gaming spend.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
          />
        </div>
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

      {/* Customer Table */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-[#161922] text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Player Name</th>
                <th className="py-3.5 px-4">Normalized Phone</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white text-sm">{c.full_name}</p>
                    {c.email && <p className="text-[11px] text-zinc-400">{c.email}</p>}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">
                    {c.normalized_phone}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {formatDateOnlyIST(c.created_at)}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">
                    {c.notes || '--'}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => viewCustomerProfile(c.id)}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-semibold text-blue-400 hover:text-white hover:bg-blue-600 hover:border-blue-600 transition-colors"
                      >
                        History
                      </button>
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-1.5 border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile & Previous Sessions Drawer / Modal */}
      {selectedCustomerId && customerDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-[#12141a] p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{customerDetails.customer.full_name}</h3>
                <p className="text-xs text-zinc-400 font-mono">{customerDetails.customer.normalized_phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Total Sessions</span>
                <p className="text-xl font-extrabold text-white mt-1">{customerDetails.totalSessions}</p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Total Spend</span>
                <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                  {formatCurrency(customerDetails.totalSpent)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-400">Last Visit</span>
                <p className="text-xs font-semibold text-zinc-200 mt-2">{formatDateOnlyIST(customerDetails.lastVisit)}</p>
              </div>
            </div>

            {/* Previous Sessions */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <History className="h-4 w-4 text-blue-400" />
                <span>Previous Gaming Sessions</span>
              </h4>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {customerDetails.sessions.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3">No recorded sessions for this customer.</p>
                ) : (
                  customerDetails.sessions.map((s: Session) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-white">
                          {s.original_duration_minutes} mins Session
                        </span>
                        <p className="text-[11px] text-zinc-400">{formatDateTimeIST(s.start_at)}</p>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        s.session_status === 'completed' ? 'bg-emerald-950 text-emerald-300' : 'bg-blue-950 text-blue-300'
                      }`}>
                        {s.session_status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Previous Invoices */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Receipt className="h-4 w-4 text-emerald-400" />
                <span>Invoice &amp; Billing History</span>
              </h4>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customerDetails.invoices.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-3">No invoices generated yet.</p>
                ) : (
                  customerDetails.invoices.map((inv: Invoice) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-white">{inv.invoice_number}</span>
                        <p className="text-[11px] text-zinc-400">{formatDateTimeIST(inv.created_at)}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-emerald-400 block">{formatCurrency(inv.total_amount)}</span>
                        <span className="text-[10px] uppercase font-bold text-zinc-400">{inv.payment_status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <h3 className="text-base font-bold text-white">Edit Customer Record</h3>
              <button onClick={() => setEditingCustomer(null)} className="rounded-lg p-1.5 text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Phone Number (Unique)</label>
                <input
                  type="tel"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm font-mono text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Private Notes</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-blue-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

