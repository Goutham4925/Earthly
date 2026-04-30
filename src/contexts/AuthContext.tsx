'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { SessionUser, UserRole } from '@/lib/marketplace-data';

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  signIn: (email: string, password: string, role: UserRole) => Promise<{ redirectTo: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const result = await fetch('/api/auth/me').then((res) => res.json());
    setUser(result.user ?? null);
    setLoading(false);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signIn = async (email: string, password: string, role: UserRole) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'Unable to sign in');
    setUser(result.user);
    return { redirectTo: result.redirectTo };
  };

  const signOut = async () => {
    await fetch('/api/auth/me', { method: 'DELETE' });
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, refreshUser, signIn, signOut }}>{children}</AuthContext.Provider>;
};
