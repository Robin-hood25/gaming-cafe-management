'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Monitor, CheckCircle2, AlertTriangle, Wrench, Clock, 
  RefreshCw, Wifi, WifiOff, Sparkles, Filter 
} from 'lucide-react';
import { PublicScreenAvailability } from '@/types/cafe';
import { cafeRepo } from '@/lib/cafe-repository';
import { formatTimeIST, formatCountdown } from '@/lib/date-utils';
import { formatCurrency } from '@/lib/utils';

export function LiveAvailability() {
  const [screens, setScreens] = useState<PublicScreenAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // Fetch sanitized screen availability
  const fetchAvailability = async () => {
    try {
      const data = await cafeRepo.getPublicScreenAvailability();
      setScreens(data);
      setLastRefreshed(new Date());
      setIsLiveConnected(true);
    } catch (err) {
      console.error('Failed to load screen availability:', err);
      setIsLiveConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Setup Realtime subscription and 1-second interval for real-time countdown calculation
  useEffect(() => {
    fetchAvailability();

    // Subscribe to realtime database changes (Supabase or local event emitter)
    const unsubscribe = cafeRepo.subscribeToAvailability(() => {
      fetchAvailability();
    });

    // 1-second ticker to recompute remaining time from database current_end_at
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  // Compute live screen metrics dynamically
  const metrics = useMemo(() => {
    const total = screens.length;
    let available = 0;
    let occupied = 0;
    let maintenance = 0;

    for (const screen of screens) {
      if (screen.maintenance_status) {
        maintenance++;
      } else if (screen.current_end_at) {
        const endTime = new Date(screen.current_end_at).getTime();
        // If there's an active session on the screen
        occupied++;
      } else {
        available++;
      }
    }

    return { total, available, occupied, maintenance };
  }, [screens]);

  // Extract unique screen types for filter
  const screenTypes = useMemo(() => {
    const types = new Set<string>();
    types.add('ALL');
    for (const s of screens) {
      if (s.screen_type) types.add(s.screen_type);
    }
    return Array.from(types);
  }, [screens]);

  // Filter screens
  const filteredScreens = useMemo(() => {
    if (selectedType === 'ALL') return screens;
    return screens.filter((s) => s.screen_type === selectedType);
  }, [screens, selectedType]);

  return (
    <section id="screens-availability" className="py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-400">
            <Sparkles className="h-4 w-4" />
            <span>REAL-TIME STATUS MONITOR</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Live Station Availability
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Current in-lounge screen states synchronized with database. Walk in anytime to grab an open station.
          </p>
        </div>

        {/* Sync Status & Manual Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400">
            {isLiveConnected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-zinc-300">Live Sync Active</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-amber-300">Reconnecting...</span>
              </>
            )}
            <span className="text-zinc-600">|</span>
            <span>Updated {formatTimeIST(lastRefreshed)}</span>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              fetchAvailability();
            }}
            title="Refresh availability"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Dynamic Summary Cards (Never Hardcoded) */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
        <div className="rounded-xl border border-zinc-800 bg-[#12141a] p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-400">Total Screens</span>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">{metrics.total}</p>
          <span className="mt-1 block text-xs text-zinc-400">Configured in lounge</span>
        </div>

        <div className="rounded-xl border border-emerald-900/40 bg-[#0d1612] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald-400">Available Now</span>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-300">{metrics.available}</p>
          <span className="mt-1 block text-xs text-emerald-500/80">Ready to play</span>
        </div>

        <div className="rounded-xl border border-blue-900/40 bg-[#0e1420] p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-blue-400">In Play / Occupied</span>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-300">{metrics.occupied}</p>
          <span className="mt-1 block text-xs text-blue-400/80">Gaming in progress</span>
        </div>

        <div className="rounded-xl border border-amber-900/30 bg-[#16130d] p-4 shadow-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-amber-400">Maintenance</span>
          <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-300">{metrics.maintenance}</p>
          <span className="mt-1 block text-xs text-amber-500/80">Hardware check</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mr-2 shrink-0">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter:</span>
        </div>
        {screenTypes.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
              selectedType === type
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
          >
            {type === 'ALL' ? 'All Stations' : type}
          </button>
        ))}
      </div>

      {/* Individual Gaming Screen Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredScreens.map((screen) => {
          // Dynamic calculation of countdown strictly from database session end timestamp
          let remainingSeconds = 0;
          let isTimeOverAwaitingCheckout = false;
          let isOccupied = false;

          if (screen.current_end_at && !screen.maintenance_status) {
            const endMs = new Date(screen.current_end_at).getTime();
            const diffSeconds = Math.floor((endMs - currentTime) / 1000);

            if (diffSeconds > 0) {
              isOccupied = true;
              remainingSeconds = diffSeconds;
            } else {
              // Session time has run out, but owner hasn't checked out yet!
              // Requirement: "If a session reaches zero but the customer has not checked out, show 'TIME OVER — AWAITING CHECKOUT' internally. Do not automatically mark the screen available and accidentally allow overlapping sessions."
              isTimeOverAwaitingCheckout = true;
            }
          }

          const isMaintenance = screen.maintenance_status;
          const isAvailable = !isMaintenance && !screen.current_end_at;

          return (
            <div
              key={screen.screen_id}
              className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-200 ${
                isAvailable
                  ? 'border-emerald-500/30 bg-[#0e1613] hover:border-emerald-500/60 shadow-lg shadow-emerald-950/10'
                  : isOccupied
                  ? 'border-blue-900/40 bg-[#101420] hover:border-blue-800/70'
                  : isTimeOverAwaitingCheckout
                  ? 'border-amber-500/40 bg-[#17140e] hover:border-amber-500/70'
                  : 'border-zinc-800 bg-[#12141a]/60 opacity-80'
              }`}
            >
              {/* Card Header: Screen Name & Type Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                      isAvailable
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : isOccupied
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                        : isTimeOverAwaitingCheckout
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Monitor className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                      {screen.screen_name}
                    </h3>
                    <span className="inline-block text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      {screen.screen_type}
                    </span>
                  </div>
                </div>

                <span className="shrink-0 rounded-md bg-zinc-800/80 px-2 py-1 text-[11px] font-semibold text-zinc-300 border border-zinc-700/50">
                  {formatCurrency(screen.hourly_rate)}/hr
                </span>
              </div>

              {/* Specs snapshot */}
              {screen.specs && (
                <p className="mt-3 text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {screen.specs}
                </p>
              )}

              {/* Status Section */}
              <div className="mt-5 border-t border-zinc-800/80 pt-4">
                {/* 1. AVAILABLE */}
                {isAvailable && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold tracking-wide">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span>AVAILABLE</span>
                    </div>
                    <span className="text-xs font-medium text-emerald-300/90 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                      Ready to play
                    </span>
                  </div>
                )}

                {/* 2. OCCUPIED WITH LIVE COUNTDOWN */}
                {isOccupied && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-blue-400 text-xs font-bold tracking-wide">
                        <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        <span>OCCUPIED</span>
                      </div>
                      <span className="text-xs text-zinc-400 flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3 text-zinc-400" />
                        <span>Expected End: {formatTimeIST(screen.current_end_at)}</span>
                      </span>
                    </div>

                    {/* Prominent Live Countdown */}
                    <div className="rounded-lg bg-zinc-950/70 border border-blue-900/50 p-2.5 text-center">
                      <span className="block text-[10px] font-medium uppercase tracking-wider text-blue-300">
                        Live Time Remaining
                      </span>
                      <span className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest text-white">
                        {formatCountdown(remainingSeconds)}
                      </span>
                    </div>
                  </div>
                )}

                {/* 3. TIME OVER — AWAITING CHECKOUT */}
                {isTimeOverAwaitingCheckout && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold tracking-wide">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                        <span>TIME OVER</span>
                      </div>
                      <span className="text-[11px] text-amber-400/80">
                        Ended at {formatTimeIST(screen.current_end_at)}
                      </span>
                    </div>
                    <div className="rounded-lg bg-amber-950/20 border border-amber-500/30 p-2 text-center text-xs font-semibold text-amber-300">
                      AWAITING CHECKOUT AT COUNTER
                    </div>
                  </div>
                )}

                {/* 4. MAINTENANCE */}
                {isMaintenance && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold tracking-wide">
                      <Wrench className="h-3.5 w-3.5 text-amber-500" />
                      <span>MAINTENANCE</span>
                    </div>
                    <span className="text-xs text-zinc-400 bg-zinc-800/60 border border-zinc-700/40 px-2 py-0.5 rounded">
                      Temporarily unavailable
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredScreens.length === 0 && (
        <div className="mt-8 rounded-xl border border-zinc-800 bg-[#11131a] p-8 text-center">
          <p className="text-sm text-zinc-400">No screens match the selected filter.</p>
        </div>
      )}
    </section>
  );
}

