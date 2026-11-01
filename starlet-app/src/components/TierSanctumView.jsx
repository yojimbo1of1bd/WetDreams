import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Star, Film, ArrowRight, Play, Eye } from 'lucide-react';
import SubdomainShelf from './SubdomainShelf';

/**
 * TierSanctumView
 * 
 * Specialized luxury sanctum rendering either Tier 1 (Soft / GND)
 * or Tier 2 (Cult Glamour & Reddit Romantic Crushes).
 * Features direct scene filmography shelves with continuous slotted video scrub montages,
 * life quotations, and community praise notes.
 */
export default function TierSanctumView({
  tier,
  domainData,
  performers = [],
  onOpenDossier,
  onPlayScene
}) {
  const isTier1 = tier === 'tier1';
  const [selectedGroup, setSelectedGroup] = useState('all');

  const tier1Performers = domainData?.performers || [];
  const coreTier2 = domainData?.corePerformers || [];
  const redditTier2 = domainData?.redditCrushPerformers || [];

  // Filtering for Tier 2
  const filteredReddit = useMemo(() => {
    if (selectedGroup === 'all') return redditTier2;
    return redditTier2.filter(p => p.group === selectedGroup);
  }, [selectedGroup, redditTier2]);

  // Aggregate top romantic / softcore scenes for Tier 1
  const tier1FeaturedScenes = useMemo(() => {
    const scenes = [];
    const seenUrls = new Set();

    tier1Performers.forEach(tp => {
      const p = performers.find(cp => cp.id === tp.id || cp.name?.toLowerCase() === tp.name.toLowerCase());
      if (p && Array.isArray(p.scenes)) {
        p.scenes.slice(0, 30).forEach(s => {
          const key = s.url || s.title;
          if (!seenUrls.has(key)) {
            seenUrls.add(key);
            scenes.push({
              ...s,
              performer: p.name,
              performerId: p.id,
              performers: [p.name, ...(s.costars || [])]
            });
          }
        });
      }
    });

    return scenes;
  }, [tier1Performers, performers]);

  // Aggregate top voted scenes for Tier 2 Reddit Crushes
  const tier2FeaturedScenes = useMemo(() => {
    const scenes = [];
    const seenUrls = new Set();

    redditTier2.slice(0, 25).forEach(rp => {
      const p = performers.find(cp => cp.id === rp.id || cp.name?.toLowerCase() === rp.name.toLowerCase());
      if (p && Array.isArray(p.scenes)) {
        p.scenes.slice(0, 8).forEach(s => {
          const key = s.url || s.title;
          if (!seenUrls.has(key)) {
            seenUrls.add(key);
            scenes.push({
              ...s,
              performer: p.name,
              performerId: p.id,
              performers: [p.name, ...(s.costars || [])]
            });
          }
        });
      }
    });

    return scenes;
  }, [redditTier2, performers]);

  return (
    <div className="py-6 space-y-8 select-none">
      {/* Sanctum Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#140b18] via-[#1a0f20] to-[#0c070f] border border-amber-400/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isTier1 ? 'SECLUDED SANCTUM · TIER 1' : 'RESTRICTED ARCHIVE · TIER 2'}</span>
              </span>
              <span className="text-zinc-400 font-mono text-xs">
                {isTier1 ? `${tier1Performers.length} Softcore / GND Divas` : `${coreTier2.length + redditTier2.length} Icons & Community Muses`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif tracking-wide">
              {domainData?.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
              {domainData?.description}
            </p>
          </div>

          {/* Tier Specific Pill Accent */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-black/60 border border-amber-400/30 backdrop-blur-md">
            <span className="text-3xl font-serif text-amber-300 font-bold">
              {isTier1 ? 'TIER 1' : 'TIER 2'}
            </span>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mt-0.5">
              {isTier1 ? 'Soft / Next Door' : 'Reddit Crushes + Cult'}
            </span>
          </div>
        </div>

        {/* Filter Chips for Tier 2 Groups */}
        {!isTier1 && (
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
            {[
              { id: 'all', label: `All Icons (${coreTier2.length + redditTier2.length})` },
              { id: 'Top Voted & Multi-Mentioned', label: '★ Top Voted Reddit Favorites (14)' },
              { id: 'Playful & Contemporary', label: '🌸 Contemporary Crushes (36)' },
              { id: 'Glamour, Matriarch & Iconic', label: '👑 Glamour & Matriarchs (45)' }
            ].map(group => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all cursor-pointer ${
                  selectedGroup === group.id
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-bold scale-[1.02]'
                    : 'bg-black/60 text-zinc-400 border border-white/10 hover:text-white hover:border-amber-400/40'
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FEATURED SCENE SHELVES */}
      {isTier1 ? (
        <div className="space-y-4">
          <SubdomainShelf
            subdomain={{
              id: 'tier1_signature',
              title: '🌸 Tier 1 Signature Soft & Romantic Masterpieces',
              description: 'Vanna Bardot (Bratty Sis), Melody Marks (Oops Family / Family XXX), Haley Reed, Molly Little, Pristine Edge, and Alina Lopez.'
            }}
            scenes={tier1FeaturedScenes}
            onPlayScene={onPlayScene}
            onOpenDossier={onOpenDossier}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <SubdomainShelf
            subdomain={{
              id: 'tier2_signature',
              title: '❤️ r/Porn_Discuss Top-Voted Community Favorites',
              description: 'Angela White, Remy LaCroix, Blake Blossom, Eva Nyx, Emily Willis, Leah Gotti, Agatha Vega, and Kendra Sunderland.'
            }}
            scenes={tier2FeaturedScenes}
            onPlayScene={onPlayScene}
            onOpenDossier={onOpenDossier}
          />
        </div>
      )}

      {/* Grid of Performers */}
      {isTier1 ? (
        /* TIER 1 GRID */
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <h3 className="text-base font-bold font-serif text-white uppercase tracking-wider">
              Tier 1 Starlet Roster ({tier1Performers.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tier1Performers.map((p, idx) => {
              const catalogPerformer = performers.find(
                cp => cp.id === p.id || cp.name?.toLowerCase() === p.name.toLowerCase()
              );
              const sceneCount = (catalogPerformer?.scenes && catalogPerformer.scenes.length > 0)
                ? catalogPerformer.scenes.length
                : (p.scenes?.length || 100);
              const quote = catalogPerformer?.quote || 'Gentle connection and authentic warmth.';

              return (
                <motion.div
                  key={p.id || idx}
                  whileHover={{ y: -4 }}
                  onClick={() => onOpenDossier && onOpenDossier(catalogPerformer ? { ...p, ...catalogPerformer } : p)}
                  className="group p-4 rounded-2xl bg-[#0f0a14] border border-amber-400/20 hover:border-amber-400/80 transition-all duration-300 shadow-xl hover:shadow-[0_10px_25px_rgba(212,175,55,0.2)] cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 bg-black">
                      <img
                        src={`./poses/${p.id}.jpg`}
                        alt={p.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src = `./avatars/${p.id}.jpg`;
                        }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                      
                      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
                        Tier 1 GND
                      </div>

                      <div className="absolute bottom-2.5 inset-x-2.5">
                        <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors font-serif">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-amber-200/90 font-mono mt-0.5 line-clamp-1">
                          {p.vibe}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 font-serif italic line-clamp-2 px-1 mb-2">
                      "{quote}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span className="text-[11px] text-zinc-500">
                      {sceneCount} verified scenes
                    </span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                      <span>Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* TIER 2 GRID */
        <div className="space-y-8">
          {/* Reddit Community Crushes Grid */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-base font-bold font-serif text-white uppercase tracking-wider">
                Reddit Community Romantic Crushes ({filteredReddit.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredReddit.map((p, idx) => {
                const catalogPerformer = performers.find(
                  cp => cp.id === p.id || cp.name?.toLowerCase() === p.name.toLowerCase()
                );
                const sceneCount = (catalogPerformer?.scenes && catalogPerformer.scenes.length > 0)
                  ? catalogPerformer.scenes.length
                  : (p.scenes?.length || 50);

                return (
                  <div
                    key={p.id || idx}
                    onClick={() => onOpenDossier && onOpenDossier(catalogPerformer ? { ...p, ...catalogPerformer } : p)}
                    className="group p-4 rounded-2xl bg-[#0e0813] border border-white/10 hover:border-amber-400/70 transition-all cursor-pointer flex gap-4 items-center hover:bg-white/[0.03] shadow-lg"
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border border-amber-400/30 group-hover:border-amber-400 transition-colors bg-black shadow-md">
                      <img
                        src={`./avatars/${p.id}.jpg`}
                        alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = `./poses/${p.id}.jpg`;
                        }}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                          {p.name}
                        </h4>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 flex-shrink-0">
                          {sceneCount} sc
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-300 font-serif italic mt-1 line-clamp-2 leading-tight">
                        "{p.note}"
                      </p>
                      <div className="text-[10px] text-zinc-500 font-mono mt-2 flex items-center justify-between">
                        <span className="truncate">{p.group}</span>
                        <span className="text-amber-400/90 group-hover:text-amber-300 font-bold flex items-center gap-0.5">
                          Dossier →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
