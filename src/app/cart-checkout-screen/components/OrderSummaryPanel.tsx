'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Tag, ChevronDown, ChevronUp, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { CartItem } from './cartData';

interface OrderSummaryPanelProps {
  items: CartItem[];
  subtotal: number;
  savings: number;
  deliveryFee: number;
  gst: number;
  total: number;
}

export default function OrderSummaryPanel({
  items,
  subtotal,
  savings,
  deliveryFee,
  gst,
  total,
}: OrderSummaryPanelProps) {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [showItems, setShowItems] = useState(true);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'KISAN10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code. Try KISAN10 for 10% off.');
      setCouponApplied(false);
    }
    // TODO: POST /api/coupons/validate with { code: couponCode, subtotal }
  };

  const couponDiscount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const finalTotal = total - couponDiscount;

  return (
    <div className="sticky top-24 flex flex-col gap-4">
      {/* Order summary card */}
      <div className="bg-card border border-border rounded-2xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground text-sm">Order Summary</h3>
          <button
            onClick={() => setShowItems(!showItems)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            {items.length} item{items.length !== 1 ? 's' : ''}
            {showItems ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Item thumbnails */}
        {showItems && items.length > 0 && (
          <div className="px-5 py-4 border-b border-border flex flex-col gap-3">
            {items.map((item) => (
              <div key={`summary-item-${item.id}`} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                  <AppImage
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xs font-bold text-foreground tabular-nums shrink-0">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Coupon code */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">
            Apply Coupon
          </p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                placeholder="Enter coupon code"
                className="input-base pl-8 text-xs py-2"
                disabled={couponApplied}
              />
            </div>
            {couponApplied ? (
              <button
                onClick={() => {
                  setCouponApplied(false);
                  setCouponCode('');
                }}
                className="px-3 py-2 text-xs font-semibold text-danger border border-danger/30 rounded-lg hover:bg-red-50 transition-colors"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={applyCoupon}
                disabled={!couponCode.trim()}
                className="px-3 py-2 text-xs font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors active:scale-95"
              >
                Apply
              </button>
            )}
          </div>
          {couponError && <p className="text-xs text-red-600 font-medium mt-1.5">{couponError}</p>}
          {couponApplied && (
            <p className="text-xs text-green-600 font-semibold mt-1.5">
              ✅ Coupon KISAN10 applied — ₹{couponDiscount.toLocaleString('en-IN')} off
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">
            Try: <span className="font-semibold text-primary">KISAN10</span> for 10% off
          </p>
        </div>

        {/* Price breakdown */}
        <div className="px-5 py-4 flex flex-col gap-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">
              Subtotal ({items.length} items)
            </span>
            <span className="font-semibold text-foreground tabular-nums">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          {savings > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Product discount</span>
              <span className="font-semibold text-green-600 tabular-nums">
                −₹{savings.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {couponApplied && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Coupon (KISAN10)</span>
              <span className="font-semibold text-green-600 tabular-nums">
                −₹{couponDiscount.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">Delivery charges</span>
            {deliveryFee === 0 ? (
              <span className="font-semibold text-green-600">FREE</span>
            ) : (
              <span className="font-semibold text-foreground tabular-nums">₹{deliveryFee}</span>
            )}
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">GST (5%)</span>
            <span className="font-semibold text-foreground tabular-nums">
              ₹{gst.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="h-px bg-border my-1" />

          <div className="flex justify-between">
            <span className="text-base font-extrabold text-foreground">Total Amount</span>
            <span className="text-xl font-extrabold text-foreground tabular-nums">
              ₹{finalTotal.toLocaleString('en-IN')}
            </span>
          </div>

          {(savings > 0 || couponApplied) && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-green-700 font-bold">
                🎉 You save ₹{(savings + couponDiscount).toLocaleString('en-IN')} on this order!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trust signals */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">
          Why Shop on earthly
        </p>
        <div className="flex flex-col gap-3">
          {[
            {
              icon: ShieldCheck,
              text: 'Verified vendors & genuine products',
              color: 'text-blue-600',
            },
            { icon: Truck, text: 'Free delivery above ₹999', color: 'text-primary' },
            { icon: RotateCcw, text: '7-day easy return policy', color: 'text-orange-600' },
          ].map((item) => (
            <div key={`trust-${item.text.slice(0, 12)}`} className="flex items-center gap-2.5">
              <item.icon size={15} className={item.color} />
              <span className="text-xs text-muted-foreground font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
