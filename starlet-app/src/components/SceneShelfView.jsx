import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Play, Search, Film, Star, Clock, Plus, Check, Zap, RefreshCw, Bookmark } from 'lucide-react';
import { GENRE_LABELS, FAMILY_GENRES, realScenes } from '../constants';

/**
 * SceneShelfItem
 * 
 * Individual scene row item with animated video scrub montage trailer on hover.
 */
function SceneShelfItem({ s, isQueued, onToggleWatchlist, onPlayScene, onOpenDossier, onStashScene, isStashed, performers }) {
  const primaryThumb = s.thumbnail || (s.performerId ? `./avatars/${s.performerId}.jpg` : './avatars/default.jpg');

  const montageFrames = useMemo(() => {
    const list = [];
    if (s.thumbnail && typeof s.thumbnail === 'string') {
      const match = s.thumbnail.match(/^(.*\/)(\d+)\.(jpg|webp|jpeg)$/i);
      if (match) {
        for (let i = 1; i <= 10; i++) {
          list.push(`${match[1]}${i}.${match[3]}`);
        }
      } else {
        list.push(s.thumbnail);
      }
    }
    return list.length > 0 ? list : [primaryThumb];
  }, [s.thumbnail, primaryThumb]);

  const [isHovered, setIsHovered] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [imgSrc, setImgSrc] = useState(primaryThumb);
  const thumbRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const intervalRef = useRef(null);

  const startLoop = () => {
    setIsHovered(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setFrameIdx(idx => {
        const next = (idx + 1) % montageFrames.length;
        setImgSrc(montageFrames[next]);
        return next;
      });
    }, 220); // 220ms continuous video scrub
  };

  const stopLoop = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsHovered(false);
    setFrameIdx(0);
    setImgSrc(primaryThumb);
  };

  const handleMouseMove = (e) => {
    if (!thumbRef.current || montageFrames.length <= 1) return;
    const rect = thumbRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const next = Math.min(montageFrames.length - 1, Math.floor(ratio * montageFrames.length));
    if (next !== frameIdx) {
      setFrameIdx(next);
      setImgSrc(montageFrames[next]);
    }
    if (!isHovered) setIsHovered(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => () => stopLoop(), []);

  return (
    <div
      onMouseEnter={() => {
        hoverTimerRef.current = setTimeout(startLoop, 150);
      }}
      onMouseLeave={stopLoop}
      className="group glass rounded-xl p-2.5 sm:p-3 border border-[var(--line)] hover:border-[var(--accent-medium)] flex items-center justify-between gap-3 transition-all hover:bg-[#1f1821]"
    >
      {/* Mini Thumbnail with Hover Montage & 60fps Scrub */}
      <div
        ref={thumbRef}
        onMouseMove={handleMouseMove}
        onClick={() => onPlayScene && onPlayScene(s)}
        className="aspect-video w-24 sm:w-28 rounded-lg overflow-hidden bg-black flex-shrink-0 relative group/thumb cursor-pointer border border-white/10"
      >
        <img
          src={imgSrc}
          alt={s.title}
          className={`w-full h-full object-cover transition-transform duration-200 filter ${isHovered ? 'scale-105 brightness-105' : 'brightness-90'
            }`}
          onError={(e) => {
            e.currentTarget.src = s.performerId ? `./avatars/${s.performerId}.jpg` : './avatars/melody-marks.jpg';
          }}
          loading="lazy"
        />

        {/* Beeg Scrubber Progress Line */}
        {isHovered && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-black/60 z-20 overflow-hidden pointer-events-none">
            <div
              className="h-full bg-amber-400 transition-all duration-75"
              style={{ width: `${((frameIdx + 1) / montageFrames.length) * 100}%` }}
            />
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
            <span className="text-[9px] font-mono font-bold text-amber-300 bg-black/80 px-1 py-0.5 rounded shadow">
              {frameIdx + 1}/{montageFrames.length}
            </span>
          </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity bg-black/40">
          <Play className="w-5 h-5 text-amber-400 fill-current" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <button
          onClick={() => {
            const p = performers.find(item => item.id === s.performerId);
            if (p && onOpenDossier) onOpenDossier(p);
          }}
          className="text-xs font-bold text-[var(--accent)] hover:underline truncate block text-left cursor-pointer"
        >
          {s.performer}
        </button>
        <p className="text-xs font-semibold text-[var(--ink)] line-clamp-1 mt-0.5">
          {s.title}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] mt-1">
          {s.studio && <span className="truncate">{s.studio}</span>}
          {s.duration && <span className="font-mono bg-[#161117] px-1 py-0.5 rounded">{s.duration}</span>}
          {s.rating && <span className="text-[#4ade80] font-semibold">★ {s.rating}</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {onStashScene && (
          <button
            onClick={() => onStashScene(s)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${isStashed
                ? 'bg-amber-400/20 border-amber-400/60 text-amber-300'
                : 'bg-[#181319] border-[var(--line)] text-[var(--muted)] hover:text-amber-300'
              }`}
            title={isStashed ? 'Saved in Starlet Library' : 'Save to Starlet Library'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isStashed ? 'fill-current' : ''}`} />
          </button>
        )}

        {onToggleWatchlist && (
          <button
            onClick={() => onToggleWatchlist(s)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${isQueued
                ? 'bg-[#4ade80]/20 border-[#4ade80]/60 text-[#4ade80]'
                : 'bg-[#181319] border-[var(--line)] text-[var(--muted)] hover:text-white'
              }`}
            title={isQueued ? 'Remove from queue' : 'Add to queue'}
          >
            {isQueued ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        )}

        <button
          onClick={() => onPlayScene && onPlayScene(s)}
          className="p-2 rounded-xl bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors cursor-pointer"
          title="Play in cinema"
        >
          <Play className="w-4 h-4 fill-current ml-0.5" />
        </button>
      </div>
    </div>
  );
}

export default function SceneShelfView({
  performers,
  onOpenDossier,
  onPlayScene,
  onToggleWatchlist,
  onStashScene,
  watchlistUrls = new Set()
}) {
  const [search, setSearch] = useState('');
  const [selectedStudio, setSelectedStudio] = useState('all');
  const [selectedScenario, setSelectedScenario] = useState('all');
  const [shelfVisibleCounts, setShelfVisibleCounts] = useState({});
  const [isSearchingTube, setIsSearchingTube] = useState(false);
  const [liveTubeScenes, setLiveTubeScenes] = useState([]);
  const [tubeSearchDone, setTubeSearchDone] = useState(false);
  const [tubePage, setTubePage] = useState(1);
  const [tubeHasMore, setTubeHasMore] = useState(true);
  const [stashedUrls, setStashedUrls] = useState(() => new Set());

  // Reset live tube results when search query changes
  useEffect(() => {
    setLiveTubeScenes([]);
    setTubeSearchDone(false);
    setTubePage(1);
    setTubeHasMore(true);
  }, [search]);

  // Stash helper
  const handleStash = async (s) => {
    if (onStashScene) {
      await onStashScene(s);
      setStashedUrls(prev => new Set([...prev, s.url || s.title]));
    }
  };

  // Live Multi-Tube Search (Eporner + FPO with Page Pagination)
  const handleLiveTubeSearch = async (targetPage = 1) => {
    const q = search.trim();
    if (!q) return;
    setIsSearchingTube(true);
    setTubeSearchDone(false);
    try {
      const res = await fetch(`/api/archive-search?query=${encodeURIComponent(q)}&page=${targetPage}&per_page=24`);
      const data = await res.json();
      if (data.success && Array.isArray(data.scenes) && data.scenes.length > 0) {
        // Tag performer if found in query or catalog
        const enriched = data.scenes.map(s => {
          let perf = null;
          if (performers && performers.length) {
            perf = performers.find(p => p.name && (s.title.toLowerCase().includes(p.name.toLowerCase()) || q.toLowerCase().includes(p.name.toLowerCase())));
          }
          return {
            ...s,
            performer: perf ? perf.name : (s.performer || q.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')),
            performerId: perf ? perf.id : null
          };
        });

        if (targetPage === 1) {
          setLiveTubeScenes(enriched);
        } else {
          setLiveTubeScenes(prev => {
            const urls = new Set(prev.map(x => x.url));
            const fresh = enriched.filter(x => !urls.has(x.url));
            return [...prev, ...fresh];
          });
        }
        setTubePage(targetPage);
        setTubeHasMore(data.hasMore !== false);
      } else if (targetPage === 1) {
        // Fallback: try mirror resolver endpoint
        const mRes = await fetch(`/api/mirror?source=eporner&query=${encodeURIComponent(q)}`);
        const mData = await mRes.json();
        if (mData.success && mData.allVideos && mData.allVideos.length > 0) {
          setLiveTubeScenes(mData.allVideos);
          setTubeHasMore(false);
        } else if (mData.success && mData.embedUrl) {
          setLiveTubeScenes([{
            title: mData.title || q,
            studio: 'Eporner HD',
            url: mData.embedUrl,
            duration: '28:15',
            rating: '98%',
            isReal: true
          }]);
          setTubeHasMore(false);
        } else {
          setLiveTubeScenes([]);
          setTubeHasMore(false);
        }
      } else {
        setTubeHasMore(false);
      }
    } catch (err) {
      console.warn('Live tube search error:', err);
      setTubeHasMore(false);
    } finally {
      setIsSearchingTube(false);
      setTubeSearchDone(true);
    }
  };

  const SCENARIO_PILLS = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'swap', label: 'Family Swap' },
    { id: 'blackmail', label: 'Blackmail' },
    { id: 'permission', label: 'Permission' },
    { id: 'shared-bed', label: 'Shared Bed' },
    { id: 'caught', label: 'Caught' },
    { id: 'study', label: 'Study Help' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'vacation', label: 'Vacation' },
    { id: 'stepmom', label: 'Stepmom' },
    { id: 'stepsis', label: 'Stepsis' }
  ];

  const TOP_STUDIOS = [
    'All Studios', 'Brazzers', 'Pure Taboo', 'TeamSkeet', 'Nubiles', 'Deeper', 'Vixen', 'Blacked', 'Private', 'Marc Dorcel'
  ];

  // Aggregate all verified real scenes across all performers
  const { byGenre, totalSceneCount } = useMemo(() => {
    const genreMap = {};
    let total = 0;

    for (const p of performers) {
      const pScenes = realScenes(p);
      for (const s of pScenes) {
        const gs = (s.genres && s.genres.length > 0)
          ? s.genres
          : (p.genres || []).filter(g => FAMILY_GENRES.has(g));

        const targetGenres = gs.filter(g => FAMILY_GENRES.has(g));
        if (!targetGenres.length) targetGenres.push('family');

        for (const g of targetGenres) {
          if (!genreMap[g]) genreMap[g] = [];
          genreMap[g].push({
            ...s,
            performer: p.name,
            performerId: p.id,
            performerAge: p.age
          });
          total++;
        }
      }
    }

    return {
      byGenre: genreMap,
      totalSceneCount: total
    };
  }, [performers]);

  // Filter scenes
  const filteredGenres = useMemo(() => {
    const rawQ = search.replace(/^["']|["']$/g, '').toLowerCase().trim();
    const tokens = rawQ ? rawQ.split(/\s+/).filter(Boolean) : [];
    const studio = selectedStudio.toLowerCase();
    const result = {};

    for (const [genre, scenes] of Object.entries(byGenre)) {
      let filtered = scenes;
      if (selectedStudio !== 'all') {
        filtered = filtered.filter(s => (s.studio || '').toLowerCase().includes(studio));
      }
      if (selectedScenario !== 'all') {
        filtered = filtered.filter(s => (s.genres || []).includes(selectedScenario));
      }
      if (tokens.length > 0) {
        filtered = filtered.filter(s => {
          const searchable = `${s.title || ''} ${s.performer || ''} ${s.studio || ''} ${(s.genres || []).join(' ')}`.toLowerCase();
          return tokens.every(token => searchable.includes(token));
        });
      }
      if (filtered.length > 0) {
        result[genre] = filtered;
      }
    }
    return result;
  }, [byGenre, search, selectedStudio, selectedScenario]);

  const genreOrder = Object.keys(GENRE_LABELS).filter(g => filteredGenres[g]?.length);

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4">
      {/* Shelf Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-[var(--accent)]/20 text-[var(--accent)]">
              <Film className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-[var(--accent)]">
              Curated Scene Shelves
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[var(--ink)]">
            Scenario Release Archive
          </h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            Explore {totalSceneCount.toLocaleString()} verified releases categorized across family, taboo, and roleplay genres.
          </p>
        </div>

        {/* Search with Instant Deep Tube Trigger */}
        <div className="relative w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLiveTubeSearch(1);
              }}
              placeholder="Search local 38k scenes, or press Enter for Live Tubes..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#140e16] border border-[var(--line)] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[var(--accent)] transition-all shadow-inner"
            />
          </div>
          {search.trim() && (
            <button
              onClick={() => handleLiveTubeSearch(1)}
              disabled={isSearchingTube}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
              title="Query live Eporner & FPO tube mirrors directly"
            >
              {isSearchingTube ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-current" />
              )}
              <span className="hidden sm:inline">Deep Tube</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters: Scenario Pills */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {SCENARIO_PILLS.map(sc => {
            const isSelected = selectedScenario === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => setSelectedScenario(sc.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isSelected
                    ? 'bg-[var(--accent)] text-black shadow-md font-bold'
                    : 'bg-[#161019] text-[var(--muted)] border border-[var(--line)] hover:text-white hover:border-[var(--accent)]'
                  }`}
              >
                {sc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* LIVE EXTERNAL TUBE RESULTS SHELF (When queried) */}
      {liveTubeScenes.length > 0 && (
        <div className="mb-10 p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-500/15 border border-amber-400/40 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
                <span>Live Tube Streams Found for "{search}"</span>
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold border border-amber-400/40">
                  {liveTubeScenes.length} releases (Page {tubePage})
                </span>
              </h3>
            </div>
            <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
              Stream directly in Cinema Player · Save to Starlet Library
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {liveTubeScenes.map((s, idx) => (
              <SceneShelfItem
                key={`tube-${idx}`}
                s={s}
                isQueued={Boolean(s.url && watchlistUrls.has(s.url))}
                onToggleWatchlist={onToggleWatchlist}
                onPlayScene={onPlayScene}
                onOpenDossier={onOpenDossier}
                onStashScene={handleStash}
                isStashed={stashedUrls.has(s.url || s.title)}
                performers={performers}
              />
            ))}
          </div>

          {/* Tube Pagination */}
          {tubeHasMore && (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleLiveTubeSearch(tubePage + 1)}
                disabled={isSearchingTube}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-purple-500/20 hover:from-amber-500/35 hover:to-rose-500/35 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                {isSearchingTube ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Searching Next 24 Releases...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                    <span>Load Next 24 Tube Releases (Page {tubePage + 1})</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Genre Shelves */}
      {genreOrder.length > 0 ? (
        <div className="space-y-8">
          {genreOrder.map(g => {
            const scenes = filteredGenres[g];
            const currentLimit = shelfVisibleCounts[g] || 30;
            const visibleScenes = scenes.slice(0, currentLimit);

            return (
              <div key={g} className="border-l-4 border-l-[var(--accent)] pl-4 py-1">
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                    {GENRE_LABELS[g] || g}
                  </h3>
                  <span className="text-xs text-[var(--accent)] font-semibold font-mono">
                    {scenes.length} {scenes.length === 1 ? 'Release' : 'Releases'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {visibleScenes.map((s, idx) => (
                    <SceneShelfItem
                      key={idx}
                      s={s}
                      isQueued={Boolean(s.url && watchlistUrls.has(s.url))}
                      onToggleWatchlist={onToggleWatchlist}
                      onPlayScene={onPlayScene}
                      onOpenDossier={onOpenDossier}
                      onStashScene={handleStash}
                      isStashed={stashedUrls.has(s.url || s.title)}
                      performers={performers}
                    />
                  ))}
                </div>

                {/* Progressive Shelf Pagination Controls */}
                {scenes.length > currentLimit ? (
                  <div className="mt-4 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShelfVisibleCounts(prev => ({ ...prev, [g]: (prev[g] || 30) + 30 }))}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-rose-500/10 to-amber-500/20 hover:from-amber-500/35 hover:to-rose-500/25 border border-amber-400/40 text-amber-200 text-xs font-mono font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300 fill-current" />
                      <span>Load Next 30 Releases</span>
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-black/40 text-amber-300 border border-amber-400/30">
                        {Math.min(scenes.length, currentLimit)} / {scenes.length.toLocaleString()}
                      </span>
                    </button>
                  </div>
                ) : scenes.length > 30 ? (
                  <div className="mt-3 flex items-center justify-center gap-2 text-zinc-500 text-xs font-mono">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>All {scenes.length.toLocaleString()} releases displayed for {GENRE_LABELS[g] || g}</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : liveTubeScenes.length === 0 ? (
        <div className="p-8 sm:p-12 text-center glass rounded-3xl border border-amber-400/25 bg-[#0e0813] space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-white">
              {search ? `"${search}" Not In Local Archive` : 'No Releases Found'}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto leading-relaxed">
              {search
                ? `This specific release is not cached in your local 38k-scene library. Query live Eporner & FPO tube mirrors to locate, stream, or preview it directly.`
                : 'No scenes match the selected studio or scenario filters.'}
            </p>
          </div>

          {search && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleLiveTubeSearch(1)}
                disabled={isSearchingTube}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:brightness-110 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center gap-2.5 mx-auto shadow-xl shadow-amber-500/25 transition-all cursor-pointer border border-amber-300"
              >
                {isSearchingTube ? (
                  <>
                    <RefreshCw className="w-4 h-4 text-black animate-spin" />
                    <span>Scanning Eporner & FPO Tube Mirrors...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-black fill-current" />
                    <span>⚡ Query Live Eporner & FPO Tube Mirrors</span>
                  </>
                )}
              </button>
            </div>
          )}

          {tubeSearchDone && liveTubeScenes.length === 0 && (
            <p className="text-xs font-mono text-zinc-500 mt-2">
              No external tube mirrors returned matching stream links for this exact title.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
