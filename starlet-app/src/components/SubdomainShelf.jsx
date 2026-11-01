import React, { useRef, useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Clock, Sparkles, Eye } from 'lucide-react';

/**
 * SubdomainSceneCard
 * 
 * Individual scene card with animated 10-frame video scrub montage on hover / hold.
 * Automatically derives numbered video scrub frames (1.jpg to 10.jpg) from tube thumbnails.
 */
/**
 * SubdomainSceneCard
 * 
 * Enhanced Beeg-Style Media Scrubbing Engine:
 * 1. Proportional horizontal mouse cursor scrub (instant 60fps GPU-composited scrubbing)
 * 2. Touch drag scrub for mobile and tablet touchscreens
 * 3. Preloaded frame cache in browser memory (zero flicker / white voids)
 * 4. Glowing timeline scrub progress bar across the bottom
 * 5. Serial storyboard autoplay loop on hover / eye click
 * 6. "👑 BEST OF THE BEST" luxury gold badge for Tier A scenes
 */
function SubdomainSceneCard({ scene, onPlayScene, onOpenDossier }) {
  const primaryThumb = scene.thumbnail || scene.thumb || './avatars/default.jpg';
  const performers = Array.isArray(scene.performers) ? scene.performers : [scene.performer].filter(Boolean);

  // Generate 10-frame animated scrub montage URLs strictly from this exact video
  const montageFrames = useMemo(() => {
    const list = [];
    if (primaryThumb && typeof primaryThumb === 'string') {
      const match = primaryThumb.match(/^(.*\/)(\d+)\.(jpg|webp|jpeg)$/i);
      if (match) {
        const prefix = match[1];
        const ext = match[3];
        // Generate continuous time-slice frames 1 to 10
        for (let i = 1; i <= 10; i++) {
          list.push(`${prefix}${i}.${ext}`);
        }
      } else {
        list.push(primaryThumb);
      }
    }
    return list.length > 0 ? list : [primaryThumb];
  }, [primaryThumb]);

  const [isHovered, setIsHovered] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(primaryThumb);
  const [imgFailedCount, setImgFailedCount] = useState(0);

  const cardRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const intervalRef = useRef(null);
  const preloadedRef = useRef(false);

  // Preload frames in memory on first hover so seeking is instant
  const preloadFrames = () => {
    if (preloadedRef.current || montageFrames.length <= 1) return;
    preloadedRef.current = true;
    montageFrames.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };

  const startAutoMontage = () => {
    preloadFrames();
    setIsHovered(true);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setFrameIndex(idx => {
        const next = (idx + 1) % montageFrames.length;
        setImgSrc(montageFrames[next]);
        return next;
      });
    }, 220); // 220ms serial preview trailer cycle
  };

  const stopMontage = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsHovered(false);
    setFrameIndex(0);
    setImgSrc(primaryThumb);
  };

  useEffect(() => {
    return () => stopMontage();
  }, []);

  // 1. Desktop Hover: Starts 200ms preview trailer
  const handleMouseEnter = () => {
    preloadFrames();
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      startAutoMontage();
    }, 150);
  };

  const handleMouseLeave = () => {
    stopMontage();
  };

  // 2. Beeg 60 FPS Cursor Scrubbing: updates frame index based on horizontal mouse position
  const handleMouseMove = (e) => {
    if (!cardRef.current || montageFrames.length <= 1) return;
    preloadFrames();
    const rect = cardRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const nextIdx = Math.min(montageFrames.length - 1, Math.floor(ratio * montageFrames.length));

    if (nextIdx !== frameIndex) {
      setFrameIndex(nextIdx);
      setImgSrc(montageFrames[nextIdx]);
    }

    if (!isHovered) setIsHovered(true);

    // Pause the auto timer while user is actively steering the cursor
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 3. Mobile Touch Drag Scrubbing
  const handleTouchMove = (e) => {
    if (!cardRef.current || !e.touches[0] || montageFrames.length <= 1) return;
    preloadFrames();
    const rect = cardRef.current.getBoundingClientRect();
    const touchX = e.touches[0].clientX;
    const ratio = Math.max(0, Math.min(1, (touchX - rect.left) / rect.width));
    const nextIdx = Math.min(montageFrames.length - 1, Math.floor(ratio * montageFrames.length));

    if (nextIdx !== frameIndex) {
      setFrameIndex(nextIdx);
      setImgSrc(montageFrames[nextIdx]);
    }
    if (!isHovered) setIsHovered(true);
  };

  const handleImageError = () => {
    setImgFailedCount(c => c + 1);
    if (imgFailedCount === 0 && scene.performerId) {
      setImgSrc(`./avatars/${scene.performerId}.jpg`);
    } else {
      setImgSrc('./avatars/melody-marks.jpg');
    }
  };

  const isBestOfTheBest = scene.isBest || scene.tierLevel === 'best' || (scene.score && scene.score >= 78);

  return (
    <div
      ref={cardRef}
      onClick={() => onPlayScene(scene)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchEnd={stopMontage}
      className={`flex-shrink-0 w-72 sm:w-80 group/card rounded-2xl bg-[#0e0912] border overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_32px_rgba(212,175,55,0.3)] flex flex-col select-none relative ${
        isBestOfTheBest ? 'border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.15)]' : 'border-white/10 hover:border-amber-400/80'
      }`}
    >
      {/* Thumbnail / Animated Montage Viewport */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <img
          src={imgSrc}
          alt={scene.title}
          className={`w-full h-full object-cover transition-transform duration-200 filter ${
            isHovered ? 'scale-105 brightness-105' : 'brightness-95'
          }`}
          onError={handleImageError}
          loading="lazy"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

        {/* Beeg Timeline Scrubber Progress Line Indicator */}
        {isHovered && (
          <div className="absolute bottom-0 inset-x-0 h-1.5 bg-black/70 z-30 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 transition-all duration-75 shadow-[0_0_10px_rgba(245,158,11,0.9)]"
              style={{ width: `${((frameIndex + 1) / montageFrames.length) * 100}%` }}
            />
          </div>
        )}

        {/* 👑 BEST OF THE BEST Badge */}
        {isBestOfTheBest ? (
          <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-[9px] tracking-wider uppercase shadow-lg shadow-amber-400/30 flex items-center gap-1 z-20 pointer-events-none">
            <span>👑</span>
            <span>BEST OF THE BEST</span>
          </div>
        ) : isHovered ? (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/90 border border-amber-400/60 backdrop-blur-md flex items-center gap-1.5 z-20 shadow-lg pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span className="text-[10px] font-mono font-bold text-amber-300 tracking-wider uppercase">
              FRAME {frameIndex + 1}/{montageFrames.length}
            </span>
          </div>
        ) : null}

        {/* Quality Badge */}
        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-amber-400 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md pointer-events-none z-10">
          {scene.quality || '1080p HD'}
        </div>

        {/* Duration Badge */}
        {scene.duration && (
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-mono text-white flex items-center gap-1 border border-white/10 pointer-events-none z-10">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{scene.duration}</span>
          </div>
        )}

        {/* Eye Preview Button (Plays Continuous Slotted Montage on Tap/Click) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isHovered) stopMontage();
            else startAutoMontage();
          }}
          className="absolute bottom-2.5 left-2.5 px-2 py-1 rounded-md bg-black/80 hover:bg-amber-400 hover:text-black text-amber-300 backdrop-blur-md text-[10px] font-mono flex items-center gap-1 border border-amber-400/30 transition-all z-20 cursor-pointer"
          title="Toggle Continuous Slotted Video Montage"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">{isHovered ? 'Pause' : 'Preview'}</span>
        </button>

        {/* Escalation Stage Badge (if available) */}
        {!isHovered && scene.escalationStage && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-rose-600/90 text-white font-bold text-[10px] uppercase tracking-wider backdrop-blur-md border border-rose-400/30 z-10">
            Stage {scene.escalationStage}
          </div>
        )}

        {/* Play Button Icon on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/35 backdrop-blur-[1px] pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-black flex items-center justify-center shadow-xl shadow-amber-400/50 transform scale-90 group-hover/card:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Metadata */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 group-hover/card:text-amber-300 transition-colors line-clamp-2 leading-snug">
          {scene.title}
        </h4>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-1.5 truncate">
            {performers.slice(0, 2).map((pName, pIdx) => (
              <span
                key={pIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenDossier) onOpenDossier(pName);
                }}
                className="hover:text-amber-300 hover:underline cursor-pointer truncate font-medium text-zinc-300"
              >
                {pName}
                {pIdx < Math.min(performers.length, 2) - 1 ? ',' : ''}
              </span>
            ))}
            {performers.length > 2 && (
              <span className="text-zinc-500 font-mono">+{performers.length - 2}</span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {scene.tierLevel === 'tier_b' && (
              <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-1 rounded">
                Tier B
              </span>
            )}
            {scene.rating && (
              <span className="font-mono text-amber-400 flex items-center gap-0.5 font-bold">
                ★ {scene.rating}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SubdomainShelf
 * 
 * Horizontal, Netflix-style carousel for scenes belonging to a specific subdomain
 * (e.g., Christmas & Holiday Gifting, Card Bets & Debt Trades, Church/Nun, etc.).
 */
export default function SubdomainShelf({ subdomain, scenes = [], onPlayScene, onOpenDossier }) {
  const scrollRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(24);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -420 : 420;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const visibleScenes = useMemo(() => {
    return scenes.slice(0, visibleCount);
  }, [scenes, visibleCount]);

  if (!scenes || scenes.length === 0) {
    return (
      <div className="mb-10 p-5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400/50" />
            <h3 className="text-base sm:text-lg font-bold text-amber-200 font-serif tracking-wide">
              {subdomain.title}
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Archived Collection</span>
        </div>
        <p className="text-xs text-zinc-500 font-mono">
          Verified releases loaded directly from local encrypted store.
        </p>
      </div>
    );
  }

  return (
    <div className="mb-12 relative group/shelf">
      {/* Shelf Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/10 border border-amber-400/40 flex items-center justify-center text-amber-300 font-serif font-bold text-sm shadow-lg shadow-amber-400/10">
            ✦
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-wide font-serif flex items-center gap-2">
              <span>{subdomain.title}</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold">
                {scenes.length} {scenes.length === 1 ? 'release' : 'releases'}
              </span>
            </h3>
            {subdomain.description && (
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{subdomain.description}</p>
            )}
          </div>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-1.5 opacity-80 group-hover/shelf:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-black/80 hover:bg-amber-400 hover:text-black text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-black/80 hover:bg-amber-400 hover:text-black text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-md"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {visibleScenes.map((scene, idx) => (
          <SubdomainSceneCard
            key={scene.id || scene.url || idx}
            scene={scene}
            onPlayScene={onPlayScene}
            onOpenDossier={onOpenDossier}
          />
        ))}

        {scenes.length > visibleCount && (
          <div
            onClick={() => setVisibleCount(c => c + 24)}
            className="flex-shrink-0 w-44 rounded-2xl bg-black/60 border border-amber-400/30 hover:border-amber-400 text-amber-300 hover:text-white flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-105 active:scale-95 group/load select-none"
            title="Load additional verified releases"
          >
            <Sparkles className="w-6 h-6 text-amber-400 mb-2 group-hover/load:rotate-12 transition-transform" />
            <span className="text-xs font-mono font-bold text-center">Load More Releases</span>
            <span className="text-[10px] text-zinc-400 mt-1">+{scenes.length - visibleCount} more</span>
          </div>
        )}
      </div>
    </div>
  );
}
