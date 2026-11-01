import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Award, Film, Users, Heart, CheckCircle, PieChart, Sparkles } from 'lucide-react';
import { GENRE_LABELS, FAMILY_GENRES, isFamily, isNewcomer, realScenes } from '../constants';
import CoStarConstellation from './CoStarConstellation';

export default function AnalyticsView({ performers, favorites, seen, onOpenDossier }) {
  const stats = useMemo(() => {
    const total = performers.length;
    const famCount = performers.filter(isFamily).length;
    const newCount = performers.filter(isNewcomer).length;
    const totalScenes = performers.reduce((acc, p) => acc + realScenes(p).length, 0);

    // Genre distribution
    const genreCounts = {};
    for (const p of performers) {
      for (const g of (p.genres || [])) {
        if (FAMILY_GENRES.has(g)) {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        }
      }
    }
    const topGenres = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count, label: GENRE_LABELS[genre] || genre }))
      .sort((a, b) => b.count - a.count);

    // Studio distribution (Normalized and Deduplicated)
    const studioCounts = {};
    for (const p of performers) {
      for (const s of realScenes(p)) {
        if (s.studio) {
          const raw = s.studio.split(/[\(/&]/)[0].trim();
          if (
            raw.length > 2 &&
            !/independent|archive|unknown|featured|various|202\d|xxx video|fpo|porn|full video|hd|clip/i.test(raw)
          ) {
            let canon = raw;
            if (/^brazzers$/i.test(canon)) canon = 'Brazzers';
            else if (/^teamskeet$/i.test(canon)) canon = 'TeamSkeet';
            else if (/^mofos$/i.test(canon)) canon = 'Mofos';
            else if (/^twistys$/i.test(canon)) canon = 'Twistys';
            else if (/^life\s*selector$/i.test(canon)) canon = 'Life Selector';
            else if (/^reality\s*kings$/i.test(canon)) canon = 'Reality Kings';
            else if (/^family\s*strokes$/i.test(canon)) canon = 'Family Strokes';
            else if (/^pure\s*xxx\s*films$/i.test(canon)) canon = 'Pure XXX Films';
            else if (/^dirty\s*flix$/i.test(canon)) canon = 'Dirty Flix';
            else if (/^babes$/i.test(canon)) canon = 'Babes';
            else canon = canon.charAt(0).toUpperCase() + canon.slice(1);

            studioCounts[canon] = (studioCounts[canon] || 0) + 1;
          }
        }
      }
    }
    const topStudios = Object.entries(studioCounts)
      .map(([studio, count]) => ({ studio, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Era distribution
    const eraCounts = {
      'Newcomers (2023–2026)': performers.filter(p => p.active?.from >= 2023).length,
      'Modern Stars (2018–2022)': performers.filter(p => p.active?.from >= 2018 && p.active?.from < 2023).length,
      'Prime Era (2012–2017)': performers.filter(p => p.active?.from >= 2012 && p.active?.from < 2018).length,
      'Classic / Veterans (Pre-2012)': performers.filter(p => p.active?.from && p.active.from < 2012).length
    };

    // User completion
    const seenPct = total > 0 ? Math.round((seen.size / total) * 100) : 0;
    const favPct = total > 0 ? Math.round((favorites.size / total) * 100) : 0;

    // Top performers by verified scenes
    const topPerformers = performers
      .slice()
      .sort((a, b) => realScenes(b).length - realScenes(a).length)
      .slice(0, 8);

    return {
      total,
      famCount,
      newCount,
      totalScenes,
      topGenres,
      topStudios,
      eraCounts,
      seenPct,
      favPct,
      topPerformers
    };
  }, [performers, favorites, seen]);

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 space-y-8">
      {/* Overview Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold gold-gradient-text flex items-center gap-2 mb-1">
          <BarChart3 className="w-7 h-7 text-[var(--accent)]" />
          Catalog Intelligence & Insights Dashboard
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Real-time analytics across {stats.total} starlets, genre distributions, studio filmographies, and your personal viewing progress.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <Users className="w-3.5 h-3.5 text-[#d4a853]" />
            <span>Total Catalog</span>
          </div>
          <p className="font-serif text-2xl font-bold text-white">{stats.total}</p>
          <span className="text-[10px] text-[var(--accent)]">Indexed Profiles</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <Heart className="w-3.5 h-3.5 text-[#fb7185]" />
            <span>Family Genre</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#fb7185]">{stats.famCount}</p>
          <span className="text-[10px] text-[#fb7185]/70">Family Starlets</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#60a5fa]" />
            <span>Newcomers</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#60a5fa]">{stats.newCount}</p>
          <span className="text-[10px] text-[#60a5fa]/70">Debut ≤ 3 yrs</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <Film className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Verified Scenes</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#4ade80]">{stats.totalScenes}</p>
          <span className="text-[10px] text-[#4ade80]/70">Direct Video Links</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-[#4ade80]" />
            <span>Catalog Seen</span>
          </div>
          <p className="font-serif text-2xl font-bold text-white">{stats.seenPct}%</p>
          <span className="text-[10px] text-[var(--muted)]">{seen.size} marked seen</span>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-1">
            <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Favorites</span>
          </div>
          <p className="font-serif text-2xl font-bold text-[#f59e0b]">{favorites.size}</p>
          <span className="text-[10px] text-[#f59e0b]/70">{stats.favPct}% of directory</span>
        </div>
      </div>

      {/* Main Charts & Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Genre Breakdown */}
        <div className="glass rounded-3xl p-6 border border-[var(--line)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--line)]">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[var(--accent)]" />
              Family Scenario Breakdown
            </h3>
            <span className="text-xs text-[var(--muted)]">By Starlet Prevalence</span>
          </div>

          <div className="space-y-2.5">
            {stats.topGenres.slice(0, 8).map(item => {
              const maxCount = stats.topGenres[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.genre} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e8dfd8]">{item.label}</span>
                    <span className="text-[var(--accent)] font-mono font-bold">{item.count} starlets</span>
                  </div>
                  <div className="h-2 w-full bg-[#181219] rounded-full overflow-hidden border border-[var(--line)]">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--accent)] to-[#fce5a9] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Studios Leaderboard */}
        <div className="glass rounded-3xl p-6 border border-[var(--line)]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-[var(--line)]">
            <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[var(--accent)]" />
              Top Studios by Scene Output
            </h3>
            <span className="text-xs text-[var(--muted)]">Verified Direct Links</span>
          </div>

          <div className="space-y-2.5">
            {stats.topStudios.map((item, idx) => {
              const maxCount = stats.topStudios[0]?.count || 1;
              const pct = Math.round((item.count / maxCount) * 100);
              return (
                <div key={item.studio} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e8dfd8] flex items-center gap-2">
                      <span className="w-4 text-[10px] font-mono text-[var(--muted)]">#{idx + 1}</span>
                      {item.studio}
                    </span>
                    <span className="text-[#4ade80] font-mono font-bold">{item.count} releases</span>
                  </div>
                  <div className="h-2 w-full bg-[#181219] rounded-full overflow-hidden border border-[var(--line)]">
                    <div
                      className="h-full bg-gradient-to-r from-[#4ade80] to-[#22c55e] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Career Eras & Top Filmographies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Career Era Distribution */}
        <div className="glass rounded-3xl p-6 border border-[var(--line)]">
          <h3 className="font-serif text-lg font-bold text-white mb-4 pb-2 border-b border-[var(--line)] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            Career Debut Timeline
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(stats.eraCounts).map(([era, count]) => (
              <div key={era} className="bg-[#140f15] rounded-2xl p-4 border border-[var(--line)] flex flex-col justify-between">
                <span className="text-xs text-[var(--muted)] font-medium">{era}</span>
                <p className="font-serif text-2xl font-bold text-white mt-2">{count}</p>
                <div className="h-1.5 w-full bg-[#1e1721] rounded-full overflow-hidden mt-3">
                  <div
                    className="h-full bg-[var(--accent)] rounded-full"
                    style={{ width: `${Math.round((count / stats.total) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Enriched Starlets */}
        <div className="glass rounded-3xl p-6 border border-[var(--line)]">
          <h3 className="font-serif text-lg font-bold text-white mb-4 pb-2 border-b border-[var(--line)] flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--accent)]" />
            Most Comprehensive Filmographies
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stats.topPerformers.map(p => {
              const sc = realScenes(p);
              return (
                <button
                  key={p.id}
                  onClick={() => onOpenDossier(p)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#140f15] hover:bg-[#201822] border border-[var(--line)] text-left transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={`./avatars/${p.id}.jpg`}
                      alt=""
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}.jpg`;
                      }}
                      className="w-8 h-8 rounded-full object-cover border border-[var(--accent)] flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{p.name}</p>
                      <span className="text-[10px] text-[var(--muted)]">Debut {p.active?.from || '?'}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#4ade80] bg-[#4ade80]/10 px-2 py-0.5 rounded-full">
                    {sc.length} scenes
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Celestial Co-Star Collaboration Constellation */}
      <CoStarConstellation onOpenDossier={onOpenDossier} />
    </div>
  );
}

