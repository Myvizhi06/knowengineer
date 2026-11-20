import React, { useState, useEffect } from 'react';
import { 
  Sparkles, ArrowRight, ShoppingCart, Check, Zap, TrendingUp, 
  Layers, Database, ShieldCheck, Heart, Award, Cpu, Plus 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import RecommendationCard from '../components/RecommendationCard';
import KnowledgeGraphVisualizer from '../components/KnowledgeGraphVisualizer';
import { api } from '../api';

const CATEGORIES = [
  { name: 'Fruits', emoji: '🍎', desc: 'Fresh, organic orchard fruits' },
  { name: 'Vegetables', emoji: '🥦', desc: 'Farm fresh cooking essentials' },
  { name: 'Dairy', emoji: '🧀', desc: 'Milk, butter, cheeses & yogurt' },
  { name: 'Bakery', emoji: '🍞', desc: 'Freshly baked artisan breads' },
  { name: 'Beverages', emoji: '☕', desc: 'Coffee, tea & sparkling sodas' },
  { name: 'Snacks', emoji: '🥨', desc: 'Chips, biscuits, nuts & pretzels' },
  { name: 'Personal Care', emoji: '🧴', desc: 'Shampoo, soaps & dental care' },
  { name: 'Household', emoji: '🧼', desc: 'Cleaning sprays & detergents' },
];

export default function HomePage({ 
  onSelectCategory, 
  onViewProduct, 
  onAddToCart, 
  cartItems, 
  setCurrentTab 
}) {
  const [products, setProducts] = useState([]);
  const [featuredRules, setFeaturedRules] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo interactive bundle selector (e.g. Bread selected)
  const [activeDemoAntecedent, setActiveDemoAntecedent] = useState(null);
  const [demoRecommendations, setDemoRecommendations] = useState([]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [prods, stats] = await Promise.all([
        api.getProducts(),
        api.getAnalytics().catch(() => null)
      ]);
      setProducts(prods);
      setAnalytics(stats);

      // Default demo item: Whole Wheat Artisan Bread
      const bread = prods.find(p => p.product_name.includes('Bread')) || prods[0];
      if (bread) {
        setActiveDemoAntecedent(bread);
        const recs = await api.getProductRecommendations(bread.product_id, 3);
        setDemoRecommendations(recs.recommendations);
      }
    } catch (err) {
      console.error('Failed to load homepage data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoChange = async (prod) => {
    setActiveDemoAntecedent(prod);
    try {
      const recs = await api.getProductRecommendations(prod.product_id, 3);
      setDemoRecommendations(recs.recommendations);
    } catch (err) {
      console.error(err);
    }
  };

  // Featured 4 products from different categories
  const featuredProducts = products.slice(0, 8);

  const getCartQuantity = (id) => {
    const found = cartItems.find(i => i.product_id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-emerald-900/40">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Driven Supermarket Recommendation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            Smart Shopping, Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300">Knowledge AI</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            Discover real-time smart product pairings mined from customer purchasing behaviors. 
            SmartCart uses <strong>Market Basket Analysis</strong> and the <strong>Apriori Algorithm</strong> to calculate <em>Support</em>, <em>Confidence</em>, and <em>Lift</em> for intelligent supermarket cross-selling.
          </p>

          {/* Call to Actions */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setCurrentTab('products')}
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all flex items-center gap-2 group"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentTab('knowledge')}
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/10 transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Inspect Knowledge Graph</span>
            </button>
          </div>

          {/* Quick Metrics Banner */}
          {analytics && (
            <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div>
                <div className="text-2xl font-black text-white">{analytics.total_products}</div>
                <div className="text-xs text-slate-400 font-medium">Catalog Products</div>
              </div>
              <div>
                <div className="text-2xl font-black text-emerald-400">{analytics.total_transactions}</div>
                <div className="text-xs text-slate-400 font-medium">Recorded Baskets</div>
              </div>
              <div>
                <div className="text-2xl font-black text-teal-400">{analytics.total_association_rules}</div>
                <div className="text-xs text-slate-400 font-medium">Mined AI Rules</div>
              </div>
              <div>
                <div className="text-2xl font-black text-green-400">8 Categories</div>
                <div className="text-xs text-slate-400 font-medium">Fresh Supermarket</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Interactive "Frequently Bought Together" Showcase */}
      <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-green-700 font-bold text-xs uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" /> Live Apriori Rule Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Bought Together Showcase
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">
              Select an item below to see how our Knowledge Representation system evaluates historical customer baskets to recommend complementary products.
            </p>
          </div>

          {/* Demo trigger selector chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {products.slice(0, 5).map(p => (
              <button
                key={p.product_id}
                onClick={() => handleDemoChange(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeDemoAntecedent?.product_id === p.product_id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {p.product_name.split(' ')[0]} {p.product_name.split(' ')[1] || ''}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Pairing Display */}
        {activeDemoAntecedent && (
          <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
              
              {/* Left: Antecedent (Selected Item) */}
              <div className="bg-white p-5 rounded-2xl border-2 border-green-500 shadow-md">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-block mb-3">
                  Selected Item (Antecedent)
                </span>
                <div className="w-full h-36 rounded-xl overflow-hidden bg-slate-100 mb-3">
                  <img
                    src={activeDemoAntecedent.image_url}
                    alt={activeDemoAntecedent.product_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm line-clamp-1">
                  {activeDemoAntecedent.product_name}
                </h3>
                <div className="text-xs text-slate-500 font-medium">{activeDemoAntecedent.category}</div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-base font-black text-slate-900">${activeDemoAntecedent.price.toFixed(2)}</span>
                  <button
                    onClick={() => onAddToCart(activeDemoAntecedent)}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    + Cart
                  </button>
                </div>
              </div>

              {/* Right: Mined Recommendations (Consequents) */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Association Rules Fired for "{activeDemoAntecedent.product_name}"
                  </span>
                </div>

                {demoRecommendations.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 bg-white rounded-2xl border border-slate-200 text-xs">
                    Mining rules for this item...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {demoRecommendations.map(item => (
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
              </div>

            </div>
          </div>
        )}
      </section>

      {/* 3. Product Categories */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse Supermarket Categories
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Organized across 8 departments, enabling category-based knowledge relationships and fallbacks.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {CATEGORIES.map(cat => (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg hover:border-green-300 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl group-hover:scale-110 transition-transform">
                  {cat.emoji}
                </span>
                <span className="text-slate-300 group-hover:text-green-600 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-green-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Featured Supermarket Products */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Supermarket Essentials
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Top quality fresh products ready for your smart cart.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('products')}
            className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 group"
          >
            <span>View All ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.map(product => (
            <ProductCard
              key={product.product_id}
              product={product}
              onAddToCart={onAddToCart}
              onViewDetails={onViewProduct}
              cartQuantity={getCartQuantity(product.product_id)}
            />
          ))}
        </div>
      </section>

      {/* 5. Embedded Knowledge Graph Spotlight */}
      <section>
        <KnowledgeGraphVisualizer onSelectProduct={onViewProduct} />
      </section>

      {/* 6. Educational Guide: Market Basket Analysis & Knowledge Representation */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Academic Methodology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            How Knowledge Representation & Apriori Work in SmartCart
          </h2>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Market Basket Analysis identifies hidden cross-category purchasing patterns by mining frequent itemsets from supermarket receipts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs font-mono mb-3">
              01
            </div>
            <h3 className="font-bold text-base text-white">Support Metric</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Measures how frequently itemset (A ∪ B) appears across all transactions.
            </p>
            <div className="mt-3 p-2 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[11px]">
              Support(A, B) = Count(A ∩ B) / Total Orders
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs font-mono mb-3">
              02
            </div>
            <h3 className="font-bold text-base text-white">Confidence Metric</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Probability that a customer who has already chosen item A will also purchase item B.
            </p>
            <div className="mt-3 p-2 bg-slate-900 rounded-lg text-blue-300 font-mono text-[11px]">
              Confidence(A → B) = Support(A, B) / Support(A)
            </div>
          </div>

          <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs font-mono mb-3">
              03
            </div>
            <h3 className="font-bold text-base text-white">Lift Metric</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Measures rule strength over chance. Lift &gt; 1 indicates strong affinity (e.g. Lift = 3.5x).
            </p>
            <div className="mt-3 p-2 bg-slate-900 rounded-lg text-amber-300 font-mono text-[11px]">
              Lift(A → B) = Confidence(A → B) / Support(B)
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
