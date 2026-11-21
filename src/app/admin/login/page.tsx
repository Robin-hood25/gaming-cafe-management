'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, KeyRound, Mail, ArrowRight, Gamepad2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn, isLiveSupabase, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await signIn(email, password);
      if (res.success) {
        router.push('/admin/dashboard');
      } else {
        setError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'owner' | 'staff') => {
    setError(null);
    setSubmitting(true);
    const demoEmail = role === 'owner' ? 'owner@nexusgaming.in' : 'staff@nexusgaming.in';
    const demoPass = 'admin123';
    setEmail(demoEmail);
    setPassword(demoPass);
    const res = await signIn(demoEmail, demoPass);
    if (res.success) {
      router.push('/admin/dashboard');
    } else {
      setError(res.error || 'Demo login failed');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 mb-4 shadow-lg shadow-blue-900/10">
            <Gamepad2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Staff &amp; Owner Portal
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Restricted access for Nexus Gaming Lounge authorized personnel
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-zinc-800 bg-[#11131a] p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@nexusgaming.in"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/80 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              <span>{submitting ? 'Verifying Credentials...' : 'Sign In to Dashboard'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Login Option for testing & local mode */}
          <div className="mt-8 border-t border-zinc-800/80 pt-6">
            <span className="block text-center text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-3">
              One-Click Staff Access (Demo / Local Mode)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('owner')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <Shield className="h-3.5 w-3.5 text-blue-400" />
                <span>Owner Login</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('staff')}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Staff Login</span>
              </button>
            </div>
            <p className="mt-3 text-center text-[11px] text-zinc-400">
              {isLiveSupabase ? 'Connected to live Supabase Authentication' : 'Local persistent mode active (Pass: admin123)'}
            </p>
          </div>
        </div>

        {/* Back to public link */}
        <div className="mt-6 text-center">
          <a href="/" className="text-xs text-zinc-400 hover:text-white transition-colors">
            &larr; Back to Public Customer Website
          </a>
        </div>
      </div>
    </div>
  );
}

