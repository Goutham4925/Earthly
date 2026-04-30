'use client';
import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Trash2, Minus, Plus } from 'lucide-react';
import { CartItem } from './cartData';

interface CartItemRowProps {
  item: CartItem;
  onQtyChange: (qty: number) => void;
  onRemove: () => void;
}

export default function CartItemRow({ item, onQtyChange, onRemove }: CartItemRowProps) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => onRemove(), 300);
  };

  const subtotal = item.price * item.quantity;

  return (
    <div
      className={`flex items-start gap-4 p-5 transition-all duration-300 ${removing ? 'opacity-0 max-h-0 overflow-hidden py-0' : 'opacity-100'}`}
    >
      {/* Image */}
      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
        <AppImage
          src={item.image}
          alt={item.imageAlt}
          fill
          sizes="80px"
          className="object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{item.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">{item.vendor}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs bg-secondary text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">{item.category}</span>
              <span className="text-xs text-muted-foreground">{item.unit}</span>
            </div>
          </div>

          {/* Remove button */}
          <button
            onClick={handleRemove}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-red-50 transition-colors shrink-0"
            aria-label="Remove item from cart"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Price + Qty row */}
        <div className="flex items-center justify-between mt-3 gap-3">
          {/* Quantity control */}
          <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
            <button
              onClick={() => onQtyChange(Math.max(1, item.quantity - 1))}
              disabled={item.quantity <= 1}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-90"
            >
              <Minus size={13} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-foreground tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onQtyChange(Math.min(item.maxQty, item.quantity + 1))}
              disabled={item.quantity >= item.maxQty}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-foreground hover:bg-card disabled:opacity-40 disabled:cursor-not-allowed transition-colors active:scale-90"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-base font-extrabold text-foreground tabular-nums">
              ₹{subtotal.toLocaleString('en-IN')}
            </p>
            {item.discountPct > 0 && (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                ₹{(item.originalPrice * item.quantity).toLocaleString('en-IN')}
              </p>
            )}
          </div>
        </div>

        {/* Per unit price */}
        <p className="text-xs text-muted-foreground mt-1">
          ₹{item.price.toLocaleString('en-IN')} × {item.quantity} {item.unit}
          {item.discountPct > 0 && (
            <span className="ml-2 text-green-600 font-semibold">
              {item.discountPct}% off
            </span>
          )}
        </p>
      </div>
    </div>
  );
}