import React, { useState } from 'react';
import { ShoppingCart, Store, Network, ShieldCheck, Search, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  cartItems, 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (onSearchSubmit) onSearchSubmit();
      setCurrentTab('products');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-spin" />
        <span>Powered by <strong>Market Basket Analysis</strong> & <strong>Apriori Algorithm</strong> Knowledge Mining</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-500/20 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-green-600 transition-colors">
                  Smart<span className="text-green-600">Cart</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-green-100 text-green-700 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block -mt-1">
                Intelligent Supermarket
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search supermarket items (e.g., Bread, Milk, Apples)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                className="w-full pl-10 pr-20 py-2 text-sm bg-slate-100 border border-transparent rounded-full focus:bg-white focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                onClick={() => {
                  if (onSearchSubmit) onSearchSubmit();
                  setCurrentTab('products');
                }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-full transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg transition-colors ${
                currentTab === 'home'
                  ? 'text-green-600 bg-green-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setCurrentTab('products')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentTab === 'products'
                  ? 'text-green-600 bg-green-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Products</span>
            </button>

            <button
              onClick={() => setCurrentTab('knowledge')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentTab === 'knowledge'
                  ? 'text-green-600 bg-green-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Network className="w-4 h-4 text-indigo-500" />
              <span>Knowledge Graph</span>
            </button>

            <button
              onClick={() => setCurrentTab('admin')}
              className={`px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors ${
                currentTab === 'admin'
                  ? 'text-green-600 bg-green-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Admin</span>
            </button>
          </nav>

          {/* Cart button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentTab('cart')}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold text-sm transition-all shadow-sm ${
                currentTab === 'cart'
                  ? 'bg-green-600 text-white shadow-green-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemsCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-green-500 text-white rounded-full">
                  {totalItemsCount}
                </span>
              )}
              {totalCartPrice > 0 && (
                <span className="text-xs text-green-300 font-mono hidden md:inline border-l border-slate-700 pl-2">
                  ${totalCartPrice.toFixed(2)}
                </span>
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile search input */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              className="w-full pl-9 pr-16 py-2 text-sm bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-green-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              onClick={() => {
                if (onSearchSubmit) onSearchSubmit();
                setCurrentTab('products');
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-green-600 text-white text-xs font-semibold rounded"
            >
              Go
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm ${
              currentTab === 'home' ? 'text-green-600 bg-green-50 font-bold' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => { setCurrentTab('products'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              currentTab === 'products' ? 'text-green-600 bg-green-50 font-bold' : 'text-slate-700'
            }`}
          >
            <Store className="w-4 h-4" /> Products
          </button>
          <button
            onClick={() => { setCurrentTab('knowledge'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              currentTab === 'knowledge' ? 'text-green-600 bg-green-50 font-bold' : 'text-slate-700'
            }`}
          >
            <Network className="w-4 h-4 text-indigo-500" /> Knowledge Graph
          </button>
          <button
            onClick={() => { setCurrentTab('admin'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${
              currentTab === 'admin' ? 'text-green-600 bg-green-50 font-bold' : 'text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-500" /> Admin Dashboard
          </button>
        </div>
      )}
    </header>
  );
}
