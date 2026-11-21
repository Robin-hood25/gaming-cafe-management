import React from 'react';
import Link from 'next/link';
import { Gamepad2, Shield } from 'lucide-react';
import { CafeSettings } from '@/types/cafe';

interface FooterProps {
  settings: CafeSettings;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="border-t border-[#1b1f2a] bg-[#07080b] py-10 px-4 sm:px-6 lg:px-8 text-xs text-zinc-400">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-white tracking-wide">{settings.cafe_name}</p>
            <p className="text-[11px] text-zinc-400">Premier Esports &amp; Console Gaming Lounge • Indiranagar</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/admin/login" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors">
            <Shield className="h-3.5 w-3.5 text-blue-400" />
            <span>Staff Dashboard</span>
          </Link>
          <span className="text-zinc-600">|</span>
          <p className="text-[11px]">
            Strict Data Privacy: No customer personal data is ever exposed publicly.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl mt-6 pt-6 border-t border-zinc-900 text-center text-[11px] text-zinc-400">
        &copy; {new Date().getFullYear()} {settings.cafe_name}. All rights reserved. Built with Next.js, Supabase PostgreSQL, and Tailwind CSS.
      </div>
    </footer>
  );
}

