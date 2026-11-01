import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRightLeft, Award, Film, Play, Heart, Sparkles, Check } from 'lucide-react';
import { GENRE_LABELS, FAMILY_GENRES, isFamily, isNewcomer, realScenes } from '../constants';

export default function CompareModal({
  performerA,
  performerB,
  allPerformers,
  onClose,
  onSelectA,
  onSelectB,
  onOpenDossier
}) {
  const [searchA, setSearchA] = useState('');
  const [searchB, setSearchB] = useState('');
  const [dropdownA, setDropdownA] = useState(false);
  const [dropdownB, setDropdownB] = useState(false);

  if (!performerA || !performerB) return null;

  const scenesA = realScenes(performerA);
  const scenesB = realScenes(performerB);

  // Common genres
  const genresA = new Set(performerA.genres || []);
  const genresB = new Set(performerB.genres || []);
  const commonGenres = [...genresA].filter(g => genresB.has(g) && FAMILY_GENRES.has(g));

  const filteredPerformersA = allPerformers
    .filter(p => p.name.toLowerCase().includes(searchA.toLowerCase()))
    .slice(0, 6);

  const filteredPerformersB = allPerformers
    .filter(p => p.name.toLowerCase().includes(searchB.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative z-10 w-full max-w-4xl max-h-[90vh] glass-raised rounded-3xl border border-[var(--accent-medium)] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-6 border-b border-[var(--line)] bg-[#181219] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold gold-gradient-text">
                Head-to-Head Performer Comparison
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Comparing career milestones, scenario genres, physical attributes, and verified releases.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#201822] text-[var(--muted)] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Performers Header Showcase */}
          <div className="grid grid-cols-2 gap-4">
            {/* Side A */}
            <div className="glass rounded-2xl p-4 border border-[var(--line)] text-center relative">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[var(--accent)] mb-3 bg-[#19131a]">
                <img
                  src={`./avatars/${performerA.id}.jpg`}
                  alt=""
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(performerA.name.replace(/\s+/g, '_'))}.jpg`;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-serif text-xl font-bold text-white truncate">{performerA.name}</h4>
              <p className="text-xs text-[var(--muted)]">{performerA.nationality || 'American'} · Debut {performerA.active?.from || '—'}</p>

              <button
                onClick={() => setDropdownA(!dropdownA)}
                className="mt-2 text-[11px] text-[var(--accent)] underline hover:text-white"
              >
                Change Starlet ▾
              </button>

              {dropdownA && (
                <div className="absolute top-full left-0 right-0 z-30 bg-[#161017] border border-[var(--line)] rounded-xl p-2 shadow-2xl mt-1 text-left">
                  <input
                    type="text"
                    value={searchA}
                    onChange={e => setSearchA(e.target.value)}
                    placeholder="Search performer..."
                    className="w-full bg-[#0d090d] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-white mb-1.5 outline-none"
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {filteredPerformersA.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { onSelectA(p); setDropdownA(false); }}
                        className="w-full text-left px-2 py-1 text-xs text-[var(--muted)] hover:text-white hover:bg-[#221824] rounded truncate"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Side B */}
            <div className="glass rounded-2xl p-4 border border-[var(--line)] text-center relative">
              <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[var(--accent)] mb-3 bg-[#19131a]">
                <img
                  src={`./avatars/${performerB.id}.jpg`}
                  alt=""
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(performerB.name.replace(/\s+/g, '_'))}.jpg`;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <h4 className="font-serif text-xl font-bold text-white truncate">{performerB.name}</h4>
              <p className="text-xs text-[var(--muted)]">{performerB.nationality || 'American'} · Debut {performerB.active?.from || '—'}</p>

              <button
                onClick={() => setDropdownB(!dropdownB)}
                className="mt-2 text-[11px] text-[var(--accent)] underline hover:text-white"
              >
                Change Starlet ▾
              </button>

              {dropdownB && (
                <div className="absolute top-full left-0 right-0 z-30 bg-[#161017] border border-[var(--line)] rounded-xl p-2 shadow-2xl mt-1 text-left">
                  <input
                    type="text"
                    value={searchB}
                    onChange={e => setSearchB(e.target.value)}
                    placeholder="Search performer..."
                    className="w-full bg-[#0d090d] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-white mb-1.5 outline-none"
                  />
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {filteredPerformersB.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { onSelectB(p); setDropdownB(false); }}
                        className="w-full text-left px-2 py-1 text-xs text-[var(--muted)] hover:text-white hover:bg-[#221824] rounded truncate"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metric Comparison Rows */}
          <div className="space-y-2">
            {/* Age */}
            <div className="grid grid-cols-3 items-center p-3 rounded-xl bg-[#140f15] border border-[var(--line)] text-xs">
              <div className="text-center font-bold font-mono text-white text-sm">{performerA.age || '?'}</div>
              <div className="text-center text-[var(--muted)] font-semibold uppercase text-[10px] tracking-wider">Age</div>
              <div className="text-center font-bold font-mono text-white text-sm">{performerB.age || '?'}</div>
            </div>

            {/* Career Debut */}
            <div className="grid grid-cols-3 items-center p-3 rounded-xl bg-[#140f15] border border-[var(--line)] text-xs">
              <div className="text-center font-bold font-mono text-white text-sm">{performerA.active?.from || '—'}</div>
              <div className="text-center text-[var(--muted)] font-semibold uppercase text-[10px] tracking-wider">Career Debut</div>
              <div className="text-center font-bold font-mono text-white text-sm">{performerB.active?.from || '—'}</div>
            </div>

            {/* Total Verified Scenes */}
            <div className="grid grid-cols-3 items-center p-3 rounded-xl bg-[#140f15] border border-[var(--line)] text-xs">
              <div className="text-center font-bold font-mono text-[#4ade80] text-sm">{scenesA.length} releases</div>
              <div className="text-center text-[var(--muted)] font-semibold uppercase text-[10px] tracking-wider">Verified Releases</div>
              <div className="text-center font-bold font-mono text-[#4ade80] text-sm">{scenesB.length} releases</div>
            </div>

            {/* Hair */}
            <div className="grid grid-cols-3 items-center p-3 rounded-xl bg-[#140f15] border border-[var(--line)] text-xs">
              <div className="text-center font-medium capitalize text-white">{performerA.hair || '—'}</div>
              <div className="text-center text-[var(--muted)] font-semibold uppercase text-[10px] tracking-wider">Hair Color</div>
              <div className="text-center font-medium capitalize text-white">{performerB.hair || '—'}</div>
            </div>

            {/* Body */}
            <div className="grid grid-cols-3 items-center p-3 rounded-xl bg-[#140f15] border border-[var(--line)] text-xs">
              <div className="text-center font-medium capitalize text-white">{performerA.body || '—'}</div>
              <div className="text-center text-[var(--muted)] font-semibold uppercase text-[10px] tracking-wider">Body Type</div>
              <div className="text-center font-medium capitalize text-white">{performerB.body || '—'}</div>
            </div>
          </div>

          {/* Shared Family Scenario Genres */}
          {commonGenres.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[rgba(212,168,83,0.12)] to-[rgba(179,134,52,0.06)] border border-[var(--accent-medium)] text-center">
              <span className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider block mb-2">
                Shared Scenario Overlap ({commonGenres.length})
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                {commonGenres.map(g => (
                  <span
                    key={g}
                    className="text-xs px-2.5 py-1 rounded-full bg-[#1b151c] text-[#4ade80] border border-[#4ade80]/30 font-medium"
                  >
                    ★ {GENRE_LABELS[g] || g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Direct Profile Access Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => onOpenDossier(performerA)}
              className="py-2.5 rounded-xl bg-[#1d171e] text-[var(--accent)] border border-[var(--accent)]/40 hover:bg-[var(--accent)] hover:text-black font-semibold text-xs transition-all"
            >
              Open {performerA.name}'s Dossier →
            </button>
            <button
              onClick={() => onOpenDossier(performerB)}
              className="py-2.5 rounded-xl bg-[#1d171e] text-[var(--accent)] border border-[var(--accent)]/40 hover:bg-[var(--accent)] hover:text-black font-semibold text-xs transition-all"
            >
              Open {performerB.name}'s Dossier →
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

