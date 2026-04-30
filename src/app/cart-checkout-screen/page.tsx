import React from 'react';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import CartCheckoutContent from './components/CartCheckoutContent';

export default function CartCheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <CartCheckoutContent />
    </div>
  );
}