import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Trophy, ArrowLeft, ArrowRight, Zap, RefreshCw, Crown } from 'lucide-react';

const DEFAULT_ELO = 1200;
const BASE_K_FACTOR = 32;

function getStoredElo() {
  try {
    const raw = localStorage.getItem('facemash_elo_ratings');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredElo(ratings) {
  try {
    localStorage.setItem('facemash_elo_ratings', JSON.stringify(ratings));
  } catch {}
}

function getStoredHighScore() {
  try {
    return parseInt(localStorage.getItem('facemash_high_score') || '0', 10);
  } catch {
    return 0;
  }
}

export default function FaceMashArena({ performers = [], onOpenDossier, onBack }) {
  const [activeSubTab, setActiveSubTab] = useState('matchup'); // 'matchup' | 'leaderboard'
  const [eloRatings, setEloRatings] = useState(getStoredElo);
  const [reignStreak, setReignStreak] = useState(0);
  const [highScore, setHighScore] = useState(getStoredHighScore);
  const [slideDirection, setSlideDirection] = useState('right-in'); // 'right-in' | 'promoted-left'

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Pool of candidate starlets
  const candidatePool = useMemo(() => {
    return performers.filter(p => p && p.name && p.id);
  }, [performers]);

  // Pick a random starlet different from excluded IDs
  const pickRandomStarlet = (excludeIds = []) => {
    const available = candidatePool.filter(p => !excludeIds.includes(p.id));
    if (!available.length) return candidatePool[0] || null;
    return available[Math.floor(Math.random() * available.length)];
  };

  // Initial pair
  const [performerA, setPerformerA] = useState(() => {
    if (candidatePool.length < 1) return null;
    return candidatePool[Math.floor(Math.random() * candidatePool.length)];
  });

  const [performerB, setPerformerB] = useState(() => {
    if (candidatePool.length < 2) return null;
    const aId = performerA?.id;
    return pickRandomStarlet([aId]);
  });

  // Keep pair populated if pool loads async
  useEffect(() => {
    if (!performerA && candidatePool.length > 0) {
      const a = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      setPerformerA(a);
      setPerformerB(pickRandomStarlet([a.id]));
    }
  }, [candidatePool, performerA]);

  const eloA = performerA ? (eloRatings[performerA.id] || DEFAULT_ELO) : DEFAULT_ELO;
  const eloB = performerB ? (eloRatings[performerB.id] || DEFAULT_ELO) : DEFAULT_ELO;

  // "Winner Stays" voting logic with heavily weighted streak math
  const handleVote = (winnerSide) => {
    if (!performerA || !performerB) return;

    const winner = winnerSide === 'left' ? performerA : performerB;
    const loser = winnerSide === 'left' ? performerB : performerA;

    const rW = eloRatings[winner.id] || DEFAULT_ELO;
    const rL = eloRatings[loser.id] || DEFAULT_ELO;

    // Streak Multiplier: Each round the winner defends increases K-factor dynamically
    const currentStreak = winnerSide === 'left' ? reignStreak + 1 : 1;
    const weightedK = Math.round(BASE_K_FACTOR * (1 + 0.6 * Math.min(currentStreak, 10)));

    const expectedW = 1 / (1 + Math.pow(10, (rL - rW) / 400));
    const expectedL = 1 / (1 + Math.pow(10, (rW - rL) / 400));

    const gain = Math.round(weightedK * (1 - expectedW));
    const newRW = rW + gain;
    const newRL = Math.round(rL + weightedK * (0 - expectedL));

    const updated = {
      ...eloRatings,
      [winner.id]: newRW,
      [loser.id]: newRL
    };

    setEloRatings(updated);
    saveStoredElo(updated);

    // Update streak and high score
    setReignStreak(currentStreak);
    if (currentStreak > highScore) {
      setHighScore(currentStreak);
      try { localStorage.setItem('facemash_high_score', String(currentStreak)); } catch {}
    }

    if (winnerSide === 'left') {
      // LEFT WINS: Left stays as champion.
      // Loser on the right slides away, and a fresh challenger slides in on the right.
      setSlideDirection('right-in');
      const newChallenger = pickRandomStarlet([performerA.id, performerB.id]);
      setPerformerB(newChallenger);
    } else {
      // RIGHT WINS: Right model moves to Left slot as new champion.
      // Brand new challenger slides in on the right.
      setSlideDirection('promoted-left');
      const newChampion = performerB;
      const newChallenger = pickRandomStarlet([newChampion.id, performerA.id]);
      setPerformerA(newChampion);
      setPerformerB(newChallenger);
    }
  };

  const handleSkip = () => {
    if (!performerA) return;
    const newChallenger = pickRandomStarlet([performerA.id, performerB?.id]);
    setPerformerB(newChallenger);
  };

  // Touch Swipe Gesture
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchEndX.current - touchStartX.current;
    if (Math.abs(diff) > 50) {
      if (diff < 0) {
        handleVote('left');
      } else {
        handleVote('right');
      }
    }
  };

  // Keyboard controls: ArrowLeft (Vote A), ArrowRight (Vote B), Space (Skip), Esc (Exit)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeSubTab !== 'matchup') return;
      if (e.target?.tagName === 'INPUT' || e.target?.tagName === 'TEXTAREA') return;

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleVote('left');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleVote('right');
      } else if (e.key === ' ' || e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSkip();
      } else if (e.key === 'Escape' && onBack) {
        e.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performerA, performerB, eloRatings, activeSubTab, reignStreak]);

  // Leaderboard ranking
  const topRanked = useMemo(() => {
    const scored = candidatePool.map(p => ({
      ...p,
      elo: eloRatings[p.id] || DEFAULT_ELO
    }));
    scored.sort((a, b) => b.elo - a.elo);
    return scored.slice(0, 50);
  }, [candidatePool, eloRatings]);

  return (
    <div className="w-full max-w-[177.78vh] mx-auto px-2 sm:px-4 py-2 space-y-3 animate-fadeIn select-none">
      {/* 1. MINIMALIST HUD (BACK BUTTON + STREAK + LEADERBOARD SWITCHER) */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-xs uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
              title="Return to Directory"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Directory</span>
            </button>
          )}

          {activeSubTab === 'matchup' && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 to-rose-500/25 border border-amber-400/40 text-amber-200 font-bold flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-current" />
                Streak: {reignStreak}
              </span>
              <span className="text-zinc-400 hidden sm:inline text-[11px]">
                High Score: <strong className="text-amber-300">{highScore}</strong>
              </span>
            </div>
          )}
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('matchup')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'matchup'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                : 'bg-white/10 text-white/80 hover:bg-white/15'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Higher Lower Arena</span>
          </button>

          <button
            onClick={() => setActiveSubTab('leaderboard')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/30'
                : 'bg-white/10 text-white/80 hover:bg-white/15'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Top 50 Leaderboard</span>
          </button>
        </div>
      </div>

      {/* 2. FULL-SCREEN 50/50 SPLIT MATCHUP STAGE ("WINNER STAYS") */}
      {activeSubTab === 'matchup' && performerA && performerB && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full aspect-video min-h-[580px] max-h-[82vh] rounded-3xl overflow-hidden border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95)] bg-black grid grid-cols-1 md:grid-cols-2"
        >
          {/* STARLET A (LEFT HALF - REIGNING QUEEN) */}
          <div
            onClick={() => handleVote('left')}
            className="relative h-full flex flex-col justify-end p-8 sm:p-12 cursor-pointer overflow-hidden group/left transition-all border-b md:border-b-0 md:border-r border-white/10"
          >
            {/* Full-Bleed Posed Background Image */}
            <img
              key={performerA.id}
              src={`./poses/${performerA.id}.jpg`}
              onError={(e) => {
                if (!e.target.dataset.triedAvatar) {
                  e.target.dataset.triedAvatar = '1';
                  e.target.src = `./avatars/${performerA.id}.jpg`;
                } else if (!e.target.dataset.triedBabepedia) {
                  e.target.dataset.triedBabepedia = '1';
                  e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(performerA.name.replace(/\s+/g, '_'))}.jpg`;
                }
              }}
              alt={performerA.name}
              className="absolute inset-0 w-full h-full object-cover object-[center_20%] group-hover/left:scale-105 transition-transform duration-700 filter brightness-[0.85] group-hover/left:brightness-100"
            />

            {/* Dark Scrim Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 pointer-events-none" />
            <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover/left:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Reign Streak Badge if reigning */}
            {reignStreak > 0 && (
              <div className="absolute top-6 left-6 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black font-mono font-black text-xs uppercase tracking-wider shadow-xl shadow-amber-400/30">
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Reigning Queen · {reignStreak} {reignStreak === 1 ? 'Win' : 'Wins'}</span>
              </div>
            )}

            {/* Center / Bottom: Model Name ONLY */}
            <div className="relative z-10 space-y-3">
              <h3 className="font-serif text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)] group-hover/left:text-amber-300 transition-colors">
                {performerA.name}
              </h3>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono text-white/90 group-hover/left:bg-amber-400 group-hover/left:text-black group-hover/left:border-transparent transition-all">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Choose {performerA.name.split(' ')[0]} [← / A]</span>
              </div>
            </div>
          </div>

          {/* STARLET B (RIGHT HALF - CHALLENGER) */}
          <div
            onClick={() => handleVote('right')}
            className="relative h-full flex flex-col justify-end p-8 sm:p-12 cursor-pointer overflow-hidden group/right transition-all"
          >
            {/* Full-Bleed Posed Background Image */}
            <AnimatePresence mode="wait">
              <motion.img
                key={performerB.id}
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                src={`./poses/${performerB.id}.jpg`}
                onError={(e) => {
                  if (!e.target.dataset.triedAvatar) {
                    e.target.dataset.triedAvatar = '1';
                    e.target.src = `./avatars/${performerB.id}.jpg`;
                  } else if (!e.target.dataset.triedBabepedia) {
                    e.target.dataset.triedBabepedia = '1';
                    e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(performerB.name.replace(/\s+/g, '_'))}.jpg`;
                  }
                }}
                alt={performerB.name}
                className="absolute inset-0 w-full h-full object-cover object-[center_20%] group-hover/right:scale-105 transition-transform duration-700 filter brightness-[0.85] group-hover/right:brightness-100"
              />
            </AnimatePresence>

            {/* Dark Scrim Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 pointer-events-none" />
            <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover/right:opacity-100 transition-opacity duration-300 pointer-events-none" />

            {/* Challenger Badge */}
            <div className="absolute top-6 right-6 z-10 flex items-center gap-1 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[11px] font-mono font-bold text-rose-300 uppercase tracking-wider">
              <span>New Challenger</span>
            </div>

            {/* Center / Bottom: Model Name ONLY */}
            <div className="relative z-10 space-y-3">
              <h3 className="font-serif text-4xl sm:text-6xl font-black text-white tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.95)] group-hover/right:text-rose-300 transition-colors">
                {performerB.name}
              </h3>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-mono text-white/90 group-hover/right:bg-rose-500 group-hover/right:text-white group-hover/right:border-transparent transition-all">
                <span>Choose {performerB.name.split(' ')[0]} [→ / D]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* FLOATING CENTRAL "VS" BADGE */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black/90 border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.7)] flex items-center justify-center font-serif font-black text-amber-300 text-base sm:text-xl tracking-wider animate-pulse">
              VS
            </div>
          </div>
        </div>
      )}

      {/* 3. TOP 50 LEADERBOARD TAB */}
      {activeSubTab === 'leaderboard' && (
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl border border-white/10 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-amber-400" />
                FaceMash Global Elo Leaderboard
              </h2>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Dynamic power standings calculated from head-to-head showdowns.
              </p>
            </div>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('facemash_elo_ratings');
                  setEloRatings({});
                } catch {}
              }}
              className="text-xs font-mono text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Elo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {topRanked.map((starlet, index) => (
              <div
                key={starlet.id}
                onClick={() => onOpenDossier && onOpenDossier(starlet)}
                className="group p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 transition-all flex items-center gap-3 cursor-pointer"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 ${
                  index === 0 ? 'bg-amber-400 text-black shadow-md shadow-amber-400/40' :
                  index === 1 ? 'bg-zinc-300 text-black' :
                  index === 2 ? 'bg-amber-700 text-white' :
                  'bg-white/10 text-white/70'
                }`}>
                  {index + 1}
                </span>

                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/15 flex-shrink-0 bg-[#161019]">
                  <img
                    src={`./avatars/${starlet.id}.jpg`}
                    alt={starlet.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(starlet.name.replace(/\s+/g, '_'))}.jpg`;
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                    {starlet.name}
                  </h4>
                  <p className="font-mono text-xs text-amber-400 font-bold">
                    {starlet.elo} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
