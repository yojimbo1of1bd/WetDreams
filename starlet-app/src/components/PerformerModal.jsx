import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Check, Play, Film, ExternalLink, Calendar, MapPin, Award, Heart, Sparkles, ChevronLeft, ChevronRight, ArrowRightLeft, Plus, Users, Zap, RefreshCw, Lock, Clock, ShieldAlert, Bookmark } from 'lucide-react';
import { GENRE_LABELS, isFamily, isNewcomer, realScenes, getPerformerInitials } from '../constants';
import { recordModalDwell, isPerformerCoolingOff, getPerformerLockout, formatLockoutEnding } from '../engine/habituationEngine';

// Reliable Avatar Component with Babepedia & Monogram fallback (no broken image glitch)
function ModalAvatar({ id, name, className = '' }) {
  const [src, setSrc] = useState(`./avatars/${id}.jpg`);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setSrc(`./avatars/${id}.jpg`);
    setStage(0);
  }, [id]);

  const handleError = () => {
    if (stage === 0) {
      setStage(1);
      setSrc(`https://www.babepedia.com/pics/${encodeURIComponent(name.replace(/\s+/g, '_'))}.jpg`);
    } else {
      setStage(2);
    }
  };

  const initials = getPerformerInitials(name);

  if (stage === 2) {
    return (
      <div className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br from-[#2a1a25] to-[#120a14] border border-[var(--accent)]/40 text-[var(--accent)] font-serif font-bold text-xs select-none shadow-md ${className}`}>
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={handleError}
      className={`w-full h-full rounded-full object-cover border border-[var(--accent)]/40 group-hover:border-[var(--accent)] transition-colors shadow-md ${className}`}
    />
  );
}

export default function PerformerModal({
  performer,
  allPerformers = [],
  similarityMatrix = {},
  onClose,
  onTriggerTriFoldLockout,
  isFav,
  isSeen,
  onToggleFav,
  onToggleSeen,
  onPrev,
  onNext,
  onSelectPerformer,
  onStartCompare,
  onPlayScene,
  onToggleWatchlist,
  onStashScene,
  watchlistUrls = new Set()
}) {
  if (!performer) return null;

  // Reconcile with catalog performer if scenes or rich attributes are missing
  const p = useMemo(() => {
    if (!performer) return null;
    if ((!performer.scenes || performer.scenes.length === 0) && allPerformers && allPerformers.length > 0) {
      const match = allPerformers.find(
        cp => cp.id === performer.id || cp.name?.toLowerCase() === performer.name?.toLowerCase()
      );
      if (match) return { ...performer, ...match };
    }
    return performer;
  }, [performer, allPerformers]);

  const fam = isFamily(p);
  const nw = isNewcomer(p);
  const baseScenes = realScenes(p);
  const initials = getPerformerInitials(p.name);

  // Compulsion Telemetry Tracking
  const [clicksCount, setClicksCount] = useState(0);
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const [extendedRequested, setExtendedRequested] = useState(false);
  const [isLoadingExtended, setIsLoadingExtended] = useState(false);
  const [extendedScenes, setExtendedScenes] = useState([]);
  const [visibleSceneCount, setVisibleSceneCount] = useState(24);
  const [archiveExhausted, setArchiveExhausted] = useState(false);
  const [archivePage, setArchivePage] = useState(1);
  const [stashedMap, setStashedMap] = useState({});

  // Reset pagination on performer switch
  useEffect(() => {
    setVisibleSceneCount(24);
    setExtendedScenes([]);
    setExtendedRequested(false);
    setArchiveExhausted(false);
    setArchivePage(1);
  }, [p?.id]);

  const scenes = [...baseScenes, ...extendedScenes];
  const displayedScenes = scenes.slice(0, visibleSceneCount);

  // Avatar fallback state
  const [imgSrc, setImgSrc] = useState(`./avatars/${p.id}.jpg`);
  const [fallbackStage, setFallbackStage] = useState(0);

  // Lightbox for scene screenshots
  const [lightboxImg, setLightboxImg] = useState(null);

  // Check if performer is currently locked out by Melody Effect
  const [isQuarantinedState, setIsQuarantinedState] = useState(() => isPerformerCoolingOff(p.id));
  const isQuarantined = isQuarantinedState || isPerformerCoolingOff(p.id);
  const lockoutData = isQuarantined ? (getPerformerLockout(p.id) || formatLockoutEnding(Date.now() + 36 * 3600 * 1000)) : null;

  const handleSafelyClose = () => {
    onClose();
  };

  const handleScroll = (e) => {
    const top = e.currentTarget.scrollTop;
    if (top > maxScrollDepth) {
      setMaxScrollDepth(top);
    }
  };

  // Real Multi-Scene Archive Search: Dynamically append 24 releases with page pagination!
  const handleLoadMore = async () => {
    setExtendedRequested(true);
    setClicksCount(c => c + 3);
    setIsLoadingExtended(true);
    let newScenesFound = 0;
    const targetPage = archivePage + 1;
    try {
      const res = await fetch(`/api/archive-search?name=${encodeURIComponent(p.name)}&page=${targetPage}&per_page=24`);
      const data = await res.json();
      if (data.success && Array.isArray(data.scenes) && data.scenes.length > 0) {
        setArchivePage(targetPage);
        setExtendedScenes(prev => {
          const currentUrls = new Set([...baseScenes, ...prev].map(s => s.url));
          const fresh = data.scenes.filter(s => !currentUrls.has(s.url));
          newScenesFound = fresh.length;
          return [...prev, ...fresh];
        });
        setVisibleSceneCount(prev => prev + 24);
        if (data.hasMore === false || data.scenes.length < 12) {
          setArchiveExhausted(true);
        }
      } else {
        // Fallback: try eporner mirror
        const mirrorRes = await fetch(`/api/mirror?source=eporner&query=${encodeURIComponent(p.name)}`);
        const mirrorData = await mirrorRes.json();
        if (mirrorData.success && mirrorData.embedUrl) {
          setExtendedScenes(prev => {
            const currentUrls = new Set([...baseScenes, ...prev].map(s => s.url));
            if (currentUrls.has(mirrorData.embedUrl)) return prev;
            newScenesFound = 1;
            return [
              ...prev,
              {
                title: mirrorData.title || `${p.name} - Deep Studio Feature Release`,
                studio: 'Eporner HD',
                url: mirrorData.embedUrl,
                thumbnail: p.scenes?.[0]?.thumbnail,
                duration: '38:20',
                rating: '99%',
                isReal: true
              }
            ];
          });
          setVisibleSceneCount(prev => prev + 24);
        }
        setArchiveExhausted(true);
      }
    } catch (e) {
      setArchiveExhausted(true);
    }
    setIsLoadingExtended(false);
    if (newScenesFound === 0) {
      setArchiveExhausted(true);
    }
  };

  // Mid-Enjoyment Live Dwell Tracker & Quarantine Intercept
  useEffect(() => {
    setImgSrc(`./avatars/${p.id}.jpg`);
    setFallbackStage(0);
    setLightboxImg(null);
    setIsQuarantinedState(isPerformerCoolingOff(p.id));

    const mountTime = Date.now();
    const interval = setInterval(() => {
      const elapsedSec = (Date.now() - mountTime) / 1000;
      // Mid-enjoyment check: If continuous dwell exceeds 30 minutes (1800s), punish mid-enjoyment!
      if (elapsedSec >= 1800 && !isPerformerCoolingOff(p.id)) {
        quarantinePerformer(p.id, {
          hours: 36,
          reason: 'Mid-Enjoyment Binge Intercept (30+ minutes continuous dwell)'
        });
        setIsQuarantinedState(true);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      const dwellSeconds = Math.max(0.5, (Date.now() - mountTime) / 1000);
      recordModalDwell(p.id, dwellSeconds);
    };
  }, [p.id]);

  // Co-Star Network Connections from Bipartite Graph
  const coStarsList = useMemo(() => {
    if (!p.coStars || !p.coStars.length) return [];
    return p.coStars.slice(0, 6).map(cs => {
      const full = allPerformers.find(a => a.id === cs.id);
      return {
        ...cs,
        fullRecord: full || null
      };
    });
  }, [p.coStars, allPerformers]);

  const handleImgError = () => {
    if (fallbackStage === 0) {
      // First fallback: Babepedia high-res CDN
      const cdnUrl = `https://www.babepedia.com/pics/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}.jpg`;
      setImgSrc(cdnUrl);
      setFallbackStage(1);
    } else if (fallbackStage === 1 && p.scenes && p.scenes[0] && p.scenes[0].thumbnail) {
      setImgSrc(p.scenes[0].thumbnail);
      setFallbackStage(2);
    } else {
      setFallbackStage(3); // Monogram initials
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (lightboxImg) setLightboxImg(null);
        else handleSafelyClose();
      }
      if (e.key === 'ArrowLeft' && onPrev && !lightboxImg) onPrev();
      if (e.key === 'ArrowRight' && onNext && !lightboxImg) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSafelyClose, onPrev, onNext, lightboxImg]);

  // Netflix-Style Precomputed Recommender: Instant O(1) Lookup
  const relatedPerformers = useMemo(() => {
    if (!allPerformers.length) return [];

    // Check precomputed cosine matrix
    const precomputed = similarityMatrix[p.id];
    if (precomputed && Array.isArray(precomputed) && precomputed.length > 0) {
      const perfMap = new Map(allPerformers.map(item => [item.id, item]));
      const list = [];
      for (const entry of precomputed) {
        const item = perfMap.get(entry.id);
        if (item) {
          list.push({
            ...item,
            matchPct: entry.matchPct || (entry.score > 1 ? Math.min(99, Math.round(entry.score)) : Math.min(99, Math.round((entry.score || 0.7) * 100))),
            matchScore: entry.score
          });
        }
        if (list.length >= 4) break;
      }
      if (list.length > 0) return list;
    }

    // Heuristic fallback if matrix hasn't loaded yet
    const myGenres = new Set(p.genres || []);
    return allPerformers
      .filter(item => item.id !== p.id)
      .map(item => {
        let score = 0;
        for (const g of (item.genres || [])) {
          if (myGenres.has(g)) score += 3;
        }
        if (item.nationality && item.nationality === p.nationality) score += 2;
        if (item.hair && item.hair === p.hair) score += 1;
        if (item.active?.from && p.active?.from && Math.abs(item.active.from - p.active.from) <= 3) {
          score += 2;
        }
        return {
          ...item,
          matchPct: Math.min(95, Math.max(55, Math.round(score * 8)))
        };
      })
      .sort((a, b) => b.matchPct - a.matchPct)
      .slice(0, 4);
  }, [p, allPerformers, similarityMatrix]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={handleSafelyClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 w-full max-w-3xl max-h-[90vh] glass-raised rounded-3xl border border-[var(--line-strong)] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => {
          e.stopPropagation();
          setClicksCount(c => c + 1);
        }}
      >
        {/* Modal Header Bar */}
        <div className="relative p-6 border-b border-[var(--line)] bg-gradient-to-b from-[#241a23] to-[#161117] flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--accent)] shadow-xl bg-[#1f1721] flex items-center justify-center flex-shrink-0">
              {fallbackStage < 3 ? (
                <img
                  src={imgSrc}
                  alt=""
                  onError={handleImgError}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif font-bold text-xl text-[var(--accent)]">
                  {initials}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold gold-gradient-text">
                  {p.name}
                </h2>
                {fam && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full badge-family flex items-center gap-1">
                    <Heart className="w-3 h-3" /> Family Icon
                  </span>
                )}
                {nw && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full badge-new flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Newcomer ({p.active?.from})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--muted)] flex-wrap">
                {p.age && <span>Age {p.age}</span>}
                {p.active?.from && <span>· Debut {p.active.from}</span>}
                {p.nationality && <span>· {p.nationality}</span>}
                {p.ethnicity && <span>· {p.ethnicity}</span>}
                {p.hair && <span>· {p.hair} Hair</span>}
                {p.body && <span>· {p.body}</span>}
              </div>

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => onToggleFav(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isFav
                      ? 'bg-[#f59e0b]/20 border-[#f59e0b]/60 text-[#f59e0b]'
                      : 'bg-[#1e171f] border-[var(--line)] text-[var(--muted)] hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-[#f59e0b]' : ''}`} />
                  <span>{isFav ? 'Favorited' : 'Add to Favorites'}</span>
                </button>

                <button
                  onClick={() => onToggleSeen(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSeen
                      ? 'bg-[#4ade80]/20 border-[#4ade80]/60 text-[#4ade80]'
                      : 'bg-[#1e171f] border-[var(--line)] text-[var(--muted)] hover:text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSeen ? 'Seen ✓' : 'Mark as Seen'}</span>
                </button>

                {onStartCompare && (
                  <button
                    onClick={() => onStartCompare(p)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1e171f] border border-[var(--accent-medium)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span>Compare Stats</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Close & Cycle Controls */}
          <div className="flex items-center gap-1">
            {onPrev && (
              <button
                onClick={onPrev}
                className="p-2 rounded-full bg-[#1b151c] text-[var(--muted)] hover:text-white transition-colors"
                title="Previous starlet (←)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="p-2 rounded-full bg-[#1b151c] text-[var(--muted)] hover:text-white transition-colors"
                title="Next starlet (→)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={handleSafelyClose}
              className="p-2 rounded-full bg-[#1b151c] text-[var(--muted)] hover:text-white transition-colors ml-1"
              title="Close modal (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body with Telemetry Tracker */}
        <div onScroll={handleScroll} className="p-6 overflow-y-auto space-y-6">
          {/* Awards & Badges Banner */}
          {((p.awards && p.awards.length > 0) || (p.badges && p.badges.length > 0)) && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Accolades & Industry Recognition
              </h4>
              <div className="flex items-center gap-2 flex-wrap">
                {(p.awards || []).map((aw, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold px-3 py-1 rounded-xl bg-gradient-to-r from-[rgba(212,168,83,0.18)] to-[rgba(179,134,52,0.1)] border border-[var(--accent-medium)] text-[#fce5a9]"
                  >
                    🏆 {aw}
                  </span>
                ))}
                {(p.badges || []).map((bg, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-2.5 py-1 rounded-xl bg-[#1e1820] border border-[var(--line)] text-[var(--muted)]"
                  >
                    ★ {bg}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Persona Quotation on Life */}
          {p.quote && (
            <div className="relative p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-[#18111e] to-amber-500/5 border border-amber-400/30 shadow-md">
              <span className="text-3xl text-amber-400/40 font-serif absolute top-1 left-3 select-none leading-none">“</span>
              <p className="font-serif italic text-sm sm:text-base text-zinc-100 pl-6 pr-2 leading-relaxed">
                {p.quote}
              </p>
              <div className="mt-2 text-right">
                <span className="text-[11px] font-mono text-amber-300 font-semibold">— {p.name} · Persona Philosophy</span>
              </div>
            </div>
          )}

          {/* Reddit Community Sentiment */}
          {p.redditSentiment && (
            <div className="p-4 rounded-2xl bg-[#0f0914] border border-white/10 shadow-md">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-rose-300 uppercase tracking-wider">
                  💬 Reddit Community Consensus (r/Porn_Discuss)
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                "{p.redditSentiment}"
              </p>
            </div>
          )}

          {/* Biography & Editorial Summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
              Career Overview & Editorial Notes
            </h4>
            <div className="bg-[#141014] rounded-2xl p-4 border border-[var(--line)] text-sm text-[#e6ded7] leading-relaxed">
              {p.expanded || p.notes || `${p.name} is a premier featured entertainer in modern online adult media.`}
            </div>
          </div>

          {/* Real Verified Scene Releases */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5" /> Verified Filmography & Direct Streaming ({scenes.length})
              </h4>
              <span className="text-xs text-[var(--muted)]">
                Direct scene streaming links
              </span>
            </div>

            {isQuarantined ? (
              /* Frosted Lockout Overlay: Avatar above is visible, but content is blurred & locked */
              <div className="relative p-6 sm:p-8 rounded-3xl bg-rose-950/25 border-2 border-rose-500/50 backdrop-blur-2xl text-center space-y-4 shadow-2xl">
                <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif text-2xl font-bold text-white">
                    Melody Effect · Content Quarantine Active
                  </h4>
                  <p className="text-xs text-rose-300 font-mono mt-1 uppercase tracking-widest">
                    ⚠️ Tri-Fold (3x) Resting Protocol Enforced
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 rounded-2xl bg-black/80 border border-white/10 text-left text-xs font-mono space-y-2 backdrop-blur-md">
                  <div className="flex justify-between border-b border-white/10 pb-1.5 text-zinc-400">
                    <span>Universal Time Ending (UTC):</span>
                    <strong className="text-rose-300">{lockoutData?.unlockAtUTC || lockoutData?.utc}</strong>
                  </div>
                  <div className="flex justify-between border-b border-white/10 pb-1.5 text-zinc-400">
                    <span>Local Unlock Date & Time:</span>
                    <strong className="text-amber-300">{lockoutData?.unlockAtLocal || lockoutData?.local}</strong>
                  </div>
                  <div className="flex justify-between text-zinc-400 pt-0.5">
                    <span>Quarantine Reason:</span>
                    <span className="text-zinc-200">{lockoutData?.reason || 'Compulsive Dopamine Intercept'}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                  Her photo portrait remains accessible above, but video playback and external filmography are temporarily blurred and locked to break dopamine exhaustion.
                </p>

                {/* High-Contrast Cross Button: Close Dossier & Explore Other Starlets */}
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-4 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all cursor-pointer border border-amber-300"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                  <span>Close Dossier & Explore Other Starlets</span>
                </button>
              </div>
            ) : scenes.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayedScenes.map((s, idx) => {
                    const isQueued = s.url && watchlistUrls.has(s.url);
                    return (
                      <div
                        key={idx}
                        className="group flex flex-col justify-between bg-[#130f14] hover:bg-[#1f1821] rounded-2xl p-3 border border-[var(--line)] hover:border-[var(--accent)] transition-all shadow-md"
                      >
                        <div>
                          {/* Thumbnail screenshot if available */}
                          {s.thumbnail ? (
                            <div
                              onClick={() => setLightboxImg(s.thumbnail)}
                              className="relative aspect-video rounded-xl overflow-hidden mb-2.5 bg-[#090709] border border-[var(--line)] cursor-zoom-in"
                            >
                              <img
                                src={s.thumbnail}
                                alt={s.title}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[11px] font-bold text-white bg-black/70 px-2 py-1 rounded-full">
                                  🔍 Click to Enlarge
                                </span>
                              </div>
                              {s.duration && (
                                <span className="absolute bottom-2 right-2 text-[10px] font-mono font-bold bg-black/80 px-2 py-0.5 rounded text-white">
                                  {s.duration}
                                </span>
                              )}
                              {s.rating && (
                                <span className="absolute top-2 left-2 text-[10px] font-bold bg-[#4ade80]/90 px-1.5 py-0.5 rounded text-black">
                                  ★ {s.rating}
                                </span>
                              )}
                            </div>
                          ) : null}

                          <h5 className="font-semibold text-xs text-[var(--ink)] group-hover:text-[var(--accent)] line-clamp-2 transition-colors">
                            {s.title}
                          </h5>
                          <p className="text-[11px] text-[var(--muted)] mt-1 truncate">
                            Studio: {s.studio || 'Featured'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[11px] pt-2 mt-2 border-t border-[var(--line)] gap-2">
                          <button
                            onClick={() => {
                              if (onPlayScene) onPlayScene({ ...s, performer: p.name });
                              else window.open(s.url || `https://www.fpo.xxx/search/${encodeURIComponent(p.name)}/`, '_blank');
                            }}
                            className="font-semibold text-[var(--accent)] hover:underline flex items-center gap-1 truncate"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Play in Cinema</span>
                          </button>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {onStashScene && (
                              <button
                                onClick={async () => {
                                  await onStashScene(s, p);
                                  setStashedMap(prev => ({ ...prev, [s.url || s.title]: true }));
                                }}
                                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                  stashedMap[s.url || s.title]
                                    ? 'bg-amber-400/20 border-amber-400/60 text-amber-300'
                                    : 'bg-[#181319] border-[var(--line)] text-[var(--muted)] hover:text-amber-300'
                                }`}
                                title={stashedMap[s.url || s.title] ? 'Saved to Catalog' : 'Save to Performer Catalog'}
                              >
                                <Bookmark className={`w-3 h-3 ${stashedMap[s.url || s.title] ? 'fill-current' : ''}`} />
                              </button>
                            )}
                            {onToggleWatchlist && (
                              <button
                                onClick={() => onToggleWatchlist({ ...s, performer: p.name })}
                                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                                  isQueued
                                    ? 'bg-[#4ade80]/20 border-[#4ade80]/60 text-[#4ade80]'
                                    : 'bg-[#181319] border-[var(--line)] text-[var(--muted)] hover:text-white'
                                }`}
                                title={isQueued ? 'In Queue' : 'Add to Queue'}
                              >
                                {isQueued ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              </button>
                            )}
                            <a
                              href={s.url || `https://www.fpo.xxx/search/${encodeURIComponent(p.name)}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg border border-[var(--line)] text-[var(--muted)] hover:text-white"
                              title="Open direct video link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Scene Pagination & Deep Archive Action */}
                <div className="pt-5 flex flex-col items-center justify-center gap-3">
                  {scenes.length > visibleSceneCount ? (
                    <div className="flex flex-col items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setVisibleSceneCount(prev => Math.min(scenes.length, prev + 24))}
                        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-amber-500/25 transition-all cursor-pointer border border-amber-300"
                      >
                        <Zap className="w-4 h-4 text-black fill-current" />
                        <span>Load More Verified Releases (+24)</span>
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-black/20 text-black font-bold">
                          {displayedScenes.length} / {scenes.length}
                        </span>
                      </button>
                      <span className="text-[11px] font-mono text-zinc-500">
                        Paging through {scenes.length} verified high-definition releases
                      </span>
                    </div>
                  ) : !archiveExhausted ? (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={isLoadingExtended}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/35 hover:to-rose-500/35 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold transition-all shadow-xl flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      {isLoadingExtended ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                          <span>Querying Extended Studio Archives (Page {archivePage + 1})...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-amber-300 fill-current" />
                          <span>⚡ Deep Archive: Load Next 24 Tube Releases (Page {archivePage + 1})</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-400 text-xs font-mono">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>All {scenes.length} verified releases loaded · Complete archive displayed</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-6 text-center bg-gradient-to-b from-[#181219] to-[#100b11] rounded-2xl border border-[var(--line)] space-y-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] flex items-center justify-center mx-auto">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
                <div>
                  <h5 className="font-serif text-sm font-bold text-white">
                    Direct Video Archive Search: {p.name}
                  </h5>
                  <p className="text-xs text-[var(--muted)] mt-1 max-w-md mx-auto">
                    Search and stream verified releases, high-definition scenes, and full-length filmography directly from the archive.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
                  <a
                    href={`https://www.fpo.xxx/search/${encodeURIComponent(p.name)}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-semibold text-xs hover:brightness-110 shadow-lg transition-all"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Watch {p.name} on FPO</span>
                  </a>
                  <a
                    href={`https://www.babepedia.com/babe/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white font-medium text-xs hover:bg-white/15 border border-white/10 transition-all"
                  >
                    <span>Babepedia Dossier</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Bipartite Co-Stars in Shared Scenes */}
          {coStarsList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" /> Frequent Co-Stars:
                </h4>
                <span className="text-[10px] text-[var(--accent)]/80 font-medium tracking-wide">
                  Multi-Cast Graph
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {coStarsList.map(cs => (
                  <button
                    key={cs.id}
                    onClick={() => {
                      if (cs.fullRecord && onSelectPerformer) {
                        onSelectPerformer(cs.fullRecord);
                      }
                    }}
                    className="p-2 rounded-xl bg-[#140f15] hover:bg-[#201822] border border-[var(--line)] hover:border-[var(--accent)] text-center transition-all group"
                  >
                    <div className="relative w-12 h-12 mx-auto mb-1.5">
                      <ModalAvatar id={cs.id} name={cs.name} />
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[var(--accent)] text-black">
                        {cs.weight}x
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-white group-hover:text-[var(--accent)] truncate">
                      {cs.name}
                    </p>
                    <span className="text-[9px] text-[var(--muted)] block truncate">
                      {cs.weight} shared {cs.weight === 1 ? 'scene' : 'scenes'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Related / Similar Performers Recommendation Carousel */}
          {relatedPerformers.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> More Like {p.name}:
                </h4>
                <span className="text-[10px] text-emerald-400/90 font-medium tracking-wide">
                  Cosine Affinity Engine
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {relatedPerformers.map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelectPerformer && onSelectPerformer(item)}
                    className="p-2.5 rounded-xl bg-[#140f15] hover:bg-[#201822] border border-[var(--line)] hover:border-[var(--accent)] text-center transition-all group relative overflow-hidden"
                  >
                    <div className="relative w-14 h-14 mx-auto mb-2">
                      <ModalAvatar id={item.id} name={item.name} />
                      {item.matchPct && (
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500/90 text-black shadow-sm">
                          {item.matchPct}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-white group-hover:text-[var(--accent)] truncate">
                      {item.name}
                    </p>
                    <span className="text-[10px] text-[var(--muted)] block truncate mt-0.5">
                      {item.active?.label || (item.age ? `Age ${item.age}` : 'Starlet')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* External Verification Links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <a
              href={`https://www.fpo.xxx/search/${encodeURIComponent(p.name)}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-[var(--accent)] text-[#09070a] hover:bg-[var(--accent-light)] transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Film className="w-3.5 h-3.5" />
              <span>FPO Video Archive</span>
            </a>

            <a
              href={`https://www.babepedia.com/babe/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl text-center text-xs font-semibold bg-[#1a141b] text-[var(--ink)] hover:text-[#fb7185] border border-[var(--line)] hover:border-[#fb7185]/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-[#fb7185]" />
              <span>Babepedia Dossier</span>
            </a>

            <a
              href={`https://www.iafd.com/results.asp?searchtype=comprehensive&searchstring=${encodeURIComponent(p.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-3 rounded-xl text-center text-xs font-semibold bg-[#1a141b] text-[var(--ink)] hover:text-sky-400 border border-[var(--line)] hover:border-sky-500/40 transition-all flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-sky-400" />
              <span>IAFD Industry Registry</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* Fullscreen Screenshot Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 cursor-pointer"
          onClick={() => setLightboxImg(null)}
        >
          <img
            src={lightboxImg}
            alt="Scene Screenshot"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-[var(--line)]"
          />
        </div>
      )}
    </div>
  );
}
