'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { AuthRole } from './AuthShell';

interface LoginFormData {
  email: string;
  password: string;
  remember: boolean;
}

interface DemoCredential {
  role: string;
  email: string;
  password: string;
}

const demoCredentials: DemoCredential[] = [
  { role: 'Farmer', email: 'rajan.kumar@agromarket.in', password: 'Farmer@2026' },
  { role: 'Vendor', email: 'greenfields.seeds@vendor.in', password: 'Vendor@2026' },
  { role: 'Delivery', email: 'suresh.delivery@agromarket.in', password: 'Agent@2026' },
  { role: 'Admin', email: 'admin@agromarket.in', password: 'Admin@2026' },
];

const roleCredentialMap: Record<AuthRole, DemoCredential> = {
  user: demoCredentials[0],
  vendor: demoCredentials[1],
  employee: demoCredentials[2],
  admin: demoCredentials[3],
};

export default function LoginForm({ role }: { role: AuthRole }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/product-browsing-screen');

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '', remember: false },
  });

  const credential = roleCredentialMap[role];

  const autofill = () => {
    setValue('email', credential.email);
    setValue('password', credential.password);
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, password: data.password, role }),
    });
    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      setError('root', { message: result.error ?? 'Invalid credentials for the selected role' });
      return;
    }

    localStorage.setItem('agromarket_user', JSON.stringify(result.user));
    setRedirectTo(result.redirectTo);
    setSuccess(true);
    setTimeout(() => router.push(result.redirectTo), 700);
  };

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle size={32} className="text-green-600" />
        </div>
        <div>
          <p className="text-lg font-bold text-foreground">Signed in successfully!</p>
          <p className="text-sm text-muted-foreground mt-1">Redirecting to your dashboard...</p>
        </div>
        <Link href={redirectTo} className="btn-primary flex items-center gap-2 mt-2">
          Go to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {errors.root && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700 font-medium">
          {errors.root.message}
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-semibold text-foreground">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className={`input-base ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
          placeholder="your@email.com"
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })}
        />
        {errors.email && <p className="text-xs text-red-600 font-medium">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="login-password" className="text-sm font-semibold text-foreground">
            Password
          </label>
          <button type="button" className="text-xs text-primary hover:underline font-medium">
            Forgot password?
          </button>
        </div>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className={`input-base pr-10 ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''}`}
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-600 font-medium">{errors.password.message}</p>}
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary" {...register('remember')} />
        <span className="text-sm text-muted-foreground font-medium">Remember me for 30 days</span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2 mt-1 py-3"
        style={{ minHeight: 48 }}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          'Sign In'
        )}
      </button>

      {role === 'user' && (
        <a
          href="/api/auth/google/start"
          className="w-full flex items-center justify-center gap-2 border border-border bg-card text-foreground font-semibold px-5 py-3 rounded-lg hover:bg-muted transition-colors"
        >
          <span className="text-base font-extrabold text-blue-600">G</span>
          Continue with Google
        </a>
      )}

      <div className="mt-2 border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between bg-muted px-4 py-2.5">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Demo Credentials</p>
          <button type="button" onClick={autofill} className="text-xs font-semibold text-primary hover:underline">
            Use {credential.role} account
          </button>
        </div>
        <div className="divide-y divide-border">
          {demoCredentials.map((cred) => (
            <div key={`cred-${cred.role}`} className="grid grid-cols-[60px_1fr_auto] items-center gap-2 px-4 py-2.5">
              <span className="text-xs font-semibold text-muted-foreground">{cred.role}</span>
              <div className="min-w-0">
                <p className="text-xs text-foreground truncate font-medium">{cred.email}</p>
                <p className="text-xs text-muted-foreground">{cred.password}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setValue('email', cred.email);
                  setValue('password', cred.password);
                }}
                className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
              >
                Use
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
}
