import React from 'react';
import { ShieldAlert, Lock, Clock, Calendar } from 'lucide-react';
import StarletAvatar from './StarletAvatar';
import { getPerformerLockout, unquarantinePerformer, formatLockoutEnding } from '../engine/habituationEngine';

export default function CoolingOffCard({ performer, onRestore }) {
  const lockout = getPerformerLockout(performer.id);
  const expiryInfo = lockout || formatLockoutEnding(Date.now() + 36 * 3600 * 1000);

  const handleManualOverride = (e) => {
    e.stopPropagation();
    unquarantinePerformer(performer.id);
    if (onRestore) onRestore(performer.id);
  };

  return (
    <div className="relative rounded-2xl p-5 border-2 border-rose-500/40 bg-[#160d16]/90 backdrop-blur-xl flex flex-col justify-between min-h-[380px] text-center overflow-hidden shadow-2xl group">
      {/* Background Subtle Pulse Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-950/20 via-transparent to-black/60 pointer-events-none" />

      {/* Top Banner */}
      <div className="relative z-10 flex items-center justify-between text-[10px] font-mono font-bold text-rose-300 uppercase tracking-wider mb-2">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          Melody Effect Active
        </span>
        <span className="bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/40">
          Tri-Fold Resting
        </span>
      </div>

      {/* Performer Avatar (Visible & Unblurred per explicit user spec) */}
      <div className="relative z-10 flex flex-col items-center justify-center py-2">
        <div className="relative mb-3">
          <StarletAvatar
            id={performer.id}
            name={performer.name}
            hair={performer.hair}
            size="xl"
            className="border-3 border-rose-500/80 shadow-[0_0_25px_rgba(244,63,94,0.4)]"
          />
          <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-1 rounded-full shadow-lg">
            <Lock className="w-3.5 h-3.5" />
          </div>
        </div>

        <h3 className="font-serif text-lg font-bold text-white mb-1">
          {performer.name}
        </h3>
        <span className="text-[10px] font-mono text-zinc-400">
          Streaming content temporarily locked
        </span>
      </div>

      {/* Blurred & Locked Content Box with Exact Expiration Date & Universal Time */}
      <div className="relative z-10 my-2 p-3 rounded-xl bg-black/60 border border-white/10 text-left text-xs font-mono space-y-1.5 backdrop-blur-md">
        <div className="flex items-start gap-1.5 text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Universal Time Ending (UTC):</span>
            <strong className="text-rose-300 font-mono text-[11px] leading-tight block">
              {expiryInfo.unlockAtUTC || expiryInfo.utc}
            </strong>
          </div>
        </div>

        <div className="flex items-start gap-1.5 text-zinc-300 pt-1 border-t border-white/10">
          <Calendar className="w-3.5 h-3.5 text-amber-300 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Local Unlock Date:</span>
            <strong className="text-amber-200 font-mono text-[11px] leading-tight block">
              {expiryInfo.unlockAtLocal || expiryInfo.local}
            </strong>
          </div>
        </div>

        <div className="text-[10px] text-zinc-400 italic pt-1 border-t border-white/5">
          Reason: {expiryInfo.reason || 'Dopamine loop reset (Novelty preservation)'}
        </div>
      </div>

      {/* Friction Override Button */}
      <div className="relative z-10 pt-2 border-t border-white/10">
        <button
          onClick={handleManualOverride}
          className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-[11px] font-mono text-zinc-400 hover:text-rose-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          title="Manual override of cooling-off period"
        >
          <Lock className="w-3 h-3" />
          <span>Resting Active · Override Quarantine</span>
        </button>
      </div>
    </div>
  );
}
