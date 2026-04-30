'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BadgeIndianRupee, Boxes, CheckCircle2, ClipboardList, PackageCheck, ShieldCheck, Truck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { MarketplaceOrder, OrderStatus, SessionUser } from '@/lib/marketplace-data';
import type { Product } from '@/app/product-browsing-screen/components/mockProducts';

type DashboardRole = 'admin' | 'vendor' | 'delivery';

const statusLabels: Record<OrderStatus, string> = {
  pending_admin: 'Pending admin',
  assigned_to_delivery: 'Assigned to delivery',
  pickup_scheduled: 'Pickup scheduled',
  collected_from_vendor: 'Collected from vendor',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusClass: Record<OrderStatus, string> = {
  pending_admin: 'bg-amber-100 text-amber-800 border-amber-200',
  assigned_to_delivery: 'bg-blue-100 text-blue-800 border-blue-200',
  pickup_scheduled: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  collected_from_vendor: 'bg-teal-100 text-teal-800 border-teal-200',
  out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const nextDeliveryStatuses: OrderStatus[] = ['pickup_scheduled', 'collected_from_vendor', 'out_for_delivery', 'delivered'];

const roleCopy = {
  admin: { title: 'Admin Dashboard', eyebrow: 'Platform control center', intro: 'Approve accounts, assign orders to delivery, and manage marketplace products.', icon: ShieldCheck },
  vendor: { title: 'Vendor Dashboard', eyebrow: 'Seller workspace', intro: 'Update product name, price, discount, stock, description, images, and readiness for assigned orders.', icon: Boxes },
  delivery: { title: 'Delivery Dashboard', eyebrow: 'Delivery operations', intro: 'Pick up from the vendor, update each delivery stage, and keep customer tracking current.', icon: Truck },
};

export default function OperationsDashboard({ role }: { role: DashboardRole }) {
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<MarketplaceOrder[]>([]);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [message, setMessage] = useState('Loading marketplace data...');
  const [savingId, setSavingId] = useState<string | null>(null);
  const config = roleCopy[role];

  const loadData = async () => {
    const [productData, orderData] = await Promise.all([
      fetch('/api/products').then((res) => res.json()),
      fetch('/api/orders').then((res) => res.json()),
    ]);
    setProducts(productData.products ?? []);
    setOrders(orderData.orders ?? []);
    if (role === 'admin') {
      const userData = await fetch('/api/users').then((res) => res.json());
      setUsers(userData.users ?? []);
    }
    setMessage('Synced with marketplace database');
  };

  useEffect(() => {
    if (!loading) loadData().catch(() => setMessage('Could not load live data. Check DATABASE_URL and schema.'));
  }, [loading, role]);

  const deliveryAgents = users.filter((item) => item.role === 'employee' && item.status === 'approved');
  const pendingAccounts = users.filter((item) => ['vendor', 'employee'].includes(item.role) && item.status === 'pending');

  const visibleProducts = useMemo(() => {
    if (role !== 'vendor') return products;
    return products.filter((product) => product.vendor === user?.vendor);
  }, [products, role, user?.vendor]);

  const visibleOrders = useMemo(() => orders, [orders]);

  const stats = [
    { label: 'Products', value: visibleProducts.length, icon: Boxes },
    { label: 'Open Orders', value: visibleOrders.filter((order) => !['delivered', 'cancelled'].includes(order.status)).length, icon: ClipboardList },
    { label: 'Delivered', value: visibleOrders.filter((order) => order.status === 'delivered').length, icon: CheckCircle2 },
    { label: 'Revenue', value: `Rs ${visibleOrders.reduce((sum, order) => sum + order.total, 0).toLocaleString('en-IN')}`, icon: BadgeIndianRupee },
  ];

  const saveProduct = async (product: Product) => {
    setSavingId(product.id);
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
    setSavingId(null);
    setMessage(response.ok ? `Saved ${product.name}` : 'Product save failed');
  };

  const updateProduct = (id: string, patch: Partial<Product>) => {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, ...patch } : product)));
  };

  const updateOrder = async (order: MarketplaceOrder, patch: Partial<MarketplaceOrder>) => {
    setSavingId(order.id);
    await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, ...patch }),
    });
    setOrders((current) => current.map((item) => (item.id === order.id ? { ...item, ...patch } : item)));
    setSavingId(null);
    setMessage(`Updated ${order.id}`);
  };

  const approveUser = async (target: SessionUser, status: 'approved' | 'rejected') => {
    setSavingId(target.id);
    setMessage('Updating...');

    const response = await fetch('/api/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: target.id, status }),
    });

    if (!response.ok) {
      let errorMessage = 'Approval failed';
      try {
        const data = await response.json();
        errorMessage = (data?.error as string) ?? errorMessage;
      } catch {
        // ignore parse errors
      }
      setMessage(errorMessage);
      setSavingId(null);
      return;
    }

    setMessage(`User ${status}`);
    // Re-sync from backend to ensure DB update actually happened
    const userData = await fetch('/api/users').then((res) => res.json());
    setUsers(userData.users ?? []);
    setSavingId(null);
  };

  if (!loading && (!user || (role === 'delivery' ? user.role !== 'employee' : user.role !== role))) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-lg p-6 max-w-md text-center">
          <h1 className="text-xl font-extrabold text-foreground">Sign in required</h1>
          <p className="text-sm text-muted-foreground mt-2">Use the correct approved account to open this dashboard.</p>
          <Link href="/sign-up-login-screen" className="btn-primary inline-flex mt-5">Go to Login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
              <config.icon size={23} className="text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">{config.eyebrow}</p>
              <h1 className="text-2xl font-extrabold text-foreground">{config.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/product-browsing-screen" className="btn-secondary">Marketplace</Link>
            {role === 'admin' && <Link href="/delivery-dashboard" className="btn-secondary">Delivery View</Link>}
            <Link href="/sign-up-login-screen" className="btn-primary">Switch Login</Link>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-6">
        <p className="text-sm text-muted-foreground max-w-3xl">{config.intro}</p>
        <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm font-semibold text-primary">{message}</div>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                <stat.icon size={18} className="text-primary" />
              </div>
              <p className="text-2xl font-extrabold text-foreground mt-2 tabular-nums">{stat.value}</p>
            </div>
          ))}
        </section>

        {role === 'admin' && (
          <section className="mt-8">
            <h2 className="text-lg font-extrabold text-foreground mb-3">Account Approvals</h2>
            <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
              {pendingAccounts.length === 0 && <p className="p-4 text-sm text-muted-foreground">No pending vendor or delivery applications.</p>}
              {pendingAccounts.map((account) => (
                <div key={account.id} className="grid grid-cols-1 md:grid-cols-[1fr_.7fr_.8fr_auto] gap-3 p-4 items-center">
                  <div>
                    <p className="font-bold text-foreground">{account.name}</p>
                    <p className="text-xs text-muted-foreground">{account.email}</p>
                  </div>
                  <span className="text-sm font-semibold capitalize">{account.role}</span>
                  <span className="text-sm text-muted-foreground">{account.vendor || account.phone || 'No business name'}</span>
                  <div className="flex gap-2">
                    <button className="btn-primary" disabled={savingId === account.id} onClick={() => approveUser(account, 'approved')}>Approve</button>
                    <button className="btn-secondary" disabled={savingId === account.id} onClick={() => approveUser(account, 'rejected')}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {role !== 'delivery' && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-extrabold text-foreground">Product Inventory</h2>
              <span className="text-xs font-semibold text-muted-foreground">{visibleProducts.length} listings</span>
            </div>
            <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
              {visibleProducts.map((product) => (
                <div key={product.id} className="grid grid-cols-1 lg:grid-cols-[1.3fr_.7fr_.55fr_.55fr_.55fr_.7fr_auto] gap-3 p-4 items-center">
                  <input className="input-base" value={product.name} onChange={(event) => updateProduct(product.id, { name: event.target.value })} />
                  <input className="input-base" value={product.category} onChange={(event) => updateProduct(product.id, { category: event.target.value, categorySlug: event.target.value.toLowerCase().replaceAll(' ', '-') })} />
                  <input type="number" className="input-base" value={product.price} onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) })} />
                  <input type="number" className="input-base" value={product.originalPrice} onChange={(event) => updateProduct(product.id, { originalPrice: Number(event.target.value) })} />
                  <input type="number" className="input-base" value={product.discountPct} onChange={(event) => updateProduct(product.id, { discountPct: Number(event.target.value) })} />
                  <input
                    type="number"
                    className="input-base"
                    value={product.stock}
                    onChange={(event) => {
                      const stock = Number(event.target.value);
                      updateProduct(product.id, { stock, stockStatus: stock <= 0 ? 'out_of_stock' : stock < 20 ? 'low_stock' : 'in_stock' });
                    }}
                  />
                  <button onClick={() => saveProduct(product)} disabled={savingId === product.id} className="btn-primary">{savingId === product.id ? 'Saving...' : 'Save'}</button>
                  <textarea className="input-base lg:col-span-7" rows={2} value={product.description} onChange={(event) => updateProduct(product.id, { description: event.target.value })} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-foreground">Orders</h2>
            <span className="text-xs font-semibold text-muted-foreground">{visibleOrders.length} records</span>
          </div>
          <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
            {visibleOrders.map((order) => (
              <div key={order.id} className="grid grid-cols-1 xl:grid-cols-[.8fr_1fr_.8fr_.8fr_1fr_1.1fr] gap-3 p-4 items-center">
                <div>
                  <p className="font-extrabold text-sm text-foreground">{order.id}</p>
                  <Link className="text-xs font-semibold text-primary" href={`/order-tracking/${order.id}`}>Tracking page</Link>
                </div>
                <div>
                  <p className="font-bold text-sm text-foreground">{order.customerName}</p>
                  <p className="text-xs text-muted-foreground">{order.city} - {order.pincode}</p>
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{order.vendor}</p>
                <p className="text-sm font-extrabold text-foreground tabular-nums">Rs {order.total.toLocaleString('en-IN')}</p>
                <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                  <PackageCheck size={13} />
                  {statusLabels[order.status]}
                </span>
                {role === 'admin' ? (
                  <select
                    className="input-base"
                    value={order.assignedAgentId ?? ''}
                    disabled={savingId === order.id}
                    onChange={(event) => {
                      const agent = deliveryAgents.find((item) => item.id === event.target.value);
                      if (agent) updateOrder(order, { assignedAgentId: agent.id, assignedAgent: agent.name, status: 'assigned_to_delivery' });
                    }}
                  >
                    <option value="">Assign delivery person</option>
                    {deliveryAgents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}
                  </select>
                ) : role === 'delivery' ? (
                  <select className="input-base" value={order.status} disabled={savingId === order.id} onChange={(event) => updateOrder(order, { status: event.target.value as OrderStatus })}>
                    {nextDeliveryStatuses.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
                  </select>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground">Delivery: {order.assignedAgent}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
