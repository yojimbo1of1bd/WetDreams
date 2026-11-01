import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, VolumeX, Play, Pause, ChevronLeft, ChevronRight,
  RotateCcw, Clock, Timer, Hourglass, Settings, X, Sparkles
} from 'lucide-react';
import GlassShatter from './GlassShatter';
import SanctuaryGridMatrix from './SanctuaryGridMatrix';

const WALLPAPERS = [
  {
    id: 'cowboy-bebop',
    file: 'ed-and-ein-cowboy-bebop.3840x2160.mp4',
    title: 'Cowboy Bebop · Ed & Ein Summer Meadow',
    clockPos: 'bottom-left',
    color: '#f7f7f0',
    lightSource: 'Sun Top-Right',
    rationale: 'Dynamic diagonal triad with Sun & Ed/Ein.'
  },
  {
    id: 'broken-window',
    file: 'broken-window-the-last-of-us.1920x1080.mp4',
    title: 'The Last of Us · Broken Window',
    clockPos: 'bottom-right',
    color: '#e2e8f0',
    lightSource: 'Window Stream Top-Left',
    rationale: 'Natural light enters from left; clock sits in low-luminance right shadow.'
  },
  {
    id: 'ellie-guitar',
    file: 'ellie-playing-guitar-in-the-room.1920x1080.mp4',
    title: "The Last of Us · Ellie's Guitar Room",
    clockPos: 'bottom-right',
    color: '#fde68a',
    lightSource: 'Lamp Over Ellie Center-Left',
    rationale: 'Key light hits Ellie; clock rests in subtle off-white opposite shadow.'
  },
  {
    id: 'jake-night',
    file: 'jake-listens-to-music-alone-at-night-adventure-time-moewalls-com.mp4',
    title: 'Adventure Time · Jake Night Lo-Fi',
    clockPos: 'top-left',
    color: '#e0f2fe',
    lightSource: 'Desk Lamp Bottom-Center',
    rationale: 'Warm glow at bottom; clock floats quietly in the dark starry sky.'
  },
  {
    id: 'gwen-stacy',
    file: 'gwen-stacy-street.3840x2160.mp4',
    title: 'Spider-Verse · Gwen Stacy Rain Street',
    clockPos: 'top-left',
    color: '#bae6fd',
    lightSource: 'Streetlight Perspective Center',
    rationale: 'Rain perspective pulls center; clock balances upper night skyline.'
  },
  {
    id: 'titanfall-helmet',
    file: 'helmet-from-titanfall-2.1920x1080.mp4',
    title: 'Titanfall 2 · Pilot Helmet',
    clockPos: 'bottom-right',
    color: '#a7f3d0',
    lightSource: 'Visor Cyan Glow Center',
    rationale: 'High intensity visor glow center; clock rests in lower right shadow.'
  },
  {
    id: 'vice-city',
    file: 'vice-city-dreams.3840x2160.mp4',
    title: 'Vice City · Sunset Dreams',
    clockPos: 'top-left',
    color: '#f5d0fe',
    lightSource: 'Neon Sun Center-Bottom',
    rationale: 'Low horizon sunset; clock balances upper left dusk clouds.'
  },
  {
    id: 'mystical-torii',
    file: 'mystical-torii.3840x2160.mp4',
    title: 'Mystical Torii · Twilight Reflections',
    clockPos: 'bottom-left',
    color: '#fecdd3',
    lightSource: 'Torii Lanterns Center',
    rationale: 'Water reflections center; clock anchors lower left mist.'
  },
  {
    id: 'the-arcade',
    file: 'the-arcade-the-last-of-us.1920x1080.mp4',
    title: 'The Last of Us · Abandoned Arcade',
    clockPos: 'bottom-left',
    color: '#99f6e4',
    lightSource: 'Neon Signage Top-Center',
    rationale: 'Overhead neon; clock rests in lower left shadow plane.'
  },
  {
    id: 'rick-and-morty',
    file: 'rick-and-morty-riding-car-moewalls-com.mp4',
    title: 'Rick & Morty · Cosmic Cruiser',
    clockPos: 'top-left',
    color: '#bbf7d0',
    lightSource: 'Space Cruiser Center-Right',
    rationale: 'Movement heads right; clock balances left cosmos.'
  }
];

