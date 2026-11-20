import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Package, ShoppingBag, BarChart3, Network, Plus, 
  Edit3, Trash2, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, 
  Search, Sliders, Database, Layers, X, TrendingUp, DollarSign 
} from 'lucide-react';
import KnowledgeGraphVisualizer from '../components/KnowledgeGraphVisualizer';
import { api } from '../api';

const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Bakery',
  'Beverages',
  'Snacks',
  'Personal Care',
  'Household',
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search in admin table
  const [searchTerm, setSearchTerm] = useState('');

  // Modals for CRUD
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    product_name: '',
    category: 'Fruits',
    price: '',
    image_url: '',
    description: '',
    stock: 50,
  });
  const [editingProductId, setEditingProductId] = useState(null);

  // Retrain Apriori parameters
  const [minSupport, setMinSupport] = useState(0.02);
  const [minConfidence, setMinConfidence] = useState(0.15);
  const [minLift, setMinLift] = useState(1.0);
  const [retraining, setRetraining] = useState(false);
  const [retrainResult, setRetrainResult] = useState(null);

  // Toast / feedback message
  const [actionMessage, setActionMessage] = useState(null);

  useEffect(() => {
    loadAllAdminData();
  }, []);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [prods, txs, stats] = await Promise.all([
        api.getProducts(),
        api.getTransactions(50, 0),
        api.getAnalytics(),
      ]);
      setProducts(prods);
      setTransactions(txs);
      setAnalytics(stats);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  // 1. Add Product Handler
  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 50,
      };
      await api.createProduct(payload);
      setIsAddModalOpen(false);
      setProductForm({
        product_name: '',
        category: 'Fruits',
        price: '',
        image_url: '',
        description: '',
        stock: 50,
      });
      showNotification('Product added successfully!');
      loadAllAdminData();
    } catch (err) {
      alert(`Failed to add product: ${err.message}`);
    }
  };

  // 2. Edit Product Handler
  const openEditModal = (p) => {
    setEditingProductId(p.product_id);
    setProductForm({
      product_name: p.product_name,
      category: p.category,
      price: p.price.toString(),
      image_url: p.image_url,
      description: p.description || '',
      stock: p.stock || 50,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock) || 50,
      };
      await api.updateProduct(editingProductId, payload);
      setIsEditModalOpen(false);
      showNotification('Product updated successfully!');
      loadAllAdminData();
    } catch (err) {
      alert(`Failed to update product: ${err.message}`);
    }
  };

  // 3. Delete Product Handler
  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        showNotification(`Product "${name}" deleted successfully.`);
        loadAllAdminData();
      } catch (err) {
        alert(`Failed to delete product: ${err.message}`);
      }
    }
  };

  // 4. Retrain Apriori Rules
  const handleRetrain = async () => {
    try {
      setRetraining(true);
      setRetrainResult(null);
      const res = await api.retrainRules(minSupport, minConfidence, minLift);
      setRetrainResult(res);
      showNotification(`Apriori re-mining completed! ${res.rules_count} rules active.`);
      // Refresh analytics to reflect updated rules
      const updatedStats = await api.getAnalytics();
      setAnalytics(updatedStats);
    } catch (err) {
      setRetrainResult({ status: 'error', message: err.message });
    } finally {
      setRetraining(false);
    }
  };

  // 5. Reset & Re-seed Dataset
  const handleResetSeed = async () => {
    if (window.confirm('Reset database with 32 sample products and 135+ transactions?')) {
      try {
        setLoading(true);
        await api.seedDatabase();
        showNotification('Database reset and seeded with fresh sample transactions!');
        loadAllAdminData();
      } catch (err) {
        alert(`Seeding failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Supermarket Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Admin & Analytics Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Manage product inventory, inspect historical customer transactions, monitor association rule metrics, and re-train the Apriori recommendation model.
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => { setIsAddModalOpen(true); setProductForm({ product_name: '', category: 'Fruits', price: '', image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80', description: '', stock: 50 }); }}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
          
          <button
            onClick={handleResetSeed}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-all border border-slate-700 flex items-center gap-1.5"
            title="Reset and re-seed 32 products and 135+ transactions"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span>Re-seed Sample Data</span>
          </button>
        </div>
      </div>

      {/* Global Toast Alert */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-sm ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
            : 'bg-rose-50 text-rose-800 border-rose-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stat Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Catalog Products</span>
              <Package className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {analytics.total_products}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">8 Departments</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Customer Baskets</span>
              <ShoppingBag className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              {analytics.total_transactions}
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Historical Receipts</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-black text-green-700 mt-2 font-mono">
              ${analytics.total_revenue.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Recorded Sales</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Avg Basket Size</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
              ${analytics.average_order_value.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Per Transaction</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
              <span>Active AI Rules</span>
              <Network className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-2 font-mono">
              {analytics.total_association_rules}
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5 font-medium">Apriori Mined</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'products'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Management ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Transaction Receipts ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Top Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'graph'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Knowledge Graph & Apriori Miner</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: PRODUCT MANAGEMENT (CRUD)
         ======================================================== */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Supermarket Products Inventory
              </h2>
              <p className="text-xs text-slate-500">
                Add, update, or remove supermarket products. Changes reflect immediately in recommendations.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map(p => (
                  <tr key={p.product_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={p.image_url}
                        alt={p.product_name}
                        className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900">{p.product_name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">ID: #{p.product_id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      ${p.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-50 text-green-700">
                        {p.stock || 50} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.product_id, p.product_name)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: TRANSACTION RECEIPTS
         ======================================================== */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Historical Customer Transactions
              </h2>
              <p className="text-xs text-slate-500">
                Raw market baskets feeding the Apriori association rule mining engine.
              </p>
            </div>
            <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">
              {transactions.length} Transactions Loaded
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Tx ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Basket Contents</th>
                  <th className="py-3 px-4">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map(tx => (
                  <tr key={tx.transaction_id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      #{tx.transaction_id}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] font-mono whitespace-nowrap">
                      {tx.transaction_date}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-md">
                        {tx.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium"
                          >
                            {it.quantity}x {it.product_name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      ${tx.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: ANALYTICS & TOP RULES
         ======================================================== */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-8">
          
          {/* Top 10 Purchased Products Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Top Products */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Most Frequently Purchased Products
                  </h3>
                  <p className="text-xs text-slate-400">Ranked by total units purchased</p>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                  Top 10
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {analytics.top_products.map((p, idx) => {
                  const maxCount = analytics.top_products[0]?.purchase_count || 1;
                  const pct = Math.round((p.purchase_count / maxCount) * 100);

                  return (
                    <div key={p.product_id} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-800">
                          {idx + 1}. {p.product_name}
                        </span>
                        <span className="font-mono text-slate-500 font-semibold">
                          {p.purchase_count} units (${p.total_revenue.toFixed(2)})
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-green-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Category Distribution
                  </h3>
                  <p className="text-xs text-slate-400">Inventory balance across departments</p>
                </div>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
                  8 Categories
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {Object.entries(analytics.category_distribution).map(([cat, count]) => (
                  <div key={cat} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {cat}
                    </span>
                    <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
                      {count} items
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Top Association Rules Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
            <div className="p-4 sm:p-6 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">
                Top Mined Association Rules (Knowledge Base)
              </h3>
              <p className="text-xs text-slate-500">
                Ranked by <strong>Lift</strong> and <strong>Confidence</strong>. Higher Lift means higher probability of purchase beyond random chance.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Antecedent (IF)</th>
                    <th className="py-3 px-4">Consequent (THEN)</th>
                    <th className="py-3 px-4">Support</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Lift</th>
                    <th className="py-3 px-4">Rule Explanation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {analytics.top_rules.map(rule => (
                    <tr key={rule.rule_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {rule.antecedent}
                      </td>
                      <td className="py-3 px-4 font-sans font-bold text-green-700">
                        → {rule.consequent}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {(rule.support * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4 text-blue-700 font-bold">
                        {(rule.confidence * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded text-[11px]">
                          {rule.lift}x
                        </span>
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 text-[11px]">
                        {rule.explanation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================
          TAB 4: KNOWLEDGE GRAPH & APRIORI RETRAINING
         ======================================================== */}
      {activeTab === 'graph' && (
        <div className="space-y-8">
          
          {/* Apriori Hyperparameter Tuning Bar */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider bg-purple-100 px-2.5 py-1 rounded-md">
                  Apriori Machine Learning Engine
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">
                  Re-mine Association Rules from Database
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  Adjust Support, Confidence, and Lift thresholds to tune rule mining sensitivity. 
                  Every completed customer checkout enriches the dataset!
                </p>
              </div>

              <button
                onClick={handleRetrain}
                disabled={retraining}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-600/20 flex items-center gap-2 self-start sm:self-auto"
              >
                {retraining ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mining Rules with MLxtend...</span>
                  </>
                ) : (
                  <>
                    <Sliders className="w-4 h-4" />
                    <span>Execute Apriori Algorithm</span>
                  </>
                )}
              </button>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Min Support</span>
                  <span className="font-mono text-purple-700">{(minSupport * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.20"
                  step="0.01"
                  value={minSupport}
                  onChange={(e) => setMinSupport(parseFloat(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum co-occurrence frequency</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Min Confidence</span>
                  <span className="font-mono text-blue-700">{(minConfidence * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.80"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum rule certainty</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                  <span>Min Lift</span>
                  <span className="font-mono text-emerald-700">{minLift.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.0"
                  step="0.2"
                  value={minLift}
                  onChange={(e) => setMinLift(parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Minimum correlation factor over chance</p>
              </div>
            </div>

            {/* Retrain Feedback */}
            {retrainResult && (
              <div className={`p-4 rounded-2xl text-xs font-medium border flex items-center justify-between ${
                retrainResult.status === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-amber-50 text-amber-900 border-amber-300'
              }`}>
                <span>{retrainResult.message}</span>
                <span className="font-mono font-bold">{retrainResult.rules_count} rules stored</span>
              </div>
            )}
          </div>

          {/* Visual Network Graph */}
          <KnowledgeGraphVisualizer />

        </div>
      )}

      {/* ========================================================
          MODALS: ADD & EDIT PRODUCT
         ======================================================== */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-lg">
                {isAddModalOpen ? 'Add New Supermarket Product' : 'Edit Product'}
              </h3>
              <button
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isAddModalOpen ? handleAddProduct : handleUpdateProduct} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.product_name}
                  onChange={(e) => setProductForm({ ...productForm, product_name: e.target.value })}
                  placeholder="e.g. Fresh Organic Milk"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.10"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="2.99"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Fresh quality details..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md shadow-green-600/20"
                >
                  {isAddModalOpen ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
