'use client';

import React, { useState } from 'react';
import { X, Clock, Plus, AlertCircle } from 'lucide-react';
import { ActiveSessionView } from '@/types/cafe';
import { formatTimeIST } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';
import { calculateExtensionCharge } from '@/lib/pricing';

interface ExtendSessionModalProps {
  session: ActiveSessionView;
  onClose: () => void;
  onConfirm: (additionalMinutes: number) => Promise<void>;
}

export function ExtendSessionModal({ session, onClose, onConfirm }: ExtendSessionModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const duration = isCustom ? parseInt(customMinutes, 10) || 0 : selectedMinutes;
  const extraCharge = calculateExtensionCharge(duration, session.hourly_rate);

  // New end time calculation
  const currentEndTime = new Date(session.current_end_at).getTime();
  const baseTime = currentEndTime < Date.now() ? Date.now() : currentEndTime;
  const newEndTimestamp = new Date(baseTime + duration * 60 * 1000);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (duration <= 0) {
      setError('Please select or enter a valid extension duration.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm(duration);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to extend session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#12141a] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Extend Gaming Session</h3>
              <p className="text-xs text-zinc-400">{session.screen_name} • {session.customer_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
              Select Additional Minutes
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => {
                    setSelectedMinutes(mins);
                    setIsCustom(false);
                  }}
                  className={`rounded-lg py-2.5 text-xs font-bold transition-all ${
                    !isCustom && selectedMinutes === mins
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  +{mins}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Or Custom Duration
              </label>
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`text-[11px] font-medium ${isCustom ? 'text-blue-400' : 'text-zinc-400 hover:text-zinc-300'}`}
              >
                Use custom
              </button>
            </div>
            {isCustom && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  placeholder="e.g. 75, 90"
                  className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 py-2 px-3 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-zinc-400">minutes</span>
              </div>
            )}
          </div>

          {/* Pricing & End Time Summary */}
          <div className="rounded-xl border border-zinc-800 bg-[#171a22] p-3.5 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Current Scheduled End:</span>
              <span className="text-zinc-200 font-mono">{formatTimeIST(session.current_end_at)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>New Scheduled End:</span>
              <span className="text-emerald-400 font-mono font-bold">{formatTimeIST(newEndTimestamp)}</span>
            </div>
            <div className="border-t border-zinc-800 pt-2 flex justify-between text-zinc-300">
              <span>Hourly Rate Applied:</span>
              <span>₹{session.hourly_rate}/hr</span>
            </div>
            <div className="flex justify-between font-bold text-white text-sm">
              <span>Estimated Extra Charge:</span>
              <span className="text-blue-400">{formatCurrency(extraCharge)}</span>
            </div>
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
              disabled={submitting || duration <= 0}
              className="flex-1 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : `Confirm +${duration}m Extension`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

