'use client';
import React from 'react';
import { ShieldCheck, RotateCcw } from 'lucide-react';
import { FilterState } from './ProductBrowseContent';
import { categories } from './mockProducts';

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (f: FilterState) => void;
  onReset: () => void;
}

const ratingOptions = [
  { value: 4.5, label: '4.5 & above' },
  { value: 4.0, label: '4.0 & above' },
  { value: 3.5, label: '3.5 & above' },
];

const priceRanges = [
  { min: 0, max: 500, label: 'Under ₹500' },
  { min: 500, max: 1500, label: '₹500 – ₹1,500' },
  { min: 1500, max: 5000, label: '₹1,500 – ₹5,000' },
  { min: 5000, max: 15000, label: 'Above ₹5,000' },
];

export default function FilterSidebar({ filters, onFiltersChange, onReset }: FilterSidebarProps) {
  const set = (partial: Partial<FilterState>) => onFiltersChange({ ...filters, ...partial });

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wide">Filters</h3>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-danger font-semibold transition-colors"
        >
          <RotateCcw size={12} />
          Reset all
        </button>
      </div>

      {/* Category */}
      <div className="mb-6">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Category</p>
        <div className="flex flex-col gap-1">
          {categories.map((cat) => (
            <button
              key={`filter-cat-${cat.slug}`}
              onClick={() => set({ category: cat.slug })}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-150
                ${filters.category === cat.slug
                  ? 'bg-primary/10 text-primary font-semibold' :'text-foreground hover:bg-muted'
                }`}
            >
              <span>{cat.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filters.category === cat.slug ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div className="mb-6">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Price Range</p>
        <div className="flex flex-col gap-1">
          {priceRanges.map((range) => {
            const isActive = filters.priceMin === range.min && filters.priceMax === range.max;
            return (
              <button
                key={`price-${range.min}-${range.max}`}
                onClick={() => set({ priceMin: range.min, priceMax: range.max })}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-150
                  ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted'}`}
              >
                {range.label}
              </button>
            );
          })}
        </div>

        {/* Custom range */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground font-medium">Min ₹</label>
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => set({ priceMin: Math.max(0, Number(e.target.value)) })}
              className="input-base mt-1 text-xs py-1.5"
              placeholder="0"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground font-medium">Max ₹</label>
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => set({ priceMax: Math.max(filters.priceMin, Number(e.target.value)) })}
              className="input-base mt-1 text-xs py-1.5"
              placeholder="15000"
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="mb-6 flex flex-col gap-3">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Availability</p>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-foreground">In Stock Only</span>
          <button
            type="button"
            onClick={() => set({ inStockOnly: !filters.inStockOnly })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
              ${filters.inStockOnly ? 'bg-primary' : 'bg-border'}`}
          >
            <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200
              ${filters.inStockOnly ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}
            />
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={13} className="text-blue-600" />
            <span className="text-sm font-medium text-foreground">Verified Vendors Only</span>
          </div>
          <button
            type="button"
            onClick={() => set({ verifiedOnly: !filters.verifiedOnly })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
              ${filters.verifiedOnly ? 'bg-primary' : 'bg-border'}`}
          >
            <span className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform duration-200
              ${filters.verifiedOnly ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}
            />
          </button>
        </label>
      </div>

      {/* Rating */}
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Minimum Rating</p>
        <div className="flex flex-col gap-1">
          {ratingOptions.map((opt) => (
            <button
              key={`rating-${opt.value}`}
              onClick={() => set({ minRating: filters.minRating === opt.value ? 0 : opt.value })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-left transition-all duration-150
                ${filters.minRating === opt.value ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground hover:bg-muted'}`}
            >
              <span className="text-amber-500">★</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}