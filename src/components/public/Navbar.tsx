'use client';

import React from 'react';
import Link from 'next/link';
import { Gamepad2, Shield, MessageCircle, Clock, MapPin } from 'lucide-react';
import { CafeSettings } from '@/types/cafe';

interface NavbarProps {
  settings: CafeSettings;
  availableCount: number;
  totalCount: number;
}

export function Navbar({ settings, availableCount, totalCount }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1b1f2a] bg-[#0a0b0f]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Cafe Brand */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 group-hover:border-blue-400 transition-colors">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <span className="font-extrabold tracking-wider text-base sm:text-lg text-white">
              {settings.cafe_name || 'NEXUS GAMING'}
            </span>
            <span className="block text-[11px] font-medium uppercase tracking-widest text-zinc-400">
              Lounge & Esports
            </span>
          </div>
        </Link>

        {/* Live Status Pill & Quick Info */}
        <div className="hidden lg:flex items-center gap-6 text-xs text-zinc-400">
          <div className="flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-zinc-200 font-semibold">{availableCount} / {totalCount} Screens Ready</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>{settings.opening_hours || '11 AM – 1 AM'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-zinc-400" />
            <span>Indiranagar, Bengaluru</span>
          </div>
        </div>

        {/* Actions: WhatsApp & Staff Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`https://wa.me/${settings.whatsapp_number.replace(/[^0-9]/g, '')}?text=Hi%20Nexus%20Gaming%20Lounge,%20I%20have%20an%20enquiry%20regarding%20screen%20availability`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-900/30 hover:border-emerald-500 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp Enquiry</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>

          <Link
            href="/admin/login"
            className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 hover:border-blue-500/50 hover:text-white transition-all"
          >
            <Shield className="h-4 w-4 text-blue-400" />
            <span>Staff Portal</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

