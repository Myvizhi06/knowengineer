import React from 'react';
import { Sparkles, Plus, Check, ArrowRight, Zap, Info } from 'lucide-react';

export default function RecommendationCard({ 
  item, 
  onAddToCart, 
  onViewDetails, 
  inCart = false 
}) {
  const isAprioriRule = item.recommendation_type === 'association_rule';

  return (
    <div className="bg-gradient-to-b from-white to-slate-50/80 rounded-2xl border border-emerald-200/80 p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative group">
      
      {/* Top AI badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm ${
          isAprioriRule 
            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
            : 'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          <Sparkles className="w-3 h-3 text-emerald-600" />
          {isAprioriRule ? 'Frequently Bought Together' : 'Category Companion'}
        </span>

        {/* Lift metric badge */}
        {item.lift && (
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-green-600 text-white rounded font-mono shadow-sm" title="Lift value: how much more frequently these items are bought together vs chance">
            Lift {item.lift}x
          </span>
        )}
      </div>

      {/* Middle: Image + Details */}
      <div className="flex gap-3">
        <div 
          onClick={() => onViewDetails(item)}
          className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200"
        >
          <img
            src={item.image_url}
            alt={item.product_name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h4 
            onClick={() => onViewDetails(item)}
            className="font-bold text-slate-900 text-sm hover:text-green-600 cursor-pointer truncate"
            title={item.product_name}
          >
            {item.product_name}
          </h4>
          <span className="text-[11px] text-slate-500 font-medium block">
            {item.category}
          </span>
          <div className="text-base font-extrabold text-slate-900 mt-1">
            ${item.price.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Natural Language Explanation Box (Knowledge Representation) */}
      <div className="mt-3 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5 text-[11px] text-emerald-950 leading-relaxed flex items-start gap-1.5">
        <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-emerald-900">Why recommended: </span>
          <span>{item.explanation}</span>
          {item.confidence && (
            <div className="text-[10px] text-emerald-700 font-mono mt-0.5">
              Confidence: {(item.confidence * 100).toFixed(1)}% | Support: {(item.support * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Action button */}
      <div className="mt-3 pt-2 flex items-center gap-2">
        <button
          onClick={() => onAddToCart(item)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            inCart
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-slate-900 hover:bg-emerald-600 text-white'
          }`}
        >
          {inCart ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>In Cart</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              <span>Add Recommendation</span>
            </>
          )}
        </button>

        <button
          onClick={() => onViewDetails(item)}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
          title="Inspect rule details"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
