import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, Minimize2,
  Settings, Music, Sparkles, Wind, EyeOff, Lock, Unlock, Upload,
  Image as ImageIcon, Check, Radio, Headphones, ArrowLeft, Quote, Eye
} from 'lucide-react';
import SanctuaryGridMatrix from './SanctuaryGridMatrix';

// Curated Motivational Quotations for Increasing Focus & Cognitive Sovereignty
const FOCUS_QUOTATIONS = [
  {
    quote: "Concentrate all your thoughts upon the work at hand. The sun's rays do not burn until brought to a focus.",
    author: "Alexander Graham Bell",
    theme: "Singular Attention"
  },
  {
    quote: "Desires are contracts you make with yourself to be unhappy until you get what you want. Focus on what you control.",
    author: "Naval Ravikant",
    theme: "Impulse Mastery"
  },
  {
    quote: "Deep Work: The ability to focus without distraction on a cognitively demanding task is the true superpower of our era.",
    author: "Cal Newport",
    theme: "Deep Work"
  },
  {
    quote: "Where your attention goes, your time goes, and your life follows. Guard your attention with vigilance.",
    author: "Marcus Aurelius",
    theme: "Stoic Sovereignty"
  },
  {
    quote: "He who cannot obey himself will be commanded. Master the stillness within.",
    author: "Friedrich Nietzsche",
    theme: "Self-Mastery"
  },
  {
    quote: "Simplicity boils down to two steps: Identify the essential. Eliminate the rest.",
    author: "Leo Babauta",
    theme: "Minimalism"
  },
  {
    quote: "You do not rise to the level of your goals. You fall to the level of your systems.",
    author: "James Clear",
    theme: "Atomic Discipline"
  },
  {
    quote: "In an age of continuous digital noise, a single hour of unbroken focus is an absolute superpower.",
    author: "Seneca",
    theme: "Cognitive Fortitude"
  },
  {
    quote: "The secret of change is to focus all of your energy not on fighting the old, but on building the new.",
    author: "Socrates",
    theme: "Constructive Energy"
  },
  {
    quote: "A man is measured strictly by his deeds. What have your hands accomplished today?",
    author: "Reality Check",
    theme: "Action Over Craving"
  },
  {
    quote: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
    author: "Buddha",
    theme: "Present Focus"
  },
  {
    quote: "Turbulence belongs outside. Inside the sanctuary of your mind, maintain absolute stillness.",
    author: "Stoic Maxim",
    theme: "Inner Sanctum"
  }
];

