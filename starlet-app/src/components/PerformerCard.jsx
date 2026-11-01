import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Check, Play, Award, Sparkles, Heart, ArrowRightLeft,
  ChevronRight, ShieldCheck, Film
} from 'lucide-react';
import {
  GENRE_LABELS, FAMILY_GENRES, isFamily, isNewcomer, realScenes, getPerformerInitials
} from '../constants';
import { useCardImpression } from '../hooks/useCardImpression';

export default function PerformerCard({
  performer,
  isFav,
  isSeen,
  onToggleFav,
  onToggleSeen,
  onOpenDossier,
  onSelectGenre,
  onStartCompare,
  onPlayScene
}) {
  const p = performer;
  const fam = isFamily(p);
  const nw = isNewcomer(p);
  const hasAward = (p.awards || []).some(a => /win|year|award|goat|hall/i.test(a));
  const scenes = realScenes(p);
  const initials = getPerformerInitials(p.name);
  const cardRef = useCardImpression(p.id);

  // Avatar Image Source Resolution with tiered multi-fallback
  const [imgStage, setImgStage] = useState(0);

  const babepediaUrl = `https://www.babepedia.com/pics/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}.jpg`;
  const sceneThumb = p.scenes?.[0]?.thumbnail;

  const currentSrc = imgStage === 0
    ? `./avatars/${p.id}.jpg`
    : imgStage === 1
      ? babepediaUrl
      : imgStage === 2 && sceneThumb
        ? sceneThumb
        : null;

  const handleImgError = () => {
    setImgStage(s => {
      if (s === 0) return 1; // Try Babepedia
      if (s === 1 && sceneThumb) return 2; // Try Scene thumb
      return 3; // Final fallback: monogram initials
    });
  };

  // 1-Second Hover (PC) / Center-Hold (Phone) Animated Scene Montage Trailer
  const montageImages = useMemo(() => {
    const list = [];
    if (p.scenes && p.scenes.length > 0) {
      p.scenes.forEach(s => {
        if (s.thumbnail) list.push(s.thumbnail);
      });
    }
    list.push(`./avatars/${p.id}.jpg`);
    list.push(babepediaUrl);
    return Array.from(new Set(list));
  }, [p, babepediaUrl]);

  const [isMontageActive, setIsMontageActive] = useState(false);
  const [montageIndex, setMontageIndex] = useState(0);
  const hoverTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const touchHoldTimerRef = useRef(null);

  const startMontageLoop = () => {
    setIsMontageActive(true);
    setMontageIndex(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setMontageIndex(idx => (idx + 1) % montageImages.length);
    }, 380); // cycles rapid montage every 380ms
  };

  const stopMontageLoop = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (touchHoldTimerRef.current) {
      clearTimeout(touchHoldTimerRef.current);
      touchHoldTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsMontageActive(false);
    setMontageIndex(0);
  };

  useEffect(() => {
    return () => stopMontageLoop();
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      startMontageLoop();
    }, 1000); // 1.0 second hover debounce
  };

  const handleMouseLeave = () => {
    stopMontageLoop();
  };

  const handleTouchStart = (e) => {
    if (touchHoldTimerRef.current) clearTimeout(touchHoldTimerRef.current);
    touchHoldTimerRef.current = setTimeout(() => {
      startMontageLoop();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
    }, 750); // 750ms center hold threshold
  };

  const handleTouchEnd = () => {
    stopMontageLoop();
  };

  const familyGenres = (p.genres || []).filter(g => FAMILY_GENRES.has(g));

  const activeDisplaySrc = isMontageActive && montageImages.length > 0
    ? montageImages[montageIndex]
    : currentSrc;

  return (
    <div
      ref={cardRef}
      data-performer-card-id={p.id}
      onClick={() => onOpenDossier(p)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`group relative glass rounded-2xl p-4 border transition-all duration-200 cursor-pointer flex flex-col justify-between select-none ${
        isMontageActive
          ? 'border-amber-400/90 shadow-[0_0_30px_rgba(212,168,83,0.35)] bg-[#1a121d] scale-[1.015]'
          : 'border-[var(--line)] hover:border-[var(--accent)] hover:shadow-xl bg-[#130d15]/80 hover:bg-[#18111a]'
      }`}
    >
      <div>
        {/* Montage Playing Banner Indicator */}
        <AnimatePresence>
          {isMontageActive && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute -top-3 left-4 right-4 z-20 flex items-center justify-between px-3 py-1 rounded-full bg-black/90 border border-amber-400 text-[10px] font-mono font-bold text-amber-300 shadow-xl"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <Film className="w-3 h-3 text-amber-400" />
                <span>MONTAGE PREVIEW</span>
              </span>
              <span className="text-zinc-400">
                {montageIndex + 1}/{montageImages.length}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Header: Avatar Thumbnail + Identity + Quick Actions */}
        <div className="flex items-start gap-3.5 mb-3">
          {/* Avatar Thumbnail (Cycles montage on 1s hover / touch hold) */}
          <div
            className={`relative rounded-full overflow-hidden flex-shrink-0 border-2 transition-all flex items-center justify-center bg-[#1f1622] ${
              isMontageActive
                ? 'w-16 h-16 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.6)] ring-2 ring-amber-400/50'
                : 'w-12 h-12 border-[var(--line)] group-hover:border-[var(--accent)]'
            }`}
          >
            {activeDisplaySrc ? (
              <img
                src={activeDisplaySrc}
                alt={p.name}
                loading="lazy"
                onError={handleImgError}
                className="w-full h-full object-cover object-top transition-none"
              />
            ) : (
              <span className="font-serif font-bold text-xs text-[var(--accent)]">
                {initials}
              </span>
            )}
          </div>

          {/* Name & Quick Metadata */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-serif font-bold text-sm text-white truncate group-hover:text-[var(--accent)] transition-colors">
                {p.name}
              </h3>

              {/* Action Buttons: Compare, Fav, Seen */}
              <div className="flex items-center gap-1 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {onStartCompare && (
                  <button
                    onClick={() => onStartCompare(p)}
                    className="p-1 rounded text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    title="Compare"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                  </button>
                )}

                <button
                  onClick={() => onToggleFav(p.id)}
                  className={`p-1 rounded transition-colors ${
                    isFav ? 'text-[#f59e0b]' : 'text-[var(--muted)] hover:text-white'
                  }`}
                  title={isFav ? 'Remove favorite' : 'Add favorite'}
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => onToggleSeen(p.id)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono flex items-center gap-0.5 transition-colors ${
                    isSeen
                      ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30 font-bold'
                      : 'text-[var(--muted)] hover:text-white'
                  }`}
                  title={isSeen ? 'Mark Unseen' : 'Mark Seen'}
                >
                  <Check className="w-2.5 h-2.5" />
                  <span>{isSeen ? 'Seen' : '+ Seen'}</span>
                </button>
              </div>
            </div>

            {/* Demographics */}
            <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">
              {p.age ? `Age ${p.age}` : ''}
              {p.active?.from ? ` · ${p.active.from}+` : ''}
              {p.nationality ? ` · ${p.nationality}` : ''}
              {p.hair ? ` · ${p.hair}` : ''}
            </p>

            {/* Scenario Badges */}
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              {fam && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center gap-0.5">
                  <Heart className="w-2 h-2 fill-current" /> Family
                </span>
              )}
              {hasAward && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-0.5">
                  <Award className="w-2 h-2" /> Hall of Fame
                </span>
              )}
              {nw && (
                <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2" /> Newcomer
                </span>
              )}
              {familyGenres.slice(0, 2).map(g => (
                <span
                  key={g}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onSelectGenre) onSelectGenre(g);
                  }}
                  className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-white/5 text-zinc-300 hover:text-[var(--accent)] transition-colors"
                >
                  {GENRE_LABELS[g] || g}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Verified Releases & Top 2 Direct Scenes */}
        <div className="pt-2.5 mt-2 border-t border-[var(--line)]">
          <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--accent)] mb-1.5">
            <span>Verified Releases ({scenes.length})</span>
            <span className="text-[9px] text-[var(--muted)] font-normal">Click to play</span>
          </div>

          <div className="space-y-1">
            {scenes.slice(0, 2).map((s, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onPlayScene) {
                    onPlayScene(s, p);
                  } else {
                    window.open(s.url, '_blank');
                  }
                }}
                className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-black/40 hover:bg-[var(--accent)]/15 border border-white/5 hover:border-[var(--accent)]/30 transition-all text-xs group/sc cursor-pointer"
                title={`Play: ${s.title}`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <Play className="w-2.5 h-2.5 text-[var(--accent)] fill-current flex-shrink-0" />
                  <span className="truncate text-[11px] text-zinc-300 group-hover/sc:text-white">
                    {s.title}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 font-mono text-[9px]">
                  {s.duration && <span className="text-zinc-500">{s.duration}</span>}
                  {s.rating && (
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                      {s.rating}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {scenes.length === 0 && (
              <p className="text-[10px] text-[var(--muted)] italic py-1">
                No direct tube scenes verified yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: View Dossier + ID */}
      <div className="pt-2 mt-2.5 border-t border-[var(--line)] flex items-center justify-between text-[10px] text-[var(--muted)]">
        <span className="group-hover:text-[var(--accent)] transition-colors flex items-center gap-1 font-semibold">
          <span>View Profile & Filmography</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </span>

        <span className="font-mono text-zinc-500 truncate max-w-[100px]">
          ID: {p.id}
        </span>
      </div>
    </div>
  );
}
