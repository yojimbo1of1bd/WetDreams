import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, ListVideo, Brain, Flame, UserPlus, Globe, Smartphone } from 'lucide-react';

export default function TabBar({ activeTab, onChangeTab, counts, watchlistCount }) {
  const tabs = [
    { id: 'all', label: '🌐 Global Catalog', count: counts.all, isGlobal: true, key: '1' },
    { id: 'reddit_shorts', label: '📱 Reddit Shorts', isShorts: true, key: '12' },
    { id: 'family', label: 'Family Catalog', count: counts.family, key: '2' },
    { id: 'newcomers', label: 'Newcomers', count: counts.newcomers, key: '3' },
    { id: 'admissions', label: '📥 Admissions Queue', isAdmit: true, key: '11' },
    { id: 'scenes', label: '★ Scene Theater', count: counts.scenes, key: '4' },
    { id: 'facemash', label: 'FaceMash Arena', isFaceMash: true, key: '9' },
    { id: 'reddit_hype', label: '🔥 Reddit Hype', isRedditHype: true, key: '10' },
    { id: 'watchlist', label: 'My Queue', count: watchlistCount, isQueue: true, key: '5' },
    { id: 'favorites', label: '★ Favorites', count: counts.favorites, key: '6' },
    { id: 'analytics', label: 'Insights & Stats', isIcon: true, key: '7' },
    { id: 'about', label: 'System & About', isAbout: true, key: '8' }
  ];

  return (
    <nav className="glass border-b border-[var(--line)] px-2 sm:px-6 overflow-hidden">
      <div
        className="max-w-[1680px] mx-auto flex items-center gap-1 overflow-x-auto py-2 no-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 sm:gap-2 flex-shrink-0 cursor-pointer ${
                isActive ? 'text-[#fce5a9] font-bold shadow-sm' : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBadge"
                  className="absolute inset-0 bg-gradient-to-r from-[rgba(212,168,83,0.22)] to-[rgba(179,134,52,0.12)] rounded-xl border border-[var(--accent-medium)] shadow-[0_0_15px_rgba(212,168,83,0.2)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              {tab.isGlobal && <Globe className="w-4 h-4 text-sky-400 relative z-10" />}
              {tab.isShorts && <Smartphone className="w-4 h-4 text-rose-400 relative z-10" />}
              {tab.isFaceMash && <Flame className="w-4 h-4 text-rose-400 relative z-10" />}
              {tab.isAdmit && <UserPlus className="w-4 h-4 text-amber-300 relative z-10" />}
              {tab.isIcon && <BarChart3 className="w-4 h-4 text-[var(--accent)] relative z-10" />}
              {tab.isQueue && <ListVideo className="w-4 h-4 text-[var(--accent)] relative z-10" />}
              {tab.isAbout && <Brain className="w-4 h-4 text-[var(--accent)] relative z-10" />}
              <span className="relative z-10">{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`relative z-10 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold transition-colors ${
                    isActive
                      ? 'bg-[var(--accent)] text-[#09070a]'
                      : 'bg-[#1e191f] text-[var(--muted)] border border-[var(--line)]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
