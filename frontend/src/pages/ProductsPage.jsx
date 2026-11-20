import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, SlidersHorizontal, RefreshCw, X, ShoppingBag } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { api } from '../api';

const CATEGORIES = [
  'All',
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Personal Care',
  'Household',
];

export default function ProductsPage({ 
  onViewProduct, 
  onAddToCart, 
  cartItems, 
  selectedCategory = 'All', 
  onSelectCategory,
  searchQuery = '',
  setSearchQuery
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('default');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesSearch = !searchQuery || 
          p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortOption === 'price_asc') return a.price - b.price;
        if (sortOption === 'price_desc') return b.price - a.price;
        if (sortOption === 'name') return a.product_name.localeCompare(b.product_name);
        return a.product_id - b.product_id;
      });
  }, [products, selectedCategory, searchQuery, sortOption]);

  const getCartQuantity = (id) => {
    const item = cartItems.find(i => i.product_id === id);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Banner & Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-green-700 uppercase tracking-wider bg-green-100 px-2.5 py-1 rounded-md">
            Supermarket Catalog
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
            All Supermarket Products
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Browse our fresh aisles. Add items to your cart to trigger dynamic <strong>Market Basket AI</strong> recommendations.
          </p>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none w-full sm:w-64"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none font-medium text-slate-700"
            >
              <option value="default">Default Order</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => {
          const count = cat === 'All' 
            ? products.length 
            : products.filter(p => p.category === cat).length;

          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-2xs ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-slate-900/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{cat}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Bar (if category != All or search applied) */}
      {(selectedCategory !== 'All' || searchQuery) && (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-2xl text-xs text-emerald-900">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">Active Filters:</span>
            {selectedCategory !== 'All' && (
              <span className="bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => onSelectCategory('All')} />
              </span>
            )}
            {searchQuery && (
              <span className="bg-white border border-emerald-300 text-emerald-800 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                Keyword: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
            <span className="text-emerald-700 font-bold ml-2">
              Found {filteredProducts.length} items
            </span>
          </div>

          <button
            onClick={() => { onSelectCategory('All'); setSearchQuery(''); }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-green-600 mb-3" />
          <span className="font-semibold text-sm">Loading products catalog...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or select another category from the filters above.
          </p>
          <button
            onClick={() => { onSelectCategory('All'); setSearchQuery(''); }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewProduct}
              cartQuantity={getCartQuantity(product.product_id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
