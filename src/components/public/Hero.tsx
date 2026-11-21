import React from 'react';
import { ShieldAlert, Zap, Monitor, Sparkles } from 'lucide-react';
import { CafeSettings } from '@/types/cafe';

interface HeroProps {
  settings: CafeSettings;
  totalScreens: number;
  availableScreens: number;
}

export function Hero({ settings, totalScreens, availableScreens }: HeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[#1b1f2a] bg-gradient-to-b from-[#0e111a] via-[#0a0b0f] to-[#0a0b0f] py-16 px-4 sm:px-6 lg:px-8">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Pill notice */}
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-950/30 px-3 py-1.5 text-xs font-semibold text-blue-300 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>LIVE IN-STORE AVAILABILITY TRACKER</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {settings.cafe_name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-zinc-400 sm:text-lg">
          {settings.tagline || 'Next-Gen Esports & Console Gaming Lounge'}. Experience Sony PS5 Pro on 4K 120Hz OLEDs, RTX 4090 Battlestations, and Direct Drive Racing Simulators.
        </p>

        {/* STRICT NO-ONLINE-BOOKING POLICY BANNER */}
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-zinc-800 bg-[#12151e]/80 p-4 text-left shadow-xl sm:flex sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Walk-In Gaming Lounge Notice
              </h2>
              <p className="mt-0.5 text-xs text-zinc-400">
                Online bookings & payments are disabled to guarantee fair walk-in access. Gaming sessions are initiated in-person by lounge staff at our Indiranagar counter.
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-4 sm:shrink-0 flex items-center justify-end gap-2">
            <a
              href="#screens-availability"
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-blue-500 transition-all"
            >
              <Monitor className="h-4 w-4" />
              <span>View Live Screens</span>
            </a>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto text-left">
          <div className="rounded-lg border border-zinc-800/80 bg-[#11131a] p-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">PS5 Pro Stations</span>
            <p className="mt-0.5 text-sm font-bold text-white">4K 120Hz OLED 55&quot;</p>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-[#11131a] p-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">RTX 4090 &amp; 4080</span>
            <p className="mt-0.5 text-sm font-bold text-white">240Hz / 360Hz Fast-IPS</p>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-[#11131a] p-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Fanatec Sim Rig</span>
            <p className="mt-0.5 text-sm font-bold text-white">Direct Drive Triple 32&quot;</p>
          </div>
          <div className="rounded-lg border border-zinc-800/80 bg-[#11131a] p-3">
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Pricing Starts At</span>
            <p className="mt-0.5 text-sm font-bold text-blue-400">₹100 / hour</p>
          </div>
        </div>
      </div>
    </section>
  );
}

