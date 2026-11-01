import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Heart, Film, Share2, Search, Play, ArrowRight,
  CheckCircle2, X, ChevronRight, ChevronLeft, Compass, Shield,
  Layers, Users, Clock, ShieldCheck, Download, RefreshCw, Skull, Zap, ShieldAlert,
  Terminal, Sparkle
} from 'lucide-react';
import StarletAvatar from './StarletAvatar';

// 9 Comprehensive Walkthrough Steps with Stored Marked Snapshots
const TOUR_STEPS = [
  {
    target: 'search',
    title: '1. Intelligent Scenario & Age Search',
    snapshot: './snapshots/step1-search.svg',
    featureHighlight: 'Search Bar & Detected Token Tags',
    voiceQuote: "Look at the red box on the search bar, Kaka. Type natural compound phrases like 'mom swap', 'under 24', or compound tropes. Our parser processes multi-token taxonomies in 0.8ms without sending your search to any server.",
    desc: 'Instant multi-token parsing for complex scenarios, performer aliases, age thresholds, and tropes. No lag, zero false negatives.',
    icon: Search,
    color: '#60a5fa'
  },
  {
    target: 'cards',
    title: '2. "Game Character" Inspection Cards',
    snapshot: './snapshots/step2-cards.svg',
    featureHighlight: '3-Column Tactical Cards & Midline Scroll-Spy',
    voiceQuote: "See that red box around Melody's card? On desktop, our cards stay anchored in a 3-column tactical grid so nothing shifts. On your phone, scroll down and whichever girl crosses the center automatically expands into view.",
    desc: 'Tactile 3-column fixed alignment prevents accordion jumps. On mobile, midline scroll-spy auto-reveals performer profiles as you browse.',
    icon: Sparkles,
    color: '#d4a853'
  },
  {
    target: 'cinema',
    title: '3. Ad-Free Native Streaming Proxy',
    snapshot: './snapshots/step3-cinema.svg',
    featureHighlight: 'Cinema Viewport & 1080p Mirror Switcher',
    voiceQuote: "Notice the red bounding box around the Cinema player. Zero sketchy popups or malware tabs. Tap the gear icon to switch between Eporner 1080p 60fps, XVideos, and native FPO streams in real-time.",
    desc: 'Every single scene is proxied through our native streaming engine. Ads, trackers, and redirect popups are completely blocked.',
    icon: Film,
    color: '#4ade80'
  },
  {
    target: 'constellation',
    title: '4. Celestial Co-Star Constellation',
    snapshot: './snapshots/step4-constellation.svg',
    featureHighlight: 'Co-Star Orbital Collaboration Network',
    voiceQuote: "Look inside the red circle in the Analytics tab. This is our Co-Star Constellation. Every filament links starlets who share verified releases. Tap any starlet to orbit her collaboration network.",
    desc: 'Interactive force-directed graph tracking verified scene collaborations. Discover interconnected starlets and co-star chemistry.',
    icon: Share2,
    color: '#f59e0b'
  },
  {
    target: 'sanctuary',
    title: '5. Focus Sanctuary & Disguise Gateway',
    snapshot: './snapshots/step5-sanctuary.svg',
    featureHighlight: '4K Pomodoro Clock & Ambient Lo-Fi Camouflage',
    voiceQuote: "The red box highlights our Focus Sanctuary. It turns your entire screen into a Lo-Fi study room with 4K wallpapers and a Pomodoro clock. Anyone looking over your shoulder sees a calm study desk.",
    desc: 'Camouflages as "study with me.io" with Pomodoro timers and 4K scenic ambient loops. Lo-Fi soundscapes keep your screen sterile.',
    icon: Compass,
    color: '#38bdf8'
  },
  {
    target: 'reality',
    title: '6. Habituation Engine & Ego-Check Reality',
    snapshot: './snapshots/step6-habituation.svg',
    featureHighlight: '36-Hour Resting Quarantine & Visible Face',
    voiceQuote: "Notice the red quarantine box, Kaka. If you click impulsively without watching or binge too long, the Tri-Fold lockout activates for 36 hours. You can still see our faces, but content takes a resting break.",
    desc: 'ADHD rapid-abandonment detection locks impulsive browsing. Quarantined cards keep performer avatars visible while blurring scenes with exact UTC/local ending times.',
    icon: Shield,
    color: '#fb7185'
  },
  {
    target: 'admissions',
    title: '7. Admissions Queue & Personal Backup',
    snapshot: './snapshots/step7-admissions.svg',
    featureHighlight: 'Reddit Hype Ingestion & JSON Vault Export',
    voiceQuote: "Check the red-marked Admissions Queue. We pull trending newcomers from Reddit hype. You can approve them into your permanent vault with 1 click and download a full JSON backup of your personal catalog!",
    desc: 'Dynamic Reddit hype ingestion surfaces rising stars. One-click admission permanently tags and writes them to the database, plus instant personal catalog JSON export.',
    icon: Users,
    color: '#a78bfa'
  },
  {
    target: 'runes',
    title: '8. Hidden Passage 1: Stardust Runes & Clock Colon',
    snapshot: './snapshots/step8-runes.svg',
    featureHighlight: 'Clock Colon Tap & Gesture Rune Guide',
    voiceQuote: "Here is the first hidden passage, Kaka! See the red box around the clock colon? Tapping it vibrates your phone and triggers the Golden Stardust Canvas. Draw letter runes like 'O' for Hub, 'I' for Tier 1, 'L' for Tier 2, or 'Z' for the Abyss.",
    desc: 'Interactive colon trigger with haptic feedback. Single-stroke gestures on the Focus canvas instantly unlock secret sanctuary domains without leaving a trace.',
    icon: Sparkle,
    color: '#f59e0b'
  },
  {
    target: 'ciphers',
    title: '9. Hidden Passage 2: Cryptic Console Ciphers',
    snapshot: './snapshots/step9-ciphers.svg',
    featureHighlight: 'F12 Console Word Portals & Abyssal Vault',
    voiceQuote: "Our ultimate gateway on PC: press F12 and look at the red box in the console. Simply type bare words like 'tier1', 'tier2', 'swap', or 'abyss'. It pierces any cover-up instantly and takes you straight into the deepest Underworld chambers!",
    desc: 'Multi-layer piercing console resolvers. Type single-word getters or window.enter() to jump directly into the 11,000+ scene Underworld taxonomy.',
    icon: Terminal,
    color: '#ef4444'
  }
];

