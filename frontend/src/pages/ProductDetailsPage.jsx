import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ShoppingCart, Plus, Minus, Check, Sparkles, 
  Info, ShieldCheck, Truck, RefreshCw, Layers, Award, Tag 
} from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import ProductCard from '../components/ProductCard';
import { api } from '../api';

export default function ProductDetailsPage({ 
  product, 
  onBack, 
  onAddToCart, 
  cartItems, 
  onViewProduct 
}) {
  const [quantity, setQuantity] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [categoryRelated, setCategoryRelated] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    if (product) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      loadProductRecommendations(product.product_id, product.category);
    }
  }, [product]);

  const loadProductRecommendations = async (productId, category) => {
    try {
      setLoadingRecs(true);
      const [recsRes, allProds] = await Promise.all([
        api.getProductRecommendations(productId, 4),
        api.getProducts({ category })
      ]);
      setRecommendations(recsRes.recommendations || []);
      // Filter out current product from category related
      setCategoryRelated(allProds.filter(p => p.product_id !== productId).slice(0, 4));
    } catch (err) {
      console.error('Failed to load product details recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">No product selected.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
          Go to Catalog
        </button>
      </div>
    );
  }

  const inCart = cartItems.some(i => i.product_id === product.product_id);
  const cartQty = cartItems.find(i => i.product_id === product.product_id)?.quantity || 0;

  // Bundle calculation (Main product + Top recommendation)
  const topRec = recommendations.length > 0 ? recommendations[0] : null;
  const bundleTotalPrice = topRec ? (product.price + topRec.price) : product.price;
  const bundleDiscountPrice = topRec ? (bundleTotalPrice * 0.90) : bundleTotalPrice; // 10% bundle savings

  const handleAddBundle = () => {
    onAddToCart(product, 1);
    if (topRec) {
      onAddToCart(topRec, 1);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      
      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>
      </div>

      {/* Main Product Showcase Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* Image gallery */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 aspect-square max-h-[460px] group">
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <span className="absolute top-4 left-4 text-xs font-bold px-3 py-1 bg-white/90 backdrop-blur-sm text-green-700 border border-green-200 rounded-full shadow-sm">
              {product.category}
            </span>
          </div>

          {/* Product information & actions */}
          <div className="flex flex-col justify-between h-full space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Supermarket Verified Freshness</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {product.product_name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-black text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-medium">Tax included</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full ml-auto">
                  In Stock ({(product.stock || 50)} units)
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {product.description || 'High-grade supermarket item selected under strict quality criteria. Perfect for daily consumption and family meals.'}
                </p>
              </div>

              {/* Guarantees */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span>Free Supermarket Delivery</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>100% Quality Satisfaction</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Add to Cart */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-1 bg-slate-50">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-sm font-mono text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => onAddToCart(product, quantity)}
                className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-600/20 active:scale-98 transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add {quantity} to Cart (${(product.price * quantity).toFixed(2)})</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Frequently Bought Together Bundle Card */}
      {topRec && (
        <section className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-extrabold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Smart Supermarket Bundle Deal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Frequently Bought Together Pair
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Customers frequently buy these two items together. Add both to your cart and enjoy a combo bundle discount!
          </p>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm">
            
            {/* Products pair visuals */}
            <div className="flex items-center gap-3 sm:gap-6 flex-wrap justify-center sm:justify-start">
              
              {/* Item 1 */}
              <div className="flex items-center gap-3">
                <img
                  src={product.image_url}
                  alt={product.product_name}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{product.product_name}</h4>
                  <span className="text-xs font-extrabold text-slate-700">${product.price.toFixed(2)}</span>
                </div>
              </div>

              <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                +
              </span>

              {/* Item 2 */}
              <div className="flex items-center gap-3">
                <img
                  src={topRec.image_url}
                  alt={topRec.product_name}
                  className="w-16 h-16 rounded-xl object-cover border border-emerald-300"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{topRec.product_name}</h4>
                    {topRec.lift && (
                      <span className="text-[9px] bg-emerald-600 text-white font-mono px-1 rounded">
                        Lift {topRec.lift}x
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-slate-700">${topRec.price.toFixed(2)}</span>
                </div>
              </div>

            </div>

            {/* Price & Add Bundle Button */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="text-right">
                <div className="text-xs text-slate-400 line-through font-mono">
                  ${bundleTotalPrice.toFixed(2)}
                </div>
                <div className="text-xl font-black text-emerald-700 font-mono">
                  ${bundleDiscountPrice.toFixed(2)}
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Save 10% Bundle
                </span>
              </div>

              <button
                onClick={handleAddBundle}
                className="px-5 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Both to Cart</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* Frequently Bought Together Recommendations & Explanation Section */}
      <section className="space-y-4">
        <div>
          <div className="flex items-center gap-2 text-green-700 text-xs font-extrabold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Knowledge Representation In Action</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Frequently Bought Together Recommendations
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Each recommendation below was mined using the Apriori algorithm from real customer baskets. 
            The system explains the exact mathematical metrics (Support, Confidence, and Lift) that triggered the rule.
          </p>
        </div>

        {loadingRecs ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-green-600 mr-2" />
            <span className="text-xs font-semibold">Mining association rules...</span>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            No dynamic rules fired for this product yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map(rec => (
              <RecommendationCard
                key={rec.product_id}
                item={rec}
                onAddToCart={onAddToCart}
                onViewDetails={onViewProduct}
                inCart={cartItems.some(c => c.product_id === rec.product_id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Related in Same Category */}
      {categoryRelated.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-slate-200">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              More from the {product.category} Department
            </h3>
            <p className="text-xs text-slate-500">
              Browse other essential products in the same category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {categoryRelated.map(item => (
              <ProductCard
                key={item.product_id}
                product={item}
                onAddToCart={onAddToCart}
                onViewDetails={onViewProduct}
                cartQuantity={cartItems.find(c => c.product_id === item.product_id)?.quantity || 0}
              />
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
