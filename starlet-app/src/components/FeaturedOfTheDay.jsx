import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, TrendingUp, ChevronRight, MessageSquare, ThumbsUp } from 'lucide-react';

export default function FeaturedOfTheDay({ performers = [], onOpenDossier }) {
  const [hypeData, setHypeData] = useState(null);

  useEffect(() => {
    fetch('./reddit-hype-cache.json')
      .then(res => res.json())
      .then(data => setHypeData(data))
      .catch(() => {
        // Fallback to API if file fetch fails
        fetch('/api/reddit-hype')
          .then(res => res.json())
          .then(data => setHypeData(data))
          .catch(() => null);
      });
  }, []);

  const featured = hypeData?.featuredOfTheDay || hypeData?.trendingPerformers?.[0];
  const fullRecord = featured
    ? performers.find(p => p.id === featured.id || p.name.toLowerCase() === featured.name.toLowerCase())
    : performers[0];

  if (!fullRecord) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-3xl overflow-hidden glass-raised border-2 border-amber-500/40 shadow-[0_15px_50px_rgba(245,158,11,0.15)] p-6 sm:p-8 mb-8 bg-gradient-to-br from-[#1c121d]/90 via-[#150d18]/90 to-[#0c080e]/95"
    >
      {/* Background radial embers */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          {/* Header Tag with Reddit Hype Signal */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 to-rose-500/30 text-amber-200 border border-amber-500/50 shadow-md">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
              Featured Starlet of the Day · Reddit Hype Algorithm
            </span>
            <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {featured?.sentiment || 'VIRAL SURGE'} ({featured?.growthPct || '+94%'})
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-black text-white mb-2 drop-shadow-lg">
            {fullRecord.name}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 max-w-2xl mb-4 font-light leading-relaxed">
            {featured?.topPostTitle || fullRecord.expanded || fullRecord.notes || 'Reigning supreme across community discussions with top engagement velocity.'}
          </p>

          {/* Live Reddit Hype Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 max-w-xl">
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Subreddit Hype</div>
              <div className="text-xs font-bold text-amber-300">{featured?.hotSubreddit || 'r/Porn_Discuss'}</div>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Karma Velocity</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                <ThumbsUp className="w-2.5 h-2.5" />
                {featured?.upvotesVelocity?.toLocaleString() || '2,840'}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Active Threads</div>
              <div className="text-xs font-bold text-sky-400 flex items-center justify-center gap-1">
                <MessageSquare className="w-2.5 h-2.5" />
                {featured?.mentionsCount || '48'} Mentions
              </div>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 text-center">
              <div className="text-[10px] font-mono text-zinc-400 uppercase">Releases</div>
              <div className="text-xs font-bold text-purple-300">{(fullRecord.scenes || []).length || 24} Verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenDossier(fullRecord)}
              className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Explore Complete Dossier & Filmography</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* High-Resolution Portrait */}
        <div
          onClick={() => onOpenDossier(fullRecord)}
          className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-3xl overflow-hidden border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.4)] flex-shrink-0 cursor-pointer group bg-[#1a141b]"
        >
          <img
            src={`./poses/${fullRecord.id}.jpg`}
            alt={fullRecord.name}
            onError={e => {
              if (!e.target.dataset.triedAvatar) {
                e.target.dataset.triedAvatar = '1';
                e.target.src = `./avatars/${fullRecord.id}.jpg`;
              } else if (!e.target.dataset.triedBabepedia) {
                e.target.dataset.triedBabepedia = '1';
                e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(fullRecord.name.replace(/\s+/g, '_'))}.jpg`;
              }
            }}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3">
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">
              👑 HYPE QUEEN
            </span>
            <span className="text-[10px] font-mono text-white/80 bg-black/60 px-2 py-0.5 rounded-full">
              RANK #1
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

