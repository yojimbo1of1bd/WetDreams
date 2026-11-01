import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Sparkles, Shield, ArrowRight, Eye, Play, Compass, Flame, CheckCircle2
} from 'lucide-react';
import { isFamily, isNewcomer, realScenes, getPerformerInitials } from '../constants';
import StarletAvatar from './StarletAvatar';

// Sound synthesizer using Web Audio API (Zero external assets required)
function playSynthSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();

    if (type === 'whoosh') {
      const bufferSize = Math.floor(ctx.sampleRate * 0.45);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3;
      filter.frequency.setValueAtTime(220, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.2);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.45);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.18);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } else if (type === 'heartbeat') {
      const playThump = (time, freq, dur, vol) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(28, time + dur);
        gain.gain.setValueAtTime(vol, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(time);
        osc.stop(time + dur);
      };
      playThump(ctx.currentTime, 75, 0.14, 0.65);
      playThump(ctx.currentTime + 0.15, 58, 0.22, 0.5);
    } else if (type === 'collapse') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(95, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(18, ctx.currentTime + 0.85);
      gain.gain.setValueAtTime(0.85, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    } else if (type === 'awakening') {
      [528, 660, 792, 1056].forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = f;
        const start = ctx.currentTime + i * 0.14;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.14 / (i + 1), start + 0.16);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 1.8);
      });
    }
  } catch (err) {
    console.warn('Audio synthesis unavailable:', err);
  }
}

