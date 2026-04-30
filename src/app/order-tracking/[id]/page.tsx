import MarketplaceHeader from '@/components/MarketplaceHeader';
import OrderTrackingContent from './tracking-content';

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="min-h-screen bg-background">
      <MarketplaceHeader />
      <OrderTrackingContent orderId={id} />
    </div>
  );
}
