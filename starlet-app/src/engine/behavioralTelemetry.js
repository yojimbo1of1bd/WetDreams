/**
 * behavioralTelemetry.js
 * 
 * Passive, privacy-preserving behavioral telemetry for personal cognitive state inference.
 * Runs entirely client-side using localStorage Exponential Moving Averages (EMA).
 */

import { storage } from './antiTamperStorage';

const STORAGE_KEY_BASELINE = 'behavioral_baseline_v2';
const ALPHA = 0.25; // EMA adaptation rate

class BehavioralTelemetry {
  constructor() {
    this.sessionStart = Date.now();
    this.lastClickTime = Date.now();
    this.clickIntervals = [];
    this.scrollEvents = [];
    this.tabSwitches = 0;
    this.isTabActive = true;

    this.baseline = storage.getItem(STORAGE_KEY_BASELINE, {
      meanInterval: 4500, // ms
      scrollVelocity: 1.2,
      dwellRatio: 18000
    });

    this._initListeners();
  }

  _initListeners() {
    if (typeof window === 'undefined') return;

    // Visibility change listener
    document.addEventListener('visibilitychange', () => {
      this.isTabActive = document.visibilityState === 'visible';
      if (!this.isTabActive) {
        this.tabSwitches += 1;
      }
    });

    // Passive scroll sampler
    let lastScrollY = window.scrollY;
    let lastScrollTime = Date.now();

    window.addEventListener('scroll', () => {
      const now = Date.now();
      const dt = now - lastScrollTime;
      if (dt > 100) {
        const dy = Math.abs(window.scrollY - lastScrollY);
        const velocity = dy / dt; // px/ms
        this.scrollEvents.push(velocity);
        if (this.scrollEvents.length > 50) this.scrollEvents.shift();
        lastScrollY = window.scrollY;
        lastScrollTime = now;
      }
    }, { passive: true });
  }

  recordClick() {
    const now = Date.now();
    const interval = now - this.lastClickTime;
    this.lastClickTime = now;
    if (interval > 200 && interval < 60000) {
      this.clickIntervals.push(interval);
      if (this.clickIntervals.length > 30) this.clickIntervals.shift();
    }
  }

  /**
   * Returns current browsing velocity ratio compared to personal baseline.
   * Ratio > 1.4 indicates rapid skimming / scanning mode.
   * Ratio <= 1.0 indicates relaxed, thorough exploration.
   */
  getScanVelocityRatio() {
    if (this.clickIntervals.length < 3) return 1.0;
    const currentMean = this.clickIntervals.reduce((a, b) => a + b, 0) / this.clickIntervals.length;
    const base = this.baseline.meanInterval || 4500;
    return base / (currentMean + 1);
  }

  /**
   * Persists updated session EMA baseline.
   */
  finalizeSession() {
    if (this.clickIntervals.length < 5) return;
    const sessionMean = this.clickIntervals.reduce((a, b) => a + b, 0) / this.clickIntervals.length;
    const updatedMean = (ALPHA * sessionMean) + ((1 - ALPHA) * this.baseline.meanInterval);
    this.baseline.meanInterval = updatedMean;
    storage.setItem(STORAGE_KEY_BASELINE, this.baseline);
  }
}

export const telemetry = new BehavioralTelemetry();

