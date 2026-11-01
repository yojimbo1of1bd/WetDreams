import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Search, Sparkles, Users, Award, ExternalLink, RefreshCw } from 'lucide-react';

export default function CoStarConstellation({ onOpenDossier, initialFocusId }) {
  const [graphData, setGraphData] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(initialFocusId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Load graph data
  useEffect(() => {
    fetch('./costar-graph.json')
      .then(res => {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then(data => {
        setGraphData(data);
        if (!selectedNodeId && data.nodes && data.nodes.length > 0) {
          // Select most connected starlet
          const sorted = [...data.nodes].sort((a, b) => (b.degree || 0) - (a.degree || 0));
          setSelectedNodeId(sorted[0].id);
        }
      })
      .catch(err => console.error('Failed to load co-star graph:', err))
      .finally(() => setLoading(false));
  }, [initialFocusId]);

  // Lookup Maps
  const nodeMap = useMemo(() => {
    if (!graphData?.nodes) return new Map();
    return new Map(graphData.nodes.map(n => [n.id, n]));
  }, [graphData]);

  // Find Neighbors & Edges for selected node
  const activeConstellation = useMemo(() => {
    if (!graphData || !selectedNodeId) return { center: null, neighbors: [], edges: [] };
    const center = nodeMap.get(selectedNodeId);
    if (!center) return { center: null, neighbors: [], edges: [] };

    const matchingEdges = (graphData.edges || []).filter(
      e => e.source === selectedNodeId || e.target === selectedNodeId
    );

    const neighborIds = new Set();
    matchingEdges.forEach(e => {
      if (e.source === selectedNodeId) neighborIds.add(e.target);
      if (e.target === selectedNodeId) neighborIds.add(e.source);
    });

    const neighbors = [...neighborIds].map(id => nodeMap.get(id)).filter(Boolean);

    return { center, neighbors, edges: matchingEdges };
  }, [graphData, selectedNodeId, nodeMap]);

  // Search filter list
  const searchResults = useMemo(() => {
    if (!searchQuery || !graphData?.nodes) return [];
    const q = searchQuery.toLowerCase();
    return graphData.nodes.filter(n => n.name.toLowerCase().includes(q)).slice(0, 8);
  }, [searchQuery, graphData]);

  if (loading) {
    return (
      <div className="glass rounded-3xl p-12 text-center border border-[var(--line)]">
        <Sparkles className="w-8 h-8 text-[var(--accent)] animate-spin mx-auto mb-3" />
        <p className="text-sm text-zinc-400 font-mono">Mapping celestial co-star graph...</p>
      </div>
    );
  }

  if (!graphData) return null;

  const { center, neighbors, edges } = activeConstellation;

  // Layout positions in polar coordinates
  const radius = 170;
  const centerX = 250;
  const centerY = 250;

  return (
    <div className="glass rounded-3xl p-6 border border-[var(--line)] relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[var(--line)]">
        <div>
          <h3 className="font-serif text-xl font-bold text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[var(--accent)]" />
            Co-Star Collaboration Constellation
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">
            Visualizing verified multi-performer productions, shared scenes, and network affinities across {graphData.totalNodes} starlets.
          </p>
        </div>

        {/* Node Search Bar */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-[#120d14] px-3 py-1.5 rounded-full border border-[var(--line)] focus-within:border-[var(--accent)]">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search starlet node..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-zinc-500 outline-none w-44"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#171019] border border-[var(--accent)]/30 rounded-2xl p-2 shadow-2xl z-40 space-y-1">
              {searchResults.map(n => (
                <button
                  key={n.id}
                  onClick={() => {
                    setSelectedNodeId(n.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[var(--accent)] hover:text-black text-xs text-white flex items-center justify-between transition-colors"
                >
                  <span className="font-medium">{n.name}</span>
                  <span className="text-[10px] text-zinc-400 font-mono">{n.degree} links</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Visualizer Area */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Interactive SVG Network Canvas */}
        <div className="relative w-full max-w-[500px] aspect-square flex items-center justify-center bg-[#0d090e] rounded-3xl border border-[var(--line)] shadow-inner overflow-hidden">
          {/* Ambient Starlight Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,168,83,0.08)_0,transparent_70%)] pointer-events-none" />

          <svg viewBox="0 0 500 500" className="w-full h-full">
            {/* Draw Concentric Orbit Rings */}
            <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
            <circle cx={centerX} cy={centerY} r={radius * 0.6} fill="none" stroke="rgba(255,255,255,0.04)" />

            {/* Draw Golden Filament Edges */}
            {neighbors.map((nb, idx) => {
              const angle = (idx / neighbors.length) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);

              return (
                <line
                  key={nb.id}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="rgba(212, 168, 83, 0.4)"
                  strokeWidth="2"
                  strokeDasharray="2 2"
                  className="animate-pulse"
                />
              );
            })}

            {/* Draw Neighbor Nodes */}
            {neighbors.map((nb, idx) => {
              const angle = (idx / neighbors.length) * 2 * Math.PI - Math.PI / 2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);

              return (
                <g
                  key={nb.id}
                  onClick={() => setSelectedNodeId(nb.id)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={22}
                    fill="#1e1520"
                    stroke="#d4a853"
                    strokeWidth="1.5"
                    className="group-hover:stroke-white group-hover:scale-110 transition-all drop-shadow-[0_0_8px_rgba(212,168,83,0.3)]"
                  />
                  <text
                    x={x}
                    y={y + 36}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none select-none font-sans"
                  >
                    {nb.name.split(' ')[0]}
                  </text>
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fill="#d4a853"
                    fontSize="9"
                    fontWeight="bold"
                    className="pointer-events-none select-none font-mono"
                  >
                    {nb.name.split(' ').map(w => w[0]).join('')}
                  </text>
                </g>
              );
            })}

            {/* Draw Center Focal Starlet Node */}
            {center && (
              <g className="cursor-pointer">
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={38}
                  fill="url(#goldGradient)"
                  className="drop-shadow-[0_0_25px_rgba(212,168,83,0.6)]"
                />
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={34}
                  fill="#0f0b11"
                  stroke="#fce5a9"
                  strokeWidth="2"
                />
                <text
                  x={centerX}
                  y={centerY + 5}
                  textAnchor="middle"
                  fill="#fce5a9"
                  fontSize="13"
                  fontWeight="bold"
                  className="pointer-events-none select-none font-serif"
                >
                  {center.name.split(' ').map(w => w[0]).join('')}
                </text>
                <text
                  x={centerX}
                  y={centerY + 54}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="12"
                  fontWeight="bold"
                  className="pointer-events-none select-none font-serif"
                >
                  {center.name}
                </text>
              </g>
            )}

            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fce5a9" />
                <stop offset="50%" stopColor="#d4a853" />
                <stop offset="100%" stopColor="#8c611b" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right: Selected Node Details & Co-Star Cards */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {center && (
            <div className="bg-[#140e16] rounded-2xl p-4 border border-[var(--line)]">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--accent)] font-bold">
                    Primary Celestial Focal Node
                  </span>
                  <h4 className="font-serif text-2xl font-bold text-white mt-0.5">
                    {center.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">
                    Direct Network Collaborations: <span className="font-bold text-white">{neighbors.length} performers</span>
                  </p>
                </div>

                {onOpenDossier && (
                  <button
                    onClick={() => onOpenDossier({ id: center.id, name: center.name })}
                    className="px-3.5 py-1.5 rounded-full bg-[var(--accent)] text-black font-bold text-xs hover:bg-[var(--accent-light)] flex items-center gap-1.5 transition-colors"
                  >
                    <span>Full Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Collaborator List */}
          <div>
            <h5 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
              Verified Co-Star Collaborators ({neighbors.length})
            </h5>

            {neighbors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
                {neighbors.map(nb => (
                  <button
                    key={nb.id}
                    onClick={() => setSelectedNodeId(nb.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#130d15] hover:bg-[#201623] border border-[var(--line)] hover:border-[var(--accent-medium)] text-left transition-all group"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate group-hover:text-[var(--accent)] transition-colors">
                        {nb.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono">
                        Network Degree: {nb.degree || 1}
                      </p>
                    </div>

                    <span className="text-[11px] text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      Focus →
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic p-4 bg-[#120d14] rounded-xl text-center">
                Solo catalog performer · No direct multi-actor records logged.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

