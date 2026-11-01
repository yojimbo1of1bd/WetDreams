import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, ShieldCheck, Activity, Users, Film, Flame, Sparkles,
  Zap, Clock, Lock, RefreshCw, Eye, CheckCircle2, BookOpen,
  Feather, Compass, Award, Palette, HeartHandshake
} from 'lucide-react';
import { storage } from '../engine/antiTamperStorage';
import { telemetry } from '../engine/behavioralTelemetry';
import {
  quarantinePerformer,
  unquarantinePerformer,
  isPerformerCoolingOff,
  calculateExplorationScore,
  getHabituationScore
} from '../engine/habituationEngine';
import CoolingOffCard from './CoolingOffCard';
import StarletAvatar from './StarletAvatar';

export default function AboutView({ performers = [], onOpenDossier, onOpenWalkthrough }) {
  const [telemetryStats, setTelemetryStats] = useState({
    sessionMinutes: 0,
    meanInterval: 4500,
    scanRatio: 1.0,
    habituationCount: 0,
    quarantinedCount: 0
  });

  const [simClicks, setSimClicks] = useState(0);
  const [simPerformer, setSimPerformer] = useState(() => {
    return performers.find(p => p.name === 'Brandi Love' || p.name === 'Melody Marks' || p.name === 'Cory Chase') || performers[0] || {
      id: 'brandi-love',
      name: 'Brandi Love',
      tier: ['legend'],
      scenes: []
    };
  });
  const [simQuarantined, setSimQuarantined] = useState(false);

  useEffect(() => {
    if (performers && performers.length > 0) {
      const match = performers.find(p => p.name === 'Brandi Love') || performers.find(p => p.name === 'Melody Marks') || performers[0];
      if (match) setSimPerformer(match);
    }
  }, [performers]);

  useEffect(() => {
    const updateStats = () => {
      const hab = storage.getItem('habituation_matrix', {});
      const quar = storage.getItem('cooling_off_quarantine', {});
      const sessionStart = telemetry.sessionStart || Date.now();
      const mins = Math.floor((Date.now() - sessionStart) / 60000);

      setTelemetryStats({
        sessionMinutes: mins,
        meanInterval: Math.round(telemetry.baseline?.meanInterval || 4500),
        scanRatio: parseFloat(telemetry.getScanVelocityRatio().toFixed(2)),
        habituationCount: Object.keys(hab).length,
        quarantinedCount: Object.keys(quar).length
      });

      if (simPerformer) {
        setSimQuarantined(isPerformerCoolingOff(simPerformer.id));
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 2000);
    return () => clearInterval(interval);
  }, [simPerformer]);

  const handleSimulateClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Interactive Audio Click Synthesizer
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(simQuarantined ? 300 : 580 + simClicks * 140, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}

    // If currently quarantined, click resets test back to active state
    if (simQuarantined) {
      unquarantinePerformer(simPerformer.id);
      setSimQuarantined(false);
      setSimClicks(0);
      return;
    }

    const next = simClicks + 1;
    setSimClicks(next);
    if (next >= 3) {
      quarantinePerformer(simPerformer.id, {
        hours: 36,
        reason: 'Simulated Melody Effect Test (3 Rapid Bursts)'
      });
      setSimQuarantined(true);
      setSimClicks(0);
    }
  };

  const handleRestoreSim = () => {
    unquarantinePerformer(simPerformer.id);
    setSimQuarantined(false);
    setSimClicks(0);
  };

  return (
    <div className="max-w-[1400px] mx-auto py-10 px-4 sm:px-8 space-y-16 text-zinc-300">
      {/* 1. RENAISSANCE PROLOGUE & MANIFESTO */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(212,168,83,0.12)] border border-[rgba(212,168,83,0.3)] text-xs font-serif font-bold text-[#fce5a9] tracking-widest uppercase">
          <Palette className="w-4 h-4 text-[var(--accent)]" /> Chiaroscuro Architecture · System Codex 3.0
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-extrabold tracking-tight gold-gradient-text leading-tight">
          The Cognitive Sanctuary
        </h1>

        <p className="text-base sm:text-lg text-zinc-400 font-serif italic leading-relaxed max-w-2xl mx-auto">
          "Beauty without restraint invites numbness; desire without space decays into exhaustion."
        </p>

        <p className="text-sm text-zinc-300 leading-relaxed text-left sm:text-justify bg-[#130d15]/80 p-6 rounded-3xl border border-[var(--line)] shadow-2xl">
          Conventional adult platforms are built on predatory engagement loops — an infinite scroll of sensory deluge engineered to induce compulsive tab-hoarding and rapid hedonic adaptation. The <strong>Starlet Directory VIP</strong> was conceived as an intentional inversion: an archive curated with the dignity of an art museum, balancing deep filmographic discovery with cognitive rest, mathematical novelty preservation, and total user sovereignty.
        </p>
      </section>

      {/* ON-DEMAND AVATAR VIP TOUR LAUNCHER BANNER */}
      {onOpenWalkthrough && (
        <section className="glass rounded-3xl p-6 sm:p-7 border border-[var(--accent)]/40 bg-gradient-to-r from-[#1c1221] to-[#140c16] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-mono font-bold text-[var(--accent)] uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Interactive Starlet VIP Walkthrough</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Guided System Walkthrough by Starlet Avatars
            </h3>
            <p className="text-xs text-zinc-300 max-w-xl">
              Let our resident starlet avatars walk you through intelligent search, native ad-free streaming, co-star constellations, disguise sanctuaries, and dopamine discipline.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenWalkthrough}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#fce5a9] text-black font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 whitespace-nowrap cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Avatar Tour</span>
          </button>
        </section>
      )}

      {/* 2. REAL-TIME CLIENT TELEMETRY HUD */}
      <section className="glass rounded-3xl p-6 sm:p-8 border border-[var(--accent)]/30 bg-[#120c14]/90 backdrop-blur-2xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent)] animate-pulse" />
              Live Cognitive Telemetry Monitor
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Real-time in-browser metrics governing novelty entropy and hedonic baselines.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Zero-Telemetry · Client-Side Private
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-[#1a121d] border border-[var(--line)] text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">Session Active</span>
            <span className="text-2xl font-bold text-white font-mono">{telemetryStats.sessionMinutes}m</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a121d] border border-[var(--line)] text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">Mean Dwell Gap</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">{telemetryStats.meanInterval}ms</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a121d] border border-[var(--line)] text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">Scan Velocity</span>
            <span className="text-2xl font-bold text-sky-400 font-mono">{telemetryStats.scanRatio}x</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a121d] border border-[var(--line)] text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">Profiles Engaged</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{telemetryStats.habituationCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#1a121d] border border-[var(--line)] text-center">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">In Rest Quarantine</span>
            <span className="text-2xl font-bold text-rose-400 font-mono">{telemetryStats.quarantinedCount}</span>
          </div>
        </div>
      </section>

      {/* 3. CORE DESIGN QUESTIONS & DEEP EXPLANATIONS */}
      <section className="space-y-8">
        <div className="border-b border-[var(--line)] pb-4">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[var(--accent)]" />
            The Architectural Pillars & Core Engines
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            How our mathematical models, bipartite graphs, and proxy layers function together.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section A: What is the Melody Effect? */}
          <div className="glass rounded-3xl p-6 sm:p-7 border border-[var(--line)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-md">
              <Clock className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-white">
              What is the "Melody Effect"?
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Named after an observation with hyper-popular starlets (such as Melody Marks, Brandi Love, and Kendra Lust), the <strong>Melody Effect</strong> describes when a viewer enters an unconscious feedback loop: rapidly clicking a single starlet's profile over and over while active viewing time (modal dwell) collapses towards zero.
            </p>

            <div className="p-4 rounded-2xl bg-black/60 border border-rose-500/20 font-mono text-xs text-rose-300 space-y-1">
              <div>// Fatigue Metric Formula:</div>
              <div>Fatigue(m) = Clicks_m / (∑ DwellTime_m + 0.1) ≥ 0.45</div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              When triggered (3 rapid visits with under 7 seconds of total engagement), the engine places her card into a peaceful <strong>frosted resting state</strong> for 12 hours. This introduces healthy friction, interrupts impulsive dopamine exhaustion, and allows the starlet's novelty value to recharge.
            </p>
          </div>

          {/* Section B: The 4,061-Dimensional Recommendation Tensor */}
          <div className="glass rounded-3xl p-6 sm:p-7 border border-[var(--line)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-md">
              <Brain className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-white">
              The 4,061-Dimensional Similarity Tensor
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Rather than relying on basic keyword matching, the engine vectorizes every performer across a 4,061-dimensional feature matrix spanning career debut eras, verified studio collaborations, physical archetypes, and deep scenario n-grams (e.g. <em>mom swap</em>, <em>shared bed</em>, <em>stepdaughter birthday</em>).
            </p>

            <div className="p-4 rounded-2xl bg-black/60 border border-sky-500/20 font-mono text-xs text-sky-300 space-y-1">
              <div>// Co-Star Affinity Diffusion:</div>
              <div>v_j[scenario] ← v_j[scenario] + (0.40 · v_i[scenario] · H_i)</div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              When an established icon co-stars with an unheralded rookie, contextual affinity diffuses across our 1,297-edge graph, elevating hidden gems into your recommendations without relying on clickbait rankings.
            </p>
          </div>

          {/* Section C: Native Direct MP4 Streaming & Zero-Ad Proxy */}
          <div className="glass rounded-3xl p-6 sm:p-7 border border-[var(--line)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Film className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-white">
              Sovereign Native MP4 Streaming Proxy
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Commercial adult tubes rely heavily on hostile monetization: intrusive popup redirects, ad trackers, and sandboxed iframes designed to hijack user clicks.
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Our local streaming engine (<code className="text-emerald-400 font-mono">/api/video-stream?id=...</code>) resolves the underlying CDN source directly in Node.js, stripping all advertising layers and piping raw 1080p byte streams with HTTP <code className="text-emerald-400 font-mono">Accept-Ranges</code>. You receive instant seeking, zero ads, zero malware scripts, and native HTML5 playback.
            </p>
          </div>

          {/* Section D: Wi-Fi Phone Connectivity (Redis Clarification) */}
          <div className="glass rounded-3xl p-6 sm:p-7 border border-[var(--line)] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[var(--accent)] shadow-md">
              <Zap className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-xl font-bold text-white">
              Local Wi-Fi Streaming & Phone Access
            </h3>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Redis is an in-memory key-value cache (frequently used for database speedups), but is not a LAN web server. To view this catalog seamlessly on your phone, you don't need Redis at all:
            </p>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              Our server binds to <code className="text-amber-400 font-mono">0.0.0.0:8000</code>, broadcasting across your local home Wi-Fi. By scanning the QR code in the header or visiting your laptop's local IP (e.g. <code className="text-amber-400 font-mono">http://192.168.1.X:8000</code>), you can stream the entire VIP directory on any smartphone or tablet instantly.
            </p>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE MELODY EFFECT LIVE LAB */}
      <section className="glass rounded-3xl p-6 sm:p-8 border border-[var(--accent)]/30 bg-[#161019] shadow-2xl">
        <div className="max-w-2xl mb-8">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)]/20 text-[var(--accent)] mb-2">
            Interactive System Demonstration
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
            Test the "Melody Effect" Anti-Compulsion Lockout
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Witness how the engine responds when a user engages in compulsive rapid-clicking. Click the button 3 times in rapid succession to trigger the resting state.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
          {/* Action Trigger Box */}
          <div className="p-6 rounded-2xl bg-[#110c13] border border-[var(--line)] flex flex-col items-center text-center w-full md:w-80 space-y-4 shadow-xl">
            <span className="text-xs text-zinc-400 font-medium">Test Subject Performer:</span>
            <h4 className="font-serif text-xl font-bold text-white">{simPerformer.name}</h4>

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Burst Click Register:</span>
              <span className="font-mono text-sm font-bold text-[var(--accent)] bg-black px-3 py-1 rounded-full border border-[var(--line)]">
                {simClicks} / 3 bursts
              </span>
            </div>

            <button
              type="button"
              onClick={handleSimulateClick}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 bg-[var(--accent)] text-black hover:brightness-110 active:scale-95 cursor-pointer shadow-amber-500/25 select-none"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>{simQuarantined ? 'Quarantine Enforced (Click to Retest)' : 'Simulate Rapid Click'}</span>
            </button>

            {simQuarantined && (
              <button
                type="button"
                onClick={handleRestoreSim}
                className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
              >
                ↺ Reset Quarantine to Active
              </button>
            )}
          </div>

          {/* Resulting State Card */}
          <div className="w-full md:w-80">
            {simQuarantined ? (
              <div className="space-y-3">
                <CoolingOffCard performer={simPerformer} onRestore={handleRestoreSim} />
                <button
                  onClick={handleRestoreSim}
                  className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono text-zinc-300 transition-colors cursor-pointer"
                >
                  ↺ Reset Simulation Test
                </button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 border border-[var(--line)] text-center space-y-3.5">
                <div className="flex justify-center">
                  <StarletAvatar
                    id={simPerformer.id}
                    name={simPerformer.name}
                    hair={simPerformer.hair}
                    size="xl"
                  />
                </div>
                <h4 className="font-bold text-base text-white">{simPerformer.name}</h4>
                <span className="inline-block text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 font-semibold">
                  Active in Recommendation Feed
                </span>
                <p className="text-xs text-zinc-400">
                  Calculated Novelty Score: <strong className="text-white">{calculateExplorationScore(simPerformer).toFixed(1)}</strong> / 10
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
