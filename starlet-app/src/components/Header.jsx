import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Download, Upload, Shuffle, Film, Star, CheckCircle, Heart, Users, FileSpreadsheet, Palette, ListVideo, Smartphone, Wind, Compass, Eye, EyeOff } from 'lucide-react';
import BreezingLounge from './BreezingLounge';

export default function Header({
  total,
  familyCount,
  newcomerCount,
  favCount,
  seenCount,
  scenesCount,
  watchlistCount,
  currentTheme,
  onThemeChange,
  onRandomSpotlight,
  onOpenWatchlist,
  onExport,
  onExportCsv,
  onImportClick,
  onOpenCalmSanctuary,
  onOpenWallpaperLounge,
  onOpenMobileConnect,
  onOpenWalkthrough,
  isStealthBlur,
  onToggleStealthBlur
}) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-[var(--line)] py-3 px-4 sm:px-6">
      <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] via-[#b38634] to-[#1a1219] p-[1px] shadow-lg shadow-[var(--accent)]/20 flex items-center justify-center">
            <div className="w-full h-full bg-[#0d090d] rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[var(--accent)]" />
            </div>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight gold-gradient-text flex items-center gap-2">
              Starlet Directory
              <span className="text-[10px] font-sans uppercase tracking-widest px-2 py-0.5 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-weak)] text-[var(--accent)] font-semibold">
                VIP Edition
              </span>
            </h1>
            <p className="text-xs text-[var(--muted)] font-light">
              Premier Adult Filmography & Verified Scene Catalog
            </p>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-[#171217] border border-[var(--line)] flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[var(--muted)]">Total:</span>
            <span className="font-bold text-[var(--ink)]">{total}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#171217] border border-[var(--line)] flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#fb7185]" />
            <span className="text-[var(--muted)]">Family:</span>
            <span className="font-bold text-[#fb7185]">{familyCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#171217] border border-[var(--line)] flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span className="text-[var(--muted)]">New:</span>
            <span className="font-bold text-[#60a5fa]">{newcomerCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#171217] border border-[var(--line)] flex items-center gap-2">
            <Film className="w-3.5 h-3.5 text-[#4ade80]" />
            <span className="text-[var(--muted)]">Scenes:</span>
            <span className="font-bold text-[#4ade80]">{scenesCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#171217] border border-[var(--line)] flex items-center gap-2">
            <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]/30" />
            <span className="text-[var(--muted)]">Favs:</span>
            <span className="font-bold text-[#f59e0b]">{favCount}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-[#171217] border border-[var(--line)] flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 text-[#4ade80]" />
            <span className="text-[var(--muted)]">Seen:</span>
            <span className="font-bold text-[#4ade80]">{seenCount}</span>
          </div>

          {/* Watchlist Quick Access Badge */}
          {watchlistCount > 0 && (
            <button
              onClick={onOpenWatchlist}
              className="px-3 py-1.5 rounded-xl bg-[var(--accent-weak)] border border-[var(--accent-medium)] flex items-center gap-2 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all"
              title="Open personal video queue"
            >
              <ListVideo className="w-3.5 h-3.5" />
              <span>Queue:</span>
              <span className="font-bold font-mono">{watchlistCount}</span>
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Universal Public Stealth Blur Toggle */}
          <button
            onClick={onToggleStealthBlur}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-md cursor-pointer ${
              isStealthBlur
                ? 'bg-amber-400 text-black font-extrabold shadow-amber-400/40'
                : 'bg-white/10 text-zinc-300 hover:text-white hover:bg-white/15 border border-white/10'
            }`}
            title="Toggle Public Stealth Blur (Blurs thumbnails & avatars in public places)"
          >
            {isStealthBlur ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isStealthBlur ? 'Stealth ON' : 'Stealth Blur'}</span>
          </button>

          {/* Avatar VIP Tour Launcher */}
          {onOpenWalkthrough && (
            <button
              onClick={onOpenWalkthrough}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500 hover:text-black transition-all shadow-md cursor-pointer"
              title="Launch Interactive Avatar VIP Walkthrough Tour"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Avatar Tour</span>
            </button>
          )}

          {/* Live Wallpaper Lounge (13 local 4K scenic videos) */}
          <button
            onClick={onOpenWallpaperLounge}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500 hover:text-black transition-all shadow-md"
            title="Open 4K Live Wallpaper Ambient Lounge with Chiaroscuro Clock"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Wallpaper</span>
          </button>

          {/* Calm Sanctuary / Focus Mode Button (Image 2 & 3) */}
          <button
            onClick={onOpenCalmSanctuary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black transition-all shadow-md"
            title="Open Calm Focus Sanctuary (Lo-Fi wallpaper & Pomodoro study space)"
          >
            <Wind className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Focus Sanctuary</span>
          </button>

          {/* Wi-Fi Phone Connect Button */}
          <button
            onClick={onOpenMobileConnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500 hover:text-black transition-all shadow-md"
            title="Scan QR code to view on your phone via home Wi-Fi"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone Connect</span>
          </button>

          {/* Breezing Ambient Soundscape Player */}
          <BreezingLounge />

          {/* Theme Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-[var(--line)] bg-[#151016] text-xs">
            <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
            <select
              value={currentTheme}
              onChange={e => onThemeChange(e.target.value)}
              className="bg-transparent text-white text-[11px] outline-none cursor-pointer pr-1"
            >
              <option value="obsidian" className="bg-[#120d14]">Obsidian Gold</option>
              <option value="violet" className="bg-[#120d14]">Royal Violet</option>
              <option value="emerald" className="bg-[#120d14]">Emerald Velvet</option>
              <option value="oled" className="bg-[#120d14]">OLED Pure Dark</option>
            </select>
          </div>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line-strong)] transition-colors"
            title="Export full catalog to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={onExport}
            className="p-2 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line-strong)] transition-colors"
            title="Export favorites & seen history to JSON"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onImportClick}
            className="p-2 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:border-[var(--line-strong)] transition-colors"
            title="Import favorites & seen data"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
