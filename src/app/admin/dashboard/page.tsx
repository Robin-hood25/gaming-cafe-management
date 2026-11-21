'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Monitor, Users, DollarSign, Clock, PlusCircle, ArrowUpRight, 
  Coffee, Receipt, Shield, Activity, RefreshCw, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { ActiveSessionView, AuditLog, PublicScreenAvailability } from '@/types/cafe';
import { formatCurrency } from '@/lib/utils';
import { formatTimeIST, formatCountdown, formatDateTimeIST } from '@/lib/date-utils';
import { ExtendSessionModal } from '@/components/admin/ExtendSessionModal';
import { AddSnacksModal } from '@/components/admin/AddSnacksModal';
import { CheckoutModal } from '@/components/admin/CheckoutModal';
import { InvoiceViewModal } from '@/components/admin/InvoiceViewModal';

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionView[]>([]);
  const [screens, setScreens] = useState<PublicScreenAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Modal states
  const [selectedForExtend, setSelectedForExtend] = useState<ActiveSessionView | null>(null);
  const [selectedForSnacks, setSelectedForSnacks] = useState<ActiveSessionView | null>(null);
  const [selectedForCheckout, setSelectedForCheckout] = useState<ActiveSessionView | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [ov, sessions, screenList] = await Promise.all([
        cafeRepo.getDashboardOverview(),
        cafeRepo.getActiveSessions(),
        cafeRepo.getPublicScreenAvailability(),
      ]);
      setOverview(ov);
      setActiveSessions(sessions);
      setScreens(screenList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to availability/session changes
    const unsub = cafeRepo.subscribeToAvailability(() => {
      loadData();
    });

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const handleExtendConfirm = async (mins: number) => {
    if (!selectedForExtend) return;
    await cafeRepo.extendSession({
      sessionId: selectedForExtend.id,
      additionalMinutes: mins,
    });
    await loadData();
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-zinc-400">
        Loading management dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Lounge Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time management metrics, active gameplay, and today&apos;s financial summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              loadData();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/sessions/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start Session</span>
          </Link>
        </div>
      </div>

      {/* 8 Overview Metric Cards (Strictly Real Data) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4">
        {/* Total Screens */}
        <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Screens</span>
            <Monitor className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white">{overview?.totalScreens || 0}</p>
          <span className="mt-1 block text-[11px] text-zinc-400">Configured hardware</span>
        </div>

        {/* Available Screens */}
        <div className="rounded-xl border border-emerald-900/40 bg-[#0d1612] p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Available</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-300">{overview?.availableScreens || 0}</p>
          <span className="mt-1 block text-[11px] text-emerald-500/80">Ready for walk-in</span>
        </div>

        {/* Occupied Screens */}
        <div className="rounded-xl border border-blue-900/40 bg-[#0e1420] p-4 shadow-sm">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">In Play</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-blue-300">{overview?.occupiedScreens || 0}</p>
          <span className="mt-1 block text-[11px] text-blue-400/80">Active gaming sessions</span>
        </div>

        {/* Maintenance Screens */}
        <div className="rounded-xl border border-amber-900/40 bg-[#16130d] p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Maintenance</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-300">{overview?.maintenanceScreens || 0}</p>
          <span className="mt-1 block text-[11px] text-amber-500/80">Offline for inspection</span>
        </div>

        {/* Today's Customers */}
        <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Today&apos;s Gamers</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-white">{overview?.todayCustomersCount || 0}</p>
          <span className="mt-1 block text-[11px] text-zinc-400">Unique visitors today</span>
        </div>

        {/* Gaming Revenue */}
        <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Gaming Revenue</span>
            <Monitor className="h-4 w-4 text-blue-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-blue-400 font-mono">
            {formatCurrency(overview?.todayGamingRevenue || 0)}
          </p>
          <span className="mt-1 block text-[11px] text-zinc-400">Screen billings today</span>
        </div>

        {/* Snack Revenue */}
        <div className="rounded-xl border border-zinc-800 bg-[#11131a] p-4 shadow-sm">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Snack Revenue</span>
            <Coffee className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-300 font-mono">
            {formatCurrency(overview?.todaySnackRevenue || 0)}
          </p>
          <span className="mt-1 block text-[11px] text-zinc-400">F&amp;B sales today</span>
        </div>

        {/* Total Collected Revenue */}
        <div className="rounded-xl border border-emerald-900/50 bg-[#0c1812] p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Collected Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-300 font-mono">
            {formatCurrency(overview?.todayTotalRevenue || 0)}
          </p>
          <span className="mt-1 block text-[11px] text-emerald-500/80">Payments confirmed</span>
        </div>
      </div>

      {/* Active Sessions Live Tracker */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">
              Currently Active Sessions ({activeSessions.length})
            </h2>
          </div>
          <Link href="/admin/sessions" className="text-xs font-semibold text-blue-400 hover:text-blue-300">
            View All Active Sessions &rarr;
          </Link>
        </div>

        {activeSessions.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No active sessions right now. All operational screens are free.
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeSessions.map((session) => {
              const endMs = new Date(session.current_end_at).getTime();
              const remainingSecs = Math.max(0, Math.floor((endMs - currentTime) / 1000));
              const isOverdue = remainingSecs === 0;

              return (
                <div
                  key={session.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isOverdue
                      ? 'border-amber-500/40 bg-[#17140e]'
                      : 'border-zinc-800 bg-[#141720]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm">{session.screen_name}</h3>
                      <p className="text-xs text-zinc-300 font-medium mt-0.5">{session.customer_name}</p>
                      <p className="text-[11px] text-zinc-400">{session.customer_phone}</p>
                    </div>

                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                      ₹{session.hourly_rate}/hr
                    </span>
                  </div>

                  {/* Countdown Box */}
                  <div className="mt-3 rounded-lg bg-zinc-950/80 p-2.5 text-center border border-zinc-800">
                    <span className="block text-[10px] font-medium uppercase text-zinc-400">
                      {isOverdue ? 'Awaiting Checkout' : 'Time Remaining'}
                    </span>
                    <span className={`font-mono text-xl font-extrabold ${isOverdue ? 'text-amber-400' : 'text-white'}`}>
                      {formatCountdown(remainingSecs)}
                    </span>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-4 grid grid-cols-3 gap-1.5 pt-2 border-t border-zinc-800/80">
                    <button
                      onClick={() => setSelectedForExtend(session)}
                      className="rounded-lg bg-zinc-900 border border-zinc-800 py-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white hover:border-zinc-700"
                    >
                      Extend
                    </button>
                    <button
                      onClick={() => setSelectedForSnacks(session)}
                      className="rounded-lg bg-zinc-900 border border-zinc-800 py-1.5 text-[11px] font-semibold text-zinc-300 hover:text-white hover:border-zinc-700"
                    >
                      + Food
                    </button>
                    <button
                      onClick={() => setSelectedForCheckout(session)}
                      className="rounded-lg bg-emerald-600/20 border border-emerald-500/30 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600 hover:text-white"
                    >
                      Checkout
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Activity Feed from Audit Logs */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6">
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-4">
          <Activity className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-bold text-white">Recent Lounge Activity Feed</h2>
        </div>

        <div className="mt-4 space-y-3">
          {(!overview?.recentActivity || overview.recentActivity.length === 0) ? (
            <div className="py-6 text-center text-xs text-zinc-400">No activity recorded yet.</div>
          ) : (
            overview.recentActivity.map((log: AuditLog) => (
              <div
                key={log.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-zinc-900/40 px-4 py-2.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${
                    log.action.includes('START') ? 'bg-blue-400' :
                    log.action.includes('EXTEND') ? 'bg-amber-400' :
                    log.action.includes('PAYMENT') || log.action.includes('CHECKOUT') ? 'bg-emerald-400' : 'bg-zinc-400'
                  }`} />
                  <div>
                    <span className="font-semibold text-white mr-2">{log.action.replace('_', ' ')}</span>
                    <span className="text-zinc-400">
                      {log.details ? JSON.stringify(log.details).slice(0, 80).replace(/[{}"]/g, '') : ''}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] text-zinc-400 font-mono shrink-0 ml-4">
                  {formatDateTimeIST(log.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedForExtend && (
        <ExtendSessionModal
          session={selectedForExtend}
          onClose={() => setSelectedForExtend(null)}
          onConfirm={handleExtendConfirm}
        />
      )}

      {selectedForSnacks && (
        <AddSnacksModal
          session={selectedForSnacks}
          onClose={() => setSelectedForSnacks(null)}
          onSuccess={() => loadData()}
        />
      )}

      {selectedForCheckout && (
        <CheckoutModal
          session={selectedForCheckout}
          onClose={() => setSelectedForCheckout(null)}
          onCheckoutComplete={(invId) => {
            setSelectedForCheckout(null);
            loadData();
            setViewInvoiceId(invId);
          }}
        />
      )}

      {viewInvoiceId && (
        <InvoiceViewModal
          invoiceId={viewInvoiceId}
          onClose={() => setViewInvoiceId(null)}
        />
      )}
    </div>
  );
}

