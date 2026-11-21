'use client';

import React, { useState } from 'react';
import { Database, CheckCircle2, AlertTriangle, Copy, Terminal, Shield, ArrowRight, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function SupabaseSetupPage() {
  const isConfigured = isSupabaseConfigured();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const envSample = `# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
`;

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-400" />
          <span>Supabase Integration &amp; Setup Status</span>
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Configuration monitor for Supabase PostgreSQL, Authentication, Row Level Security, and Realtime replication.
        </p>
      </div>

      {/* Status Card */}
      <div className={`rounded-2xl border p-6 ${
        isConfigured
          ? 'border-emerald-500/30 bg-[#0c1812]'
          : 'border-amber-500/30 bg-[#16130d]'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
              isConfigured
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
            }`}>
              {isConfigured ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isConfigured ? 'Supabase Connected & Active' : 'Supabase Credentials Not Yet Configured in .env.local'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isConfigured
                  ? 'All database tables, RPCs, and Realtime subscriptions are communicating directly with your Supabase PostgreSQL cloud instance.'
                  : 'Currently operating in Local Persistent Storage mode with sample gaming cafe records. Follow the steps below to connect your real Supabase project.'}
              </p>
            </div>
          </div>

          <span className={`rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
            isConfigured
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-950 text-amber-300 border border-amber-500/30'
          }`}>
            {isConfigured ? 'LIVE CLOUD DB' : 'LOCAL MODE ACTIVE'}
          </span>
        </div>
      </div>

      {/* Step by step guide */}
      <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 sm:p-8 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white">
          How to Connect Your Supabase Cloud Database (3 Simple Steps)
        </h3>

        {/* Step 1 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Step 1: Set Environment Variables
            </span>
            <button
              onClick={() => copyToClipboard(envSample, 'env')}
              className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
            >
              <Copy className="h-3 w-3" />
              <span>{copiedSection === 'env' ? 'Copied!' : 'Copy Template'}</span>
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Create or edit <code className="text-zinc-200 bg-zinc-900 px-1.5 py-0.5 rounded">.env.local</code> in your project root with your project credentials:
          </p>
          <pre className="rounded-lg bg-[#0a0c10] border border-zinc-800 p-3 font-mono text-xs text-zinc-300 overflow-x-auto">
            {envSample}
          </pre>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Step 2: Run Database Schema Migrations
            </span>
            <span className="text-[11px] text-zinc-400">
              File: <code className="text-zinc-300">supabase/migrations/20240101000000_init_schema.sql</code>
            </span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Open your <strong>Supabase Dashboard &rarr; SQL Editor</strong>, paste and run the contents of:
          </p>
          <ul className="text-xs text-zinc-300 list-disc list-inside space-y-1">
            <li><code className="text-blue-300">supabase/migrations/20240101000000_init_schema.sql</code> (Creates 13 tables, atomic RPC procedures, row-level security, and publication)</li>
            <li><code className="text-blue-300">supabase/seed.sql</code> (Optional: seeds default screens, pricing, and initial menu items)</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
            Step 3: Create First Owner Account
          </span>
          <p className="text-xs text-zinc-400 leading-relaxed">
            In <strong>Supabase Dashboard &rarr; Authentication &rarr; Users</strong>, create an email user (e.g. <code className="text-zinc-200">owner@nexusgaming.in</code>). Then in SQL Editor execute:
          </p>
          <pre className="rounded-lg bg-[#0a0c10] border border-zinc-800 p-3 font-mono text-xs text-blue-300 overflow-x-auto">
{`INSERT INTO profiles (id, full_name, role)
VALUES ('<USER_UUID_FROM_AUTH_USERS>', 'Cafe Owner', 'owner')
ON CONFLICT (id) DO UPDATE SET role = 'owner';`}
          </pre>
        </div>
      </div>
    </div>
  );
}

