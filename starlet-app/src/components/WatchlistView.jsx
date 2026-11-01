import React, { useMemo } from 'react';
import { Film, Play, Trash2, Clock, Star, Shuffle, Download, ArrowRight, Heart } from 'lucide-react';

export default function WatchlistView({
  watchlist,
  onRemoveFromWatchlist,
  onClearWatchlist,
  onPlayScene,
  onOpenDossier
}) {
  // Calculate total runtime in minutes
  const totalDurationMinutes = useMemo(() => {
    let totalSec = 0;
    for (const s of watchlist) {
      if (s.duration) {
        const parts = s.duration.split(':').map(Number);
        if (parts.length === 2) {
          totalSec += (parts[0] * 60) + parts[1];
        } else if (parts.length === 3) {
          totalSec += (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        }
      }
    }
    return Math.round(totalSec / 60);
  }, [watchlist]);

  const hours = Math.floor(totalDurationMinutes / 60);
  const mins = totalDurationMinutes % 60;

  return (
    <div className="max-w-[1400px] mx-auto py-6 px-4 space-y-6">
      {/* Watchlist Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <h2 className="font-serif text-3xl font-bold gold-gradient-text flex items-center gap-2 mb-1">
            <Film className="w-7 h-7 text-[var(--accent)]" />
            My Personal Scene Queue & Watchlist
          </h2>
          <p className="text-xs text-[var(--muted)]">
            Curated list of verified video releases ready for streaming.
          </p>
        </div>

        {watchlist.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const randomScene = watchlist[Math.floor(Math.random() * watchlist.length)];
                if (randomScene) onPlayScene(randomScene);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--accent)] text-black font-bold text-xs hover:bg-[var(--accent-light)] transition-all shadow-md"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Shuffle Play</span>
            </button>

            <button
              onClick={onClearWatchlist}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1e1721] text-red-400 hover:bg-red-500/20 border border-red-500/30 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Queue</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)]">Queued Releases</span>
          <p className="font-serif text-2xl font-bold text-white mt-1">{watchlist.length} Scenes</p>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)]">Total Playtime</span>
          <p className="font-serif text-2xl font-bold text-[#4ade80] mt-1">
            {hours > 0 ? `${hours}h ` : ''}{mins}m
          </p>
        </div>

        <div className="glass rounded-2xl p-4 border border-[var(--line)]">
          <span className="text-xs text-[var(--muted)]">Stream Quality</span>
          <p className="font-serif text-2xl font-bold text-[var(--accent)] mt-1">1080p HD Verified</p>
        </div>
      </div>

      {/* Scene Queue List */}
      {watchlist.length > 0 ? (
        <div className="space-y-3">
          {watchlist.map((scene, idx) => (
            <div
              key={idx}
              className="group glass rounded-2xl p-4 border border-[var(--line)] hover:border-[var(--accent-medium)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:bg-[#1a141c]"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* Thumbnail Preview */}
                <div
                  onClick={() => onPlayScene(scene)}
                  className="relative w-28 h-18 rounded-xl overflow-hidden bg-black flex-shrink-0 cursor-pointer border border-[var(--line)] group-hover:border-[var(--accent)] transition-colors"
                >
                  {scene.thumbnail ? (
                    <img
                      src={scene.thumbnail}
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#151016]">
                      <Film className="w-6 h-6 text-[var(--muted)]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-6 h-6 text-[var(--accent)] fill-current" />
                  </div>
                  {scene.duration && (
                    <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-black/80 px-1.5 py-0.5 rounded text-white">
                      {scene.duration}
                    </span>
                  )}
                </div>

                {/* Meta details */}
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider block mb-0.5">
                    Queue Position #{idx + 1}
                  </span>
                  <h4 className="font-bold text-sm text-white group-hover:text-[var(--accent)] transition-colors truncate">
                    {scene.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-1 flex-wrap">
                    {scene.performer && (
                      <span className="text-[#fce5a9] font-medium font-serif">
                        {scene.performer}
                      </span>
                    )}
                    {scene.studio && <span>· {scene.studio}</span>}
                    {scene.rating && (
                      <span className="text-[#4ade80] font-bold">· ★ {scene.rating}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onPlayScene(scene)}
                  className="px-4 py-2 rounded-xl bg-[var(--accent)] text-black font-bold text-xs hover:bg-[var(--accent-light)] transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Scene</span>
                </button>

                <button
                  onClick={() => onRemoveFromWatchlist(scene)}
                  className="p-2 rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-red-400 hover:border-red-500/40 transition-colors"
                  title="Remove from queue"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-3xl p-16 text-center border border-[var(--line)]">
          <Film className="w-12 h-12 text-[var(--muted)]/40 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-white mb-1">Your Queue is Empty</h3>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto mb-6">
            Add scenes from any performer dossier or the Family Scene Shelf to build your personalized streaming playlist.
          </p>
        </div>
      )}
    </div>
  );
}

