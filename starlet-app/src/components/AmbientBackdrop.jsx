import React from 'react';
import { motion } from 'framer-motion';

export default function AmbientBackdrop({ enabled = true }) {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Deep Obsidian Radial Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-[var(--accent)]/10 via-purple-900/5 to-transparent blur-[120px] transform-gpu" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tl from-amber-600/10 via-rose-950/10 to-transparent blur-[140px] transform-gpu" />

      {/* Floating Animated Ethereal Orbs */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 20, 0],
          scale: [1, 1.15, 0.9, 1]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[var(--accent)]/5 blur-[90px]"
      />

      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.85, 1.1, 1]
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="absolute bottom-1/3 right-1/4 w-[420px] h-[420px] rounded-full bg-rose-500/5 blur-[100px]"
      />

      {/* Subtle Noise / Film Grain Overlay */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />
    </div>
  );
}

