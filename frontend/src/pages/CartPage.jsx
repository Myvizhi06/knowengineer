import React, { useState, useEffect } from 'react';
import { 
  Trash2, Plus, Minus, ShoppingCart, Sparkles, ArrowRight, 
  CheckCircle2, RefreshCw, AlertCircle, ShoppingBag, ArrowLeft, Award 
} from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import { api } from '../api';

export default function CartPage({ 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onClearCart, 
  onAddToCart, 
  onViewProduct, 
  onContinueShopping,
  setCurrentTab 
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch cart recommendations whenever cart items change
  useEffect(() => {
    if (cartItems.length > 0) {
      loadCartRecommendations();
    } else {
      setRecommendations([]);
    }
  }, [cartItems]);

  const loadCartRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const cartProductIds = cartItems.map(i => i.product_id);
      const res = await api.getCartRecommendations(cartProductIds, 4);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error('Failed to load cart recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discount = subtotal > 20 ? subtotal * 0.05 : 0; // 5% supermarket loyalty discount on orders > $20
  const estimatedTax = (subtotal - discount) * 0.06; // 6% tax
  const finalTotal = subtotal - discount + estimatedTax;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    try {
      setCheckingOut(true);
      setErrorMsg('');

      const checkoutPayload = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      const res = await api.createTransaction(checkoutPayload);
      setCompletedOrder(res);
      onClearCart();
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed. Please ensure the backend is running.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-green-600" />
            <span>Your Supermarket Shopping Cart</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review your basket items. Intelligent recommendations update dynamically based on the products in your cart.
          </p>
        </div>

        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-green-600 self-start sm:self-center"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* Main Cart Grid */}
      {cartItems.length === 0 && !completedOrder ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-800">Your shopping cart is currently empty</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Browse our fresh supermarket aisles to add products. Once you add items, our Apriori recommendation engine will discover frequently paired items for you!
          </p>
          <button
            onClick={onContinueShopping}
            className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-green-600/20"
          >
            Start Shopping Now
          </button>
        </div>
      ) : completedOrder ? (
        /* Order Confirmation Success Card */
        <div className="bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl border-2 border-green-500 p-8 sm:p-12 shadow-xl text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-green-700 bg-green-100 px-3 py-1 rounded-full">
              Checkout Successful & Recorded
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
              Thank You for Your Order!
            </h2>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Transaction ID: #{completedOrder.transaction_id} | Date: {completedOrder.transaction_date}
            </p>
          </div>

          {/* Receipt summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left text-xs space-y-3 shadow-2xs">
            <div className="font-bold text-slate-700 border-b border-slate-100 pb-2 flex justify-between">
              <span>Itemized Receipt ({completedOrder.item_count} items)</span>
              <span>Subtotal</span>
            </div>
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-600">
                <span>{item.quantity}x {item.product_name}</span>
                <span className="font-mono font-bold text-slate-800">${item.subtotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-2 flex justify-between font-black text-slate-900 text-sm">
              <span>Total Paid:</span>
              <span className="text-green-700 font-mono">${completedOrder.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Academic callout: How this updates Apriori rules */}
          <div className="bg-emerald-100/70 border border-emerald-300 rounded-2xl p-4 text-xs text-emerald-950 text-left space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Machine Learning Closed-Loop Feedback:</span>
            </div>
            <p className="leading-relaxed">
              This transaction was saved to SQLite table <code>transactions</code> and <code>transaction_items</code>. 
              The next time the Apriori algorithm runs in the Admin Dashboard, this customer basket will update the support, confidence, and lift metrics of associated products!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => { setCompletedOrder(null); onContinueShopping(); }}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Shop More Items
            </button>
            <button
              onClick={() => { setCompletedOrder(null); setCurrentTab('admin'); }}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              View in Admin Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left: Cart Items Table (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-800 text-sm">
                  Basket Items ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                </span>
                <button
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map(item => {
                  const lineTotal = item.price * item.quantity;

                  return (
                    <div key={item.product_id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/50 transition-colors">
                      {/* Product Thumbnail */}
                      <div 
                        onClick={() => onViewProduct(item)}
                        className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 cursor-pointer"
                      >
                        <img
                          src={item.image_url}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 
                          onClick={() => onViewProduct(item)}
                          className="font-bold text-slate-900 text-sm truncate hover:text-green-600 cursor-pointer"
                        >
                          {item.product_name}
                        </h4>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          ${item.price.toFixed(2)} each
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                        <button
                          onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold font-mono text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ${lineTotal.toFixed(2)}
                        </span>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => onRemoveItem(item.product_id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Order Summary Card (1 col) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="font-extrabold text-slate-900 text-base border-b border-slate-100 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Loyalty Discount (5%)</span>
                  <span className="font-mono font-bold">-${discount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Tax (6%)</span>
                <span className="font-mono font-bold text-slate-800">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-emerald-700">
                <span>Supermarket Shipping</span>
                <span className="font-bold uppercase tracking-wider">FREE</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline text-slate-900 font-black text-lg">
                <span>Total Due</span>
                <span className="text-green-700 font-mono">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full py-3.5 px-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
            >
              {checkingOut ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Checkout...</span>
                </>
              ) : (
                <>
                  <span>Checkout & Record Transaction</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-[11px] text-slate-400 text-center leading-relaxed">
              Recording this transaction adds realistic purchase data to SQLite, triggering Apriori pattern re-learning.
            </div>
          </div>

        </div>
      )}

      {/* Dynamic Cart Recommendations Section */}
      {cartItems.length > 0 && (
        <section className="bg-slate-50/80 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-green-700 text-xs font-extrabold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-green-600" />
                <span>Intelligent Basket Recommendations</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                Frequently Bought with Your Basket
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Generated dynamically from association rules matching the products currently in your cart. 
                Products already in your cart are automatically excluded.
              </p>
            </div>

            {loadingRecs && (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <RefreshCw className="w-4 h-4 animate-spin text-green-600" />
                <span>Evaluating Apriori Rules...</span>
              </div>
            )}
          </div>

          {recommendations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No additional recommendations found for this specific combination.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(item => (
                <RecommendationCard
                  key={item.product_id}
                  item={item}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewProduct}
                  inCart={cartItems.some(c => c.product_id === item.product_id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
}
