'use client';
import React from 'react';
import { ShoppingCart, Heart, ShieldCheck, Star, AlertTriangle, Package, Check } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';
import Badge from '@/components/ui/Badge';
import { Product } from './mockProducts';


interface ProductCardProps {
  product: Product;
  inCart: boolean;
  inWishlist: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export default function ProductCard({ product, inCart, inWishlist, onAddToCart, onToggleWishlist }: ProductCardProps) {
  const isOutOfStock = product.stockStatus === 'out_of_stock';
  const isLowStock = product.stockStatus === 'low_stock';

  return (
    <div className={`group bg-card border rounded-2xl shadow-card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-elevated hover:-translate-y-0.5
      ${isOutOfStock ? 'border-border opacity-75' : 'border-border hover:border-primary/30'}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-muted aspect-[4/3]">
        <AppImage
          src={product.image}
          alt={product.imageAlt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale-[30%]' : ''}`}
        />

        {/* Discount badge */}
        {product.discountPct > 0 && (
          <div className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            -{product.discountPct}%
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white text-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow">
              Out of Stock
            </span>
          </div>
        )}

        {/* Low stock warning */}
        {isLowStock && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
            <AlertTriangle size={10} />
            Only {product.stock} left
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); onToggleWishlist(); }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full shadow flex items-center justify-center transition-all duration-150
            ${inWishlist ? 'bg-red-500 text-white' : 'bg-white/90 text-muted-foreground hover:bg-white hover:text-red-500'}`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={14} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Category + Vendor */}
        <div className="flex items-center justify-between gap-2">
          <Badge variant="category">{product.category}</Badge>
          <div className="flex items-center gap-1 shrink-0">
            {product.vendorVerified && (
              <ShieldCheck size={12} className="text-blue-600" />
            )}
            <span className="text-xs text-muted-foreground font-medium truncate max-w-[100px]">{product.vendor}</span>
          </div>
        </div>

        {/* Name */}
        <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={`star-${product.id}-${star}`}
                size={12}
                className={star <= Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-border fill-border'}
              />
            ))}
          </div>
          <span className="text-xs font-semibold text-foreground tabular-nums">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mt-auto">
          <span className="text-xl font-extrabold text-foreground tabular-nums">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.discountPct > 0 && (
            <span className="text-sm text-muted-foreground line-through tabular-nums">
              ₹{product.originalPrice.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-medium ml-auto">{product.unit}</span>
        </div>

        {/* Min order note */}
        {product.minOrder > 1 && (
          <p className="text-xs text-muted-foreground">
            Min. order: {product.minOrder} units
          </p>
        )}

        {/* Add to cart */}
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-150
            ${isOutOfStock
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : inCart
                ? 'bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 active:scale-95' :'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-sm'
            }`}
        >
          {isOutOfStock ? (
            <>
              <Package size={14} />
              Notify When Available
            </>
          ) : inCart ? (
            <>
              <Check size={14} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}