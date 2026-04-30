import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Earthly — Agriculture Marketplace for Farmers',
  description:
    'Buy fertilizers, seeds, pesticides, and farming tools from verified vendors. Fast delivery, genuine products, best prices for Indian farmers.',
  icons: {
    icon: [{ url: '/favicon.ico', type: 'image/x-icon' }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
