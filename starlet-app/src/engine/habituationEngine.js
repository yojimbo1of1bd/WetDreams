/**
 * habituationEngine.js
 * 
 * Implements Plan v2.0 Anti-Habituation & Exploration-Exploitation Model.
 * Dynamically balances established performers against new discoveries using
 * exponential habituation decay and intra-session dwell collapse detection.
 */

import { storage } from './antiTamperStorage';

const STORAGE_KEY_HABITUATION = 'habituation_matrix';
const STORAGE_KEY_SESSION_VISITS = 'session_dwell_matrix';
const STORAGE_KEY_QUARANTINE = 'cooling_off_quarantine';
const STORAGE_KEY_LOCKOUT_JOURNAL = 'starlet_lockout_journal_v2';
const STORAGE_KEY_ADHD_TRACKER = 'starlet_adhd_tracker_v2';

const LAMBDA = 0.08;      // Exposure sensitivity coefficient
const WEIGHT_CLICK = 1.0; // Profile open weight
const WEIGHT_PASS = 0.05; // Verified viewport dwell pass weight
const GAMMA = 0.015;      // Forgetting velocity (per day)

/**
 * Returns baseline discovery score for a performer based on career tier.
 */
export function getBaseTierScore(performer) {
  if (!performer) return 5;
  const tiers = Array.isArray(performer.tier) ? performer.tier : (performer.tier ? [performer.tier] : []);
  const lowerTiers = tiers.map(t => String(t).toLowerCase());

  if (lowerTiers.some(t => t.includes('legend') || t.includes('goat'))) return 10;
  if (lowerTiers.some(t => t.includes('performer-of-year') || t.includes('hall-of-fame'))) return 9;
  if (lowerTiers.some(t => t.includes('fan-favorite') || t.includes('verified'))) return 7;
  if (lowerTiers.some(t => t.includes('new-starlet') || t.includes('newcomer'))) return 6;
  return 5;
}

/**
 * Loads habituation state from storage.
 */
function getHabituationRecord(performerId) {
  const map = storage.getItem(STORAGE_KEY_HABITUATION, {});
  return map[performerId] || { clicks: 0, passes: 0, lastSeen: Date.now() };
}

/**
 * Records a profile click (full engagement).
 */
export function recordProfileClick(performerId) {
  const map = storage.getItem(STORAGE_KEY_HABITUATION, {});
  const rec = map[performerId] || { clicks: 0, passes: 0, lastSeen: Date.now() };
  rec.clicks += 1;
  rec.lastSeen = Date.now();
  map[performerId] = rec;
  storage.setItem(STORAGE_KEY_HABITUATION, map);
}

/**
 * Records a verified viewport pass (card lingered in viewport >= 1.2s).
 */
export function recordViewportPass(performerId) {
  const map = storage.getItem(STORAGE_KEY_HABITUATION, {});
  const rec = map[performerId] || { clicks: 0, passes: 0, lastSeen: Date.now() };
  rec.passes += 1;
  rec.lastSeen = Date.now();
  map[performerId] = rec;
  storage.setItem(STORAGE_KEY_HABITUATION, map);
}

/**
 * Calculates current actual habituation H_actual(u, m).
 */
export function getHabituationScore(performerId) {
  const rec = getHabituationRecord(performerId);
  const now = Date.now();
  const deltaDays = Math.max(0, (now - rec.lastSeen) / (1000 * 60 * 60 * 24));

  const rawEngagement = (WEIGHT_CLICK * rec.clicks) + (WEIGHT_PASS * rec.passes);
  const H = 1 - Math.exp(-LAMBDA * rawEngagement);
  const H_actual = H * Math.exp(-GAMMA * deltaDays);

  return Math.min(0.95, Math.max(0, H_actual));
}

/**
 * Computes Anti-Habituation Exploration-Exploitation Score:
 * Score = B(m) / (1 + H_actual)
 */
export function calculateExplorationScore(performer) {
  if (!performer) return 5;
  const base = getBaseTierScore(performer);
  const H_actual = getHabituationScore(performer.id);
  return base / (1 + H_actual);
}

/**
 * Records active modal dwell time for a performer during current session.
 */
export function recordModalDwell(performerId, dwellSeconds) {
  const sessionMatrix = storage.getSessionItem(STORAGE_KEY_SESSION_VISITS, {});
  const visits = sessionMatrix[performerId] || [];
  visits.push(dwellSeconds);
  sessionMatrix[performerId] = visits;
  storage.setSessionItem(STORAGE_KEY_SESSION_VISITS, sessionMatrix);

  // Check if Dwell Collapse Fatigue rule applies:
  // k_m >= 3 and F(m) = k_m / (sum(dwell) + 0.1) >= 0.45
  if (visits.length >= 3) {
    const totalDwell = visits.reduce((acc, v) => acc + v, 0);
    const F = visits.length / (totalDwell + 0.1);
    if (F >= 0.45) {
      quarantinePerformer(performerId, { hours: 36, reason: 'Dwell Collapse (Melody Effect rapid profile clicks)' });
    }
  }
}

