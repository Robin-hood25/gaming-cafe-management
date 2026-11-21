'use client';

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Download, Calendar, DollarSign, Clock, 
  Trophy, Coffee, AlertTriangle, ArrowUpRight 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { formatCurrency } from '@/lib/utils';
import { formatDateTimeIST } from '@/lib/date-utils';

export default function ReportsPage() {
  const [range, setRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await cafeRepo.getReports(range);
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [range]);

  const handleExportCSV = () => {
    if (!reports) return;
    const rows = [
      ['Metric', 'Value'],
      ['Report Range', range],
      ['Actual Collected Payments', reports.actualCollectedRevenue],
      ['Total Billed Revenue', reports.totalBilledRevenue],
      ['Gaming Revenue', reports.gamingRevenue],
      ['Snacks & Food Revenue', reports.foodRevenue],
      ['Outstanding Unpaid Amount', reports.outstandingAmount],
      ['Total Sessions Count', reports.totalSessions],
      ['Average Session Duration (mins)', reports.avgDuration],
      ['Unpaid Invoices Count', reports.unpaidInvoicesCount],
      [],
      ['Most Used Screens', 'Sessions Count', 'Total Hours'],
      ...reports.screenRankings.map((s: any) => [s.name, s.count, s.hours.toFixed(1)]),
      [],
      ['Popular Food & Beverage Items', 'Units Sold', 'Revenue (₹)'],
      ...reports.productRankings.map((p: any) => [p.name, p.quantity, p.revenue]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gaming_cafe_report_${range}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <span>Reports &amp; Financial Analytics</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Realized revenue tracking, gaming station utilization, snacks breakdown, and audit exports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Date range filter */}
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-0.5 text-xs font-semibold">
            {(['today', 'week', 'month', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-md px-3 py-1.5 uppercase transition-colors ${
                  range === r ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === 'week' ? 'Past 7 Days' : r === 'month' ? 'Past Month' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-700"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading && !reports ? (
        <div className="py-12 text-center text-xs text-zinc-400">Calculating financial metrics...</div>
      ) : (
        <>
          {/* Revenue Breakdown Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-900/40 bg-[#0c1812] p-5 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                Realized Revenue (Collected)
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
                {formatCurrency(reports?.actualCollectedRevenue || 0)}
              </p>
              <span className="mt-1 block text-[11px] text-emerald-500/80">
                Verified manual cash/UPI receipts
              </span>
            </div>

            <div className="rounded-2xl border border-blue-900/40 bg-[#0e1420] p-5 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
                Gaming Station Revenue
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-300 font-mono">
                {formatCurrency(reports?.gamingRevenue || 0)}
              </p>
              <span className="mt-1 block text-[11px] text-blue-400/80">
                PS5, PC, Xbox, Sim Rig play
              </span>
            </div>

            <div className="rounded-2xl border border-amber-900/40 bg-[#16130d] p-5 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                Food &amp; Beverage Revenue
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
                {formatCurrency(reports?.foodRevenue || 0)}
              </p>
              <span className="mt-1 block text-[11px] text-amber-500/80">
                Cold drinks &amp; cafe snacks
              </span>
            </div>

            <div className="rounded-2xl border border-red-900/40 bg-[#180e0e] p-5 shadow-sm">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-red-400">
                Outstanding (Unpaid)
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-300 font-mono">
                {formatCurrency(reports?.outstandingAmount || 0)}
              </p>
              <span className="mt-1 block text-[11px] text-red-400/80">
                {reports?.unpaidInvoicesCount} invoices awaiting payment
              </span>
            </div>
          </div>

          {/* Session Performance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4">
              <span className="text-[11px] font-bold uppercase text-zinc-400">Total Sessions</span>
              <p className="mt-1 text-2xl font-extrabold text-white">{reports?.totalSessions}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4">
              <span className="text-[11px] font-bold uppercase text-zinc-400">Average Duration</span>
              <p className="mt-1 text-2xl font-extrabold text-white">{reports?.avgDuration} mins</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4">
              <span className="text-[11px] font-bold uppercase text-zinc-400">Total Billed</span>
              <p className="mt-1 text-2xl font-extrabold text-zinc-200 font-mono">{formatCurrency(reports?.totalBilledRevenue)}</p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4">
              <span className="text-[11px] font-bold uppercase text-zinc-400">Collection Rate</span>
              <p className="mt-1 text-2xl font-extrabold text-emerald-400 font-mono">
                {reports?.totalBilledRevenue > 0
                  ? `${Math.round((reports.actualCollectedRevenue / reports.totalBilledRevenue) * 100)}%`
                  : '100%'}
              </p>
            </div>
          </div>

          {/* Leaderboards Grid: Screen Usage & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Screen Utilization */}
            <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Station Utilization Ranking</span>
              </h3>

              <div className="space-y-3">
                {reports?.screenRankings.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-4">No sessions in selected range.</p>
                ) : (
                  reports?.screenRankings.map((screen: any, idx: number) => (
                    <div
                      key={screen.name}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{screen.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-blue-400 block">{screen.count} sessions</span>
                        <span className="text-[11px] text-zinc-400">{screen.hours.toFixed(1)} hrs logged</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Popular Products */}
            <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 shadow-md">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-emerald-400" />
                <span>Most Popular Refreshments</span>
              </h3>

              <div className="space-y-3">
                {reports?.productRankings.length === 0 ? (
                  <p className="text-xs text-zinc-400 py-4">No refreshment orders in selected range.</p>
                ) : (
                  reports?.productRankings.map((p: any, idx: number) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-zinc-300">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-white">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-emerald-400 font-mono block">{formatCurrency(p.revenue)}</span>
                        <span className="text-[11px] text-zinc-400">{p.quantity} units sold</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

