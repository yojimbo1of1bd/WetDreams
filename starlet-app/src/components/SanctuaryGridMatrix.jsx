import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Shield, Lock, Check, Zap, Heart, Flame, Users, Dices, Skull, Church } from 'lucide-react';

/**
 * SanctuaryGridMatrix
 * 
 * High-Precision Geometric Matrix Grid for mobile & desktop.
 * Replaces loose stardust freehand drawing with a tactile 3x3 node matrix.
 * Recognizes letter runes (O, I, L, C, M, S, Z, △) or direct glyph selection.
 */
export default function SanctuaryGridMatrix({ onUnlockDomain, onClose }) {
  const containerRef = useRef(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [currentPointer, setCurrentPointer] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [recognizedRune, setRecognizedRune] = useState(null);

  // 3x3 Matrix Grid Node Definitions (percentages for responsive scaling)
  const MATRIX_NODES = [
    { id: 0, row: 0, col: 0, x: 20, y: 20 },
    { id: 1, row: 0, col: 1, x: 50, y: 20 },
    { id: 2, row: 0, col: 2, x: 80, y: 20 },
    { id: 3, row: 1, col: 0, x: 20, y: 50 },
    { id: 4, row: 1, col: 1, x: 50, y: 50 },
    { id: 5, row: 1, col: 2, x: 80, y: 50 },
    { id: 6, row: 2, col: 0, x: 20, y: 80 },
    { id: 7, row: 2, col: 1, x: 50, y: 80 },
    { id: 8, row: 2, col: 2, x: 80, y: 80 }
  ];

  // Domain Rune Catalog
  const RUNE_TARGETS = [
    { key: 'master_hub', letter: 'O', name: 'Master Underworld Hub', icon: Sparkles, color: 'text-amber-400' },
    { key: 'domain_tier1', letter: 'I', name: 'Tier 1: Soft GND Sanctum', icon: Heart, color: 'text-rose-400' },
    { key: 'domain_tier2', letter: 'L', name: 'Tier 2: Reddit Crushes', icon: Flame, color: 'text-amber-300' },
    { key: 'domain_family_archetypes', letter: 'M', name: 'Family Swaps & Archetypes', icon: Users, color: 'text-emerald-400' },
    { key: 'domain_games_bets', letter: 'S', name: 'Games, Bets & Study', icon: Dices, color: 'text-indigo-400' },
    { key: 'domain_abyssal_nasty', letter: 'Z', name: 'The Abyssal Vault', icon: Skull, color: 'text-red-500' },
    { key: 'domain_institutional_niche', letter: 'C', name: 'The Cloister & Church', icon: Church, color: 'text-purple-300' },
    { key: 'domain_permission_escalation', letter: '△', name: 'Escalation Sanctum', icon: Zap, color: 'text-orange-400' }
  ];

  // Haptic Feedback Helper
  const triggerHaptic = (ms = 30) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(ms);
      }
    } catch {}
  };

  // Convert client coordinates to percentage within the grid box
  const getGridCoords = useCallback((clientX, clientY) => {
    if (!containerRef.current) return null;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x, y };
  }, []);

  // Check if pointer is near a node (within radius)
  const findNearbyNode = useCallback((coords, threshold = 12) => {
    if (!coords) return null;
    for (const node of MATRIX_NODES) {
      const dist = Math.hypot(coords.x - node.x, coords.y - node.y);
      if (dist <= threshold) {
        return node.id;
      }
    }
    return null;
  }, []);

  // Pattern Recognition Engine
  const evaluatePattern = useCallback((sequence) => {
    if (!sequence || sequence.length < 2) return null;
    const str = sequence.join('-');

    // Letter 'I' (Vertical straight line)
    if (str === '1-4-7' || str === '0-3-6' || str === '2-5-8' || str === '7-4-1') {
      return RUNE_TARGETS.find(r => r.letter === 'I');
    }

    // Letter 'L' (Down then right)
    if (str === '0-3-6-7-8' || str === '1-4-7-8' || str === '0-3-6-7') {
      return RUNE_TARGETS.find(r => r.letter === 'L');
    }

    // Letter 'C' (Right to left, down, then right)
    if (str === '2-1-0-3-6-7-8' || str === '1-0-3-6-7' || str === '2-1-0-3-6-7') {
      return RUNE_TARGETS.find(r => r.letter === 'C');
    }

    // Letter 'O' (Perimeter Box / Loop)
    if (
      str === '0-1-2-5-8-7-6-3-0' || str === '1-2-5-8-7-6-3-0-1' ||
      str === '0-3-6-7-8-5-2-1-0' || str === '1-0-3-6-7-8-5-2-1' ||
      (sequence.length >= 7 && sequence[0] === sequence[sequence.length - 1])
    ) {
      return RUNE_TARGETS.find(r => r.letter === 'O');
    }

    // Letter 'Z' (Top right, diagonal down-left, right)
    if (str === '0-1-2-4-6-7-8' || str === '0-1-2-6-7-8' || str === '0-2-4-6-8') {
      return RUNE_TARGETS.find(r => r.letter === 'Z');
    }

    // Letter 'M' (Up, down-diagonal, up-diagonal, down)
    if (str === '6-3-0-4-2-5-8' || str === '6-3-4-5-8' || str === '6-0-4-2-8') {
      return RUNE_TARGETS.find(r => r.letter === 'M');
    }

    // Letter 'S' (S-curve)
    if (str === '2-1-0-3-4-5-8-7-6' || str === '1-0-3-4-5-8-7' || str === '2-1-4-7-6') {
      return RUNE_TARGETS.find(r => r.letter === 'S');
    }

    // Triangle '△'
    if (str === '1-6-8-1' || str === '1-8-6-1' || str === '4-6-8-4' || str === '1-7-8-1') {
      return RUNE_TARGETS.find(r => r.letter === '△');
    }

    return null;
  }, []);

  // Handle successful match
  const handleMatchRune = (target) => {
    triggerHaptic([60, 40, 80]);
    setRecognizedRune(target);

    setTimeout(() => {
      if (typeof onUnlockDomain === 'function') {
        onUnlockDomain(target.key);
      }
    }, 700);
  };

  // Pointer Event Handlers
  const handlePointerDown = (e) => {
    setIsDrawing(true);
    const coords = getGridCoords(e.clientX, e.clientY);
    if (!coords) return;
    setCurrentPointer(coords);

    const nodeId = findNearbyNode(coords);
    if (nodeId !== null) {
      setSelectedNodes([nodeId]);
      triggerHaptic(25);
    } else {
      setSelectedNodes([]);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    const coords = getGridCoords(e.clientX, e.clientY);
    if (!coords) return;
    setCurrentPointer(coords);

    const nodeId = findNearbyNode(coords);
    if (nodeId !== null && !selectedNodes.includes(nodeId)) {
      setSelectedNodes(prev => [...prev, nodeId]);
      triggerHaptic(20);
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    setCurrentPointer(null);

    const matched = evaluatePattern(selectedNodes);
    if (matched) {
      handleMatchRune(matched);
    } else {
      // Clear after brief delay if no match
      setTimeout(() => setSelectedNodes([]), 400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060309]/98 backdrop-blur-3xl flex flex-col items-center justify-between p-4 sm:p-6 select-none overflow-y-auto no-scrollbar">
      {/* Top Header */}
      <div className="w-full max-w-lg flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-serif font-bold text-xs shadow-md shadow-amber-400/20">
            🜏
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              SANCTUARY GRID MATRIX
            </div>
            <div className="text-xs text-zinc-400 font-mono">Connect nodes or tap rune below</div>
          </div>
        </div>

        <button
          onClick={onClose}
          type="button"
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
          title="Return to Sanctuary Clock"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit Grid</span>
        </button>
      </div>

      {/* Center Matrix Drawing Box */}
      <div className="flex-1 flex flex-col items-center justify-center my-4 w-full max-w-sm">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative aspect-square w-full max-w-[320px] rounded-3xl bg-black/80 border-2 border-amber-400/40 shadow-[0_0_50px_rgba(212,175,55,0.15)] touch-none cursor-crosshair overflow-hidden"
        >
          {/* Ambient Occult Geometric Compass in Background */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-15">
            <div className="w-48 h-48 rounded-full border border-amber-400/60" />
            <div className="absolute w-32 h-32 rounded-full border border-dashed border-amber-400/50" />
            <div className="absolute w-full h-[1px] bg-amber-400/30" />
            <div className="absolute h-full w-[1px] bg-amber-400/30" />
          </div>

          {/* SVG Connector Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Committed connected segments */}
            {selectedNodes.map((nodeId, idx) => {
              if (idx === 0) return null;
              const prevNode = MATRIX_NODES[selectedNodes[idx - 1]];
              const currNode = MATRIX_NODES[nodeId];
              return (
                <line
                  key={`${prevNode.id}-${currNode.id}`}
                  x1={`${prevNode.x}%`}
                  y1={`${prevNode.y}%`}
                  x2={`${currNode.x}%`}
                  y2={`${currNode.y}%`}
                  stroke="rgba(245, 158, 11, 0.95)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 0 8px rgba(245,158,11,0.8))' }}
                />
              );
            })}

            {/* Live trailing elastic line to finger/cursor */}
            {isDrawing && currentPointer && selectedNodes.length > 0 && (
              (() => {
                const lastNode = MATRIX_NODES[selectedNodes[selectedNodes.length - 1]];
                return (
                  <line
                    x1={`${lastNode.x}%`}
                    y1={`${lastNode.y}%`}
                    x2={`${currentPointer.x}%`}
                    y2={`${currentPointer.y}%`}
                    stroke="rgba(251, 191, 36, 0.6)"
                    strokeWidth="2.5"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />
                );
              })()
            )}
          </svg>

          {/* 9 Matrix Nodes */}
          {MATRIX_NODES.map(node => {
            const isSelected = selectedNodes.includes(node.id);
            const isLast = selectedNodes[selectedNodes.length - 1] === node.id;

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              >
                {/* Outer Ring */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isSelected
                      ? 'border-2 border-amber-300 bg-amber-400/20 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-110'
                      : 'border border-white/15 bg-white/5'
                  }`}
                >
                  {/* Central Node Dot */}
                  <div
                    className={`w-3.5 h-3.5 rounded-full transition-transform duration-150 ${
                      isSelected
                        ? isLast
                          ? 'bg-amber-300 scale-125 shadow-[0_0_12px_rgba(245,158,11,1)] animate-ping'
                          : 'bg-amber-400'
                        : 'bg-white/40'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Feedback Notification Banner */}
        <div className="h-8 mt-3 flex items-center justify-center">
          {recognizedRune ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-4 py-1 rounded-full bg-amber-400 text-black font-mono font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/50"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Rune '{recognizedRune.letter}': {recognizedRune.name}</span>
            </motion.div>
          ) : selectedNodes.length > 0 ? (
            <span className="text-[11px] font-mono text-amber-300 tracking-wider">
              Tracing nodes: {selectedNodes.join(' → ')}
            </span>
          ) : (
            <span className="text-[11px] font-mono text-zinc-500">
              Draw letter rune or tap below to warp
            </span>
          )}
        </div>
      </div>

      {/* Tactile Fast-Tap Rune Chips (Guarantees 100% Reliable Mobile Access) */}
      <div className="w-full max-w-lg mb-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2 font-bold flex items-center justify-between px-1">
          <span>Direct Rune Selection (1-Tap):</span>
          <span className="text-amber-400/80">Zero Lag</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RUNE_TARGETS.map(rune => {
            const Icon = rune.icon;
            return (
              <button
                key={rune.key}
                onClick={() => handleMatchRune(rune)}
                type="button"
                className="px-3 py-2 rounded-xl bg-[#110a16] border border-amber-400/20 hover:border-amber-400/80 hover:bg-amber-400/10 active:scale-95 transition-all text-left flex items-center gap-2 cursor-pointer group shadow-md"
              >
                <div className="w-6 h-6 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-xs font-mono font-extrabold text-amber-300 group-hover:border-amber-400">
                  {rune.letter}
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold text-zinc-200 group-hover:text-amber-200 truncate">
                    {rune.name.split(':')[0]}
                  </div>
                  <div className="text-[9px] font-mono text-zinc-500 truncate">Tap to warp</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

