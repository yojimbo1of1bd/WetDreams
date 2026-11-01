import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Award, Heart, ChevronRight } from 'lucide-react';
import { isFamily, isNewcomer, realScenes } from '../constants';

export default function SpotlightHero({ performer, onOpenDossier }) {
  if (!performer) return null;
  const p = performer;
  const scenes = realScenes(p);
  const fam = isFamily(p);
  const nw = isNewcomer(p);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden glass-raised border border-[var(--accent-medium)] shadow-2xl p-6 sm:p-8 mb-8"
    >
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#fb7185]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40">
              <Sparkles className="w-3 h-3" /> Featured Starlet Spotlight
            </span>
            {fam && (
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full badge-family flex items-center gap-1">
                <Heart className="w-3 h-3" /> Family Icon
              </span>
            )}
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white mb-2">
            {p.name}
          </h2>

          <p className="text-xs sm:text-sm text-[var(--muted)] line-clamp-2 max-w-2xl mb-4 font-light">
            {p.expanded || p.notes || 'Distinguished performer featured across premier studio productions.'}
          </p>

          <div className="flex items-center gap-4 text-xs text-[#d6ccc2] flex-wrap mb-4">
            {p.age && <span>Age <strong>{p.age}</strong></span>}
            {p.active?.from && <span>Debut <strong>{p.active.from}</strong></span>}
            {p.nationality && <span>Origin <strong>{p.nationality}</strong></span>}
            <span>Releases <strong>{scenes.length} Verified</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenDossier(p)}
              className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-[#09070a] font-bold text-xs hover:bg-[var(--accent-light)] transition-all shadow-lg flex items-center gap-1.5"
            >
              <span>Explore Complete Dossier</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Avatar Portrait */}
        <div
          onClick={() => onOpenDossier(p)}
          className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-2 border-[var(--accent)] shadow-2xl flex-shrink-0 cursor-pointer group bg-[#1a141b]"
        >
          <img
            src={`./avatars/${p.id}.jpg`}
            alt={p.name}
            onError={e => {
              e.target.onerror = null;
              e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}.jpg`;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3">
            <span className="text-[11px] font-bold text-white uppercase tracking-wider">
              VIP Profile
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
