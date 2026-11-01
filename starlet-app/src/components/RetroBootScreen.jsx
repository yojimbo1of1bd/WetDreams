import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Lock } from 'lucide-react';

export default function RetroBootScreen({ onComplete }) {
  // Strict 140-second unskippable lockdown
  const TOTAL_SECONDS = 140;
  const [elapsed, setElapsed] = useState(0);
  const [imgSrc, setImgSrc] = useState('/downloads/wallhaven-yqg6r7_2560x1600.png');

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(current => {
        if (current >= TOTAL_SECONDS) {
          clearInterval(timer);
          setTimeout(() => onComplete(), 500);
          return TOTAL_SECONDS;
        }
        return current + 1;
      });
    }, 1000);

    const handleKey = (e) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKey);
    };
  }, [onComplete]);

  const percentage = Math.min(100, Math.floor((elapsed / TOTAL_SECONDS) * 100));
  const remaining = TOTAL_SECONDS - elapsed;
  const bytesLoaded = Math.round((elapsed / TOTAL_SECONDS) * 8537); // 8.5MB total

  return (
    <div
      onClick={() => onComplete()}
      onTouchStart={() => onComplete()}
      className="fixed inset-0 z-[70] bg-[#020502] flex flex-col items-center justify-between overflow-hidden select-none cursor-pointer"
      title="Click anywhere or press Space to advance to Scenic Lounge"
    >
      {/* 1. GIANT CRT GLASS CURVATURE & PHOSPHOR SCANLINE OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-30 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.68)_50%)] bg-[length:100%_4px]" />
      <div className="absolute inset-0 pointer-events-none z-30 shadow-[inset_0_0_160px_rgba(0,0,0,0.96)]" />
      <div className="absolute inset-0 pointer-events-none z-30 opacity-20 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.25)_0%,transparent_85%)]" />

      {/* 2. TOP VINTAGE AIRLOCK HUD (NO SKIP, LOCKED) */}
      <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between text-xs font-mono text-[#4ade80] bg-black/75 backdrop-blur-md border-b border-[#4ade80]/30">
        <div className="flex items-center gap-3">
          <Monitor className="w-4 h-4 text-[#4ade80] animate-pulse" />
          <span className="font-bold tracking-widest uppercase text-[#4ade80]">
            ANALOG CRT AIRLOCK · 140S PROTOCOL LOCKDOWN
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] font-bold text-rose-300">
            <Lock className="w-3 h-3" /> UNBREAKABLE AIRLOCK
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] font-mono text-zinc-300">
            RECEIVING: <strong className="text-white">wallhaven-yqg6r7_2560x1600.png</strong>
          </span>
          <span className="font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded border border-amber-500/30">
            {remaining}s REMAINING ({percentage}%)
          </span>
        </div>
      </div>

      {/* 3. MAIN FULLSCREEN BASELINE RASTER SCAN VIEWPORT */}
      <div className="relative w-full flex-1 overflow-hidden bg-black flex items-center justify-center">
        {/* Baseline progressive image revealed top-to-bottom line by line */}
        <div className="relative w-full h-full">
          <img
            src={imgSrc}
            onError={() => setImgSrc('/avatars/melody-marks.jpg')}
            alt="Baseline Progressive Download"
            className="w-full h-full object-cover transition-none pointer-events-none"
            style={{
              clipPath: `inset(0 0 ${100 - percentage}% 0)`
            }}
          />

          {/* Active Glowing Electron Phosphor Beam */}
          {elapsed < TOTAL_SECONDS && (
            <div
              className="absolute inset-x-0 h-1 bg-white shadow-[0_0_20px_#4ade80,0_0_40px_#22c55e] z-10 pointer-events-none"
              style={{
                top: `${percentage}%`
              }}
            >
              <div className="absolute right-4 -top-5 bg-black/90 text-[#4ade80] text-[9px] font-mono px-2 py-0.5 rounded border border-[#4ade80]/40 shadow-lg">
                RASTER ROW {elapsed} / {TOTAL_SECONDS} · ANALOG 14.4k CRAWL
              </div>
            </div>
          )}

          {/* Below Unrendered Dark Phosphor Vacuum */}
          <div
            className="absolute inset-x-0 bottom-0 bg-[#020703]/98 pointer-events-none"
            style={{
              height: `${100 - percentage}%`
            }}
          >
            <div className="w-full h-full opacity-10 bg-[radial-gradient(#4ade80_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>
        </div>
      </div>

      {/* 4. BOTTOM TELEMETRY BAR: NO BYPASS ALLOWED */}
      <div className="relative z-20 w-full px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#4ade80] bg-black/85 backdrop-blur-md border-t border-[#4ade80]/30 gap-2">
        <div className="flex items-center gap-4 text-[11px]">
          <span>BUFFER ACCUMULATED: {bytesLoaded} KB / 8,537 KB</span>
          <span className="hidden md:inline text-zinc-600">|</span>
          <span className="hidden md:inline">LINE {elapsed} OF {TOTAL_SECONDS} (1.0 SEC/ROW)</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span>Analog decompression in progress. Awaiting full frame raster.</span>
        </div>
      </div>
    </div>
  );
}
