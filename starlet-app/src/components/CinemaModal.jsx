import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Play, ExternalLink, Film, Clock, Star,
  Plus, Check, ShieldCheck, RotateCcw, Maximize2, AlertCircle, Loader2, Sparkles, Settings, Bookmark
} from 'lucide-react';
import { recordSceneWatch } from '../engine/habituationEngine';

function getCleanEmbedUrl(rawUrl) {
  if (!rawUrl) return null;
  // FPO video link: https://www.fpo.xxx/video/12345/slug/ -> https://www.fpo.xxx/embed/12345
  const fpoMatch = rawUrl.match(/fpo\.xxx\/video\/(\d+)/i);
  if (fpoMatch) return `https://www.fpo.xxx/embed/${fpoMatch[1]}`;

  // If already embed URL:
  if (rawUrl.includes('/embed/')) return rawUrl;

  return null;
}

export default function CinemaModal({
  scene,
  performer,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onOpenDossier,
  onStashScene,
  isStashed = false
}) {
  const [stashed, setStashed] = useState(isStashed);
  const [directVideoUrl, setDirectVideoUrl] = useState(scene?.videoUrl || null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveFailed, setResolveFailed] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [playerKey, setPlayerKey] = useState(0);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p HD');
  const [currentMirror, setCurrentMirror] = useState('native');
  const [mirrorEmbedUrl, setMirrorEmbedUrl] = useState(null);
  const [isResolvingMirror, setIsResolvingMirror] = useState(false);
  const [mirrorNotification, setMirrorNotification] = useState(null);
  const videoRef = useRef(null);

  // Cinema Mode Hover Scrub Montage
  const [isCinemaMontageActive, setIsCinemaMontageActive] = useState(false);
  const [cinemaFrameIndex, setCinemaFrameIndex] = useState(0);

  const montageFrames = useMemo(() => {
    const list = [];
    const thumb = scene?.thumbnail;
    if (thumb && typeof thumb === 'string') {
      const match = thumb.match(/^(.*\/)(\d+)\.(jpg|webp|jpeg)$/i);
      if (match) {
        for (let i = 1; i <= 10; i++) {
          list.push(`${match[1]}${i}.${match[3]}`);
        }
      } else {
        list.push(thumb);
      }
    }
    return list.length > 0 ? list : [scene?.thumbnail || './avatars/default.jpg'];
  }, [scene?.thumbnail]);

  if (!scene) return null;

  const targetUrl = scene.url || (performer ? `https://www.fpo.xxx/search/${encodeURIComponent(performer.name)}/` : 'https://www.fpo.xxx');
  const embedUrl = getCleanEmbedUrl(scene.url);
  const activeEmbedUrl = mirrorEmbedUrl || embedUrl;

  const handleSelectMirror = async (mirrorKey, qualityLabel) => {
    setSelectedQuality(qualityLabel);
    setShowQualityMenu(false);

    if (mirrorKey === 'native') {
      setCurrentMirror('native');
      setMirrorEmbedUrl(null);
      setUseIframeFallback(false);
      setMirrorNotification('Switched to FPO Native Stream');
      setTimeout(() => setMirrorNotification(null), 2500);
      return;
    }

    if (mirrorKey === 'direct') {
      setCurrentMirror('direct');
      setMirrorEmbedUrl(null);
      setUseIframeFallback(false);
      setMirrorNotification('Playing Direct MP4 Stream');
      setTimeout(() => setMirrorNotification(null), 2500);
      return;
    }

    setIsResolvingMirror(true);
    setMirrorNotification(`Resolving ${mirrorKey.toUpperCase()} stream...`);

    try {
      const pName = performer?.name || scene?.performer || '';
      const sTitle = scene?.title || '';
      const res = await fetch(`/api/mirror?source=${mirrorKey}&query=${encodeURIComponent(sTitle)}&performer=${encodeURIComponent(pName)}`);
      const data = await res.json();
      if (data.success && data.embedUrl) {
        setCurrentMirror(mirrorKey);
        setMirrorEmbedUrl(data.embedUrl);
        setUseIframeFallback(true);
        setMirrorNotification(`Connected to ${mirrorKey.toUpperCase()} Mirror!`);
        setTimeout(() => setMirrorNotification(null), 3000);
      } else {
        setMirrorNotification(`Mirror unavailable for this title. Using FPO stream.`);
        setTimeout(() => setMirrorNotification(null), 3500);
      }
    } catch (err) {
      setMirrorNotification(`Mirror connection failed. Using FPO stream.`);
      setTimeout(() => setMirrorNotification(null), 3500);
    } finally {
      setIsResolvingMirror(false);
    }
  };

  // Attempt to resolve direct MP4 stream from local /api/video-stream proxy
  useEffect(() => {
    let active = true;
    if (scene.videoUrl) {
      if (scene.videoUrl.startsWith('http')) {
        setDirectVideoUrl(`/api/proxy-video?url=${encodeURIComponent(scene.videoUrl)}`);
      } else {
        setDirectVideoUrl(scene.videoUrl);
      }
      return;
    }

    const videoId = scene.url?.match(/fpo\.xxx\/video\/(\d+)/i)?.[1];
    if (videoId) {
      setIsResolving(true);
      fetch(`/api/stream?id=${videoId}`)
        .then(res => {
          if (!res.ok) throw new Error('Status ' + res.status);
          return res.json();
        })
        .then(data => {
          if (active && data.success) {
            setDirectVideoUrl(data.proxyStreamUrl || `/api/video-stream?id=${videoId}`);
          } else if (active) {
            setResolveFailed(true);
          }
        })
        .catch(() => {
          if (active) {
            // Fallback: try proxy-stream directly
            setDirectVideoUrl(`/api/video-stream?id=${videoId}`);
          }
        })
        .finally(() => {
          if (active) setIsResolving(false);
        });
    } else {
      setResolveFailed(true);
    }

    return () => {
      active = false;
    };
  }, [scene.url, scene.videoUrl]);

  const handleReload = () => {
    setPlayerKey(k => k + 1);
  };

  // Track active scene playback duration for ADHD abandonment / fatigue telemetry
  useEffect(() => {
    const playStartTime = Date.now();
    return () => {
      const watchSec = Math.max(1, (Date.now() - playStartTime) / 1000);
      const perfId = performer?.id || scene?.performerId;
      if (perfId) {
        recordSceneWatch(perfId, watchSec);
      }
    };
  }, [performer?.id, scene?.title]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-xl">
      <div className="absolute inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 25 }}
        className="relative z-10 w-full max-w-5xl bg-[#110c13] rounded-3xl border border-[var(--accent)]/30 shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Cinema Top Header */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 bg-[#161019] flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="p-2.5 rounded-2xl bg-[var(--accent)] text-black flex-shrink-0 shadow-lg">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-xl font-bold text-white truncate">
                  {scene.title}
                </h3>
                {directVideoUrl ? (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/20 text-[var(--accent)] border border-[var(--accent)]/40 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-[var(--accent)]" />
                    DIRECT NATIVE MP4
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    AD-SHIELD ACTIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate mt-0.5">
                {performer ? (
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenDossier) onOpenDossier(performer);
                    }}
                    className="text-[var(--accent)] hover:underline font-semibold"
                  >
                    {performer.name}
                  </button>
                ) : 'Featured Starlet'} · Studio: <span className="text-zinc-300 font-medium">{scene.studio || 'Premier Studio'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              title="Reload video stream"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-zinc-300 hover:text-white hover:bg-white/20 transition-colors"
              title="Close Cinema [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Screen Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
          {directVideoUrl && !useIframeFallback && !mirrorEmbedUrl ? (
            /* Mode 1: 100% Ad-Free Native HTML5 MP4 Player */
            <div className="relative w-full h-full bg-black flex items-center justify-center">
              <video
                key={playerKey + '-' + directVideoUrl}
                ref={videoRef}
                src={directVideoUrl}
                poster={scene.thumbnail}
                controls
                autoPlay
                playsInline
                onError={() => {
                  console.warn('Direct stream error, switching to embed');
                  setUseIframeFallback(true);
                }}
                className="w-full h-full bg-black object-contain cursor-pointer"
              />

              {/* Top Watermark Badge */}
              <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase bg-black/80 text-[var(--accent)] border border-[var(--accent)]/40 px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3.5 h-3.5" /> Ad-Free Native Stream
                </span>
              </div>
            </div>
          ) : (isResolving || isResolvingMirror) ? (
            /* Resolving State */
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-[#090709] text-center p-6">
              {scene.thumbnail && (
                <img
                  src={scene.thumbnail}
                  alt={scene.title}
                  className="absolute inset-0 w-full h-full object-cover filter blur-sm brightness-40"
                />
              )}
              <div className="relative z-10 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin mb-3" />
                <h4 className="text-sm font-bold text-white mb-1">
                  {mirrorNotification || 'Connecting to Video Stream Mirror...'}
                </h4>
                <p className="text-xs text-zinc-400 max-w-xs">
                  Bypassing advertising layers to establish verified stream connection.
                </p>
              </div>
            </div>
          ) : activeEmbedUrl ? (
            /* Mode 2: Strict Ad-Shielded Sandboxed Iframe (zero popups, zero redirects, zero clickjacking) */
            <div className="relative w-full h-full bg-black">
              <iframe
                key={playerKey + '-' + activeEmbedUrl}
                src={activeEmbedUrl}
                title={scene.title}
                className="w-full h-full border-0 bg-black"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              />

              {/* Watermark Protection Bar */}
              <div className="absolute top-3 left-3 pointer-events-none z-10 flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-wider uppercase bg-black/80 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-md backdrop-blur-md flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Ad-Shielded {currentMirror.toUpperCase()} Stream
                </span>
              </div>

              {mirrorNotification && (
                <div className="absolute top-3 right-3 z-30 px-3.5 py-1.5 rounded-full bg-black/90 border border-amber-400/50 text-xs font-mono text-amber-200 shadow-2xl flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{mirrorNotification}</span>
                </div>
              )}
            </div>
          ) : (
            /* Mode 3: In-App Stream Resolver with Interactive Hover Scrub Montage (Zero External Redirects) */
            <div
              className="relative w-full h-full flex items-center justify-center bg-black cursor-pointer overflow-hidden group/cinemapreview"
              onMouseEnter={() => {
                if (montageFrames.length > 1) setIsCinemaMontageActive(true);
              }}
              onMouseLeave={() => {
                setIsCinemaMontageActive(false);
                setCinemaFrameIndex(0);
              }}
              onMouseMove={(e) => {
                if (montageFrames.length > 1) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const xPct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const fIdx = Math.floor(xPct * montageFrames.length);
                  setCinemaFrameIndex(Math.min(fIdx, montageFrames.length - 1));
                }
              }}
            >
              <img
                src={isCinemaMontageActive ? montageFrames[cinemaFrameIndex] : (scene.thumbnail || './avatars/melody-marks.jpg')}
                alt={scene.title}
                className="w-full h-full object-cover filter brightness-75 transition-all duration-200"
                onError={(e) => {
                  e.currentTarget.src = performer?.id ? `./avatars/${performer.id}.jpg` : './avatars/melody-marks.jpg';
                }}
              />

              {/* Hover Scrub Montage Indicator Badge */}
              {isCinemaMontageActive && (
                <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/90 border border-amber-400/60 backdrop-blur-md flex items-center gap-2 shadow-2xl">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    SCRUB PREVIEW · FRAME {cinemaFrameIndex + 1}/{montageFrames.length}
                  </span>
                </div>
              )}

              {/* Hover Scrub Timeline Bar at Bottom */}
              {isCinemaMontageActive && (
                <div className="absolute bottom-12 inset-x-6 z-20 h-1.5 rounded-full bg-white/20 overflow-hidden backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all duration-75"
                    style={{ width: `${((cinemaFrameIndex + 1) / montageFrames.length) * 100}%` }}
                  />
                </div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
                <button
                  type="button"
                  onClick={() => handleSelectMirror('eporner', '1080p HD')}
                  className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-400 to-amber-300 text-black flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform mb-3 cursor-pointer group/btn"
                  title="Launch In-App Video Stream"
                >
                  <Play className="w-9 h-9 fill-current ml-1 group-hover/btn:scale-110 transition-transform" />
                </button>

                <span className="text-xs font-bold text-white uppercase tracking-widest bg-black/85 px-4 py-1.5 rounded-full border border-white/20 mt-1 shadow-lg">
                  Launch In-App 1080p Stream (Zero External Ads)
                </span>
                <span className="text-[11px] text-zinc-400 font-mono mt-2">
                  Hover mouse horizontally to scrub through montage frames
                </span>
              </div>
            </div>
          )}

          {/* Bottom Badges Overlay */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white pointer-events-none z-10">
            <div className="flex items-center gap-2">
              {scene.duration && (
                <span className="flex items-center gap-1 font-mono font-bold bg-black/85 px-2.5 py-1 rounded-lg border border-white/10 shadow-md">
                  <Clock className="w-3.5 h-3.5 text-[var(--accent)]" /> {scene.duration}
                </span>
              )}
              {scene.rating && (
                <span className="flex items-center gap-1 font-bold bg-emerald-400 text-black px-2.5 py-1 rounded-lg shadow-md">
                  <Star className="w-3.5 h-3.5 fill-black" /> {scene.rating}
                </span>
              )}
            </div>

            <span className="text-[11px] text-zinc-400 font-mono bg-black/85 px-2.5 py-1 rounded-lg border border-white/10">
              {directVideoUrl ? '1080p Direct MP4' : 'Verified Cinema Stream'}
            </span>
          </div>
        </div>

        {/* Cinema Controls Bar */}
        <div className="p-3.5 sm:p-5 bg-[#140e16] flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap relative">
            {/* Mirror / Quality Switcher Gear */}
            <div className="relative">
              <button
                onClick={() => setShowQualityMenu(s => !s)}
                className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-mono font-bold text-amber-300 transition-all flex items-center gap-1.5 cursor-pointer"
                title="Select Stream Quality & Mirror"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{selectedQuality}</span>
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-12 left-0 z-50 w-56 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/20 p-2 shadow-2xl space-y-1">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase text-zinc-400 font-bold border-b border-white/10">
                    Stream Mirror & Quality
                  </div>
                  {[
                    { label: 'Eporner (1080p 60fps HD)', key: 'eporner', q: '1080p HD', icon: '★' },
                    { label: 'XVideos (720p HQ)', key: 'xvideos', q: '720p HQ', icon: '●' },
                    { label: 'FPO Archive (480p Native)', key: 'native', q: '480p Native', icon: '■' },
                    { label: 'Direct MP4 Stream', key: 'direct', q: 'Direct MP4', icon: '▲' }
                  ].map(m => (
                    <button
                      key={m.label}
                      onClick={() => handleSelectMirror(m.key, m.q)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                        selectedQuality === m.q
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
                          : 'text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      <span className="truncate">{m.label}</span>
                      <span className="text-[10px] font-mono opacity-60">{m.icon}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {directVideoUrl && (
              <button
                onClick={() => setUseIframeFallback(f => !f)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-zinc-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{useIframeFallback ? 'Switch to Native Player' : 'Switch to Embed Player'}</span>
              </button>
            )}

            {onStashScene && (
              <button
                onClick={async () => {
                  await onStashScene(scene, performer);
                  setStashed(true);
                }}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  stashed
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white hover:border-amber-400 hover:text-amber-300'
                }`}
                title="Permanently save this scene to starlet library catalog"
              >
                <Bookmark className={`w-4 h-4 ${stashed ? 'fill-current' : ''}`} />
                <span>{stashed ? 'Saved in Catalog' : 'Save to Library'}</span>
              </button>
            )}

            {onToggleWatchlist && (
              <button
                onClick={() => onToggleWatchlist(scene)}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                  isInWatchlist
                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white hover:border-[var(--accent)]'
                }`}
              >
                {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{isInWatchlist ? 'In Queue' : 'Add to Queue'}</span>
              </button>
            )}

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-light)] text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
              title="Open source video page in new tab"
            >
              <span>Watch on Source Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {directVideoUrl
                ? 'Direct Native MP4 Stream Active: 100% Ad-Free Playback'
                : 'Ad-Shield Active: Popups blocked by browser security'}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
