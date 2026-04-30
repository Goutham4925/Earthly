'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock, Package, Truck } from 'lucide-react';
import type { MarketplaceOrder, OrderStatus } from '@/lib/marketplace-data';

const steps: Array<{ key: OrderStatus; label: string; detail: string }> = [
  { key: 'pending_admin', label: 'Order placed', detail: 'Waiting for admin assignment' },
  { key: 'assigned_to_delivery', label: 'Delivery assigned', detail: 'Agent will visit the vendor' },
  { key: 'pickup_scheduled', label: 'Pickup scheduled', detail: 'Vendor pickup is planned' },
  { key: 'collected_from_vendor', label: 'Collected', detail: 'Order picked up from vendor' },
  { key: 'out_for_delivery', label: 'On the way', detail: 'Agent is heading to you' },
  { key: 'delivered', label: 'Delivered', detail: 'Order completed' },
];

export default function OrderTrackingContent({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [message, setMessage] = useState('Loading tracking...');

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order ?? null);
        setMessage(data.error ?? '');
      })
      .catch(() => setMessage('Unable to load tracking.'));
  }, [orderId]);

  if (!order) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-card border border-border rounded-lg p-6 text-center">
          <Clock size={28} className="text-primary mx-auto" />
          <h1 className="text-xl font-extrabold mt-3">Order Tracking</h1>
          <p className="text-sm text-muted-foreground mt-2">{message || 'Order not found.'}</p>
          <Link href="/sign-up-login-screen" className="btn-primary inline-flex mt-5">Sign in</Link>
        </div>
      </main>
    );
  }

  const activeIndex = Math.max(0, steps.findIndex((step) => step.key === order.status));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">Tracking</p>
            <h1 className="text-2xl font-extrabold text-foreground">{order.id}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-primary">
            <Truck size={18} />
            {order.assignedAgent}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm">
          <div><span className="text-muted-foreground">Customer</span><p className="font-bold">{order.customerName}</p></div>
          <div><span className="text-muted-foreground">Vendor</span><p className="font-bold">{order.vendor}</p></div>
          <div><span className="text-muted-foreground">Total</span><p className="font-bold">Rs {order.total.toLocaleString('en-IN')}</p></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-5 mt-5">
        <h2 className="font-extrabold text-foreground mb-5">Live Status</h2>
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const done = index <= activeIndex;
            return (
              <div key={step.key} className="flex gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  {done ? <CheckCircle2 size={18} /> : <Package size={16} />}
                </div>
                <div>
                  <p className="font-bold text-foreground">{step.label}</p>
                  <p className="text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