export default function CinematicAwakening({
  isOpen,
  performers = [],
  onComplete,
  onStartTour
}) {
  // Acts: 'vision1' | 'vision2' | 'vision3_run' | 'collapsed' | 'awakening'
  const [act, setAct] = useState('vision1');
  const [typewriter, setTypewriter] = useState('');

  // 1. Select the 3 vision starlets and the 1 awakening host starlet
  const { vision1, vision2, vision3, hostStarlet, hostRole } = useMemo(() => {
    if (!performers || performers.length === 0) {
      const fallback = {
        id: 'melody-marks',
        name: 'Melody Marks',
        age: 23,
        nationality: 'American',
        genres: ['stepsis', 'family']
      };
      return {
        vision1: fallback,
        vision2: fallback,
        vision3: fallback,
        hostStarlet: fallback,
        hostRole: { label: 'Stepsis', color: '#fb7185', icon: Heart }
      };
    }

    // High rating or famous starlets for visions
    const sorted = [...performers].sort((a, b) => {
      const sA = realScenes(a).length;
      const sB = realScenes(b).length;
      return sB - sA;
    });

    const v1 = sorted[1] || sorted[0];
    const v2 = sorted[3] || sorted[0];
    const v3 = sorted[5] || sorted[0];

    // Host category: Random selection among { stepsis, stepdaughter, stepmom, newcomer }
    const roleCategories = [
      { key: 'stepsis', label: 'Stepsis', color: '#fb7185', icon: Heart },
      { key: 'stepmom', label: 'Stepmom', color: '#f59e0b', icon: Flame },
      { key: 'stepdaughter', label: 'Stepdaughter', color: '#c084fc', icon: Sparkles },
      { key: 'newcomer', label: 'Newcomer', color: '#60a5fa', icon: Shield }
    ];

    const chosenRole = roleCategories[Math.floor(Math.random() * roleCategories.length)];
    let candidates = [];

    if (chosenRole.key === 'stepsis') {
      candidates = performers.filter(p => (p.genres || []).includes('stepsis'));
    } else if (chosenRole.key === 'stepmom') {
      candidates = performers.filter(p => (p.genres || []).includes('stepmom'));
    } else if (chosenRole.key === 'stepdaughter') {
      candidates = performers.filter(p => (p.genres || []).includes('stepdaughter'));
    } else if (chosenRole.key === 'newcomer') {
      candidates = performers.filter(p => isNewcomer(p));
    }

    if (candidates.length === 0) {
      candidates = performers.filter(isFamily);
    }
    if (candidates.length === 0) {
      candidates = performers;
    }

    const host = candidates[Math.floor(Math.random() * candidates.length)];

    return {
      vision1: v1,
      vision2: v2,
      vision3: v3,
      hostStarlet: host,
      hostRole: chosenRole
    };
  }, [performers]);

  // 2. Cinematic Timeline Progression
  useEffect(() => {
    if (!isOpen) return;

    // ACT 1: Vision 1 pops up with whoosh sound
    setAct('vision1');
    playSynthSound('whoosh');

    // ACT 2: 1.8s later, Vision 2 pops up with camera shake & heartbeat
    const t1 = setTimeout(() => {
      setAct('vision2');
      playSynthSound('whoosh');
      playSynthSound('heartbeat');
    }, 1800);

    // ACT 3: 3.8s later, Vision 3 appears down corridor, camera sprints towards her
    const t2 = setTimeout(() => {
      setAct('vision3_run');
      playSynthSound('heartbeat');
      // Rapid heartbeat during sprint
      const hb1 = setTimeout(() => playSynthSound('heartbeat'), 450);
      const hb2 = setTimeout(() => playSynthSound('heartbeat'), 900);
      const hb3 = setTimeout(() => playSynthSound('heartbeat'), 1350);

      // COLLAPSE: 2.1s into sprint, camera collapses into darkness
      const tCollapse = setTimeout(() => {
        setAct('collapsed');
        playSynthSound('collapse');
      }, 2100);

      return () => {
        clearTimeout(hb1);
        clearTimeout(hb2);
        clearTimeout(hb3);
        clearTimeout(tCollapse);
      };
    }, 3800);

    // ACT 4: 6.8s later, Eyelids blink open, Awakening begins
    const t3 = setTimeout(() => {
      setAct('awakening');
      playSynthSound('awakening');
    }, 6800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isOpen]);

  // 3. Typewriter Effect for Dialogue in Act 4
  const fullDialogue = `Hey... wake up, Kaka. You collapsed right at the doorway. Did your heart race too fast? Welcome to the harem. Let me show you around.`;

  useEffect(() => {
    if (act !== 'awakening') {
      setTypewriter('');
      return;
    }

    let i = 0;
    const interval = setInterval(() => {
      if (i <= fullDialogue.length) {
        setTypewriter(fullDialogue.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [act, fullDialogue]);

  if (!isOpen) return null;

  const RoleIcon = hostRole.icon;

  return (
    <div
      onClick={() => {
        if (act !== 'awakening') {
          setAct('awakening');
        } else {
          if (onStartTour) onStartTour(hostStarlet);
          else if (onComplete) onComplete();
        }
      }}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden select-none cursor-pointer"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />

      {/* Persistent Skip / Continue Control */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (act !== 'awakening') {
            setAct('awakening');
          } else {
            if (onStartTour) onStartTour(hostStarlet);
            else if (onComplete) onComplete();
          }
        }}
        className="absolute top-6 right-6 z-50 px-4 py-2 rounded-full bg-black/80 hover:bg-black text-amber-300 border border-amber-400/50 text-xs font-mono font-bold flex items-center gap-1.5 backdrop-blur-md shadow-xl cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="Advance to Awakening or Directory"
      >
        <span>{act !== 'awakening' ? 'Skip Cutscene →' : 'Enter Directory →'}</span>
      </button>

      {/* ACT 1: Vision 1 pops up and whooshes past */}
      <AnimatePresence>
        {act === 'vision1' && (
          <motion.div
            key="vision1"
            initial={{ opacity: 0, scale: 0.35, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1.08, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.45, filter: 'blur(14px)' }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-20 flex flex-col items-center justify-center text-center p-6"
          >
            {/* Cosmic Halo Glow */}
            <div className="absolute w-72 h-72 rounded-full bg-rose-500/20 blur-3xl -z-10 animate-pulse" />

            {/* Avatar Frame */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full overflow-hidden border-2 border-rose-500/60 shadow-[0_0_60px_rgba(244,63,94,0.45)] flex items-center justify-center">
              <StarletAvatar id={vision1.id} name={vision1.name} hair={vision1.hair} size="full" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide drop-shadow-lg">
                {vision1.name}
              </h3>
              <p className="text-xs font-mono text-rose-300/80 mt-1 uppercase tracking-widest">
                A fleeting apparition whispers in the dark...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACT 2: Vision 2 surges forward with violent camera shake & racing heart */}
      <AnimatePresence>
        {act === 'vision2' && (
          <motion.div
            key="vision2"
            initial={{ opacity: 0, scale: 0.4, x: -20 }}
            animate={{
              opacity: [0, 1, 1, 0.95],
              scale: [0.4, 1.15, 1.25, 1.35],
              x: [-16, 18, -14, 16, -10, 8, -4, 0],
              y: [-10, 12, -8, 10, -6, 4, 0],
              rotate: [-2.5, 3, -2, 2.5, -1, 0]
            }}
            exit={{ opacity: 0, scale: 1.6, filter: 'blur(20px)' }}
            transition={{
              duration: 1.9,
              times: [0, 0.3, 0.7, 1],
              ease: 'easeOut'
            }}
            className="relative z-20 flex flex-col items-center justify-center text-center p-6"
          >
            {/* Pulsing Red Chromatic Vignette for Game Character Heartbeat */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(225,29,72,0.35)_100%)] animate-pulse" />

            {/* Glowing Golden / Amber Aura */}
            <div className="absolute w-80 h-80 rounded-full bg-amber-500/25 blur-3xl -z-10" />

            <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden border-2 border-amber-400/80 shadow-[0_0_80px_rgba(245,158,11,0.6)] flex items-center justify-center">
              <StarletAvatar id={vision2.id} name={vision2.name} hair={vision2.hair} size="full" />
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-mono font-bold text-rose-300 mb-2">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-ping" />
                PULSE: 135 BPM · AROUSAL SPIKE
              </span>
              <h3 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-200 drop-shadow-xl">
                {vision2.name}
              </h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACT 3: Sprinting down corridor towards Vision 3 + stumbling & collapse */}
      <AnimatePresence>
        {act === 'vision3_run' && (
          <motion.div
            key="vision3"
            initial={{ scale: 0.5, y: 0, opacity: 0 }}
            animate={{
              scale: [0.5, 0.8, 1.4, 2.4],
              y: [0, -18, 14, -18, 14, -20, 22, -10],
              opacity: [0, 1, 1, 1],
              rotate: [0, -2, 2, -3, 3, -6, 25]
            }}
            transition={{
              duration: 2.1,
              times: [0, 0.25, 0.65, 1],
              ease: 'easeInOut'
            }}
            className="relative z-20 flex flex-col items-center justify-center text-center p-6"
          >
            {/* Radial Corridor Motion Blur Lines */}
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)]" />

            <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white/80 shadow-[0_0_100px_rgba(255,255,255,0.7)] flex items-center justify-center">
              <StarletAvatar id={vision3.id} name={vision3.name} hair={vision3.hair} size="full" />
            </div>

            <div className="mt-4">
              <p className="font-serif text-xl sm:text-2xl font-bold text-white tracking-widest drop-shadow-md">
                {vision3.name}
              </p>
              <p className="text-xs font-mono text-red-400 font-bold mt-1 tracking-wider uppercase animate-pulse">
                ⚠️ HEART OVERLOAD · VISION BLACKING OUT...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BLACKOUT COLLAPSE STATE */}
      <AnimatePresence>
        {act === 'collapsed' && (
          <motion.div
            key="collapsed"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black flex items-center justify-center"
          >
            <div className="text-center font-mono text-xs text-zinc-600 tracking-widest uppercase">
              [ ... Collapsed at the threshold ... ]
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ACT 4: EYELIDS BLINK OPEN -> FIRST PERSON PERSPECTIVE AWAKENING */}
      <AnimatePresence>
        {act === 'awakening' && (
          <motion.div
            key="awakening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative z-40 w-full h-full flex flex-col items-center justify-center p-4 sm:p-8"
          >
            {/* Top Eyelid sliding up */}
            <motion.div
              initial={{ height: '52%' }}
              animate={{ height: '0%' }}
              transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 inset-x-0 bg-black z-50 pointer-events-none shadow-[0_20px_60px_rgba(0,0,0,1)]"
            />
            {/* Bottom Eyelid sliding down */}
            <motion.div
              initial={{ height: '52%' }}
              animate={{ height: '0%' }}
              transition={{ duration: 1.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed bottom-0 inset-x-0 bg-black z-50 pointer-events-none shadow-[0_-20px_60px_rgba(0,0,0,1)]"
            />

            {/* Ambient Warm Bedroom / Harem Glow */}
            <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/15 via-rose-500/10 to-transparent blur-3xl pointer-events-none" />

            {/* Host Starlet Standing Over You (First Person View) */}
            <motion.div
              initial={{ scale: 0.85, y: 30, filter: 'blur(12px)' }}
              animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
              className="relative max-w-lg w-full flex flex-col items-center text-center"
            >
              {/* Host Avatar with breathing float motion */}
              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mb-5"
              >
                <div
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border-4 shadow-2xl relative flex items-center justify-center"
                  style={{ borderColor: hostRole.color }}
                >
                  <StarletAvatar id={hostStarlet.id} name={hostStarlet.name} hair={hostStarlet.hair} size="full" />
                </div>

                {/* Role Pill Badge */}
                <div
                  className="absolute -bottom-2 inset-x-0 flex items-center justify-center"
                >
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg text-white"
                    style={{ backgroundColor: hostRole.color }}
                  >
                    <RoleIcon className="w-3.5 h-3.5" />
                    {hostRole.label}
                  </span>
                </div>
              </motion.div>

              {/* Starlet Name & Identity */}
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                {hostStarlet.name}
              </h2>
              <p className="text-xs font-mono text-[var(--accent)] mt-0.5">
                {hostStarlet.age ? `Age ${hostStarlet.age} · ` : ''}
                {hostStarlet.nationality || 'Verified Sovereign'}
              </p>

              {/* Dialogue Box with Typewriter Effect */}
              <div className="mt-5 w-full bg-[#161019]/90 backdrop-blur-xl border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl text-left relative">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10 text-xs font-mono text-zinc-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>DIRECT TRANSCRIPTION · FIRST PERSON HUD</span>
                </div>

                <p className="font-serif text-base sm:text-lg text-[#f5efe6] leading-relaxed min-h-[4rem]">
                  "{typewriter}"
                  <span className="inline-block w-1.5 h-4 ml-1 bg-[var(--accent)] animate-pulse" />
                </p>

                {/* Actions */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      if (onStartTour) onStartTour(hostStarlet);
                      else if (onComplete) onComplete();
                    }}
                    className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#fce5a9] text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>Let Her Give You The VIP Tour</span>
                  </button>

                  <button
                    onClick={() => {
                      if (onStartTour) onStartTour(hostStarlet);
                      else if (onComplete) onComplete();
                    }}
                    className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/15 active:scale-95 transition-all cursor-pointer"
                  >
                    <span>Enter Directory</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

