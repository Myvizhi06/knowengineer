import React from 'react';
import { ShoppingCart, Heart, Network, Cpu, Database, Sparkles, BookOpen } from 'lucide-react';

export default function Footer({ setCurrentTab }) {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg tracking-tight">Smart<span className="text-green-500">Cart</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Intelligent Supermarket Product Recommendation System utilizing Knowledge Representation and Market Basket Analysis with the Apriori algorithm.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-green-400 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full-Stack AI Capstone Project</span>
            </div>
          </div>

          {/* Core Technologies */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-green-400" />
              Core Tech Stack
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>React.js & Tailwind CSS</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>FastAPI & Python 3</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>SQLite Database</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>MLxtend & Apriori Algorithm</li>
            </ul>
          </div>

          {/* Knowledge Representation Concepts */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-400" />
              Knowledge Representation
            </h4>
            <ul className="space-y-2 text-xs">
              <li><strong>Support:</strong> Frequency of co-occurrence in transactions</li>
              <li><strong>Confidence:</strong> Probability of buying B given A</li>
              <li><strong>Lift:</strong> Ratio of observed co-occurrence to independence</li>
              <li><strong>Rule Base:</strong> IF Antecedent THEN Consequent</li>
            </ul>
          </div>

          {/* Quick links & Presentation Helpers */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Project Navigation
            </h4>
            <div className="flex flex-col space-y-2 text-xs">
              <button 
                onClick={() => { setCurrentTab('home'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="text-left hover:text-green-400 transition-colors"
              >
                Supermarket Home
              </button>
              <button 
                onClick={() => { setCurrentTab('products'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="text-left hover:text-green-400 transition-colors"
              >
                Browse 30+ Products
              </button>
              <button 
                onClick={() => { setCurrentTab('knowledge'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="text-left hover:text-green-400 transition-colors"
              >
                Interactive Knowledge Graph
              </button>
              <button 
                onClick={() => { setCurrentTab('admin'); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                className="text-left hover:text-green-400 transition-colors"
              >
                Admin & Mining Dashboard
              </button>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SmartCart Supermarket Recommendation System. Developed for academic demonstration.</p>
          <div className="flex items-center gap-1">
            <span>Built with precision for College Viva & Project Presentations</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
