'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, ChevronRight, Package } from 'lucide-react';
import { initialCartItems, CartItem } from './cartData';
import CartItemRow from './CartItemRow';
import DeliveryForm from './DeliveryForm';
import OrderSummaryPanel from './OrderSummaryPanel';
import ToastContainer, { ToastMessage } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';

export type CheckoutStep = 'cart' | 'address' | 'payment' | 'confirmed';

export default function CartCheckoutContent() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<CartItem[]>(initialCartItems);
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState<Record<string, string> | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId] = useState(() => `ORD-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const updateQty = (id: string, qty: number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: qty } : item));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    addToast({ type: 'info', title: 'Item removed from cart' });
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const savings = items.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  const deliveryFee = subtotal >= 999 ? 0 : 99;
  const gst = Math.round(subtotal * 0.05);
  const total = subtotal + deliveryFee + gst;

  const steps: { key: CheckoutStep; label: string }[] = [
    { key: 'cart', label: 'Cart' },
    { key: 'address', label: 'Delivery Address' },
    { key: 'payment', label: 'Payment' },
  ];

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handleAddressSubmit = (data: Record<string, string>) => {
    setDeliveryAddress(data);
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    const primaryVendor = items[0]?.vendor ?? 'AgroMarket';
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: orderId,
        customerId: user?.id,
        customerName: deliveryAddress?.fullName ?? user?.name ?? 'Guest Customer',
        customerPhone: deliveryAddress?.phone ?? '',
        city: deliveryAddress?.city ?? '',
        pincode: deliveryAddress?.pincode ?? '',
        vendor: primaryVendor,
        assignedAgentId: null,
        assignedAgent: 'Unassigned',
        status: 'pending_admin',
        total,
        paymentMethod,
        createdAt: new Date().toISOString(),
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          vendor: item.vendor,
        })),
      }),
    }).catch(() => null);
    setOrderPlaced(true);
    setStep('confirmed');
  };

  if (step === 'confirmed') {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-12">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Package size={36} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Order Placed Successfully!</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Your order <span className="font-bold text-foreground">{orderId}</span> has been placed and will be assigned to a delivery agent shortly.
          </p>

          <div className="mt-6 bg-card border border-border rounded-2xl p-5 text-left">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Order ID</span>
                <span className="font-bold text-foreground tabular-nums">{orderId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Payment Method</span>
                <span className="font-semibold text-foreground">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Total Amount</span>
                <span className="font-extrabold text-foreground tabular-nums">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground font-medium">Estimated Delivery</span>
                <span className="font-semibold text-green-700">3–5 business days</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Link href="/product-browsing-screen" className="btn-secondary flex-1 text-center py-3">
              Continue Shopping
            </Link>
            <Link href={`/order-tracking/${orderId}`} className="btn-primary flex-1 py-3 text-center">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/product-browsing-screen" className="hover:text-primary transition-colors">Products</Link>
        <ChevronRight size={12} />
        <span className="text-foreground">Cart & Checkout</span>
      </nav>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <ShoppingCart size={22} className="text-primary" />
        <h1 className="text-2xl font-extrabold text-foreground">Your Cart</h1>
        <span className="bg-primary/10 text-primary text-sm font-bold px-3 py-0.5 rounded-full">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={`step-${s.key}`}>
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold border-2 transition-all
                ${i < stepIndex ? 'bg-primary border-primary text-white'
                  : i === stepIndex ? 'border-primary text-primary bg-primary/10' :'border-border text-muted-foreground bg-card'}`}
              >
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-semibold hidden sm:block transition-colors
                ${i === stepIndex ? 'text-primary' : i < stepIndex ? 'text-foreground' : 'text-muted-foreground'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded transition-colors ${i < stepIndex ? 'bg-primary' : 'bg-border'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Empty cart */}
      {items.length === 0 && step === 'cart' ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <ShoppingCart size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Your cart is empty</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Add fertilizers, seeds, or tools from our marketplace to get started.
          </p>
          <Link href="/product-browsing-screen" className="btn-primary mt-5">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8">
          {/* Left panel */}
          <div className="flex-1 min-w-0">
            {step === 'cart' && (
              <div className="flex flex-col gap-4">
                {/* Cart items */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                  <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-bold text-foreground text-sm">Cart Items ({items.length})</h2>
                    {items.length > 0 && (
                      <button
                        onClick={() => setItems([])}
                        className="text-xs text-danger font-semibold hover:underline"
                      >
                        Clear cart
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {items.map((item) => (
                      <CartItemRow
                        key={`cart-row-${item.id}`}
                        item={item}
                        onQtyChange={(qty) => updateQty(item.id, qty)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* Free delivery notice */}
                {deliveryFee > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-amber-600 text-lg">🚚</span>
                    <p className="text-sm text-amber-800 font-medium">
                      Add <strong>₹{(999 - subtotal).toLocaleString('en-IN')}</strong> more to get free delivery!
                    </p>
                  </div>
                )}
                {deliveryFee === 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-green-600 text-lg">✅</span>
                    <p className="text-sm text-green-800 font-medium">You qualify for free delivery!</p>
                  </div>
                )}

                {/* Proceed button */}
                <button
                  onClick={() => {
                    if (!user && !loading) {
                      addToast({ type: 'warning', title: 'Please sign in to proceed', description: 'Login is required before checkout.' });
                      window.location.href = '/sign-up-login-screen?next=/cart-checkout-screen';
                      return;
                    }
                    setStep('address');
                  }}
                  disabled={items.length === 0}
                  className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base font-bold"
                >
                  Proceed to Delivery Address
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === 'address' && (
              <DeliveryForm
                onSubmit={handleAddressSubmit}
                onBack={() => setStep('cart')}
              />
            )}

            {step === 'payment' && deliveryAddress && (
              <PaymentStep
                paymentMethod={paymentMethod}
                onPaymentChange={setPaymentMethod}
                deliveryAddress={deliveryAddress}
                onBack={() => setStep('address')}
                onPlaceOrder={handlePlaceOrder}
                total={total}
              />
            )}
          </div>

          {/* Right panel — Order summary */}
          <div className="lg:w-80 xl:w-96 shrink-0">
            <OrderSummaryPanel
              items={items}
              subtotal={subtotal}
              savings={savings}
              deliveryFee={deliveryFee}
              gst={gst}
              total={total}
            />
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

// Payment step inline component
interface PaymentStepProps {
  paymentMethod: 'cod' | 'razorpay';
  onPaymentChange: (m: 'cod' | 'razorpay') => void;
  deliveryAddress: Record<string, string>;
  onBack: () => void;
  onPlaceOrder: () => Promise<void>;
  total: number;
}

function PaymentStep({ paymentMethod, onPaymentChange, deliveryAddress, onBack, onPlaceOrder, total }: PaymentStepProps) {
  const [loading, setLoading] = useState(false);

  const handleOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    await onPlaceOrder();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Delivery address summary */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-foreground text-sm">Delivery Address</h3>
          <button onClick={onBack} className="text-xs text-primary font-semibold hover:underline">Change</button>
        </div>
        <div className="text-sm text-foreground leading-relaxed">
          <p className="font-semibold">{deliveryAddress.fullName}</p>
          <p className="text-muted-foreground mt-0.5">{deliveryAddress.addressLine1}</p>
          {deliveryAddress.addressLine2 && <p className="text-muted-foreground">{deliveryAddress.addressLine2}</p>}
          <p className="text-muted-foreground">{deliveryAddress.city}, {deliveryAddress.state} — {deliveryAddress.pincode}</p>
          <p className="text-muted-foreground mt-1">📱 {deliveryAddress.phone}</p>
        </div>
      </div>

      {/* Payment method */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h3 className="font-bold text-foreground text-sm mb-4">Payment Method</h3>
        <div className="flex flex-col gap-3">
          {/* COD */}
          <button
            onClick={() => onPaymentChange('cod')}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left
              ${paymentMethod === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-card'}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
              ${paymentMethod === 'cod' ? 'border-primary' : 'border-border'}`}>
              {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pay when your order is delivered. No extra charges.</p>
            </div>
            <span className="text-2xl">💵</span>
          </button>

          {/* Razorpay */}
          <button
            onClick={() => onPaymentChange('razorpay')}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left
              ${paymentMethod === 'razorpay' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-card'}`}
          >
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
              ${paymentMethod === 'razorpay' ? 'border-primary' : 'border-border'}`}>
              {paymentMethod === 'razorpay' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">Razorpay (UPI / Card / Net Banking)</p>
              <p className="text-xs text-muted-foreground mt-0.5">Secure online payment. Integration available after setup.</p>
            </div>
            <span className="text-2xl">💳</span>
          </button>
        </div>

        {paymentMethod === 'razorpay' && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 font-medium">
            Razorpay integration is pending setup. Your order will be placed with COD fallback.
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button onClick={onBack} className="btn-secondary flex-1 py-3">
          Back
        </button>
        <button
          onClick={handleOrder}
          disabled={loading}
          className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 text-base font-bold"
          style={{ minHeight: 52 }}
        >
          {loading ? (
            <>
              <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
              </svg>
              Placing Order...
            </>
          ) : (
            `Place Order — ₹${total.toLocaleString('en-IN')}`
          )}
        </button>
      </div>
    </div>
  );
}
