import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Zap, Lock, Skull, Heart, Flame, X, Clock } from 'lucide-react';
import StarletAvatar from './StarletAvatar';

const EGO_CHECK_APHORISMS = [
  "He who cannot conquer his own appetites will always remain a vassal to those who feed them.",
  "In the midst of chaos, there is also opportunity; but he who is controlled by impulse defeats himself before the battle begins.",
  "A fit body, a calm mind, a house full of love. These things cannot be bought—they must be earned through ruthless restraint.",
  "You are searching for dopamine in pixels while your real life is rotting in plain sight. Nobody is coming to save you.",
  "The consumer dopamine trap is designed for those who mistake motion for achievement. The bill always comes due."
];

export default function CompulsionLockoutModal({
  data,
  onClose
}) {
  const [cooldownSeconds, setCooldownSeconds] = useState(10);
  const [quote] = useState(() => {
    const idx = Math.floor(Math.random() * EGO_CHECK_APHORISMS.length);
    return EGO_CHECK_APHORISMS[idx];
  });

  useEffect(() => {
    if (cooldownSeconds <= 0) return;
    const t = setInterval(() => {
      setCooldownSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(t);
  }, [cooldownSeconds]);

  if (!data || !data.performer) return null;

  const { performer, clicks = 0, scrollDepth = 0, extendedRequested = false } = data;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 select-none">
      {/* Background Pulse Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.25)_0%,transparent_75%)] animate-pulse pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        className="relative max-w-xl w-full rounded-3xl bg-[#110910] border-2 border-rose-500/60 p-6 sm:p-8 shadow-[0_0_80px_rgba(244,63,94,0.45)] text-center space-y-6 overflow-hidden"
      >
        {/* Immediate Top-Right Cross Button (No Lockout Trap) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer border border-white/10"
          title="Close & Browse Other Starlets [Esc]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Warning Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Melody Effect · Tri-Fold Compulsion Intercept</span>
        </div>

        {/* Performer Mugshot & Diagnostic Metrics */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <StarletAvatar
              id={performer.id}
              name={performer.name}
              hair={performer.hair}
              size="2xl"
              className="border-4 border-rose-500/80 shadow-[0_0_30px_rgba(244,63,94,0.5)]"
            />
            <div className="absolute -bottom-2 -right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-lg">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              {performer.name}
            </h3>
            <p className="text-xs font-mono text-rose-300 uppercase tracking-widest mt-1">
              ⚠️ Tri-Fold (3x) Resting Quarantine Enforced
            </p>
          </div>
        </div>

        {/* Audit Log Box */}
        <div className="p-4 rounded-2xl bg-black/60 border border-white/10 text-left text-xs font-mono space-y-2">
          <div className="flex justify-between border-b border-white/10 pb-1.5 text-zinc-400">
            <span>Dossier Scene Clicks:</span>
            <strong className="text-rose-400">{clicks} rapid clicks</strong>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-1.5 text-zinc-400">
            <span>Scroll Engagement Depth:</span>
            <strong className="text-amber-300">{scrollDepth} px</strong>
          </div>
          <div className="flex justify-between border-b border-white/10 pb-1.5 text-zinc-400">
            <span>Extended Archive Query:</span>
            <strong className={extendedRequested ? 'text-rose-400' : 'text-zinc-500'}>
              {extendedRequested ? 'Triggered (+24 Uncut Releases)' : 'Standard'}
            </strong>
          </div>
          <div className="flex justify-between text-zinc-300 pt-1 font-bold">
            <span>Quarantine Cool-Down:</span>
            <span className="text-rose-400">36 Hours (Tri-Fold Lockout)</span>
          </div>
        </div>

        {/* Anonymous Ego-Check Philosophical Aphorism */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-rose-200/90 italic font-serif text-sm sm:text-base leading-relaxed">
          “{quote}”
        </div>

        {/* Dismissal / Cool-Down Button with Instant Override */}
        <div className="space-y-2">
          <button
            onClick={onClose}
            className="w-full py-4 px-6 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xl flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-black cursor-pointer shadow-amber-500/25"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
            <span>Close Lockout & Explore Other 1,375 Starlets</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

