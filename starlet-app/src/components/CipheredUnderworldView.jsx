import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Shield, ArrowLeft, X, Gift, Dices, Users, Flame,
  Church, Zap, Heart, Search, EyeOff, Eye, Layers, Skull, AlertTriangle, Droplets
} from 'lucide-react';
import { UNDERWORLD_DOMAINS, GESTURE_SYMBOLS, UNDERWORLD_SCENES_CACHE } from '../engine/underworldTaxonomy';
import SubdomainShelf from './SubdomainShelf';
import TierSanctumView from './TierSanctumView';
import PerformerModal from './PerformerModal';

/**
 * CipheredUnderworldView
 * 
 * The Master Hidden Realm ("The Underworld").
 * Accessible exclusively via cryptic console ciphers or Focus Sanctuary geometric runes.
 * Self-contained: In-place dossiers, blazing-fast decoupled rendering,
 * and continuous video scrub previews across all scenario domains.
 */
export default function CipheredUnderworldView({
  initialDomain = 'master_hub',
  performers = [],
  underworldCache = null,
  onClose,
  onPlayScene,
  isStealthBlur,
  onToggleStealthBlur
}) {
  const initialDomainKey = typeof initialDomain === 'object' && initialDomain?.domain
    ? initialDomain.domain
    : (initialDomain || 'master_hub');
  const initialSubdomainKey = typeof initialDomain === 'object' && initialDomain?.subdomain
    ? initialDomain.subdomain
    : null;

  const [activeDomainKey, setActiveDomainKey] = useState(initialDomainKey);
  const [activeSubdomainId, setActiveSubdomainId] = useState(initialSubdomainKey);
  const [cachedScenes, setCachedScenes] = useState(() => (
    underworldCache && Object.keys(underworldCache).length > 0
      ? underworldCache
      : (UNDERWORLD_SCENES_CACHE || {})
  ));
  const [activeDossierPerformer, setActiveDossierPerformer] = useState(null);

  // Sync cache if passed asynchronously from parent App.jsx
  useEffect(() => {
    if (underworldCache && Object.keys(underworldCache).length > 0) {
      setCachedScenes(underworldCache);
    }
  }, [underworldCache]);

  // Sync active domain & subdomain when initialDomain prop changes (via console keywords / gestures)
  useEffect(() => {
    if (initialDomain) {
      const dKey = typeof initialDomain === 'object' && initialDomain.domain ? initialDomain.domain : initialDomain;
      const subKey = typeof initialDomain === 'object' && initialDomain.subdomain ? initialDomain.subdomain : null;
      setActiveDomainKey(dKey || 'master_hub');
      setActiveSubdomainId(subKey);
      if (subKey) {
        setTimeout(() => {
          const el = document.getElementById(`shelf-${subKey}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      }
    }
  }, [initialDomain]);

  // Load pre-cached Underworld scenario releases with multi-path fallback
  useEffect(() => {
    if (underworldCache && Object.keys(underworldCache).length > 0) return;
    async function loadUnderworldScenes() {
      const candidates = [
        './underworld-scenes-cache.json',
        '/starlet-app/dist/underworld-scenes-cache.json',
        '/underworld-scenes-cache.json',
        './starlet-app/public/underworld-scenes-cache.json'
      ];
      for (const url of candidates) {
        try {
          const res = await fetch(`${url}?v=${Date.now()}`);
          if (res.ok) {
            const data = await res.json();
            if (data && Object.keys(data).length > 0) {
              setCachedScenes(data);
              return;
            }
          }
        } catch (e) {}
      }
    }
    loadUnderworldScenes();
  }, [underworldCache]);

  // Handle Escape key to instantly collapse and return to disguise
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (activeDossierPerformer) {
          setActiveDossierPerformer(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [onClose, activeDossierPerformer]);

  // Robust Performer Resolver for In-Place Dossier Modal
  const handleOpenDossier = (performerOrName) => {
    if (!performerOrName) return;
    let target = null;
    if (typeof performerOrName === 'string') {
      const query = performerOrName.trim().toLowerCase();
      target = performers.find(p => 
        (p.name && p.name.toLowerCase() === query) || 
        (p.id && p.id.toLowerCase() === query)
      );
      if (!target) {
        target = {
          id: query.replace(/\s+/g, '-'),
          name: performerOrName,
          scenes: [],
          genres: ['featured'],
          rating: '98%',
          hair: 'Blonde'
        };
      }
    } else if (typeof performerOrName === 'object') {
      // Reconcile with full catalog performer if scenes are missing or empty
      if (!performerOrName.scenes || performerOrName.scenes.length === 0) {
        const queryId = performerOrName.id;
        const queryName = performerOrName.name?.toLowerCase();
        const full = performers.find(p => (queryId && p.id === queryId) || (queryName && p.name?.toLowerCase() === queryName));
        target = full ? { ...performerOrName, ...full } : performerOrName;
      } else {
        target = performerOrName;
      }
    }
    if (target) {
      setActiveDossierPerformer(target);
    }
  };

  // High-Performance Scene Indexer (O(1) Pre-Indexed Static Mapping):
  // Reads pre-cached releases directly, with instantaneous in-memory catalog fallback
  // so no subdomain is ever stuck "Awaiting Ingestion".
  const indexedSubdomainScenes = useMemo(() => {
    const map = new Map();

    Object.values(UNDERWORLD_DOMAINS).forEach(dom => {
      if (dom.subdomains) {
        dom.subdomains.forEach(sub => {
          let preCached = Array.isArray(cachedScenes[sub.id]) && cachedScenes[sub.id].length > 0
            ? cachedScenes[sub.id]
            : (Array.isArray(UNDERWORLD_SCENES_CACHE?.[sub.id]) && UNDERWORLD_SCENES_CACHE[sub.id].length > 0
                ? UNDERWORLD_SCENES_CACHE[sub.id]
                : []);

          // Instantaneous In-Memory Catalog Fallback:
          // If pre-cached releases are missing or still loading for this subdomain,
          // instantly harvest matching verified releases from active performers via subdomain regex!
          if (preCached.length === 0 && performers && performers.length > 0) {
            try {
              const rx = sub.regex ? new RegExp(sub.regex, 'i') : null;
              if (rx) {
                const collected = [];
                const seenUrls = new Set();
                for (const p of performers) {
                  for (const sc of (p.scenes || [])) {
                    if (sc.url && !seenUrls.has(sc.url)) {
                      if (rx.test(sc.title || '') || (sc.genres || []).some(g => rx.test(g))) {
                        seenUrls.add(sc.url);
                        collected.push({
                          ...sc,
                          performerName: p.name,
                          performerId: p.id,
                          score: 95
                        });
                        if (collected.length >= 80) break;
                      }
                    }
                  }
                  if (collected.length >= 80) break;
                }
                preCached = collected;
              }
            } catch (e) {}
          }

          map.set(sub.id, [...preCached]);
        });
      }
    });

    // Strict Scene-First Prioritization: "Best of the Best" first -> Tier B -> Others
    map.forEach((list, subId) => {
      list.sort((a, b) => {
        const scoreA = typeof a.score === 'number' ? a.score : (a.isBest ? 85 : 40);
        const scoreB = typeof b.score === 'number' ? b.score : (b.isBest ? 85 : 40);
        return scoreB - scoreA;
      });
    });

    return map;
  }, [cachedScenes, performers]);

  const navDomains = [
    { key: 'master_hub', label: '✦ Master Underworld Hub', icon: Sparkles, color: 'text-amber-300' },
    { key: 'domain_tier1', label: '🌸 Tier 1: Soft GND', icon: Heart, color: 'text-rose-300' },
    { key: 'domain_tier2', label: '❤️ Tier 2: Reddit Crushes', icon: Flame, color: 'text-amber-400' },
    { key: 'domain_family_archetypes', label: '👥 Family Archetypes & Swaps', icon: Users, color: 'text-amber-200' },
    { key: 'domain_games_bets', label: '🎲 Games & Study Leverage', icon: Dices, color: 'text-indigo-400' },
    { key: 'domain_hardcore_dynamics', label: '⚡ Hardcore Dynamics', icon: Zap, color: 'text-rose-500' },
    { key: 'domain_abyssal_nasty', label: '💀 The Abyssal Vault', icon: Skull, color: 'text-red-500' },
    { key: 'domain_permission_escalation', label: '🔥 Escalation (5-Stage)', icon: Flame, color: 'text-orange-400' },
    { key: 'domain_institutional_niche', label: '⛪ The Cloister (Nun)', icon: Church, color: 'text-purple-300' },
    { key: 'domain_gifting_holidays', label: '🎁 Gifting & Holidays', icon: Gift, color: 'text-emerald-400' }
  ];

  const PRIORITY_QUICK_CATEGORIES = [
    { id: 'family_swaps', domain: 'domain_family_archetypes', title: '🔄 Swaps', badge: '1,855' },
    { id: 'cuckold_voyeur', domain: 'domain_family_archetypes', title: '👁️ Cuck / Hotwife', badge: '440' },
    { id: 'wild_orgies', domain: 'domain_hardcore_dynamics', title: '🎉 Wild Orgies', badge: '540' },
    { id: 'gangbang_trains', domain: 'domain_hardcore_dynamics', title: '⚡ Gangbangs', badge: '384' },
    { id: 'anal_choreography', domain: 'domain_hardcore_dynamics', title: '🍑 Anal Artistry', badge: '1,563' },
    { id: 'facial_cumshot', domain: 'domain_hardcore_dynamics', title: '💦 Facial Finishes', badge: '647' },
    { id: 'study_grades', domain: 'domain_games_bets', title: '🎓 Study / Tutors', badge: '2,068' },
    { id: 'taboo_extremes', domain: 'domain_abyssal_nasty', title: '💀 Abyssal Extremes', badge: '2,244' }
  ];

  const currentDomainData = UNDERWORLD_DOMAINS[activeDomainKey.replace('domain_', '')] ||
    Object.values(UNDERWORLD_DOMAINS).find(d => d.id === activeDomainKey);

  return (
    <div className="fixed inset-0 z-[100] bg-[#050307] text-zinc-100 overflow-y-auto no-scrollbar select-none">
      {/* Background Atmosphere & Ambient Occult Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#d4af37_0.75px,transparent_0.75px)] [background-size:32px_32px] opacity-10" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* TOP VIP HEADER */}
        <header className="sticky top-0 z-50 bg-[#050307]/95 backdrop-blur-2xl border-b border-amber-400/20 px-4 sm:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Title & Rune Gateway Badge */}
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400/30 to-amber-600/10 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-lg shadow-amber-400/20 font-serif text-lg font-bold">
                🜏
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400/90 font-bold">
                    CIPHERED DOMAIN · ZERO-LEAK REALM
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-serif tracking-wide">
                  The Underworld Sanctuary
                </h1>
              </div>
            </div>

            {/* Quick Actions, Stealth Blur Toggle & Panic Exit Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              {/* Stealth Blur Toggle Button in Underworld Header */}
              {onToggleStealthBlur && (
                <button
                  type="button"
                  onClick={onToggleStealthBlur}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    isStealthBlur
                      ? 'bg-amber-400 text-black font-extrabold shadow-amber-400/40'
                      : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/15'
                  }`}
                  title="Toggle Public Stealth Blur (Discreet Mode)"
                >
                  {isStealthBlur ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{isStealthBlur ? 'Stealth ON' : 'Stealth Blur'}</span>
                </button>
              )}

              <div className="text-[11px] font-mono text-zinc-500 hidden lg:flex items-center gap-2">
                <span>Press</span>
                <kbd className="px-2 py-0.5 rounded bg-black/60 border border-white/10 text-amber-300 font-mono">
                  Esc
                </kbd>
                <span>to collapse instantly</span>
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:brightness-110 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer border border-rose-400/40"
                title="Immediate Panic Exit: Close Underworld & Return to Disguise"
              >
                <X className="w-4 h-4" />
                <span>Return to Disguise</span>
              </button>
            </div>
          </div>

          {/* HORIZONTAL DOMAIN RUNE SWITCHER */}
          <div className="max-w-7xl mx-auto mt-4 pt-3 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {navDomains.map(d => {
              const Icon = d.icon;
              const isActive = activeDomainKey === d.key;

              return (
                <button
                  key={d.key}
                  onClick={() => {
                    setActiveDomainKey(d.key);
                    setActiveSubdomainId(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold font-mono whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30 font-bold scale-[1.02]'
                      : 'bg-[#0f0914] text-zinc-400 border border-white/10 hover:border-amber-400/40 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : d.color}`} />
                  <span>{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* PRIORITY SCENARIO SHORTCUTS BAR */}
          <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-bold whitespace-nowrap mr-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" /> Focus Scenarios:
            </span>
            {PRIORITY_QUICK_CATEGORIES.map(cat => {
              const count = (indexedSubdomainScenes.get(cat.id) || []).length;
              const isSelected = activeSubdomainId === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveDomainKey(cat.domain);
                    setActiveSubdomainId(cat.id);
                    setTimeout(() => {
                      const el = document.getElementById(`shelf-${cat.id}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 120);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-black font-extrabold shadow-md shadow-amber-400/20 scale-105'
                      : 'bg-[#120a17] text-zinc-300 border border-amber-400/20 hover:border-amber-400/60 hover:text-white'
                  }`}
                >
                  <span>{cat.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-black/20 text-black' : 'bg-white/10 text-amber-300'}`}>
                    {count || cat.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        {/* MAIN BODY CONTENT */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-8 py-8">
          {activeDomainKey === 'master_hub' ? (
            /* ============================================================== */
            /* 1. MASTER HUB OVERVIEW                                          */
            /* ============================================================== */
            <div>
              {/* Grand Banner */}
              <div className="mb-12 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#170c1e] via-[#100615] to-[#1c0e24] border border-amber-400/30 relative overflow-hidden shadow-2xl">
                <div className="relative z-10 max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>SECLUDED ARCHIVE · 1,424 STARLETS HARMONIZED</span>
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white font-serif tracking-tight leading-tight">
                    The Underworld Nexus
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-300 mt-3 leading-relaxed">
                    A strictly partitioned parallel reality. Dive into designated holiday gifting subdomains,
                    high-stakes strategic leverage, five-stage somatic escalations, the Abyssal Vault, or access the isolated
                    Tier 1 (Soft/GND) and Tier 2 (Reddit Crushes) sanctuaries.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => setActiveDomainKey('domain_tier1')}
                      className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-400/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Heart className="w-4 h-4 fill-current text-black" />
                      <span>Explore Tier 1 (Soft GND)</span>
                    </button>
                    <button
                      onClick={() => setActiveDomainKey('domain_tier2')}
                      className="px-6 py-3 rounded-2xl bg-black/80 hover:bg-black text-amber-300 border border-amber-400/40 font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span>Explore Tier 2 (Reddit Crushes)</span>
                    </button>
                    <button
                      onClick={() => setActiveDomainKey('domain_abyssal_nasty')}
                      className="px-6 py-3 rounded-2xl bg-black/80 hover:bg-black text-red-400 border border-red-500/30 font-bold text-xs sm:text-sm active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Skull className="w-4 h-4 text-red-500" />
                      <span>The Abyssal Vault</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Spotlight Subdomain Shelves */}
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h3 className="text-xl font-bold font-serif text-white tracking-wide">
                      Spotlight Subdomain Shelves
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">Auto-Filtered Real Streams</span>
                </div>

                {/* 1. Family & Spousal Swaps */}
                <SubdomainShelf
                  subdomain={{
                    id: 'family_swaps',
                    title: '🔄 Family & Spousal Swaps (Mom, Sister, Wife)',
                    description: 'Wife swaps, mom swaps, sister swaps, and traded domestic dynamics.'
                  }}
                  scenes={indexedSubdomainScenes.get('family_swaps') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 2. Cuckold & Voyeur */}
                <SubdomainShelf
                  subdomain={{
                    id: 'cuckold_voyeur',
                    title: '👁️ Cuckold, Hotwife & Voyeuristic Humiliation',
                    description: 'Watched through cracked doors, bull dominance, and husband clean up.'
                  }}
                  scenes={indexedSubdomainScenes.get('cuckold_voyeur') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 3. Wild Orgies */}
                <SubdomainShelf
                  subdomain={{
                    id: 'wild_orgies',
                    title: '🎉 Wild Orgies & Group Parties',
                    description: 'Multiple girls, room-full gatherings, and uninhibited group celebrations.'
                  }}
                  scenes={indexedSubdomainScenes.get('wild_orgies') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 4. Gangbangs & Trains */}
                <SubdomainShelf
                  subdomain={{
                    id: 'gangbang_trains',
                    title: '⚡ Gangbangs, Trains & Bukkake Surrounds',
                    description: 'Heavy numbers, non-stop physical trains, and surrounded starlets.'
                  }}
                  scenes={indexedSubdomainScenes.get('gangbang_trains') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 5. Anal Artistry */}
                <SubdomainShelf
                  subdomain={{
                    id: 'anal_choreography',
                    title: '🍑 Anal Artistry & Deep Passion',
                    description: 'Tight backdoor mastery, oil choreography, and deep rhythmic intensity.'
                  }}
                  scenes={indexedSubdomainScenes.get('anal_choreography') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 6. Facial Finishes */}
                <SubdomainShelf
                  subdomain={{
                    id: 'facial_cumshot',
                    title: '💦 Facial Finishes & Cumshot Climaxes',
                    description: 'Flawless close-up facial finishes, swallows, and heavy cream climaxes.'
                  }}
                  scenes={indexedSubdomainScenes.get('facial_cumshot') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 7. Study Sessions & Tutors */}
                <SubdomainShelf
                  subdomain={{
                    id: 'study_grades',
                    title: '🎓 Study Sessions, Math Tutors & Passing Grades',
                    description: 'Failing grade negotiations, strict math tutoring, and report card deals.'
                  }}
                  scenes={indexedSubdomainScenes.get('study_grades') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />

                {/* 8. The Abyssal Extremes */}
                <SubdomainShelf
                  subdomain={{
                    id: 'taboo_extremes',
                    title: '💀 Taboo Extremes & Forbidden Realities',
                    description: 'The deepest raw underworld: unfiltered, extreme, and taboo.'
                  }}
                  scenes={indexedSubdomainScenes.get('taboo_extremes') || []}
                  onPlayScene={onPlayScene}
                  onOpenDossier={handleOpenDossier}
                />
              </div>
            </div>
          ) : activeDomainKey === 'domain_tier1' || activeDomainKey === 'domain_tier2' ? (
            /* ============================================================== */
            /* 2. TIER 1 OR TIER 2 SANCTUMS                                    */
            /* ============================================================== */
            <TierSanctumView
              tier={activeDomainKey === 'domain_tier1' ? 'tier1' : 'tier2'}
              domainData={activeDomainKey === 'domain_tier1' ? UNDERWORLD_DOMAINS.tier1_soft_gnd : UNDERWORLD_DOMAINS.tier2_glamour_reddit}
              performers={performers}
              onOpenDossier={handleOpenDossier}
              onPlayScene={onPlayScene}
            />
          ) : (
            /* ============================================================== */
            /* 3. SCENARIO DOMAIN SUBDOMAIN SHELVES                            */
            /* ============================================================== */
            <div>
              {/* Domain Overview Header */}
              <div className="mb-8 p-6 sm:p-8 rounded-3xl bg-[#0e0813] border border-amber-400/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest">
                    SCENARIO DOMAIN
                  </span>
                  <span className="text-zinc-500 font-mono text-xs">
                    {(currentDomainData?.subdomains || []).length} Structured Subdomains
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-serif">
                  {currentDomainData?.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-2xl leading-relaxed">
                  {currentDomainData?.description}
                </p>
              </div>

              {/* Render Shelves for Each Subdomain */}
              <div className="space-y-6">
                {(currentDomainData?.subdomains || []).map(sub => (
                  <div key={sub.id} id={`shelf-${sub.id}`}>
                    <SubdomainShelf
                      subdomain={sub}
                      scenes={indexedSubdomainScenes.get(sub.id) || []}
                      onPlayScene={onPlayScene}
                      onOpenDossier={handleOpenDossier}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* SELF-CONTAINED IN-PLACE DOSSIER MODAL */}
      {activeDossierPerformer && (
        <PerformerModal
          performer={activeDossierPerformer}
          allPerformers={performers}
          onClose={() => setActiveDossierPerformer(null)}
          onPlayScene={onPlayScene}
          onSelectPerformer={handleOpenDossier}
        />
      )}
    </div>
  );
}
