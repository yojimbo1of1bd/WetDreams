/**
 * antiTamperStorage.js
 * 
 * Multi-layer client-side storage abstraction (localStorage + sessionStorage).
 * Handles persistent state for anti-habituation metrics, active dwell times,
 * and session telemetry with graceful memory fallbacks.
 */

const STORAGE_PREFIX = 'starlet_v2_';

class AntiTamperStorage {
  constructor() {
    this.memoryCache = new Map();
  }

  _getKey(key) {
    return `${STORAGE_PREFIX}${key}`;
  }

  getItem(key, defaultValue = null) {
    const fullKey = this._getKey(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(fullKey);
        if (val !== null) {
          return JSON.parse(val);
        }
      }
    } catch {
      // Fall through to memory fallback
    }

    if (this.memoryCache.has(fullKey)) {
      return this.memoryCache.get(fullKey);
    }
    return defaultValue;
  }

  setItem(key, value) {
    const fullKey = this._getKey(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(fullKey, JSON.stringify(value));
      }
    } catch {
      // Quota exceeded or private browsing
    }
    this.memoryCache.set(fullKey, value);
  }

  removeItem(key) {
    const fullKey = this._getKey(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(fullKey);
      }
    } catch {}
    this.memoryCache.delete(fullKey);
  }

  getSessionItem(key, defaultValue = null) {
    const fullKey = this._getKey(key);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const val = window.sessionStorage.getItem(fullKey);
        if (val !== null) {
          return JSON.parse(val);
        }
      }
    } catch {}
    return defaultValue;
  }

  setSessionItem(key, value) {
    const fullKey = this._getKey(key);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.setItem(fullKey, JSON.stringify(value));
      }
    } catch {}
  }
}

export const storage = new AntiTamperStorage();

