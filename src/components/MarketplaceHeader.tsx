'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AppLogo from '@/components/ui/AppLogo';
import { ShoppingCart, Search, Bell, Menu, X, Package, Leaf, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CartBadgeProps {
  count: number;
}

function CartBadge({ count }: CartBadgeProps) {
  if (count === 0) return null;
  return (
    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
      {count > 9 ? '9+' : count}
    </span>
  );
}

const navLinks = [
  { label: 'Browse Products', href: '/product-browsing-screen', icon: Package },
  { label: 'Categories', href: '/product-browsing-screen', icon: Leaf },
];

export default function MarketplaceHeader() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const cartCount = 3; // TODO: Connect to cart context / API
  const dashboardHref =
    user?.role === 'admin' ? '/admin-dashboard' : user?.role === 'vendor' ? '/vendor-dashboard' : user?.role === 'employee' ? '/delivery-dashboard' : '/product-browsing-screen';

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 text-center font-medium">
        🌾 Free delivery on orders above ₹999 &nbsp;|&nbsp; Verified vendors only &nbsp;|&nbsp; COD
        available
      </div>

      {/* Main nav */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 flex items-center gap-4 h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <AppLogo size={36} />
          <span className="font-extrabold text-xl text-primary tracking-tight hidden sm:block">
            earthly
          </span>
        </Link>

        {/* Search bar */}
        <div className="flex-1 max-w-xl hidden md:flex items-center gap-2 bg-input border border-border rounded-lg px-3.5 py-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search seeds, fertilizers, tools..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Desktop nav links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={`nav-${link.label}`}
              href={link.href}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  pathname === link.href
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <link.icon size={15} />
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
            <Bell size={20} className="text-muted-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </button>

          {/* Cart */}
          <Link
            href="/cart-checkout-screen"
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ShoppingCart size={20} className="text-muted-foreground" />
            <CartBadge count={cartCount} />
          </Link>

          {user ? (
            <>
              <Link href={dashboardHref} className="hidden sm:flex items-center gap-1.5 ml-1 bg-secondary text-primary text-sm font-semibold px-4 py-2 rounded-lg border border-border">
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
              <button onClick={signOut} className="hidden sm:flex text-sm font-semibold px-3 py-2 rounded-lg hover:bg-muted">Logout</button>
            </>
          ) : (
            <Link
              href="/sign-up-login-screen"
              className="hidden sm:flex items-center gap-1.5 ml-1 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 active:scale-95 transition-all duration-150"
            >
              <LogIn size={15} />
              Sign In
            </Link>
          )}

          {/* Mobile menu */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-card px-4 py-4 flex flex-col gap-2">
          {/* Mobile search */}
          <div className="flex items-center gap-2 bg-input border border-border rounded-lg px-3.5 py-2 mb-2">
            <Search size={16} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
          {navLinks.map((link) => (
            <Link
              key={`mobile-nav-${link.label}`}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <link.icon size={16} className="text-primary" />
              {link.label}
            </Link>
          ))}
          <Link
            href="/sign-up-login-screen"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1.5 mt-1 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2.5 rounded-lg"
          >
            <LogIn size={15} />
            Sign In / Register
          </Link>
        </div>
      )}
    </header>
  );
}