export default function CalmSanctuary({ isOpen, onClose, onGestureUnlock, onResetToIcebergTip }) {
  // Timer States
  const [mode, setMode] = useState('pomodoro'); // pomodoro (25), short (5), long (15)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [colonTapCount, setColonTapCount] = useState(0);
  const [isColonHidden, setIsColonHidden] = useState(false);
  const colonTapTimeoutRef = useRef(null);

  // Focus Sanctuary Clean / Zen Mode: Hides static UI chrome & clutter writings
  const [hideWritings, setHideWritings] = useState(true);

  // Automated Focus Quotation Engine State
  const [quoteInterval, setQuoteInterval] = useState(15); // Interval in seconds: 5, 10, 15, 30
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Wallpaper State: 'anime' | 'forest' | 'cyber' | 'custom'
  const [wallpaper, setWallpaper] = useState('anime');
  const [customVideoUrl, setCustomVideoUrl] = useState(null);

  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('forest-rain'); // 'forest-rain' | 'anime-lofi' | 'alpha-waves' | 'custom'
  const [volume, setVolume] = useState(0.5);
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [customAudioFileUrl, setCustomAudioFileUrl] = useState(null);
  const [customTrackName, setCustomTrackName] = useState('Custom Audio File');

  // Breathing Guide State
  const [showBreather, setShowBreather] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale');

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Audio Context Ref for synthetic soundscapes
  const audioCtxRef = useRef(null);
  const soundNodesRef = useRef([]);
  const htmlAudioRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  // Mode Time Durations
  const DURATIONS = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  // Timer Countdown Effect
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Play soft completion chime
      playTone(523.25, 0.4); // C5
      setTimeout(() => playTone(659.25, 0.5), 200); // E5
      setTimeout(() => playTone(783.99, 0.7), 400); // G5
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Automated Focus Quotation Rotation Effect
  useEffect(() => {
    if (!isOpen || !quoteInterval || quoteInterval <= 0) return;
    const timer = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % FOCUS_QUOTATIONS.length);
    }, quoteInterval * 1000);
    return () => clearInterval(timer);
  }, [isOpen, quoteInterval]);

  // Breathing Cycle Effect (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    if (!showBreather) return;
    const cycle = () => {
      setBreathPhase('Inhale');
      setTimeout(() => {
        setBreathPhase('Hold');
        setTimeout(() => {
          setBreathPhase('Exhale');
        }, 4000);
      }, 4000);
    };
    cycle();
    const interval = setInterval(cycle, 12000);
    return () => clearInterval(interval);
  }, [showBreather]);

  // Switch Mode
  const handleSelectMode = (newMode) => {
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  // Mobile Stealth Barrier Combo:
  // Holding countdown 7s acknowledges with subtle vibration and arms Stage 1 of the combo
  const sanctuaryHoldTimer = useRef(null);

  const handleCountdownTouchStart = () => {
    if (sanctuaryHoldTimer.current) clearTimeout(sanctuaryHoldTimer.current);

    // Hold 7.0s on countdown to acknowledge Stage 1
    sanctuaryHoldTimer.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30); // Subtle acknowledgment vibration
      }
      window.__comboCountdownArmedTime = Date.now();
    }, 7000);
  };

  const handleCountdownTouchEnd = () => {
    if (sanctuaryHoldTimer.current) {
      clearTimeout(sanctuaryHoldTimer.current);
      sanctuaryHoldTimer.current = null;
    }
  };

  // 5-Second Long Press on Clock Colon (Activates Sanctuary Precision Matrix Grid)
  const [isGridModeActive, setIsGridModeActive] = useState(() => {
    try {
      return sessionStorage.getItem('sanctuary_grid_active') === 'true';
    } catch {
      return false;
    }
  });
  const [colonHoldProgress, setColonHoldProgress] = useState(0);
  const colonHoldTimerRef = useRef(null);
  const colonHoldIntervalRef = useRef(null);
  const colonPointerDownTimeRef = useRef(0);

  const startColonHold = (e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    colonPointerDownTimeRef.current = Date.now();
    try { if (navigator?.vibrate) navigator.vibrate(25); } catch {}

    const startTime = Date.now();
    const duration = 5000; // 5.0 seconds hold

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
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    cancelColonHold();
    const pressDuration = Date.now() - colonPointerDownTimeRef.current;
    // Release within 500ms is a registered tap
    if (pressDuration < 500) {
      handleColonTap();
    }
  };

  // Covert Clock Colon Triple-Tap Listener:
  // Upon 3 taps, the colon immediately disappears and activates the SanctuaryGridMatrix,
  // allowing direct domain selection overlaying the hidden first stage.
  const handleColonTap = () => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(35);
      }
    } catch {}

    if (colonTapTimeoutRef.current) {
      clearTimeout(colonTapTimeoutRef.current);
    }

    const nextCount = colonTapCount + 1;
    if (nextCount >= 3) {
      setColonTapCount(0);
      setIsColonHidden(true);
      try {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([70, 40, 100]);
        }
      } catch {}
      setIsGridModeActive(true);
      try { sessionStorage.setItem('sanctuary_grid_active', 'true'); } catch {}
    } else {
      setColonTapCount(nextCount);
      colonTapTimeoutRef.current = setTimeout(() => {
        setColonTapCount(0);
      }, 1200);
    }
  };

  // Keyboard shortcut listener: Escape or ~ exits
  useEffect(() => {
    const handleKey = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape' || e.key === '`' || e.key === '~') {
        if (isGridModeActive) {
          setIsGridModeActive(false);
          setIsColonHidden(false);
          try { sessionStorage.removeItem('sanctuary_grid_active'); } catch {}
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, isGridModeActive]);

  // Web Audio Tone helper
  const playTone = (freq, duration) => {
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Synthetic Soundscapes Engine
  const stopSyntheticAudio = () => {
    soundNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {}
    });
    soundNodesRef.current = [];
  };

  const startSyntheticAudio = (type) => {
    stopSyntheticAudio();
    try {
      const ctx = audioCtxRef.current || new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      if (type === 'forest-rain') {
        // Pink noise generator for gentle soothing rain
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          output[i] *= 0.06;
          b6 = white * 0.115926;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(volume * 0.5, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);
        whiteNoise.start(0);

        soundNodesRef.current = [whiteNoise, filter, gainNode];
      } else if (type === 'alpha-waves') {
        // 432Hz binaural drone with sub-bass relaxation pad
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime); // A2 fundamental
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(116, ctx.currentTime); // 8Hz alpha beat difference

        gain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();
        soundNodesRef.current = [osc1, osc2, gain];
      } else if (type === 'anime-lofi') {
        // Warm nostalgic analog chords
        const freqs = [174.61, 220.00, 261.63, 329.63]; // F-A-C-E major 7th chord
        const oscs = [];
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume * 0.08, ctx.currentTime);

        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, ctx.currentTime);
          osc.connect(gain);
          osc.start();
          oscs.push(osc);
        });

        gain.connect(ctx.destination);
        soundNodesRef.current = [...oscs, gain];
      }
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (isPlayingAudio) {
      if (htmlAudioRef.current) htmlAudioRef.current.pause();
      stopSyntheticAudio();
      setIsPlayingAudio(false);
    } else {
      if (currentTrack === 'custom-file' && customAudioFileUrl) {
        if (htmlAudioRef.current) {
          htmlAudioRef.current.play().catch(() => {});
          setIsPlayingAudio(true);
        }
      } else if (currentTrack === 'custom-url' && customAudioUrl) {
        if (htmlAudioRef.current) {
          htmlAudioRef.current.src = customAudioUrl;
          htmlAudioRef.current.play().catch(() => {});
          setIsPlayingAudio(true);
        }
      } else {
        startSyntheticAudio(currentTrack);
        setIsPlayingAudio(true);
      }
    }
  };

  // Handle Track Selection
  const handleSelectTrack = (trackId) => {
    setCurrentTrack(trackId);
    if (isPlayingAudio) {
      if (htmlAudioRef.current) htmlAudioRef.current.pause();
      stopSyntheticAudio();
      if (trackId === 'custom-file' && customAudioFileUrl) {
        if (htmlAudioRef.current) {
          htmlAudioRef.current.src = customAudioFileUrl;
          htmlAudioRef.current.play().catch(() => {});
        }
      } else if (trackId === 'custom-url' && customAudioUrl) {
        if (htmlAudioRef.current) {
          htmlAudioRef.current.src = customAudioUrl;
          htmlAudioRef.current.play().catch(() => {});
        }
      } else {
        startSyntheticAudio(trackId);
      }
    }
  };

  // Handle Local Audio File Selection
  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomAudioFileUrl(url);
      setCustomTrackName(file.name.replace(/\.[^/.]+$/, ''));
      setCurrentTrack('custom-file');
      if (htmlAudioRef.current) {
        htmlAudioRef.current.src = url;
        htmlAudioRef.current.play().catch(() => {});
        setIsPlayingAudio(true);
      }
    }
  };

  // Handle Local Video Wallpaper Selection
  const handleVideoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomVideoUrl(url);
      setWallpaper('custom');
    }
  };

  // Format mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed inset-0 z-50 overflow-hidden bg-black flex flex-col items-center justify-between select-none"
      >
        {/* Hidden HTML Audio Element for custom URLs & Files */}
        <audio
          ref={htmlAudioRef}
          loop
          onPlay={() => setIsPlayingAudio(true)}
          onPause={() => setIsPlayingAudio(false)}
        />

        {/* 1. DYNAMIC LIVELY WALLPAPER BACKGROUND */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {wallpaper === 'anime' ? (
            /* Cowboy Bebop Summer Anime Meadow */
            <div className="relative w-full h-full bg-gradient-to-b from-[#2176ff] via-[#4895ef] to-[#a2d2ff]">
              {/* Giant animated cumulus clouds */}
              <div className="absolute inset-0 opacity-80 overflow-hidden">
                <motion.div
                  animate={{ x: ['-5%', '5%', '-5%'] }}
                  transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-10 left-1/4 w-[900px] h-[550px] bg-white/90 rounded-[50%] blur-3xl filter"
                />
                <motion.div
                  animate={{ x: ['5%', '-5%', '5%'] }}
                  transition={{ duration: 55, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-20 right-10 w-[700px] h-[450px] bg-white/80 rounded-[50%] blur-2xl filter"
                />
                <motion.div
                  animate={{ x: ['-3%', '3%', '-3%'] }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-1/3 left-10 w-[600px] h-[350px] bg-white/70 rounded-[50%] blur-xl filter"
                />
              </div>

              {/* Distant Hills & Rolling Horizon */}
              <div className="absolute bottom-0 inset-x-0 h-2/5">
                <svg viewBox="0 0 1440 320" className="w-full h-full object-cover">
                  <path
                    fill="#38b000"
                    fillOpacity="0.85"
                    d="M0,224L60,208C120,192,240,160,360,165.3C480,171,600,213,720,218.7C840,224,960,192,1080,186.7C1200,181,1320,203,1380,213.3L1440,224L1440,320L0,320Z"
                  />
                  <path
                    fill="#2d6a4f"
                    d="M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,256C672,267,768,245,864,229.3C960,213,1056,203,1152,213.3C1248,224,1344,256,1392,272L1440,288L1440,320L0,320Z"
                  />
                </svg>

                {/* Sunflowers in foreground */}
                <div className="absolute bottom-6 left-12 flex items-end gap-3 opacity-90 drop-shadow-xl">
                  <span className="text-6xl animate-pulse">🌻</span>
                  <span className="text-4xl animate-bounce" style={{ animationDuration: '3s' }}>🌻</span>
                  <span className="text-5xl">🌻</span>
                </div>
              </div>

              {/* Gentle Vignette */}
              <div className="absolute inset-0 bg-radial-vignette opacity-30" />
            </div>
          ) : wallpaper === 'forest' ? (
            /* Enchanted Pine Forest Mist */
            <div className="relative w-full h-full bg-[#131b14]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#0b100c] via-[#1a2c1d] to-[#2d4a34] opacity-90" />
              <motion.div
                animate={{ x: ['-20%', '20%', '-20%'], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-3xl"
              />
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>
          ) : wallpaper === 'cyber' ? (
            /* Cyberpunk Lofi Night Window */
            <div className="relative w-full h-full bg-[#0a0512]">
              <div className="absolute inset-0 bg-gradient-to-br from-[#190a2e] via-[#090314] to-[#120024]" />
              <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />
            </div>
          ) : (
            /* Local Custom Video Loop */
            customVideoUrl && (
              <video
                src={customVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover filter brightness-90"
              />
            )
          )}
        </div>

        {/* 1.5. 3-TAP / 5-SECOND COLON ACTIVATED PRECISION MATRIX GRID */}
        {isGridModeActive && (
          <SanctuaryGridMatrix
            onUnlockDomain={(targetKey) => {
              setIsGridModeActive(false);
              setIsColonHidden(false);
              try { sessionStorage.removeItem('sanctuary_grid_active'); } catch {}
              if (typeof onGestureUnlock === 'function') {
                onGestureUnlock(targetKey);
              }
            }}
            onClose={() => {
              setIsGridModeActive(false);
              setIsColonHidden(false);
              try { sessionStorage.removeItem('sanctuary_grid_active'); } catch {}
            }}
          />
        )}

        {/* 2. TOP NAV: PROMINENT BACK BUTTON + ZEN TOGGLE + WALLPAPERS */}
        <header className="relative z-20 w-full max-w-6xl mx-auto pt-6 px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* Back Button + Optional Branding Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-black/60 hover:bg-black/80 active:scale-95 border-2 border-amber-400/80 hover:border-amber-300 text-amber-300 font-bold text-xs sm:text-sm flex items-center gap-2 backdrop-blur-xl shadow-[0_4px_25px_rgba(212,168,83,0.35)] transition-all cursor-pointer group"
              title="Return to Starlet VIP Directory [Esc]"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to Directory</span>
            </button>

            {onResetToIcebergTip && (
              <button
                onClick={onResetToIcebergTip}
                className="px-3.5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 backdrop-blur-xl transition-all cursor-pointer"
                title="Reset back to Iceberg's Tip (4K Cover-up Lounge) without erasing persistent memory"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Iceberg's Tip</span>
              </button>
            )}

            {!hideWritings && (
              <span className="font-mono text-xs font-bold tracking-widest text-amber-300/80 uppercase hidden md:flex items-center gap-2">
                FOCUS SANCTUARY · SOVEREIGN DISCIPLINE
              </span>
            )}
          </div>

          {/* Right Action Controls: Zen Mode Toggle + Wallpapers + Breathing */}
          <div className="flex items-center gap-2">
            {/* Zen Distraction-Free Toggle (Hides static writings and chrome) */}
            <button
              onClick={() => setHideWritings(h => !h)}
              className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xl transition-all cursor-pointer ${
                hideWritings
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-105'
                  : 'bg-black/50 border-white/20 text-white/80 hover:text-white hover:bg-black/70'
              }`}
              title="Toggle Zen Clean View (Hides static writings, mode chips & footers)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hideWritings ? 'Show Writings' : 'Zen Clean View'}</span>
            </button>

            {/* Wallpaper Selector (Minimized in Zen Mode) */}
            {!hideWritings && (
              <div className="hidden sm:flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full p-1 text-xs">
                <button
                  onClick={() => setWallpaper('anime')}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    wallpaper === 'anime' ? 'bg-white text-black font-bold shadow' : 'text-white/70 hover:text-white'
                  }`}
                  title="Anime Summer Meadow"
                >
                  Meadow
                </button>
                <button
                  onClick={() => setWallpaper('forest')}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    wallpaper === 'forest' ? 'bg-white text-black font-bold shadow' : 'text-white/70 hover:text-white'
                  }`}
                  title="Pine Forest Mist"
                >
                  Forest
                </button>
                <button
                  onClick={() => setWallpaper('cyber')}
                  className={`px-2.5 py-1 rounded-full transition-all ${
                    wallpaper === 'cyber' ? 'bg-white text-black font-bold shadow' : 'text-white/70 hover:text-white'
                  }`}
                  title="Cyber Lo-Fi"
                >
                  Lo-Fi
                </button>
                <button
                  onClick={() => videoInputRef.current?.click()}
                  className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-all ${
                    wallpaper === 'custom' ? 'bg-white text-black font-bold shadow' : 'text-white/70 hover:text-white'
                  }`}
                  title="Upload local video"
                >
                  <Upload className="w-3 h-3" />
                </button>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  className="hidden"
                />
              </div>
            )}

            {/* Breathing Guide Button */}
            <button
              onClick={() => setShowBreather(b => !b)}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                showBreather
                  ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                  : 'bg-black/40 border-white/20 text-white hover:bg-black/60'
              }`}
              title="Toggle Relaxation Breathing Guide"
            >
              <Wind className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 3. CENTER: HUGE DIGITAL TIMER + AUTOMATED ROTATING FOCUS QUOTES */}
        <main className="relative z-20 flex flex-col items-center justify-center my-auto px-4">
          {/* Mode Tabs: pomodoro | short break | long break (Hidden in Zen Clean View) */}
          {!hideWritings && (
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/20 rounded-full p-1.5 mb-6 shadow-2xl">
              <button
                onClick={() => handleSelectMode('pomodoro')}
                className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'pomodoro'
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                pomodoro
              </button>
              <button
                onClick={() => handleSelectMode('short')}
                className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'short'
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                short break
              </button>
              <button
                onClick={() => handleSelectMode('long')}
                className={`px-5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  mode === 'long'
                    ? 'bg-white text-black shadow-lg scale-105'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                long break
              </button>
            </div>
          )}

          {/* Big Digital Clock Display */}
          <div
            onTouchStart={handleCountdownTouchStart}
            onTouchEnd={handleCountdownTouchEnd}
            onTouchCancel={handleCountdownTouchEnd}
            className="relative flex items-center justify-center my-1 cursor-pointer select-none"
            title="Focus Timer"
          >
            <span className="font-mono text-[7.5rem] sm:text-[11rem] md:text-[13rem] font-extrabold text-white tracking-tighter drop-shadow-[0_15px_35px_rgba(0,0,0,0.7)] leading-none select-none">
              {formatTime(timeLeft).split(':')[0]}
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
              {formatTime(timeLeft).split(':')[1]}
            </span>

            {/* Breathing Circle Overlay */}
            {showBreather && (
              <motion.div
                animate={{
                  scale: breathPhase === 'Inhale' ? 1.6 : breathPhase === 'Hold' ? 1.6 : 1,
                  opacity: breathPhase === 'Hold' ? 0.9 : 0.6
                }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className="absolute w-64 h-64 rounded-full border-4 border-white/40 pointer-events-none flex items-center justify-center bg-white/5 backdrop-blur-sm"
              >
                <span className="text-xl font-bold tracking-widest text-white uppercase drop-shadow">
                  {breathPhase}
                </span>
              </motion.div>
            )}
          </div>

          {/* Action Controls: start / pause | restart */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setIsRunning(r => !r)}
              className="px-9 py-3 rounded-full bg-white text-black font-bold text-base hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-2 cursor-pointer"
            >
              {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              <span>{isRunning ? 'pause' : 'start'}</span>
            </button>

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/20 text-white hover:bg-black/60 hover:scale-105 active:scale-95 transition-all shadow-xl cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* 4. AUTOMATED ROTATING FOCUS QUOTATIONS HUD */}
          <div className="mt-6 max-w-xl w-full px-4 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuoteIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="bg-black/50 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative"
              >
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>FOCUS DISCIPLINE & STILLNESS</span>
                </div>

                <p className="font-serif italic text-sm sm:text-base text-zinc-100 leading-relaxed">
                  "{FOCUS_QUOTATIONS[currentQuoteIndex].quote}"
                </p>

                <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-mono">
                  <span className="text-amber-300 font-semibold">— {FOCUS_QUOTATIONS[currentQuoteIndex].author}</span>
                  <span className="text-zinc-500">•</span>
                  <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider font-bold">
                    {FOCUS_QUOTATIONS[currentQuoteIndex].theme}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Quotation Interval Controls */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-mono text-zinc-400">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Rotate every:</span>
              {[5, 10, 15, 30].map(sec => (
                <button
                  key={sec}
                  onClick={() => setQuoteInterval(sec)}
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    quoteInterval === sec
                      ? 'bg-amber-400 text-black shadow-md'
                      : 'bg-white/5 hover:bg-white/15 text-zinc-300 border border-white/10'
                  }`}
                  title={`Rotate quotations every ${sec} seconds`}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* 5. BOTTOM BAR: LO-FI AUDIO PLAYER (Hidden in Zen Clean View) */}
        {!hideWritings && (
          <footer className="relative z-20 w-full max-w-6xl mx-auto pb-6 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Lo-Fi Music Card */}
            <div className="flex items-center gap-3.5 bg-black/60 backdrop-blur-2xl border border-white/20 p-2.5 rounded-2xl shadow-2xl text-white">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Headphones className="w-5 h-5 text-white" />
              </div>

              <div className="min-w-0 pr-3">
                <p className="text-xs font-bold truncate">
                  {currentTrack === 'forest-rain' && 'Forest Rain & Mist'}
                  {currentTrack === 'anime-lofi' && 'Summer Afternoon Lo-Fi'}
                  {currentTrack === 'alpha-waves' && '432Hz Deep Focus Alpha'}
                  {currentTrack === 'custom-file' && customTrackName}
                  {currentTrack === 'custom-url' && 'Online Radio Stream'}
                </p>
                <p className="text-[10px] text-white/60 truncate">
                  Ambient Soundscape Engine
                </p>
              </div>

              {/* Play/Pause Button */}
              <button
                onClick={toggleAudio}
                className="p-2 rounded-full bg-white text-black hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Soundscape Selector Menu */}
              <div className="flex items-center gap-1 border-l border-white/20 pl-2">
                <button
                  onClick={() => handleSelectTrack('forest-rain')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    currentTrack === 'forest-rain' ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Rain"
                >
                  🌧️
                </button>
                <button
                  onClick={() => handleSelectTrack('anime-lofi')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    currentTrack === 'anime-lofi' ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Lo-Fi"
                >
                  ☕
                </button>
                <button
                  onClick={() => handleSelectTrack('alpha-waves')}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    currentTrack === 'alpha-waves' ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Alpha Waves"
                >
                  🧘
                </button>
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    currentTrack === 'custom-file' ? 'bg-white/30 text-white' : 'text-white/60 hover:text-white'
                  }`}
                  title="Upload Local MP3 / Audio File"
                >
                  📁
                </button>
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileUpload}
                  className="hidden"
                />
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-1.5 pl-2">
                <Volume2 className="w-3.5 h-3.5 text-white/70" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={e => {
                    const v = parseFloat(e.target.value);
                    setVolume(v);
                    if (htmlAudioRef.current) htmlAudioRef.current.volume = v;
                  }}
                  className="w-16 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>

            {/* Quick Exit Pill */}
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs text-white/70 hover:text-white backdrop-blur-md bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full border border-white/15 transition-all cursor-pointer shadow-lg"
              title="Return to Directory [Esc]"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
              <span>Exit Focus Sanctuary</span>
            </button>
          </footer>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
