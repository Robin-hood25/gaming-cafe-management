'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  PlusCircle, User, Phone, Monitor, Clock, 
  Users, FileText, ArrowRight, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { cafeRepo } from '@/lib/cafe-repository';
import { PublicScreenAvailability } from '@/types/cafe';
import { formatTimeIST } from '@/lib/date-utils';
import { formatCurrency, normalizePhoneNumber } from '@/lib/utils';

export default function NewSessionPage() {
  const router = useRouter();
  const [screens, setScreens] = useState<PublicScreenAvailability[]>([]);
  const [loadingScreens, setLoadingScreens] = useState(true);

  // Form Fields (Required by Section 4)
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [customDuration, setCustomDuration] = useState('');
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [playerCount, setPlayerCount] = useState(1);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load available screens
  useEffect(() => {
    async function fetchScreens() {
      try {
        const data = await cafeRepo.getPublicScreenAvailability();
        setScreens(data);
        // Pre-select first available screen if any
        const firstAvailable = data.find((s) => s.status === 'AVAILABLE');
        if (firstAvailable) {
          setSelectedScreenId(firstAvailable.screen_id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingScreens(false);
      }
    }
    fetchScreens();
  }, []);

  const effectiveDuration = isCustomDuration ? parseInt(customDuration, 10) || 0 : durationMinutes;
  const selectedScreen = screens.find((s) => s.screen_id === selectedScreenId);

  // Dynamic start & calculated end time
  const now = new Date();
  const calculatedEndTime = new Date(now.getTime() + effectiveDuration * 60 * 1000);
  const estimatedCost = selectedScreen
    ? Number(((selectedScreen.hourly_rate * effectiveDuration) / 60).toFixed(2))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Customer phone number is required.');
      return;
    }
    if (!selectedScreenId) {
      setError('Please select an available gaming screen.');
      return;
    }
    if (effectiveDuration <= 0) {
      setError('Duration must be greater than zero minutes.');
      return;
    }

    if (selectedScreen?.status !== 'AVAILABLE') {
      setError('Selected screen is not available. Please pick an open screen.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await cafeRepo.startSession({
        customerName: customerName.trim(),
        phone: normalizePhoneNumber(phone.trim()),
        screenId: selectedScreenId,
        durationMinutes: effectiveDuration,
        playerCount: Math.max(1, playerCount),
        notes: notes.trim() || undefined,
      });

      router.push('/admin/sessions');
    } catch (err: any) {
      setError(err?.message || 'Failed to start session. Screen may have just been occupied.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
          <Link href="/admin/sessions" className="hover:text-white">Active Sessions</Link>
          <span>/</span>
          <span className="text-zinc-200">Start New Session</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
          <PlusCircle className="h-6 w-6 text-blue-400" />
          <span>Start Customer Gaming Session</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Assign an open gaming station to a walk-in player. Start date, time, and end calculations are captured automatically.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 sm:p-8 space-y-6">
        {/* Customer Information Group */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <User className="h-4 w-4" />
            <span>Customer Details</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Customer Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Phone Number <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 12345 or 9845012345"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Screen Selection Group */}
        <div className="border-t border-zinc-800/80 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <Monitor className="h-4 w-4" />
            <span>Select Available Screen <span className="text-red-400">*</span></span>
          </h2>

          {loadingScreens ? (
            <div className="py-4 text-xs text-zinc-400">Loading stations...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {screens.map((screen) => {
                const isAvailable = screen.status === 'AVAILABLE';
                const isSelected = selectedScreenId === screen.screen_id;

                return (
                  <button
                    type="button"
                    key={screen.screen_id}
                    disabled={!isAvailable}
                    onClick={() => setSelectedScreenId(screen.screen_id)}
                    className={`rounded-xl border p-3.5 text-left transition-all relative ${
                      isSelected
                        ? 'border-blue-500 bg-blue-950/30 ring-1 ring-blue-500 shadow-md'
                        : isAvailable
                        ? 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                        : 'border-zinc-900 bg-zinc-950/20 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{screen.screen_name}</span>
                      <span className="font-mono text-xs font-bold text-zinc-300">
                        {formatCurrency(screen.hourly_rate)}/hr
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-1">{screen.screen_type}</span>
                    <span className={`inline-block mt-2 rounded px-2 py-0.5 text-[10px] font-bold ${
                      isAvailable ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {screen.status}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Duration Selection Group */}
        <div className="border-t border-zinc-800/80 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4 flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>Session Duration <span className="text-red-400">*</span></span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {[30, 60, 90, 120].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => {
                  setDurationMinutes(mins);
                  setIsCustomDuration(false);
                }}
                className={`rounded-xl py-2.5 text-xs font-bold transition-all ${
                  !isCustomDuration && durationMinutes === mins
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                {mins} mins ({mins / 60} hr{mins > 60 ? 's' : ''})
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCustomDuration(!isCustomDuration)}
              className={`text-xs font-medium ${isCustomDuration ? 'text-blue-400 font-semibold' : 'text-zinc-400 hover:text-white'}`}
            >
              Custom duration?
            </button>
            {isCustomDuration && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-28 rounded-lg border border-zinc-800 bg-zinc-950 py-1.5 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
                <span className="text-xs text-zinc-400">minutes</span>
              </div>
            )}
          </div>
        </div>

        {/* Players & Notes */}
        <div className="border-t border-zinc-800/80 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Number of Players (Optional)
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value, 10) || 1)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Session Notes / Game Title (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. FIFA 24, Valorant squad"
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 px-3.5 text-sm text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Auto Captured Timestamps & Estimated Cost Preview */}
        <div className="rounded-xl border border-zinc-800 bg-[#161922] p-4 space-y-2 text-xs">
          <div className="flex justify-between text-zinc-400">
            <span>Session Start Time (Auto):</span>
            <span className="text-zinc-200 font-mono">{formatTimeIST(now)} (Now)</span>
          </div>
          <div className="flex justify-between text-zinc-400">
            <span>Calculated End Time:</span>
            <span className="text-emerald-400 font-mono font-bold">{formatTimeIST(calculatedEndTime)}</span>
          </div>
          <div className="border-t border-zinc-800 pt-2 flex justify-between text-white font-bold text-sm">
            <span>Estimated Gaming Base Charge:</span>
            <span className="text-blue-400 font-mono">{formatCurrency(estimatedCost)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80">
          <Link
            href="/admin/sessions"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Session...' : 'Start Session & Occupy Screen'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
}

