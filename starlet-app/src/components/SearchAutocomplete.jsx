import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Sparkles, Film, ArrowRight } from 'lucide-react';
import { isFamily, isNewcomer, realScenes } from '../constants';
import StarletAvatar from './StarletAvatar';

export default function SearchAutocomplete({
  isOpen,
  query,
  performers,
  onSelectPerformer
}) {
  if (!isOpen || !query || query.trim().length < 2) return null;

  const matches = performers
    .filter(p => {
      const q = query.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.notes && p.notes.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q))) ||
        (p.scenes && p.scenes.some(s => s.title && s.title.toLowerCase().includes(q)))
      );
    })
    .slice(0, 6);

  if (!matches.length) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="absolute top-full left-0 right-0 z-50 mt-2 glass-raised rounded-2xl border border-[var(--line-strong)] shadow-2xl overflow-hidden p-2"
      >
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--accent)] px-3 py-1 border-b border-[var(--line)] flex items-center justify-between">
          <span>Search Suggestions</span>
          <span className="text-[var(--muted)]">{matches.length} matches</span>
        </div>

        <div className="divide-y divide-[var(--line)]">
          {matches.map(p => {
            const fam = isFamily(p);
            const nw = isNewcomer(p);
            const sc = realScenes(p);
            return (
              <button
                key={p.id}
                onClick={() => onSelectPerformer(p)}
                className="w-full flex items-center justify-between p-2.5 hover:bg-[#201822] rounded-xl transition-colors text-left group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <StarletAvatar
                    id={p.id}
                    name={p.name}
                    hair={p.hair}
                    size="sm"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-[var(--accent)] transition-colors truncate">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
                      {p.age && <span>Age {p.age}</span>}
                      {p.nationality && <span>· {p.nationality}</span>}
                      {fam && <span className="text-[#fb7185] font-semibold">· Family</span>}
                      {nw && <span className="text-[#60a5fa] font-semibold">· New</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] font-mono text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-full">
                    {sc.length} scenes
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

