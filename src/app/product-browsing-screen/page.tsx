import React from 'react';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import ProductBrowseContent from './components/ProductBrowseContent';

export default function ProductBrowsingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <ProductBrowseContent />
    </div>
  );
}