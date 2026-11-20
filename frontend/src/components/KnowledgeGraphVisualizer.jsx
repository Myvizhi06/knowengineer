import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Network, Filter, Info, ZoomIn, ZoomOut, RefreshCw, Sparkles, ExternalLink, ArrowRight } from 'lucide-react';
import { api } from '../api';

const CATEGORY_PALETTE = {
  Fruits: { fill: '#ecfdf5', stroke: '#10b981', text: '#065f46' },
  Vegetables: { fill: '#f0fdf4', stroke: '#22c55e', text: '#166534' },
  Dairy: { fill: '#eff6ff', stroke: '#3b82f6', text: '#1e40af' },
  Bakery: { fill: '#fffbeb', stroke: '#f59e0b', text: '#92400e' },
  Beverages: { fill: '#fff7ed', stroke: '#f97316', text: '#9a3412' },
  Snacks: { fill: '#fefce8', stroke: '#eab308', text: '#854d0e' },
  'Personal Care': { fill: '#faf5ff', stroke: '#a855f7', text: '#6b21a8' },
  Household: { fill: '#f0fdfa', stroke: '#14b8a6', text: '#115e59' },
};

export default function KnowledgeGraphVisualizer({ onSelectProduct }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNode, setSelectedNode] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [minLiftFilter, setMinLiftFilter] = useState(1.5);
  const svgRef = useRef(null);

  useEffect(() => {
    loadGraph();
  }, []);

  const loadGraph = async () => {
    try {
      setLoading(true);
      const data = await api.getKnowledgeRelationships();
      setGraphData(data);
      if (data.nodes.length > 0 && !selectedNode) {
        setSelectedNode(data.nodes[0]);
      }
    } catch (err) {
      console.error('Failed to load knowledge relationships:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter edges based on category and min lift
  const filteredEdges = useMemo(() => {
    return graphData.edges.filter(edge => {
      if (edge.lift < minLiftFilter) return false;
      if (selectedCategory === 'All') return true;
      const srcNode = graphData.nodes.find(n => n.id === edge.from);
      const tgtNode = graphData.nodes.find(n => n.id === edge.to);
      return srcNode?.category === selectedCategory || tgtNode?.category === selectedCategory;
    });
  }, [graphData, selectedCategory, minLiftFilter]);

  // Compute positions of nodes in a circular / grouped layout
  const positionedNodes = useMemo(() => {
    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.38;

    const visibleNodeIds = new Set();
    filteredEdges.forEach(e => {
      visibleNodeIds.add(e.from);
      visibleNodeIds.add(e.to);
    });

    // If a node is selected, keep it visible
    if (selectedNode) visibleNodeIds.add(selectedNode.id);

    const relevantNodes = graphData.nodes.filter(n => 
      selectedCategory === 'All' ? (visibleNodeIds.has(n.id) || graphData.nodes.length < 15) : n.category === selectedCategory || visibleNodeIds.has(n.id)
    );

    const total = relevantNodes.length || 1;
    return relevantNodes.map((node, index) => {
      const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
      return {
        ...node,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [graphData, filteredEdges, selectedCategory, selectedNode]);

  const nodeMap = useMemo(() => {
    const map = {};
    positionedNodes.forEach(n => { map[n.id] = n; });
    return map;
  }, [positionedNodes]);

  // Find incoming & outgoing rules for selected node
  const selectedNodeRules = useMemo(() => {
    if (!selectedNode) return { outgoing: [], incoming: [] };
    const outgoing = graphData.edges.filter(e => e.from === selectedNode.id);
    const incoming = graphData.edges.filter(e => e.to === selectedNode.id);
    return { outgoing, incoming };
  }, [selectedNode, graphData]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
      
      {/* Header bar */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-400">
              <Network className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Product Relationship Knowledge Graph
            </h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 rounded-full">
              Apriori Rule Network
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Visual representation of association rules mined from customer transactions. 
            Nodes represent products; directed arrows show: <em>IF customer buys [Source] → THEN recommend [Target]</em>.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.15, 1.6))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev - 0.15, 0.7))}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoomLevel(1); loadGraph(); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            title="Refresh Rules"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="font-bold text-slate-600 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-2.5 py-1 rounded-full font-semibold transition-all ${
              selectedCategory === 'All'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {graphData.categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Lift Slider */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-medium">Min Lift:</span>
          <input
            type="range"
            min="1.0"
            max="6.0"
            step="0.5"
            value={minLiftFilter}
            onChange={(e) => setMinLiftFilter(parseFloat(e.target.value))}
            className="w-24 accent-green-600 cursor-pointer"
          />
          <span className="font-bold text-green-700 font-mono w-10">
            {minLiftFilter.toFixed(1)}x
          </span>
        </div>
      </div>

      {/* Main visualization grid: SVG Network + Rule Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3">
        
        {/* SVG Network Canvas */}
        <div className="lg:col-span-2 relative bg-slate-950/5 min-h-[520px] flex items-center justify-center p-4 overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-200">
          
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
              <span className="font-semibold text-sm">Rendering knowledge graph...</span>
            </div>
          ) : (
            <svg
              ref={svgRef}
              viewBox="0 0 800 550"
              className="w-full h-full max-h-[550px] transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <defs>
                {/* Arrow markers */}
                <marker
                  id="arrow-default"
                  viewBox="0 0 10 10"
                  refX="18"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 9 5 L 0 9 z" fill="#94a3b8" />
                </marker>
                <marker
                  id="arrow-active"
                  viewBox="0 0 10 10"
                  refX="20"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#16a34a" />
                </marker>
                <marker
                  id="arrow-incoming"
                  viewBox="0 0 10 10"
                  refX="20"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#3b82f6" />
                </marker>
              </defs>

              {/* Background ambient grid pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="#cbd5e1" opacity="0.4" />
              </pattern>
              <rect width="800" height="550" fill="url(#grid)" />

              {/* Directed Edges */}
              {filteredEdges.map((edge) => {
                const source = nodeMap[edge.from];
                const target = nodeMap[edge.to];
                if (!source || !target) return null;

                const isSelectedOutgoing = selectedNode && selectedNode.id === edge.from;
                const isSelectedIncoming = selectedNode && selectedNode.id === edge.to;
                const isDimmed = selectedNode && !isSelectedOutgoing && !isSelectedIncoming;

                let strokeColor = '#cbd5e1';
                let markerId = 'arrow-default';
                let strokeWidth = Math.min(Math.max(edge.lift * 0.7, 1.2), 4);

                if (isSelectedOutgoing) {
                  strokeColor = '#16a34a';
                  markerId = 'arrow-active';
                  strokeWidth = 3;
                } else if (isSelectedIncoming) {
                  strokeColor = '#3b82f6';
                  markerId = 'arrow-incoming';
                  strokeWidth = 2.5;
                }

                // Midpoint for lift label
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;

                return (
                  <g key={edge.id} className="transition-opacity duration-200" opacity={isDimmed ? 0.2 : 1}>
                    <line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      markerEnd={`url(#${markerId})`}
                      strokeDasharray={isSelectedOutgoing ? 'none' : '4,2'}
                    />
                    {(isSelectedOutgoing || isSelectedIncoming || edge.lift >= 3.0) && (
                      <text
                        x={midX}
                        y={midY - 4}
                        fontSize="9"
                        fontWeight="bold"
                        fill={isSelectedOutgoing ? '#15803d' : '#64748b'}
                        textAnchor="middle"
                        className="pointer-events-none select-none font-mono"
                      >
                        {edge.lift}x
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Product Nodes */}
              {positionedNodes.map((node) => {
                const isSelected = selectedNode && selectedNode.id === node.id;
                const palette = CATEGORY_PALETTE[node.category] || { fill: '#f8fafc', stroke: '#64748b', text: '#1e293b' };
                const radius = isSelected ? 22 : 18;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer group select-none"
                  >
                    {/* Pulsing ring if selected */}
                    {isSelected && (
                      <circle
                        r={radius + 6}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        className="animate-ping opacity-30"
                      />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={radius}
                      fill={palette.fill}
                      stroke={isSelected ? '#16a34a' : palette.stroke}
                      strokeWidth={isSelected ? 3 : 2}
                      className="transition-all duration-200 shadow-lg group-hover:scale-110"
                    />

                    {/* Inner Initials / Icon */}
                    <text
                      textAnchor="middle"
                      dy="4"
                      fontSize={isSelected ? '11' : '10'}
                      fontWeight="bold"
                      fill={palette.text}
                      className="pointer-events-none"
                    >
                      {node.label.substring(0, 2).toUpperCase()}
                    </text>

                    {/* Label below node */}
                    <text
                      y={radius + 12}
                      fontSize="9"
                      fontWeight={isSelected ? '700' : '600'}
                      fill={isSelected ? '#15803d' : '#334155'}
                      textAnchor="middle"
                      className="pointer-events-none"
                    >
                      {node.label.length > 15 ? `${node.label.substring(0, 13)}...` : node.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}

          {/* Quick network stats overlay */}
          <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] text-slate-600 shadow-sm font-medium">
            <span>Nodes: <strong>{positionedNodes.length}</strong></span> | <span>Rules Shown: <strong>{filteredEdges.length}</strong></span>
          </div>
        </div>

        {/* Node & Knowledge Rule Inspector Panel */}
        <div className="p-6 bg-slate-50/70 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-5">
              
              {/* Selected Node Card */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                <img
                  src={selectedNode.image_url}
                  alt={selectedNode.label}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-md">
                    {selectedNode.category}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm mt-1 truncate">
                    {selectedNode.label}
                  </h3>
                  <div className="text-slate-900 font-bold text-sm">
                    ${selectedNode.price?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Outgoing Rules (Recommendations triggered when buying this item) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-green-700">
                    <Sparkles className="w-3.5 h-3.5" />
                    IF Customer Buys This Item
                  </span>
                  <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {selectedNodeRules.outgoing.length} Rules
                  </span>
                </h4>

                {selectedNodeRules.outgoing.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200">
                    No high-lift association rules with this antecedent at current threshold.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedNodeRules.outgoing.map(edge => {
                      const target = graphData.nodes.find(n => n.id === edge.to);
                      return (
                        <div
                          key={edge.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between hover:border-green-300 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <ArrowRight className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            <span className="font-semibold text-slate-800 truncate">
                              {target?.label || `Product #${edge.to}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px]">
                            <span className="bg-green-100 text-green-800 font-bold px-1.5 py-0.5 rounded font-mono">
                              Lift {edge.lift}x
                            </span>
                            <span className="text-slate-400 font-mono">
                              {(edge.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Incoming Rules (Products that recommend this item) */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Info className="w-3.5 h-3.5" />
                    Recommended When Customers Buy
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {selectedNodeRules.incoming.length} Rules
                  </span>
                </h4>

                {selectedNodeRules.incoming.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-dashed border-slate-200">
                    No antecedents targeting this product at current filter.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {selectedNodeRules.incoming.map(edge => {
                      const source = graphData.nodes.find(n => n.id === edge.from);
                      return (
                        <div
                          key={edge.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                        >
                          <span className="font-medium text-slate-700 truncate">
                            {source?.label || `Product #${edge.from}`}
                          </span>
                          <span className="bg-blue-100 text-blue-800 font-bold text-[10px] px-1.5 py-0.5 rounded font-mono">
                            Lift {edge.lift}x
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {onSelectProduct && (
                <button
                  onClick={() => onSelectProduct(selectedNode)}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Product Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Network className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">Click on any product node in the graph to inspect its semantic association rules.</p>
            </div>
          )}

          {/* Metric legend */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1 leading-snug">
            <p><strong>Support:</strong> Fraction of all orders containing both products.</p>
            <p><strong>Confidence:</strong> P(Recommend | Customer has Source item).</p>
            <p><strong>Lift &gt; 1:</strong> Positive correlation (greater than chance).</p>
          </div>

        </div>

      </div>

    </div>
  );
}
