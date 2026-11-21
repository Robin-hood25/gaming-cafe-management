'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { Profile } from '@/types/cafe';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: 'owner' | 'admin' | 'staff';
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  isLoading: boolean;
  isOwner: boolean;
  isStaff: boolean;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isLiveSupabase: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isOwner: false,
  isStaff: false,
  signIn: async () => ({ success: false }),
  signOut: async () => {},
  isLiveSupabase: false,
});

const DEMO_OWNER: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'owner@nexusgaming.in',
  full_name: 'Nexus Owner (Administrator)',
  role: 'owner',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const liveSupabase = isSupabaseConfigured();

  useEffect(() => {
    async function initAuth() {
      if (liveSupabase) {
        const supabase = getSupabaseBrowserClient();
        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

              const p = profile as any;
              if (p) {
                setUser({
                  id: p.id,
                  email: session.user.email || 'staff@nexusgaming.in',
                  full_name: p.full_name,
                  role: p.role,
                });
              } else {
                setUser({
                  id: session.user.id,
                  email: session.user.email || 'staff@nexusgaming.in',
                  full_name: session.user.email?.split('@')[0] || 'Staff Member',
                  role: 'staff',
                });
              }
            }
          } catch (err) {
            console.error('Supabase session initialization error:', err);
          }
        }
      } else {
        // In local mode, check localStorage for logged-in demo session
        try {
          const stored = localStorage.getItem('nexus_admin_session');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, [liveSupabase]);

  const signIn = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    if (liveSupabase) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) return { success: false, error: 'Supabase client not initialized' };

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error || !data.user) {
        setIsLoading(false);
        return { success: false, error: error?.message || 'Authentication failed' };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const p = profile as any;
      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: p?.full_name || email.split('@')[0],
        role: p?.role || 'staff',
      };

      setUser(authUser);
      setIsLoading(false);
      return { success: true };
    } else {
      // Local demo mode credentials
      // Accepts owner@nexusgaming.in or admin@nexusgaming.in or any staff email with admin123
      if (pass === 'admin123' || pass === 'owner123' || pass.length >= 6) {
        const isOwnerAccount = email.toLowerCase().includes('owner') || email.toLowerCase().includes('admin');
        const authUser: AuthUser = {
          id: isOwnerAccount ? DEMO_OWNER.id : '00000000-0000-0000-0000-000000000002',
          email,
          full_name: isOwnerAccount ? 'Nexus Owner (Administrator)' : 'Lounge Staff Duty',
          role: isOwnerAccount ? 'owner' : 'staff',
        };

        setUser(authUser);
        try {
          localStorage.setItem('nexus_admin_session', JSON.stringify(authUser));
        } catch {}
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid password. (Use "admin123" for demo owner)' };
      }
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (liveSupabase) {
      const supabase = getSupabaseBrowserClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    setUser(null);
    try {
      localStorage.removeItem('nexus_admin_session');
    } catch {}
    setIsLoading(false);
  };

  const isOwner = user?.role === 'owner' || user?.role === 'admin';
  const isStaff = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile: user ? { id: user.id, full_name: user.full_name, role: user.role, phone: null, created_at: '', updated_at: '' } : null,
        isLoading,
        isOwner,
        isStaff,
        signIn,
        signOut,
        isLiveSupabase: liveSupabase,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

