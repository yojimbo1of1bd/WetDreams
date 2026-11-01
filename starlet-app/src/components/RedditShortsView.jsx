import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown,
  ExternalLink, Sparkles, RefreshCw, Smartphone, Eye, Film, AlertCircle
} from 'lucide-react';
import StarletAvatar from './StarletAvatar';

export default function RedditShortsView({ performers = [], onOpenDossier }) {
  const [shorts, setShorts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const [showPlayPulse, setShowPlayPulse] = useState(false);

  const videoRef = useRef(null);
  const touchStartY = useRef(0);

  // 1. Fetch live or cached Reddit Shorts
  const fetchShorts = async () => {
    setIsLoading(true);
    setVideoError(false);
    try {
      const res = await fetch('/api/reddit-shorts');
      if (res.ok) {
        const data = await res.json();
        if (data.shorts && data.shorts.length > 0) {
          setShorts(data.shorts);
          setCurrentIndex(0);
        }
      }
    } catch (err) {
      console.warn('Failed to load reddit shorts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShorts();
  }, []);

  const currentShort = shorts[currentIndex];

  // Reset video error on short change
  useEffect(() => {
    setVideoError(false);
  }, [currentIndex]);

  // 2. Play/Pause video when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          setIsMuted(true);
          videoRef.current?.play().catch(() => {});
        });
      }
    }
  }, [currentIndex, isPlaying]);

  const handleNext = () => {
    if (shorts.length === 0) return;
    setCurrentIndex(i => (i + 1) % shorts.length);
  };

  const handlePrev = () => {
    if (shorts.length === 0) return;
    setCurrentIndex(i => (i - 1 + shorts.length) % shorts.length);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
      setShowPlayPulse(true);
      setTimeout(() => setShowPlayPulse(false), 500);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  // 3. Keyboard Arrow Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm') {
        e.preventDefault();
        setIsMuted(m => !m);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shorts.length]);

  // 4. Touch Gestures for Mobile (Swipe Up / Down)
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (deltaY > 50) {
      handleNext(); // Swiped Up -> Next Short
    } else if (deltaY < -50) {
      handlePrev(); // Swiped Down -> Prev Short
    }
  };

  // Find matched performer in title or metadata
  const matchedPerformer = currentShort ? performers.find(p => {
    if (currentShort.performer && p.name.toLowerCase() === currentShort.performer.toLowerCase()) return true;
    const nameLower = p.name.toLowerCase();
    const titleLower = currentShort.title.toLowerCase();
    return titleLower.includes(nameLower);
  }) : null;

  const performerAvatarId = matchedPerformer?.id || currentShort?.performerId || currentShort?.author;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center select-none">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--accent)]">
          Pulling Vertical Reddit Shorts Feed...
        </p>
      </div>
    );
  }

  if (!currentShort) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Smartphone className="w-12 h-12 text-zinc-500" />
        <h3 className="font-serif text-xl font-bold text-white">No Shorts Available</h3>
        <p className="text-xs text-zinc-400 max-w-sm">
          Could not retrieve vertical clips at this moment.
        </p>
        <button
          onClick={fetchShorts}
          className="px-5 py-2.5 rounded-full bg-[var(--accent)] text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading Shorts</span>
        </button>
      </div>
    );
  }

  const isEmbed = !!currentShort.embedUrl;
  const activeMediaSrc = currentShort.embedUrl || currentShort.videoUrl;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-4 px-2 sm:px-4 flex flex-col items-center select-none">
      {/* Top Feed Header & Controls */}
      <div className="w-full max-w-md flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          <h2 className="font-serif font-bold text-base sm:text-lg text-white flex items-center gap-1.5">
            <span>📱 Reddit Shorts & Vertical Reels</span>
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
          <span className="bg-black/60 px-2.5 py-1 rounded-full border border-white/10">
            {currentIndex + 1} / {shorts.length}
          </span>
          <button
            onClick={fetchShorts}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Feed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 9:16 Vertical Reel Player Container */}
      <div
        className="relative w-full max-w-md aspect-[9/16] max-h-[82vh] bg-[#0c080e] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] border-2 border-white/15 group cursor-pointer"
        onClick={!isEmbed ? togglePlay : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Layer 1: Ambient High-Res Starlet Backdrop (Ensures screen is NEVER pitch black!) */}
        <div className="absolute inset-0 bg-[#120a15] flex items-center justify-center overflow-hidden">
          {currentShort.thumbnail ? (
            <img
              src={currentShort.thumbnail}
              alt=""
              className="w-full h-full object-cover filter blur-md brightness-40 scale-105"
            />
          ) : performerAvatarId ? (
            <img
              src={`./avatars/${performerAvatarId}.jpg`}
              alt=""
              className="w-full h-full object-cover filter blur-md brightness-40 scale-105"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-purple-950/40 via-black to-rose-950/30" />
          )}
        </div>

        {/* Layer 2: Active Stream Player (Embed iframe OR HTML5 Video) */}
        {isEmbed ? (
          <iframe
            key={currentShort.id || currentShort.embedUrl}
            src={currentShort.embedUrl}
            title={currentShort.title}
            className="relative z-10 w-full h-full object-cover border-0 pointer-events-auto"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : !videoError && activeMediaSrc ? (
          <video
            ref={videoRef}
            key={currentShort.id || activeMediaSrc}
            src={activeMediaSrc}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            onError={() => setVideoError(true)}
            className="relative z-10 w-full h-full object-cover"
          />
        ) : (
          /* High-Octane Fallback Card if Video stream fails (Zero Pitch Black) */
          <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4 bg-black/60 backdrop-blur-md">
            <div className="relative p-1 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 shadow-2xl">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/60 bg-black flex items-center justify-center">
                <StarletAvatar id={performerAvatarId} name={currentShort.performer || currentShort.title} size="xl" />
              </div>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white max-w-xs mx-auto line-clamp-2">
                {currentShort.title}
              </h3>
              <p className="text-xs font-mono text-amber-300 mt-1">
                {currentShort.performer || 'Starlet VIP Exclusive'}
              </p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-xs">
              {matchedPerformer && onOpenDossier && (
                <button
                  type="button"
                  onClick={() => onOpenDossier(matchedPerformer)}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Open {matchedPerformer.name} Dossier</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Next Short Reel</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Ambient Top & Bottom Vignettes */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none z-20" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none z-20" />

        {/* Play/Pause Pulse Feedback */}
        <AnimatePresence>
          {showPlayPulse && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
            >
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-2xl">
                {isPlaying ? <Play className="w-8 h-8 fill-current ml-1" /> : <Pause className="w-8 h-8 fill-current" />}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Right Action Rail */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4 z-30" onClick={e => e.stopPropagation()}>
          {/* Mute / Unmute Button (for HTML5 video) */}
          {!isEmbed && (
            <button
              onClick={toggleMute}
              className={`p-3 rounded-full backdrop-blur-xl border transition-all cursor-pointer shadow-lg active:scale-90 ${
                isMuted
                  ? 'bg-rose-500/80 border-rose-400 text-white animate-pulse'
                  : 'bg-black/60 border-white/20 text-white hover:bg-black/80'
              }`}
              title={isMuted ? 'Tap to Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          )}

          {/* Upvotes Pill */}
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-amber-400 shadow-lg">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-mono font-bold text-white mt-1 drop-shadow">
              {currentShort.ups > 1000 ? `${(currentShort.ups / 1000).toFixed(1)}k` : currentShort.ups}
            </span>
          </div>

          {/* Subreddit Link */}
          {currentShort.permalink && (
            <a
              href={currentShort.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/20 text-zinc-300 hover:text-white shadow-lg transition-colors"
              title="Open Original Reddit Post"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Floating Vertical Prev/Next Nav Pill on Side for Desktop */}
        <div className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 flex-col gap-2 z-30" onClick={e => e.stopPropagation()}>
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white transition-all cursor-pointer shadow-lg active:scale-95"
            title="Previous Short [↑ / k]"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-xl border border-white/20 text-white transition-all cursor-pointer shadow-lg active:scale-95"
            title="Next Short [↓ / j]"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Overlay Info (Metadata, Subreddit Badge, Performer Link) */}
        <div className="absolute inset-x-0 bottom-0 p-5 z-30 text-left space-y-2.5" onClick={e => e.stopPropagation()}>
          {/* Subreddit Badge + Match Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/40 uppercase tracking-wider">
              r/{currentShort.subreddit || 'verticalnsfw'}
            </span>

            {matchedPerformer && onOpenDossier && (
              <button
                onClick={() => onOpenDossier(matchedPerformer)}
                className="text-[10px] font-mono font-bold text-black bg-[var(--accent)] hover:brightness-110 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md transition-all cursor-pointer"
              >
                <Eye className="w-3 h-3" />
                <span>Open {matchedPerformer.name} Dossier</span>
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="font-serif text-sm sm:text-base font-bold text-white leading-snug drop-shadow-md line-clamp-2">
            {currentShort.title}
          </h3>

          {/* Swipe Hint */}
          <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-zinc-400 border-t border-white/10">
            <span>Swipe or click arrows to scroll reels</span>
            <span className="text-zinc-500">{isEmbed ? 'Interactive Reel Stream' : 'Tap to pause'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
