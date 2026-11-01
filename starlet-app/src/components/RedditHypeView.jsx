import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, MessageSquare, ThumbsUp, Sparkles, ExternalLink, RefreshCw, Trophy } from 'lucide-react';

export default function RedditHypeView({ performers = [], onOpenDossier }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState('all');

  const loadHypeData = () => {
    setLoading(true);
    fetch('./reddit-hype-cache.json')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        fetch('/api/reddit-hype')
          .then(res => res.json())
          .then(d => {
            setData(d);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  };

  useEffect(() => {
    loadHypeData();
  }, []);

  const trending = data?.trendingPerformers || [];
  const discussions = data?.liveDiscussions || [];
  const subreddits = data?.subreddits || ['r/Porn_Discuss', 'r/tipofmypenis', 'r/gooning', 'r/NSFW_GIF', 'r/porninaminute'];

  const filteredTrending = selectedSub === 'all'
    ? trending
    : trending.filter(t => t.hotSubreddit === selectedSub);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO HEADER */}
      <div className="relative rounded-3xl p-6 sm:p-10 border border-rose-500/30 bg-gradient-to-br from-[#1e0e1a] via-[#140b13] to-black shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-xs font-mono font-bold text-rose-300 uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 fill-current text-rose-400 animate-pulse" />
              Live Subreddit Radar & Community Velocity
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
              Reddit Hype & Trending Starlets
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 font-light mt-2 max-w-2xl leading-relaxed">
              Real-time sentiment and mention volume across adult discussion hubs. Tracking karma velocity, upvote surges, and viral scene rediscoveries.
            </p>
          </div>

          <button
            onClick={loadHypeData}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono text-white transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md flex-shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Radar</span>
          </button>
        </div>

        {/* Subreddit Filter Chips */}
        <div className="relative z-10 flex items-center gap-2 mt-6 flex-wrap">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider mr-1">Filter Subreddit:</span>
          <button
            onClick={() => setSelectedSub('all')}
            className={`px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedSub === 'all'
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/10 text-zinc-300 hover:bg-white/15'
            }`}
          >
            All Subreddits
          </button>
          {subreddits.map(sub => (
            <button
              key={sub}
              onClick={() => setSelectedSub(sub)}
              className={`px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                selectedSub === sub
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 font-bold'
                  : 'bg-white/10 text-zinc-300 hover:bg-white/15'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TOP 20 TRENDING STARLETS LEADERBOARD */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Trending Starlets Leaderboard
            </h2>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {filteredTrending.length} Trending Performers
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTrending.map((t, idx) => {
            const full = performers.find(p => p.id === t.id || p.name.toLowerCase() === t.name.toLowerCase());
            const targetPerf = full || t;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onOpenDossier(targetPerf)}
                className="group relative rounded-2xl p-4 bg-[#140d17]/85 border border-white/10 hover:border-amber-400/60 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Rank + Sentiment */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shadow-md ${
                      t.rank === 1
                        ? 'bg-amber-400 text-black shadow-amber-400/40'
                        : t.rank === 2
                          ? 'bg-zinc-300 text-black shadow-zinc-300/40'
                          : t.rank === 3
                            ? 'bg-amber-700 text-white shadow-amber-700/40'
                            : 'bg-white/10 text-white/80'
                    }`}>
                      #{t.rank}
                    </span>

                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300">
                      <TrendingUp className="w-2.5 h-2.5" />
                      {t.sentiment}
                    </span>
                  </div>

                  {/* Performer Visual + Identity */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/20 group-hover:border-amber-400 flex-shrink-0 bg-[#1c121e]">
                      <img
                        src={`./avatars/${t.id}.jpg`}
                        alt={t.name}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(t.name.replace(/\s+/g, '_'))}.jpg`;
                        }}
                        className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-serif font-bold text-base text-white group-hover:text-amber-300 transition-colors truncate">
                        {t.name}
                      </h3>
                      <p className="text-[11px] font-mono text-zinc-400">
                        Primary: <span className="text-amber-200">{t.hotSubreddit}</span>
                      </p>
                      <p className="text-[10px] font-mono text-emerald-400 font-semibold">
                        Velocity: {t.growthPct}
                      </p>
                    </div>
                  </div>

                  {/* Hot Post Discussion Snippet */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-zinc-300 line-clamp-2 italic mb-3">
                    "{t.topPostTitle}"
                  </div>
                </div>

                {/* Bottom Stats */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span className="flex items-center gap-1 text-emerald-300">
                    <ThumbsUp className="w-3 h-3" />
                    {t.upvotesVelocity?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-sky-300">
                    <MessageSquare className="w-3 h-3" />
                    {t.mentionsCount} Posts
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. LIVE DISCUSSION FEED */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-5 h-5 text-sky-400" />
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
            Active Community Discussion Threads
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {discussions.map(disc => {
            const perf = performers.find(p => p.id === disc.performerId || p.name.toLowerCase() === disc.performerName.toLowerCase());
            return (
              <div
                key={disc.id}
                onClick={() => perf && onOpenDossier(perf)}
                className="p-4 rounded-2xl bg-black/50 border border-white/10 hover:border-sky-400/50 transition-all flex items-start justify-between gap-4 cursor-pointer group"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                      {disc.subreddit}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {disc.hoursAgo}h ago
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                    {disc.title}
                  </h4>
                </div>

                <div className="flex flex-col items-end flex-shrink-0 text-right font-mono text-xs">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    +{disc.upvotes}
                  </span>
                  <span className="text-zinc-500 text-[10px]">
                    {disc.commentsCount} replies
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

