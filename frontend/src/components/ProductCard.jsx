import React from 'react';
import { ShoppingCart, Plus, Check, Eye } from 'lucide-react';

const CATEGORY_COLORS = {
  Fruits: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Vegetables: 'bg-green-50 text-green-700 border-green-200',
  Dairy: 'bg-blue-50 text-blue-700 border-blue-200',
  Bakery: 'bg-amber-50 text-amber-700 border-amber-200',
  Beverages: 'bg-orange-50 text-orange-700 border-orange-200',
  Snacks: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  'Personal Care': 'bg-purple-50 text-purple-700 border-purple-200',
  Household: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function ProductCard({ 
  product, 
  onAddToCart, 
  onViewDetails, 
  cartQuantity = 0 
}) {
  const categoryClass = CATEGORY_COLORS[product.category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-green-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Product Image Box */}
      <div 
        onClick={() => onViewDetails(product)}
        className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.image_url}
          alt={product.product_name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        
        {/* Category tag */}
        <span className={`absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm shadow-sm ${categoryClass}`}>
          {product.category}
        </span>

        {/* Hover quick preview pill */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white/95 text-slate-900 px-3 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 backdrop-blur-sm">
            <Eye className="w-3.5 h-3.5 text-green-600" /> View Details
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 
            onClick={() => onViewDetails(product)}
            className="font-bold text-slate-900 text-sm hover:text-green-600 transition-colors line-clamp-1 cursor-pointer"
            title={product.product_name}
          >
            {product.product_name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product.description || 'Fresh supermarket product delivered with quality guarantee.'}
          </p>
        </div>

        {/* Price and Add button */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-lg font-black text-slate-900">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 ${
              cartQuantity > 0
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/20'
                : 'bg-slate-900 hover:bg-green-600 text-white'
            }`}
          >
            {cartQuantity > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added ({cartQuantity})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
