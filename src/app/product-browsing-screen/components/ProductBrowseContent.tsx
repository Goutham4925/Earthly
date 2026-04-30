'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Search, X, ChevronDown, ArrowUpDown, Filter } from 'lucide-react';
import { mockProducts, Product } from './mockProducts';
import ProductCard from './ProductCard';
import FilterSidebar from './FilterSidebar';
import Link from 'next/link';

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'discount';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Highest Discount' },
];

export interface FilterState {
  category: string;
  priceMin: number;
  priceMax: number;
  inStockOnly: boolean;
  verifiedOnly: boolean;
  minRating: number;
}

const defaultFilters: FilterState = {
  category: 'all',
  priceMin: 0,
  priceMax: 15000,
  inStockOnly: false,
  verifiedOnly: false,
  minRating: 0,
};

export default function ProductBrowseContent() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('relevance');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartAdded, setCartAdded] = useState<Set<string>>(new Set());
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? mockProducts))
      .catch(() => setProducts(mockProducts));
  }, []);

  const liveCategories = useMemo(() => {
    const counts = products.reduce<Record<string, { slug: string; label: string; count: number }>>((acc, product) => {
      acc[product.categorySlug] = acc[product.categorySlug] ?? {
        slug: product.categorySlug,
        label: product.category,
        count: 0,
      };
      acc[product.categorySlug].count += 1;
      return acc;
    }, {});
    return [{ slug: 'all', label: 'All Products', count: products.length }, ...Object.values(counts)];
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }

    // Category
    if (filters.category !== 'all') {
      list = list.filter((p) => p.categorySlug === filters.category);
    }

    // Price
    list = list.filter((p) => p.price >= filters.priceMin && p.price <= filters.priceMax);

    // In stock
    if (filters.inStockOnly) {
      list = list.filter((p) => p.stockStatus !== 'out_of_stock');
    }

    // Verified vendor
    if (filters.verifiedOnly) {
      list = list.filter((p) => p.vendorVerified);
    }

    // Rating
    if (filters.minRating > 0) {
      list = list.filter((p) => p.rating >= filters.minRating);
    }

    // Sort
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'discount': list.sort((a, b) => b.discountPct - a.discountPct); break;
    }

    return list;
  }, [search, filters, sort, products]);

  const addToCart = (productId: string) => {
    setCartAdded((prev) => new Set([...prev, productId]));
    // TODO: Connect to cart context / POST /api/cart/add
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
    // TODO: POST /api/wishlist/toggle
  };

  const activeFilterCount = [
    filters.category !== 'all',
    filters.priceMin > 0 || filters.priceMax < 15000,
    filters.inStockOnly,
    filters.verifiedOnly,
    filters.minRating > 0,
  ].filter(Boolean).length;

  const resetFilters = () => setFilters(defaultFilters);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-5 font-medium">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <span className="text-foreground">Products</span>
        {filters.category !== 'all' && (
          <>
            <span>/</span>
            <span className="text-foreground capitalize">{filters.category}</span>
          </>
        )}
      </nav>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Agriculture Products</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} available
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 w-full sm:w-80 focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30 transition-all shadow-sm">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, vendors..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
        {liveCategories.map((cat) => (
          <button
            key={`cat-chip-${cat.slug}`}
            onClick={() => setFilters((f) => ({ ...f, category: cat.slug }))}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-150
              ${filters.category === cat.slug
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'
              }`}
          >
            {cat.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium
              ${filters.category === cat.slug ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex gap-6">
        {/* Filter sidebar — desktop */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <FilterSidebar filters={filters} onFiltersChange={setFilters} onReset={resetFilters} />
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            {/* Mobile filter button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:border-primary/40 transition-colors shadow-sm"
            >
              <Filter size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="hidden lg:flex items-center gap-1 text-xs text-danger font-semibold hover:underline"
              >
                <X size={12} />
                Clear all filters
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-muted-foreground font-medium hidden sm:block">Sort:</span>
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:border-primary/40 transition-colors shadow-sm"
                >
                  <ArrowUpDown size={14} className="text-muted-foreground" />
                  {sortOptions.find((s) => s.value === sort)?.label}
                  <ChevronDown size={14} className={`text-muted-foreground transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1.5 bg-card border border-border rounded-xl shadow-elevated z-20 py-1 min-w-[180px]">
                    {sortOptions.map((opt) => (
                      <button
                        key={`sort-${opt.value}`}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors
                          ${sort === opt.value ? 'text-primary bg-secondary' : 'text-foreground hover:bg-muted'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active filter pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.category !== 'all' && (
                <span className="flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20">
                  {liveCategories.find((c) => c.slug === filters.category)?.label}
                  <button onClick={() => setFilters((f) => ({ ...f, category: 'all' }))}><X size={11} /></button>
                </span>
              )}
              {filters.inStockOnly && (
                <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full border border-green-200">
                  In Stock Only
                  <button onClick={() => setFilters((f) => ({ ...f, inStockOnly: false }))}><X size={11} /></button>
                </span>
              )}
              {filters.verifiedOnly && (
                <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200">
                  Verified Vendors
                  <button onClick={() => setFilters((f) => ({ ...f, verifiedOnly: false }))}><X size={11} /></button>
                </span>
              )}
              {filters.minRating > 0 && (
                <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-semibold px-3 py-1 rounded-full border border-amber-200">
                  {filters.minRating}★ & above
                  <button onClick={() => setFilters((f) => ({ ...f, minRating: 0 }))}><X size={11} /></button>
                </span>
              )}
            </div>
          )}

          {/* Product grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Search size={32} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No products found</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Try adjusting your search or filters. We carry 12 products across 6 categories.
              </p>
              <button onClick={() => { setSearch(''); resetFilters(); }} className="btn-primary mt-5">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
              {filtered.map((product) => (
                <ProductCard
                  key={`product-${product.id}`}
                  product={product}
                  inCart={cartAdded.has(product.id)}
                  inWishlist={wishlist.has(product.id)}
                  onAddToCart={() => addToCart(product.id)}
                  onToggleWishlist={() => toggleWishlist(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-card shadow-modal overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-bold text-foreground">Filters</h3>
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <FilterSidebar filters={filters} onFiltersChange={setFilters} onReset={() => { resetFilters(); setSidebarOpen(false); }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
