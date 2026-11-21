'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Clock, PlusCircle, Coffee, CheckCircle, RefreshCw, 
  Receipt, AlertTriangle, Monitor, User, Phone 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { ActiveSessionView } from '@/types/cafe';
import { formatTimeIST, formatCountdown } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';
import { ExtendSessionModal } from '@/components/admin/ExtendSessionModal';
import { AddSnacksModal } from '@/components/admin/AddSnacksModal';
import { CheckoutModal } from '@/components/admin/CheckoutModal';
import { InvoiceViewModal } from '@/components/admin/InvoiceViewModal';

export default function ActiveSessionsPage() {
  const [sessions, setSessions] = useState<ActiveSessionView[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Modals
  const [selectedForExtend, setSelectedForExtend] = useState<ActiveSessionView | null>(null);
  const [selectedForSnacks, setSelectedForSnacks] = useState<ActiveSessionView | null>(null);
  const [selectedForCheckout, setSelectedForCheckout] = useState<ActiveSessionView | null>(null);
  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);

  const loadSessions = async () => {
    try {
      const data = await cafeRepo.getActiveSessions();
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();

    const unsub = cafeRepo.subscribeToAvailability(() => {
      loadSessions();
    });

    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      unsub();
      clearInterval(timer);
    };
  }, []);

  const handleExtend = async (mins: number) => {
    if (!selectedForExtend) return;
    await cafeRepo.extendSession({
      sessionId: selectedForExtend.id,
      additionalMinutes: mins,
    });
    await loadSessions();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Clock className="h-6 w-6 text-blue-400" />
            <span>Active Gaming Sessions</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time session monitor. Extend play duration, attach snacks &amp; drinks, or complete checkout.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setLoading(true);
              loadSessions();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <Link
            href="/admin/sessions/new"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>New Session</span>
          </Link>
        </div>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-12 text-center">
          <Monitor className="h-10 w-10 text-zinc-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No active sessions</h3>
          <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
            All stations are currently idle and ready for walk-in players.
          </p>
          <Link
            href="/admin/sessions/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start First Session</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => {
            const endMs = new Date(session.current_end_at).getTime();
            const remainingSecs = Math.max(0, Math.floor((endMs - currentTime) / 1000));
            const isOverdue = remainingSecs === 0;

            return (
              <div
                key={session.id}
                className={`rounded-2xl border p-5 shadow-lg transition-all flex flex-col justify-between ${
                  isOverdue
                    ? 'border-amber-500/40 bg-[#16130d]'
                    : 'border-zinc-800 bg-[#12141a]'
                }`}
              >
                <div>
                  {/* Station & Customer Header */}
                  <div className="flex items-start justify-between border-b border-zinc-800/80 pb-3">
                    <div>
                      <span className="rounded bg-blue-950 border border-blue-500/30 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                        {session.screen_type}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{session.screen_name}</h3>
                    </div>

                    <span className="font-mono text-xs font-bold text-zinc-300 bg-zinc-800/80 px-2.5 py-1 rounded-md">
                      ₹{session.hourly_rate}/hr
                    </span>
                  </div>

                  {/* Customer Information (Private to Admin) */}
                  <div className="mt-3.5 space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-zinc-200 font-semibold">
                      <User className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                      <span>{session.customer_name}</span>
                      <span className="text-zinc-400 font-normal">({session.player_count} player{session.player_count > 1 ? 's' : ''})</span>
                    </div>

                    <div className="flex items-center gap-2 text-zinc-400">
                      <Phone className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono">{session.customer_phone}</span>
                    </div>

                    {session.notes && (
                      <p className="text-[11px] text-zinc-400 italic bg-zinc-900/60 p-2 rounded-lg border border-zinc-800/60">
                        &quot;{session.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Countdown Timer */}
                  <div className="mt-4 rounded-xl bg-zinc-950/80 border border-zinc-800 p-3 text-center">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-0.5">
                      {isOverdue ? 'TIME OVER — AWAITING CHECKOUT' : 'Time Remaining'}
                    </span>
                    <span className={`font-mono text-2xl font-extrabold tracking-wider ${
                      isOverdue ? 'text-amber-400 animate-pulse' : 'text-white'
                    }`}>
                      {formatCountdown(remainingSecs)}
                    </span>
                  </div>

                  {/* Session Metrics Bar */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/50">
                    <div>
                      <span className="text-zinc-400 block">Start Time</span>
                      <span className="font-mono text-zinc-200">{formatTimeIST(session.start_at)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Scheduled End</span>
                      <span className="font-mono text-zinc-200">{formatTimeIST(session.current_end_at)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Initial Duration</span>
                      <span className="text-zinc-200">{session.original_duration_minutes}m</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 block">Snacks Running</span>
                      <span className="font-mono text-emerald-400 font-bold">{formatCurrency(session.orders_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Session Action Buttons */}
                <div className="mt-5 pt-3 border-t border-zinc-800/80 grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setSelectedForExtend(session)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    Extend Time
                  </button>

                  <button
                    onClick={() => setSelectedForSnacks(session)}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 py-2 text-xs font-semibold text-zinc-200 hover:text-white hover:border-zinc-700 transition-colors"
                  >
                    + Food/Drinks
                  </button>

                  <button
                    onClick={() => setSelectedForCheckout(session)}
                    className="rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition-colors"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedForExtend && (
        <ExtendSessionModal
          session={selectedForExtend}
          onClose={() => setSelectedForExtend(null)}
          onConfirm={handleExtend}
        />
      )}

      {selectedForSnacks && (
        <AddSnacksModal
          session={selectedForSnacks}
          onClose={() => setSelectedForSnacks(null)}
          onSuccess={() => loadSessions()}
        />
      )}

      {selectedForCheckout && (
        <CheckoutModal
          session={selectedForCheckout}
          onClose={() => setSelectedForCheckout(null)}
          onCheckoutComplete={(invId) => {
            setSelectedForCheckout(null);
            loadSessions();
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

