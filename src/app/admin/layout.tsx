'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Gamepad2, LayoutDashboard, Monitor, Users, Coffee, Tag, 
  Receipt, BarChart3, Settings, LogOut, PlusCircle, Clock, 
  Menu, X, Shield, Database, ChevronRight, Sparkles 
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { formatTimeIST } from '@/lib/date-utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, signOut, isLiveSupabase } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentISTTime, setCurrentISTTime] = useState<string>('--:--');

  // Clock in IST
  useEffect(() => {
    const updateTime = () => setCurrentISTTime(formatTimeIST(new Date()));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth gate: redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, isLoading, pathname, router]);

  // If on login page, render children without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-xs text-zinc-400">Loading authorized dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Active Sessions', href: '/admin/sessions', icon: Clock },
    { name: 'New Session', href: '/admin/sessions/new', icon: PlusCircle, highlight: true },
    { name: 'Screen Management', href: '/admin/screens', icon: Monitor },
    { name: 'Customers CRM', href: '/admin/customers', icon: Users },
    { name: 'Products & Menu', href: '/admin/products', icon: Coffee },
    { name: 'Pricing Settings', href: '/admin/pricing', icon: Tag },
    { name: 'Invoices & Payments', href: '/admin/invoices', icon: Receipt },
    { name: 'Reports & Analytics', href: '/admin/reports', icon: BarChart3 },
    { name: 'Cafe Settings', href: '/admin/settings', icon: Settings },
    { name: 'Supabase Setup', href: '/admin/setup', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#07080b] text-zinc-100 flex">
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[#1a1e28] bg-[#0c0e14] shrink-0 sticky top-0 h-screen overflow-y-auto">
        {/* Brand */}
        <div className="p-5 border-b border-[#1a1e28] flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-wider text-white">NEXUS CAFE</span>
              <span className="block text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">Management Console</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  item.highlight && !isActive
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 hover:bg-blue-600/20'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-bold text-blue-300">
                    START
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Database Mode Pill */}
        <div className="px-4 py-2 border-t border-[#1a1e28]">
          <Link
            href="/admin/setup"
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-[#11131a] p-2 text-[11px] text-zinc-400 hover:border-zinc-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isLiveSupabase ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-zinc-300">{isLiveSupabase ? 'Supabase Live' : 'Local Data Mode'}</span>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
        </div>

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-[#1a1e28] bg-[#090b10]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-200">
                {user.full_name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{user.full_name}</p>
                <span className="inline-block text-[10px] font-medium uppercase tracking-wider text-blue-400">
                  {user.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              title="Sign Out"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------------- MAIN VIEWPORT ---------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-[#1a1e28] bg-[#0c0e14]/90 backdrop-blur-md px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
                <Link href="/" target="_blank" className="hover:text-blue-400 transition-colors flex items-center gap-1">
                  <span>Customer Website</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
                <span>Dashboard Area</span>
              </div>
            </div>

            {/* Quick Actions & Clock */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-blue-400" />
                <span className="font-mono text-zinc-200">{currentISTTime} IST</span>
              </div>

              <Link
                href="/admin/sessions/new"
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                <PlusCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Start New Session</span>
                <span className="sm:hidden">New Session</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-[#1a1e28] bg-[#0c0e14] p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium ${
                    isActive ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs">
              <span className="text-zinc-400">{user.full_name} ({user.role})</span>
              <button onClick={() => signOut()} className="text-red-400 font-semibold flex items-center gap-1">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

