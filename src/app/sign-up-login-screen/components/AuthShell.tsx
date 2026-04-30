'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { Sprout, ShieldCheck, Truck, ArrowRight, Star, MapPin, Package } from 'lucide-react';
import RoleTabBar from './RoleTabBar';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export type AuthRole = 'user' | 'vendor' | 'employee' | 'admin';
export type AuthMode = 'login' | 'register';

const roleConfig: Record<
  AuthRole,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    description: string;
    canRegister: boolean;
  }
> = {
  user: {
    label: 'Farmer / Buyer',
    icon: Sprout,
    color: 'text-green-600',
    description: 'Browse and order agriculture products',
    canRegister: true,
  },
  vendor: {
    label: 'Vendor',
    icon: Package,
    color: 'text-blue-600',
    description: 'List and sell your agriculture products',
    canRegister: true,
  },
  employee: {
    label: 'Delivery Agent',
    icon: Truck,
    color: 'text-orange-600',
    description: 'Handle pickups and deliveries',
    canRegister: true,
  },
  admin: {
    label: 'Admin',
    icon: ShieldCheck,
    color: 'text-purple-600',
    description: 'Manage platform, vendors, and orders',
    canRegister: false,
  },
};

const brandStats = [
  { value: '12,400+', label: 'Farmers Served' },
  { value: '380+', label: 'Verified Vendors' },
  { value: '95%', label: 'On-Time Delivery' },
  { value: '4.8★', label: 'Avg. Rating' },
];

export default function AuthShell() {
  const [role, setRole] = useState<AuthRole>('user');
  const [mode, setMode] = useState<AuthMode>('login');

  const config = roleConfig[role];

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col bg-gradient-to-br from-primary via-[#1f5c2a] to-[#14401c] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-[-40px] w-40 h-40 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col h-full px-10 py-10">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <AppLogo size={44} />
            <span className="text-white font-extrabold text-2xl tracking-tight">Earthly</span>
          </div>

          {/* Main copy */}
          <div className="mt-14 flex-1">
            <h1 className="text-white text-4xl font-extrabold leading-tight text-balance">
              India's Trusted Agriculture Marketplace
            </h1>
            <p className="text-white/70 mt-4 text-base leading-relaxed">
              Buy genuine fertilizers, certified seeds, and quality farming tools from verified
              vendors — delivered to your doorstep.
            </p>

            {/* Feature bullets */}
            <ul className="mt-8 flex flex-col gap-4">
              {[
                { icon: ShieldCheck, text: 'Verified vendors with quality guarantee' },
                { icon: Truck, text: 'Doorstep delivery across 500+ pincodes' },
                { icon: Star, text: 'Best prices with seasonal discounts' },
                { icon: MapPin, text: 'Real-time order tracking' },
              ].map((item) => (
                <li
                  key={`feature-${item.text.slice(0, 15)}`}
                  className="flex items-center gap-3 text-white/80 text-sm font-medium"
                >
                  <span className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-white" />
                  </span>
                  {item.text}
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-2 gap-4">
              {brandStats.map((s) => (
                <div key={`stat-${s.label}`} className="bg-white/10 rounded-xl px-4 py-3">
                  <p className="text-white font-extrabold text-2xl tabular-nums">{s.value}</p>
                  <p className="text-white/60 text-xs mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs mt-8">© 2026 earthly. All rights reserved.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col bg-background overflow-y-auto">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 py-5 border-b border-border bg-card">
          <AppLogo size={32} />
          <span className="font-extrabold text-lg text-primary">Earthly</span>
        </div>

        <div className="flex-1 flex items-start justify-center px-6 py-10">
          <div className="w-full max-w-md">
            {/* Heading */}
            <div className="mb-6">
              <div
                className={`inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full bg-secondary border border-border`}
              >
                <config.icon size={15} className={config.color} />
                <span className="text-xs font-semibold text-muted-foreground">
                  {config.description}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-foreground">
                {mode === 'login' ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === 'login'
                  ? 'Sign in to continue to earthly'
                  : 'Join thousands of farmers on earthly'}
              </p>
            </div>

            {/* Role tabs */}
            <RoleTabBar
              role={role}
              onRoleChange={(r) => {
                setRole(r);
                setMode('login');
              }}
              roleConfig={roleConfig}
            />

            {/* Mode toggle */}
            {roleConfig[role].canRegister && (
              <div className="flex bg-muted rounded-xl p-1 mb-6">
                {(['login', 'register'] as AuthMode[]).map((m) => (
                  <button
                    key={`mode-${m}`}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150
                      ${mode === m ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>
            )}

            {/* Form */}
            {mode === 'login' || !roleConfig[role].canRegister ? (
              <LoginForm role={role} />
            ) : (
              <RegisterForm role={role} />
            )}

            {/* Browse without login */}
            <div className="mt-6 text-center">
              <Link
                href="/product-browsing-screen"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Browse products without signing in
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