// Available Avatar Hostesses for the Walkthrough
const HOSTESS_ROSTER = [
  {
    id: 'artemisia-love',
    name: 'Artemisia Love',
    age: 24,
    nationality: 'American',
    role: 'Threshold Hostess',
    badgeColor: '#fb7185'
  },
  {
    id: 'melody-marks',
    name: 'Melody Marks',
    age: 23,
    nationality: 'American',
    role: 'Sovereign Icon',
    badgeColor: '#d4a853'
  },
  {
    id: 'miriama-kunkelova',
    name: 'Miriama Kunkelova',
    age: 29,
    nationality: 'Czech',
    role: 'All-Time GOAT',
    badgeColor: '#eab308'
  },
  {
    id: 'kendra-lust',
    name: 'Kendra Lust',
    age: 44,
    nationality: 'American',
    role: 'Stepmom Matriarch',
    badgeColor: '#f97316'
  },
  {
    id: 'brandi-love',
    name: 'Brandi Love',
    age: 48,
    nationality: 'American',
    role: 'Harem Sovereign',
    badgeColor: '#ec4899'
  }
];

export default function HaremWelcomeTour({ isOpen, onClose, starlet = null }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [showEgoAttack, setShowEgoAttack] = useState(false);
  const [activeHost, setActiveHost] = useState(() => {
    if (starlet && starlet.name) {
      return {
        id: starlet.id || starlet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: starlet.name,
        age: starlet.age || 24,
        nationality: starlet.nationality || 'Verified Sovereign',
        role: 'Tour Hostess',
        badgeColor: '#d4a853'
      };
    }
    return HOSTESS_ROSTER[1]; // Default to Melody Marks
  });

  // Update active host if starlet prop updates
  useEffect(() => {
    if (starlet && starlet.name) {
      setActiveHost({
        id: starlet.id || starlet.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        name: starlet.name,
        age: starlet.age || 24,
        nationality: starlet.nationality || 'Verified Sovereign',
        role: 'Tour Hostess',
        badgeColor: '#d4a853'
      });
    }
  }, [starlet]);

  // Reset step index when opening
  useEffect(() => {
    if (isOpen) {
      setStepIndex(0);
      setShowEgoAttack(false);
    }
  }, [isOpen]);

  // Keyboard navigation: ArrowRight / Space / Enter advances; ArrowLeft goes back
  useEffect(() => {
    if (!isOpen || showEgoAttack) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      } else if (e.key === 'Escape') {
        handleInitiateClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, stepIndex, showEgoAttack]);

  const handleNextStep = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(i => i - 1);
    }
  };

  const handleCompleteTour = () => {
    try {
      localStorage.setItem('starlet_walkthrough_completed_v1', 'true');
    } catch {}
    onClose();
  };

  const handleInitiateClose = () => {
    setShowEgoAttack(true);
  };

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[stepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-2xl p-2 sm:p-4 md:p-6 flex flex-col items-center justify-start md:justify-center select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleNextStep();
        }
      }}
    >
      <motion.div
        key={stepIndex}
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-4xl max-h-[92vh] sm:max-h-[90vh] bg-[#130d16]/98 border-2 border-[var(--accent)]/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. TOP HEADER: TITLE + STEP PILL + HOSTESS PICKER + CLOSE */}
        <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              AVATAR VIP WALKTHROUGH
            </span>
            <span className="text-xs font-mono font-bold text-black bg-amber-400 px-2.5 py-0.5 rounded-full shadow-sm">
              Step {stepIndex + 1} of {TOUR_STEPS.length}
            </span>
          </div>

          {/* Guide Hostess Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            <span className="text-zinc-500 font-mono whitespace-nowrap text-[10px] uppercase tracking-wider hidden sm:inline">
              Hostess:
            </span>
            {HOSTESS_ROSTER.map(host => {
              const isSelected = activeHost.id === host.id;
              return (
                <button
                  key={host.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHost(host);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--accent)] text-black font-bold shadow-md scale-105'
                      : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/10'
                  }`}
                >
                  <div className="w-3.5 h-3.5 rounded-full overflow-hidden flex-shrink-0">
                    <StarletAvatar id={host.id} name={host.name} size="xs" />
                  </div>
                  <span>{host.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleInitiateClose();
            }}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="Exit Walkthrough"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. MAIN BODY: SPLIT VIEW (AVATAR ON LEFT, MARKED SNAPSHOT ON RIGHT) */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2.5 pr-1 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 sm:gap-4 items-stretch">
            {/* Left Column: Avatar Persona & Customized Dialogue */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-2.5 bg-[#1c1221] rounded-2xl p-3.5 border border-[var(--accent)]/30">
              {/* Avatar Header Row */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-2.5">
                <div
                  className="relative p-0.5 rounded-full shadow-[0_0_20px_rgba(212,168,83,0.35)] flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${activeHost.badgeColor || '#d4a853'}, transparent)`
                  }}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-white/40 flex items-center justify-center bg-black">
                    <StarletAvatar
                      id={activeHost.id}
                      name={activeHost.name}
                      hair={activeHost.hair}
                      size="xl"
                    />
                  </div>
                </div>

                <div>
                  <span
                    className="inline-block text-[9px] font-mono uppercase font-bold tracking-widest px-2 py-0.5 rounded-full text-white shadow-sm"
                    style={{ backgroundColor: activeHost.badgeColor || '#d4a853' }}
                  >
                    {activeHost.role || 'Hostess'}
                  </span>
                  <h4 className="font-serif text-sm sm:text-base font-bold text-white mt-0.5">
                    {activeHost.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 font-mono">
                    {activeHost.age ? `Age ${activeHost.age} · ` : ''}{activeHost.nationality || 'Sovereign'}
                  </p>
                </div>
              </div>

              {/* In-Character Direct Spoken Dialogue */}
              <div className="flex-1 flex flex-col justify-center space-y-1.5 py-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--accent)] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{activeHost.name.toUpperCase()} · SPOKEN DIRECTIVE:</span>
                </div>
                <p className="text-xs sm:text-sm font-serif italic text-zinc-100 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  "{currentStep.voiceQuote}"
                </p>
              </div>

              {/* Tactical Target Indicator */}
              <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 space-y-0.5">
                <div className="flex items-center gap-2">
                  <StepIcon className="w-3.5 h-3.5" style={{ color: currentStep.color }} />
                  <h5 className="font-serif text-xs font-bold text-white">
                    {currentStep.title}
                  </h5>
                </div>
                <p className="text-[11px] text-zinc-400 leading-tight">
                  {currentStep.desc}
                </p>
              </div>
            </div>

            {/* Right Column: Marked UI Snapshot with Red Bounding Box */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-2">
              <div
                onClick={handleNextStep}
                className="relative w-full aspect-[16/10] max-h-[260px] sm:max-h-[300px] rounded-xl overflow-hidden border-2 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)] bg-[#09070a] group cursor-pointer"
                title="Click snapshot to advance to next step"
              >
                {/* Actual Stored SVG Snapshot */}
                <img
                  key={currentStep.snapshot}
                  src={currentStep.snapshot}
                  alt={currentStep.title}
                  className="w-full h-full object-contain filter drop-shadow transition-transform duration-300 group-hover:scale-[1.02]"
                  onError={(e) => {
                    if (!e.currentTarget.dataset.retried) {
                      e.currentTarget.dataset.retried = 'true';
                      const cleanPath = currentStep.snapshot.replace(/^\.\//, '/');
                      e.currentTarget.src = `${cleanPath}?v=4`;
                    }
                  }}
                />

                {/* Tap to Advance Interactive Hint Banner */}
                <div className="absolute bottom-2 inset-x-2 py-1 px-2.5 rounded-lg bg-black/85 backdrop-blur-md border border-white/15 flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-zinc-300">
                  <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span>Click anywhere or press [Space / →] to advance</span>
                  </span>
                  <span className="text-zinc-400 hidden sm:inline">
                    {stepIndex + 1} / {TOUR_STEPS.length}
                  </span>
                </div>
              </div>

              {/* Red Box Feature Name Tag */}
              <div className="flex items-center justify-between px-1 text-xs font-mono text-zinc-400">
                <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
                  <span>🎯</span> Marked Target: {currentStep.featureHighlight}
                </span>
                <span className="text-zinc-500 text-[10px] hidden sm:inline">Interactive Visual Inspection</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. STEP PROGRESS DOTS INDICATOR */}
        <div className="flex-shrink-0 flex items-center justify-center gap-1.5 pt-1">
          {TOUR_STEPS.map((step, idx) => (
            <button
              key={step.target}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStepIndex(idx);
              }}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === stepIndex
                  ? 'w-7 bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              title={step.title}
            />
          ))}
        </div>

        {/* 4. FOOTER CONTROLS: BACK + NEXT / FINISH CONTINUATION BUTTON */}
        <div className="flex-shrink-0 bg-[#130d16]/98 backdrop-blur-md flex items-center justify-between pt-2.5 border-t border-white/10 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleInitiateClose();
            }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer py-1"
          >
            Skip Walkthrough
          </button>

          <div className="flex items-center gap-2.5">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStep();
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            {/* Unmistakable Continuation Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNextStep();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:brightness-110 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-xl shadow-amber-400/30 cursor-pointer"
            >
              <span>
                {stepIndex === TOUR_STEPS.length - 1
                  ? '✨ Finish VIP Tour & Enter Directory'
                  : `Continue to Step ${stepIndex + 2} / 9 →`}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Psychological Ego Attack Modal on Skip */}
      <AnimatePresence>
        {showEgoAttack && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="max-w-md w-full bg-[#180f1d] border-2 border-red-500/80 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_80px_rgba(239,68,68,0.4)]">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-red-500/80 shadow-lg">
                <StarletAvatar id={activeHost.id} name={activeHost.name} size="full" />
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-red-400 tracking-wider">
                  ⚠️ Cognitive Sovereign Check
                </span>
                <h4 className="font-serif text-lg font-bold text-white mt-1">
                  Attention Span Crisis, Kaka?
                </h4>
              </div>

              <p className="text-xs text-zinc-300 font-serif italic leading-relaxed">
                "Can't spare 60 seconds to inspect the controls of your own temple? Your brain is conditioned by 10-second TikTok dopamine clips. A sovereign man commands his tools before engaging his passions."
              </p>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setShowEgoAttack(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-extrabold text-xs shadow-lg shadow-amber-400/20 cursor-pointer"
                >
                  🔥 Swallow Pride &amp; Resume Walkthrough
                </button>
                <button
                  type="button"
                  onClick={handleCompleteTour}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  ⚡ Acknowledge Impatience &amp; Enter Anyway
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
