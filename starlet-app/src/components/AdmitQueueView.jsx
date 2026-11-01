import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus, CheckCircle2, XCircle, Download, Upload, Sparkles,
  Flame, Film, Shield, Calendar, ArrowRight, MessageSquare, ThumbsUp
} from 'lucide-react';

export default function AdmitQueueView({ allPerformers = [], onAdmitSuccess, onOpenDossier }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admittingId, setAdmittingId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load candidates from staging file and localStorage overrides
  useEffect(() => {
    fetch('./newcomers-staging.json')
      .then(res => res.json())
      .then(data => {
        // Filter out any candidates already in catalog
        const catalogIds = new Set(allPerformers.map(p => p.id));
        const pending = data.filter(c => !catalogIds.has(c.id));
        setCandidates(pending);
      })
      .catch(() => {
        setCandidates([]);
      })
      .finally(() => setLoading(false));
  }, [allPerformers]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Admit candidate to permanent database
  const handleAdmit = async (candidate) => {
    setAdmittingId(candidate.id);
    try {
      const res = await fetch('/api/admit-performer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(candidate)
      });
      const data = await res.json();
      if (data.success) {
        setCandidates(prev => prev.filter(c => c.id !== candidate.id));
        showToast(`✓ Admitted ${candidate.name} into VIP Directory!`);
        if (onAdmitSuccess && data.performer) {
          onAdmitSuccess(data.performer);
        }
      } else {
        showToast(`❌ Failed to admit: ${data.error || 'Server error'}`);
      }
    } catch (err) {
      showToast(`❌ Connection failed: ${err.message}`);
    } finally {
      setAdmittingId(null);
    }
  };

  // 2. Dismiss candidate from review queue
  const handleDismiss = (id) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
    showToast('Candidate dismissed from staging queue.');
  };

  // 3. Download Personal Catalog JSON & Cookie State
  const handleExportPersonalBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      performersCount: allPerformers.length,
      performers: allPerformers,
      stagedNewcomers: candidates,
      favorites: JSON.parse(localStorage.getItem('starlet_fav_v6') || '[]'),
      watchlist: JSON.parse(localStorage.getItem('starlet_watchlist_v6') || '[]'),
      lockoutJournal: JSON.parse(localStorage.getItem('starlet_lockout_journal_v2') || '{}')
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starlet_personal_catalog_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('💾 Personal catalog & cookies backup downloaded!');
  };

  return (
    <div className="max-w-[1400px] mx-auto py-8 px-4 sm:px-8 space-y-8 text-zinc-300">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 bg-[#1e1520] border-2 border-emerald-500/80 text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl font-mono text-xs flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass rounded-3xl p-6 sm:p-8 border border-[var(--accent)]/30 bg-gradient-to-br from-[#1c121e]/90 via-[#150d18]/90 to-[#0c080e]/95 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs font-mono font-bold uppercase tracking-wider">
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Newcomer Admissions & Sovereignty Staging</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Review & Admit Rising Starlets
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Candidate newcomers discovered from adult subreddits (<code className="text-amber-300">r/Porn_Discuss</code>, <code className="text-amber-300">r/tipofmypenis</code>, <code className="text-amber-300">r/NSFW_GIF</code>) awaiting your personal authorization to be permanently written into the VIP database.
          </p>
        </div>

        {/* Sovereignty Actions: Personal Export */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportPersonalBackup}
            className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-gradient-to-r from-[var(--accent)] to-[#fce5a9] text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            title="Download full standalone copy of all performers, newcomers and cookies"
          >
            <Download className="w-4 h-4" />
            <span>💾 Export Personal Catalog JSON</span>
          </button>
        </div>
      </div>

      {/* Staged Candidates Grid */}
      {loading ? (
        <div className="p-12 text-center text-zinc-400 font-mono text-sm">
          Scanning community staging pipeline...
        </div>
      ) : candidates.length === 0 ? (
        <div className="glass rounded-3xl p-16 text-center border border-white/10 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-serif text-xl font-bold text-white">Admissions Queue is Clear</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            All discovered newcomers have been approved into the permanent catalog. New candidates will automatically stage here as community subreddits highlight rising talent.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {candidates.map(c => (
            <div
              key={c.id}
              className="glass rounded-3xl p-6 border border-white/10 hover:border-amber-500/40 bg-[#160e18]/80 transition-all flex flex-col justify-between space-y-4 shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                {/* Photo Portrait Preview */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-black flex-shrink-0 border-2 border-amber-500/40 shadow-lg">
                  <img
                    src={c.photoUrl}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://www.babepedia.com/pics/${encodeURIComponent(c.name.replace(/\s+/g, '_'))}.jpg`;
                    }}
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/80 text-amber-300">
                    Debut {c.debutYear}
                  </span>
                </div>

                {/* Candidate Meta */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-serif text-2xl font-bold text-white truncate">
                      {c.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Age {c.age} · {c.nationality}
                    </span>
                  </div>

                  {/* Reddit Source Context */}
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mt-1">
                    <span className="text-amber-300 font-bold">{c.subreddit}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-rose-300">
                      <Flame className="w-3 h-3 text-rose-400 fill-current" />
                      {c.upvotes} upvotes
                    </span>
                  </div>

                  {/* Community Quote Snippet */}
                  {c.quote && (
                    <p className="text-xs text-zinc-300 italic mt-2 line-clamp-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      “{c.quote}”
                    </p>
                  )}
                </div>
              </div>

              {/* Sample Scene & Studio */}
              {c.sampleScene && (
                <div className="p-3 rounded-2xl bg-black/50 border border-white/5 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <Film className="w-4 h-4 text-amber-300 flex-shrink-0" />
                    <span className="text-white font-medium truncate">{c.sampleScene.title}</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold flex-shrink-0">
                    ★ {c.sampleScene.rating}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <button
                  onClick={() => handleDismiss(c.id)}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-300 border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Dismiss Candidate</span>
                </button>

                <button
                  onClick={() => handleAdmit(c)}
                  disabled={admittingId === c.id}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{admittingId === c.id ? 'Admitting...' : '✓ Admit to Database'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