export default function LiveWallpaperLounge({ onShatterTrigger, onClose, onStealthUnlock, isUnlocked }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [shatterState, setShatterState] = useState({ active: false, x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);

  // Mobile Stealth Two-Stage Combo Gateway:
  // Stage 1: Hold 7 seconds on countdown -> subtle vibration acknowledges Stage 1 armed.
  // Stage 2: Hold 3 seconds on normal clock -> SHATTERS THE GLASS SCREEN & ENTERS THE DRAGON!
  const countdownHoldTimer = useRef(null);
  const clockHoldTimer = useRef(null);
  const comboCountdownArmed = useRef(0);

  const handleMobileStealthTrigger = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([60, 80, 120]);
    }
    if (onStealthUnlock) {
      onStealthUnlock();
    } else if (typeof window.__triggerUnlockHarem === 'function') {
      window.__triggerUnlockHarem();
    }
  };

  const handleClockTouchStart = () => {
    if (countdownHoldTimer.current) clearTimeout(countdownHoldTimer.current);
    if (clockHoldTimer.current) clearTimeout(clockHoldTimer.current);

    if (timeMode === 'countdown') {
      // Stage 1: Holding 7 seconds on countdown
      countdownHoldTimer.current = setTimeout(() => {
        // Subtle vibration to acknowledge Stage 1 complete!
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(30);
        }
        const now = Date.now();
        comboCountdownArmed.current = now;
        window.__comboCountdownArmedTime = now;
      }, 7000);
    } else {
      // Stage 2: Holding 3 seconds on normal clock
      clockHoldTimer.current = setTimeout(() => {
        const armedTime = comboCountdownArmed.current || window.__comboCountdownArmedTime || 0;
        const now = Date.now();
        // Check if Stage 1 (7s on countdown) was completed within the last 90 seconds
        if (now - armedTime < 90000) {
          // COMBO COMPLETED! Shatters the glass screen and enters the dragon!
          comboCountdownArmed.current = 0;
          window.__comboCountdownArmedTime = 0;

          if (typeof window.__triggerCoverShatter === 'function') {
            window.__triggerCoverShatter();
          }
          setTimeout(() => {
            handleMobileStealthTrigger();
          }, 400);
        }
      }, 3000);
    }
  };

  const handleClockTouchEnd = () => {
    if (countdownHoldTimer.current) {
      clearTimeout(countdownHoldTimer.current);
      countdownHoldTimer.current = null;
    }
    if (clockHoldTimer.current) {
      clearTimeout(clockHoldTimer.current);
      clockHoldTimer.current = null;
    }
  };

  // Time / Timer / Countdown Mode: 'clock' | 'stopwatch' | 'countdown'
  const [timeMode, setTimeMode] = useState('clock');
  const [currentTime, setCurrentTime] = useState('12:00');

  // Stopwatch state
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);

  // Countdown state (default 25 minutes)
  const [countdownSeconds, setCountdownSeconds] = useState(25 * 60);
  const [countdownRunning, setCountdownRunning] = useState(false);

  // 5-Second Long Press on Clock Colon (Activates Precision Matrix Grid)
  const [isGridModeActive, setIsGridModeActive] = useState(() => {
    try {
      return sessionStorage.getItem('sanctuary_grid_active') === 'true';
    } catch {
      return false;
    }
  });
  const [colonHoldProgress, setColonHoldProgress] = useState(0);
  const [colonTapCount, setColonTapCount] = useState(0);
  const [isColonHidden, setIsColonHidden] = useState(false);
  const colonTapTimeoutRef = useRef(null);
  const colonHoldTimerRef = useRef(null);
  const colonHoldIntervalRef = useRef(null);
  const colonPointerDownTimeRef = useRef(0);

  // Covert Clock Colon Triple-Tap Listener
  const handleColonTap = () => {
    try { if (navigator?.vibrate) navigator.vibrate(35); } catch {}

    if (colonTapTimeoutRef.current) {
      clearTimeout(colonTapTimeoutRef.current);
    }

    const nextCount = colonTapCount + 1;
    if (nextCount >= 3) {
      setColonTapCount(0);
      setIsColonHidden(true);
      try { if (navigator?.vibrate) navigator.vibrate([70, 40, 100]); } catch {}
      setIsGridModeActive(true);
      try { sessionStorage.setItem('sanctuary_grid_active', 'true'); } catch {}
    } else {
      setColonTapCount(nextCount);
      colonTapTimeoutRef.current = setTimeout(() => {
        setColonTapCount(0);
      }, 1200);
    }
  };

  const startColonHold = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    colonPointerDownTimeRef.current = Date.now();
    try { if (navigator?.vibrate) navigator.vibrate(25); } catch {}

    const startTime = Date.now();
    const duration = 5000;

    if (colonHoldIntervalRef.current) clearInterval(colonHoldIntervalRef.current);
    if (colonHoldTimerRef.current) clearTimeout(colonHoldTimerRef.current);

    colonHoldIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setColonHoldProgress(progress);
    }, 50);

    colonHoldTimerRef.current = setTimeout(() => {
      if (colonHoldIntervalRef.current) clearInterval(colonHoldIntervalRef.current);
      setColonHoldProgress(0);
      try { if (navigator?.vibrate) navigator.vibrate([100, 50, 100]); } catch {}
      setIsColonHidden(true);
      setIsGridModeActive(true);
      try { sessionStorage.setItem('sanctuary_grid_active', 'true'); } catch {}
    }, duration);
  };

  const cancelColonHold = () => {
    if (colonHoldIntervalRef.current) {
      clearInterval(colonHoldIntervalRef.current);
      colonHoldIntervalRef.current = null;
    }
    if (colonHoldTimerRef.current) {
      clearTimeout(colonHoldTimerRef.current);
      colonHoldTimerRef.current = null;
    }
    setColonHoldProgress(0);
  };

  const handleColonPointerUp = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    cancelColonHold();
    const pressDuration = Date.now() - colonPointerDownTimeRef.current;
    if (pressDuration < 500) {
      handleColonTap();
    }
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && isGridModeActive) {
        setIsGridModeActive(false);
        setIsColonHidden(false);
        try { sessionStorage.removeItem('sanctuary_grid_active'); } catch {}
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isGridModeActive]);

  const videoRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const currentWp = WALLPAPERS[currentIndex] || WALLPAPERS[0];

  // Expose triggerShatter so App.jsx F12 console trigger can initiate the shatter animation
  useEffect(() => {
    window.__triggerCoverShatter = () => {
      setShatterState({
        active: true,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      });
    };
    return () => {
      delete window.__triggerCoverShatter;
    };
  }, []);

  // 1. Real-time Clock (HH:MM)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Stopwatch interval
  useEffect(() => {
    let timer = null;
    if (stopwatchRunning) {
      timer = setInterval(() => {
        setStopwatchSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [stopwatchRunning]);

  // 3. Countdown interval
  useEffect(() => {
    let timer = null;
    if (countdownRunning) {
      timer = setInterval(() => {
        setCountdownSeconds(s => {
          if (s <= 1) {
            setCountdownRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdownRunning]);

  // Cycle wallpaper on background click
  const handleScreenClick = (e) => {
    if (shatterState.active) return;
    // Only cycle if clicking the background, not interactive controls
    if (e.target.closest('[data-no-cycle]')) return;
    setCurrentIndex(i => (i + 1) % WALLPAPERS.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext(e);
      else handlePrev(e);
    }
  };

  const handleNext = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(i => (i + 1) % WALLPAPERS.length);
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    setCurrentIndex(i => (i - 1 + WALLPAPERS.length) % WALLPAPERS.length);
  };

  // Toggle Time Mode: Clock -> Stopwatch -> Countdown -> Clock
  const handleToggleMode = (e) => {
    e.stopPropagation();
    if (timeMode === 'clock') setTimeMode('stopwatch');
    else if (timeMode === 'stopwatch') setTimeMode('countdown');
    else setTimeMode('clock');
  };

  // Format seconds to MM:SS
  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const getClockPositionClasses = (pos) => {
    switch (pos) {
      case 'top-left':
        return 'top-12 left-12 items-start text-left';
      case 'top-right':
        return 'top-12 right-12 items-end text-right';
      case 'bottom-left':
        return 'bottom-16 left-12 items-start text-left';
      case 'bottom-right':
      default:
        return 'bottom-16 right-12 items-end text-right';
    }
  };

  return (
    <div
      onClick={handleScreenClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none cursor-pointer"
    >
      {/* 1. SEAMLESS LIVE 4K/1080P WALLPAPER LOOP */}
      <video
        key={currentWp.file}
        ref={videoRef}
        src={`/downloads/${currentWp.file}`}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover filter brightness-[0.88] transition-all duration-700"
      />

      {/* Subtle Ambient Film Grain & Soft Vignette */}
      <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />

      {/* 2. TOP CORNER CONTROLS */}
      <div data-no-cycle className="absolute top-6 right-6 z-30 flex items-center gap-3">
        {/* Ambient Audio Toggle (Default Muted) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(m => !m);
          }}
          className="p-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white/80 hover:text-white hover:bg-black/60 transition-all shadow-lg"
          title={isMuted ? 'Unmute Ambient Sound' : 'Mute Ambient Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-white/70" /> : <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />}
        </button>

        {/* Timer / Pomodoro Settings Gear */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowSettings(s => !s);
          }}
          className={`p-2.5 rounded-full backdrop-blur-xl border border-white/20 transition-all shadow-lg ${
            showSettings ? 'bg-amber-500 text-black' : 'bg-black/40 text-white/80 hover:text-white hover:bg-black/60'
          }`}
          title="Timer & Duration Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Wallpaper Carousel Nav */}
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full p-1 text-white/80 text-xs shadow-lg">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Previous Scenic Loop"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 text-[10px] font-mono">
            {currentIndex + 1} / {WALLPAPERS.length}
          </span>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            title="Next Scenic Loop"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Optional Close Button (when opened as modal inside directory) */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-xl border border-white/30 text-white transition-all shadow-lg cursor-pointer"
            title="Return to Directory"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2B. TIMER SETTINGS DRAWER */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            data-no-cycle
            onClick={(e) => e.stopPropagation()}
            className="absolute top-20 right-6 z-40 w-80 rounded-2xl bg-black/85 backdrop-blur-2xl border border-white/20 p-5 shadow-2xl text-white space-y-4"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" />
                <span>Timer Duration Config</span>
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 font-medium">Select Display Mode:</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setTimeMode('clock')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    timeMode === 'clock'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-white/80'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span>Clock</span>
                </button>
                <button
                  onClick={() => setTimeMode('countdown')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    timeMode === 'countdown'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-white/80'
                  }`}
                >
                  <Hourglass className="w-3 h-3" />
                  <span>Timer</span>
                </button>
                <button
                  onClick={() => setTimeMode('stopwatch')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    timeMode === 'stopwatch'
                      ? 'bg-sky-500 text-black shadow-md'
                      : 'bg-white/10 hover:bg-white/15 text-white/80'
                  }`}
                >
                  <Timer className="w-3 h-3" />
                  <span>Stopwatch</span>
                </button>
              </div>
            </div>

            {/* Countdown Presets */}
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-400 font-medium">Countdown Preset:</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[15, 25, 45, 60].map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setCountdownSeconds(m * 60);
                      setCountdownRunning(false);
                      setTimeMode('countdown');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      timeMode === 'countdown' && countdownSeconds === m * 60
                        ? 'bg-emerald-400 text-black shadow-md'
                        : 'bg-white/10 hover:bg-white/20 text-white/80'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Start / Pause Action Button in Drawer */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {timeMode === 'countdown' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCountdownRunning(r => !r)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      countdownRunning
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-emerald-400 hover:bg-emerald-300 text-black'
                    }`}
                  >
                    {countdownRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{countdownRunning ? 'Pause Countdown' : 'Start Countdown'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setCountdownRunning(false);
                      setCountdownSeconds(25 * 60);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Reset to 25m"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {timeMode === 'stopwatch' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStopwatchRunning(r => !r)}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                      stopwatchRunning
                        ? 'bg-rose-500 hover:bg-rose-600 text-white'
                        : 'bg-sky-400 hover:bg-sky-300 text-black'
                    }`}
                  >
                    {stopwatchRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{stopwatchRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setStopwatchRunning(false);
                      setStopwatchSeconds(0);
                    }}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Reset Stopwatch"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {timeMode === 'clock' && (
                <button
                  onClick={() => {
                    setTimeMode('countdown');
                    setCountdownRunning(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span className="font-mono uppercase tracking-wider">▶ Start Countdown Timer ({Math.round(countdownSeconds / 60)}m)</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. DYNAMIC TIME / TIMER / COUNTDOWN DISPLAY */}
      <div
        data-no-cycle
        className={`absolute z-20 flex flex-col pointer-events-auto transition-all duration-700 group/clock ${getClockPositionClasses(
          currentWp.clockPos
        )}`}
      >
        {/* Main Display: Clicking cycles mode (Clock <-> Stopwatch <-> Countdown), Long-press or 3-tap unlocks on mobile */}
        <div
          onClick={handleToggleMode}
          onTouchStart={handleClockTouchStart}
          onTouchEnd={handleClockTouchEnd}
          onTouchCancel={handleClockTouchEnd}
          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
          title="Click to toggle mode"
        >
          <span
            className="font-mono text-7xl sm:text-9xl font-extrabold tracking-tighter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)] leading-none select-none transition-all duration-700 group-hover/clock:brightness-125"
            style={{ color: currentWp.color }}
          >
            {timeMode === 'clock' && (
              <span className="inline-flex items-baseline">
                <span>{currentTime.split(':')[0]}</span>
                <span
                  onPointerDown={startColonHold}
                  onPointerUp={handleColonPointerUp}
                  onPointerLeave={cancelColonHold}
                  onPointerCancel={cancelColonHold}
                  onClick={(e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                  }}
                  className={`relative cursor-pointer transition-all duration-300 select-none inline-block px-1 touch-manipulation ${
                    isColonHidden ? 'opacity-0 scale-50 pointer-events-none' : 'hover:text-amber-300'
                  }`}
                >
                  :
                  {colonHoldProgress > 0 && (
                    <span
                      className="absolute -bottom-2 inset-x-0 h-1.5 bg-amber-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,1)] transition-all"
                      style={{ width: `${colonHoldProgress}%` }}
                    />
                  )}
                </span>
                <span>{currentTime.split(':')[1]}</span>
              </span>
            )}
            {timeMode === 'stopwatch' && formatSeconds(stopwatchSeconds)}
            {timeMode === 'countdown' && formatSeconds(countdownSeconds)}
          </span>
        </div>

        {/* Secondary Subtitle / Mode Indicator & Controls */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMode}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-mono uppercase tracking-wider text-white/90 transition-all cursor-pointer"
            >
              {timeMode === 'clock' && <Clock className="w-3 h-3 text-white/70" />}
              {timeMode === 'stopwatch' && <Timer className="w-3 h-3 text-amber-300" />}
              {timeMode === 'countdown' && <Hourglass className="w-3 h-3 text-emerald-300" />}
              <span>{timeMode === 'clock' ? 'Live Clock' : timeMode === 'stopwatch' ? 'Stopwatch' : 'Countdown'}</span>
            </button>

            {/* In Clock mode: Direct 1-Click "Start 25m Timer" Pill + Settings Gear */}
            {timeMode === 'clock' && (
              <div className="flex items-center gap-1.5" data-no-cycle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setTimeMode('countdown');
                    setCountdownSeconds(25 * 60);
                    setCountdownRunning(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400 hover:bg-emerald-300 text-black text-[11px] font-mono font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-105 active:scale-95 cursor-pointer"
                  title="Start 25m Focus Countdown"
                >
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  <span>Start 25m Timer</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(s => !s);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md ${
                    showSettings
                      ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300'
                      : 'bg-white/15 hover:bg-white/25 text-white/80 hover:text-white'
                  }`}
                  title="Timer Duration & Mode Config"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Stopwatch Controls */}
            {timeMode === 'stopwatch' && (
              <div className="flex items-center gap-1.5" data-no-cycle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStopwatchRunning(r => !r);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                    stopwatchRunning
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 animate-pulse'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-400/40'
                  }`}
                  title={stopwatchRunning ? 'Pause Stopwatch' : 'Start Stopwatch'}
                >
                  {stopwatchRunning ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setStopwatchRunning(false);
                    setStopwatchSeconds(0);
                  }}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                  title="Reset Stopwatch (00:00)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                {/* Gear button directly after restart icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(s => !s);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 shadow-md ${
                    showSettings
                      ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300'
                      : 'bg-white/15 hover:bg-white/25 text-white/80 hover:text-white'
                  }`}
                  title="Timer Duration & Mode Config"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                {stopwatchRunning && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    RUNNING
                  </span>
                )}
              </div>
            )}

            {/* Countdown Controls */}
            {timeMode === 'countdown' && (
              <div className="flex items-center gap-1.5" data-no-cycle>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCountdownRunning(r => !r);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 ${
                    countdownRunning
                      ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/40 animate-pulse'
                      : 'bg-emerald-400 hover:bg-emerald-300 text-black shadow-emerald-400/40'
                  }`}
                  title={countdownRunning ? 'Pause Countdown' : 'Start Countdown'}
                >
                  {countdownRunning ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCountdownRunning(false);
                    setCountdownSeconds(25 * 60);
                  }}
                  className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 text-white/80 hover:text-white transition-all flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                  title="Reset to 25m"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                {/* Gear button directly after restart icon */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowSettings(s => !s);
                  }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md ${
                    showSettings
                      ? 'bg-amber-400 text-black shadow-amber-400/40 ring-2 ring-amber-300'
                      : 'bg-white/15 hover:bg-white/25 text-white/80 hover:text-white'
                  }`}
                  title="Timer Duration & Mode Config"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                {countdownRunning && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-300 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    RUNNING
                  </span>
                )}
                {/* Quick Add Presets */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCountdownSeconds(s => s + 5 * 60);
                  }}
                  className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-mono text-white/90 hover:text-white transition-all cursor-pointer"
                >
                  +5m
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCountdownSeconds(s => s + 25 * 60);
                  }}
                  className="px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-[10px] font-mono text-white/90 hover:text-white transition-all cursor-pointer"
                >
                  +25m
                </button>
              </div>
            )}
          </div>

          <p
            className="text-xs sm:text-sm font-serif font-bold tracking-wide uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] opacity-90"
            style={{ color: currentWp.color }}
          >
            {currentWp.title}
          </p>
          <p className="text-[10px] font-mono text-white/50 drop-shadow">
            Light Key: {currentWp.lightSource} · Tap time to cycle mode
          </p>
        </div>
      </div>

      {/* 4. SEAMLESS GLASS SHATTER TRANSITION (Triggered ONLY via F12 console 'fuck') */}
      <GlassShatter
        active={shatterState.active}
        originX={shatterState.x}
        originY={shatterState.y}
        onComplete={() => {
          if (onShatterTrigger) onShatterTrigger();
        }}
      />

      {/* 5. 3-TAP / 5-SECOND COLON ACTIVATED PRECISION MATRIX GRID */}
      {isGridModeActive && (
        <SanctuaryGridMatrix
          onUnlockDomain={(targetKey) => {
            setIsGridModeActive(false);
            setIsColonHidden(false);
            try { sessionStorage.removeItem('sanctuary_grid_active'); } catch {}
            if (typeof window.__openCipheredDomain === 'function') {
              window.__openCipheredDomain(targetKey);
            }
          }}
          onClose={() => {
            setIsGridModeActive(false);
            setIsColonHidden(false);
            try { sessionStorage.removeItem('sanctuary_grid_active'); } catch {}
          }}
        />
      )}
    </div>
  );
}