/**
 * Formats a clean date & universal time description for lockouts.
 * e.g., "Mon, Nov 2, 2026 at 12:00 PM UTC (Day after next day at 12:00 PM)"
 */
export function formatLockoutEnding(unlockMs) {
  const target = new Date(unlockMs);
  const utcStr = target.toUTCString();
  const localStr = target.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
  return {
    utc: utcStr,
    local: localStr,
    display: `${localStr} (${utcStr.replace('GMT', 'UTC')})`
  };
}

/**
 * Puts a performer into temporary cooling-off or 36-48h Tri-Fold quarantine.
 */
export function quarantinePerformer(performerId, options = {}) {
  const hours = options.hours || 36;
  const reason = options.reason || 'Melody Effect Tri-Fold Resting Quarantine';
  const unlockMs = Date.now() + (hours * 60 * 60 * 1000);
  const formatted = formatLockoutEnding(unlockMs);

  // 1. Persistent Lockout Journal (localStorage)
  const journal = storage.getItem(STORAGE_KEY_LOCKOUT_JOURNAL, {});
  journal[performerId] = {
    lockedAt: new Date().toISOString(),
    unlockTimestamp: unlockMs,
    unlockAtUTC: formatted.utc,
    unlockAtLocal: formatted.local,
    reason,
    hours
  };
  storage.setItem(STORAGE_KEY_LOCKOUT_JOURNAL, journal);

  // 2. Backward compatibility map
  const quarantined = storage.getItem(STORAGE_KEY_QUARANTINE, {});
  quarantined[performerId] = unlockMs;
  storage.setItem(STORAGE_KEY_QUARANTINE, quarantined);

  return journal[performerId];
}

/**
 * Retrieves lockout data if currently quarantined.
 */
export function getPerformerLockout(performerId) {
  const journal = storage.getItem(STORAGE_KEY_LOCKOUT_JOURNAL, {});
  const entry = journal[performerId];
  if (!entry) return null;

  if (Date.now() > entry.unlockTimestamp) {
    unquarantinePerformer(performerId);
    return null;
  }
  return entry;
}

/**
 * Removes quarantine (conscious user friction).
 */
export function unquarantinePerformer(performerId) {
  const journal = storage.getItem(STORAGE_KEY_LOCKOUT_JOURNAL, {});
  delete journal[performerId];
  storage.setItem(STORAGE_KEY_LOCKOUT_JOURNAL, journal);

  const quarantined = storage.getItem(STORAGE_KEY_QUARANTINE, {});
  delete quarantined[performerId];
  storage.setItem(STORAGE_KEY_QUARANTINE, quarantined);
}

/**
 * Checks if a performer is currently in cooling-off / lockout state.
 */
export function isPerformerCoolingOff(performerId) {
  const lockout = getPerformerLockout(performerId);
  if (lockout) return true;

  const quarantined = storage.getItem(STORAGE_KEY_QUARANTINE, {});
  const expiry = quarantined[performerId];
  if (!expiry) return false;
  if (Date.now() > expiry) {
    unquarantinePerformer(performerId);
    return false;
  }
  return true;
}

/**
 * ADHD Scene Engagement Tracker:
 * Punishes rapid video abandonment (< 15 seconds) or extreme single-performer binging (> 45 mins).
 */
export function recordSceneWatch(performerId, watchSeconds) {
  const tracker = storage.getSessionItem(STORAGE_KEY_ADHD_TRACKER, {});
  const rec = tracker[performerId] || { rapidAbandons: 0, totalWatchSec: 0, lastWatch: Date.now() };

  rec.totalWatchSec += watchSeconds;
  rec.lastWatch = Date.now();

  // If video closed in < 15 seconds, user is rapidly jumping/seeking dopamine bursts without watching
  if (watchSeconds < 15) {
    rec.rapidAbandons += 1;
    if (rec.rapidAbandons >= 3) {
      quarantinePerformer(performerId, {
        hours: 36,
        reason: 'ADHD Rapid Scene Abandonment (Compulsive jumping without viewing)'
      });
      rec.rapidAbandons = 0;
    }
  } else {
    // Reset consecutive abandonment streak on healthy watch
    rec.rapidAbandons = Math.max(0, rec.rapidAbandons - 1);
  }

  // Extreme single-performer binging: > 45 minutes on 1 starlet in single session
  if (rec.totalWatchSec > 2700) {
    quarantinePerformer(performerId, {
      hours: 36,
      reason: 'Prolonged Content Binging (Novelty exhaustion threshold reached)'
    });
    rec.totalWatchSec = 0;
  }

  tracker[performerId] = rec;
  storage.setSessionItem(STORAGE_KEY_ADHD_TRACKER, tracker);
}

