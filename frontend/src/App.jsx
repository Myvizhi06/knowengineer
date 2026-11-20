import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';
import KnowledgeGraphVisualizer from './components/KnowledgeGraphVisualizer';
import { Sparkles, Check, ShoppingCart, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Cart state persisted to localStorage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('smartcart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartcart_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Cart operations
  const handleAddToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        return prev.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prev, {
          product_id: product.product_id,
          product_name: product.product_name,
          category: product.category,
          price: product.price,
          image_url: product.image_url,
          quantity: quantity
        }];
      }
    });
    showToast(`Added ${quantity > 1 ? `${quantity}x ` : ''}${product.product_name} to cart`);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.product_id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Navigation helpers
  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setCurrentTab('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setCurrentTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = () => {
    setCurrentTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-green-100 selection:text-green-900">
      
      {/* Global Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartItems={cartItems}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {currentTab === 'home' && (
          <HomePage
            onSelectCategory={handleSelectCategory}
            onViewProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'products' && (
          <ProductsPage
            onViewProduct={handleViewProduct}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'product-details' && (
          <ProductDetailsPage
            product={selectedProduct}
            onBack={() => setCurrentTab('products')}
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
            onViewProduct={handleViewProduct}
          />
        )}

        {currentTab === 'cart' && (
          <CartPage
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onAddToCart={handleAddToCart}
            onViewProduct={handleViewProduct}
            onContinueShopping={() => setCurrentTab('products')}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'knowledge' && (
          <div className="space-y-8 pb-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100 px-3 py-1 rounded-full">
                Interactive Knowledge Base
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                Supermarket Association Network
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Explore the ontology of supermarket entities, categories, and association rules mined from customer checkout baskets.
              </p>
            </div>
            <KnowledgeGraphVisualizer onSelectProduct={handleViewProduct} />
          </div>
        )}

        {currentTab === 'admin' && (
          <AdminDashboard />
        )}

      </main>

      {/* Floating Add to Cart Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-7 h-7 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Global Footer */}
      <Footer setCurrentTab={setCurrentTab} />

    </div>
  );
}
