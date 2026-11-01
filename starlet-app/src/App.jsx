import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import TabBar from './components/TabBar';
import ControlsBar from './components/ControlsBar';
import ActiveBar from './components/ActiveBar';
import Sidebar from './components/Sidebar';
import PerformerCard from './components/PerformerCard';
import PerformerModal from './components/PerformerModal';
import SceneShelfView from './components/SceneShelfView';
import SpotlightHero from './components/SpotlightHero';
import AnalyticsView from './components/AnalyticsView';
import CompareModal from './components/CompareModal';
import CinemaModal from './components/CinemaModal';
import WatchlistView from './components/WatchlistView';
import CoolingOffCard from './components/CoolingOffCard';
import AmbientBackdrop from './components/AmbientBackdrop';
import AboutView from './components/AboutView';
import CalmSanctuary from './components/CalmSanctuary';
import RetroBootScreen from './components/RetroBootScreen';
import LiveWallpaperLounge from './components/LiveWallpaperLounge';
import CinematicAwakening from './components/CinematicAwakening';
import HaremWelcomeTour from './components/HaremWelcomeTour';
import MobileConnectModal from './components/MobileConnectModal';
import FaceMashArena from './components/FaceMashArena';
import CompulsionLockoutModal from './components/CompulsionLockoutModal';
import RedditHypeView from './components/RedditHypeView';
import FeaturedOfTheDay from './components/FeaturedOfTheDay';
import AdmitQueueView from './components/AdmitQueueView';
import RedditShortsView from './components/RedditShortsView';
import CipheredUnderworldView from './components/CipheredUnderworldView';
import { resolveCipher, UNDERWORLD_SCENES_CACHE } from './engine/underworldTaxonomy';
import { isFamily, isNewcomer, realScenes, FAMILY_GENRES, getAgeBracket } from './constants';
import { recordProfileClick, calculateExplorationScore, isPerformerCoolingOff, quarantinePerformer } from './engine/habituationEngine';
import { telemetry } from './engine/behavioralTelemetry';

const STORAGE_KEY_SEEN = 'starlet_seen_v6';
const STORAGE_KEY_FAV = 'starlet_fav_v6';
const STORAGE_KEY_WATCHLIST = 'starlet_watchlist_v6';
const STORAGE_KEY_THEME = 'starlet_theme_v6';

export default function App() {
  const [performers, setPerformers] = useState([]);
  const [similarityMatrix, setSimilarityMatrix] = useState({});
  const [underworldCache, setUnderworldCache] = useState(UNDERWORLD_SCENES_CACHE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('rating');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeFilters, setActiveFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [spotlightPerformer, setSpotlightPerformer] = useState(null);
  const [midlineActiveId, setMidlineActiveId] = useState(null);

  // Cinema modal & scene streaming
  const [cinemaScene, setCinemaScene] = useState(null);

  // Retro CRT baseline scan, Live 4K Wallpaper Lounge & Gateways
  // Mandatory Iceberg Tip: Cover-up is ALWAYS invoked on initial mount / reload
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showWallpaperLounge, setShowWallpaperLounge] = useState(true);

  // Progressive Render & CRT Boot Screen: Disabled by default to ensure instant tap response
  const [showRetroBoot, setShowRetroBoot] = useState(false);

  const [showAwakeningCutscene, setShowAwakeningCutscene] = useState(false);
  const [showHaremWelcome, setShowHaremWelcome] = useState(false);
  const [tourHostStarlet, setTourHostStarlet] = useState(null);
  const [showCalmSanctuary, setShowCalmSanctuary] = useState(false);
  const [showMobileConnect, setShowMobileConnect] = useState(false);
  const [triFoldLockoutData, setTriFoldLockoutData] = useState(null);
  const [cipheredDomain, setCipheredDomain] = useState(null);

  // Universal Public Stealth Blur Privacy Mode
  const [isStealthBlur, setIsStealthBlur] = useState(() => {
    try {
      return localStorage.getItem('starlet_stealth_blur') === 'true';
    } catch {
      return false;
    }
  });

  const toggleStealthBlur = () => {
    setIsStealthBlur(prev => {
      const next = !prev;
      try { localStorage.setItem('starlet_stealth_blur', String(next)); } catch {}
      return next;
    });
  };

  // Keyboard shortcut: Press 'B' to toggle Stealth Blur
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.key === 'b' || e.key === 'B') && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        toggleStealthBlur();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Unlock Harem Trigger: launches the seamless glass shatter & unlocks VIP Directory!
  const triggerUnlockHarem = () => {
    document.title = "Starlet VIP Directory";

    const alreadyCompleted = localStorage.getItem('starlet_walkthrough_completed_v1') === 'true';

    if (typeof window.__triggerCoverShatter === 'function') {
      window.__triggerCoverShatter();
      setTimeout(() => {
        setIsUnlocked(true);
        setShowWallpaperLounge(false);
        setShowCalmSanctuary(false);
        setShowRetroBoot(false);
        if (!alreadyCompleted) {
          setShowAwakeningCutscene(true);
        }
      }, 700);
    } else {
      setIsUnlocked(true);
      setShowWallpaperLounge(false);
      setShowCalmSanctuary(false);
      setShowRetroBoot(false);
      if (!alreadyCompleted) {
        setShowAwakeningCutscene(true);
      }
    }
  };

  // Reset to Iceberg Tip (Layer 1 Live Wallpaper Lounge) without erasing persistent memory
  const handleResetToIcebergTip = () => {
    setShowCalmSanctuary(false);
    setCipheredDomain(null);
    setIsUnlocked(false);
    setShowWallpaperLounge(true);
    // Explicitly guarantee persistent walkthrough memory is preserved:
    try {
      localStorage.setItem('starlet_walkthrough_completed_v1', 'true');
    } catch {}
    setShowAwakeningCutscene(false);
    setShowHaremWelcome(false);
  };

  // Expose unlock trigger globally for child modals & touch gestures
  useEffect(() => {
    window.__triggerUnlockHarem = triggerUnlockHarem;
  }, []);

  // Expose manual test trigger for RetroBoot (Disabled by default to keep phone UI snappy)
  useEffect(() => {
    window.triggerRetroBoot = () => setShowRetroBoot(true);
  }, []);

  // Global Gateways:
  // 1. Desktop: strictly F12 console 'fuck' or 'fuck()'
  // 2. Mobile: subtle 3-tap touch gesture or physical device shake (with permission handler)
  useEffect(() => {
    // 1. Desktop console gateway
    const unlockFn = () => {
      triggerUnlockHarem();
      return "💥 Barrier shattered. Welcome to the harem, kaka.";
    };
    try {
      Object.defineProperty(window, 'fuck', {
        configurable: true,
        get() {
          return unlockFn();
        }
      });
      window.fuck = unlockFn;
    } catch {}

    // Purge any lingering unlock flags to guarantee cover-up precedence on fresh visit/reload
    try {
      localStorage.removeItem('starlet_session_unlocked_v2');
      sessionStorage.removeItem('starlet_session_unlocked');
    } catch {}

    // Expose global helper for tour
    window.startAvatarTour = () => setShowHaremWelcome(true);

    // 3. Cryptic Domain Console Gateway for The Ciphered Underworld
    const handleDomainEnter = (cipher) => {
      const targetDomain = resolveCipher(cipher);
      if (targetDomain) {
        try { localStorage.setItem('starlet_walkthrough_completed_v1', 'true'); } catch {}
        setShowHaremWelcome(false);
        setIsUnlocked(true);
        setShowWallpaperLounge(false);
        setShowCalmSanctuary(false);
        setShowRetroBoot(false);
        setCipheredDomain(targetDomain);
        const name = typeof targetDomain === 'object'
          ? `${targetDomain.domain} · ${targetDomain.label || targetDomain.subdomain}`
          : targetDomain;
        return `🌌 [Underworld Portal Engaged]: Tapping into ${name}. Welcome.`;
      }
      return `❌ Invalid domain cipher: '${cipher}'. Valid ciphers: harem, underworld, tier1, tier2, holidays, bets, family, escalation, church, hardcore, swap, cuck, orgy, gangbang, anal, facial, study`;
    };

    window.enter = handleDomainEnter;
    window.__openCipheredDomain = (domainKey) => setCipheredDomain(domainKey);

    // Define single-word console shortcuts on window (dual getter + callable function)
    const domainCiphers = [
      'harem', 'underworld', 'tier1', 'tier2', 'holidays', 'bets', 'family', 'escalation', 'church', 'hardcore',
      'swap', 'swaps', 'cuck', 'cuckold', 'hotwife', 'orgy', 'orgies', 'gangbang', 'train', 'anal', 'facial', 'facials', 'study', 'tutor',
      'chores', 'points', 'point', 'freeuse', 'permission', 'daughter', 'persuasion',
      'abyss', 'nasty', 'deep', 'depraved'
    ];
    domainCiphers.forEach(cipherWord => {
      try {
        const cipherFn = () => handleDomainEnter(cipherWord);
        cipherFn.toString = () => handleDomainEnter(cipherWord);
        cipherFn.valueOf = () => handleDomainEnter(cipherWord);

        Object.defineProperty(window, cipherWord, {
          configurable: true,
          get() {
            return cipherFn();
          }
        });
        window[cipherWord] = cipherFn;
      } catch {}
    });
  }, [isUnlocked]);

  // Mobile Midline Scroll-Spy: Auto-expands whichever card crosses the vertical center
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (window.innerWidth > 1024) return;
        const midY = window.innerHeight / 2;
        const cards = document.querySelectorAll('[data-performer-card-id]');
        let closestId = null;
        let closestDist = Infinity;

        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          const cardCenterY = rect.top + rect.height / 2;
          const dist = Math.abs(cardCenterY - midY);
          if (rect.top <= midY + 140 && rect.bottom >= midY - 140 && dist < closestDist) {
            closestDist = dist;
            closestId = card.getAttribute('data-performer-card-id');
          }
        });

        if (closestId && closestId !== midlineActiveId) {
          setMidlineActiveId(closestId);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [midlineActiveId]);

  // Compare modal state
  const [compareA, setCompareA] = useState(null);
  const [compareB, setCompareB] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_THEME) || 'obsidian';
    } catch {
      return 'obsidian';
    }
  });

  // Watchlist state
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WATCHLIST);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User persistence (Favorites & Seen)
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAV);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [seen, setSeen] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEEN);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const searchInputRef = useRef(null);
  const fileImportRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
  }, [theme]);

  // Save watchlist, favorites & seen
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WATCHLIST, JSON.stringify(watchlist));
    } catch {}
  }, [watchlist]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify([...favorites]));
    } catch {}
  }, [favorites]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEEN, JSON.stringify([...seen]));
    } catch {}
  }, [seen]);

  // Load performers data & precomputed similarity matrix
  useEffect(() => {
    async function loadData() {
      try {
        const [resPerf, resSim, resUnderworld] = await Promise.all([
          fetch('./performers-tagged.json'),
          fetch('./similarity-matrix.json').catch(() => null),
          fetch('./underworld-scenes-cache.json').catch(() => null)
        ]);

        if (!resPerf.ok) throw new Error(`HTTP error! status: ${resPerf.status}`);
        const data = await resPerf.json();
        setPerformers(data);

        if (resSim && resSim.ok) {
          const simData = await resSim.json().catch(() => null);
          if (simData) setSimilarityMatrix(simData);
        }

        if (resUnderworld && resUnderworld.ok) {
          const uwData = await resUnderworld.json().catch(() => null);
          if (uwData && Object.keys(uwData).length > 0) {
            setUnderworldCache(uwData);
          }
        }

        if (data.length > 0) {
          const famList = data.filter(isFamily);
          const pick = famList[Math.floor(Math.random() * Math.min(famList.length, 25))];
          setSpotlightPerformer(pick || data[0]);
        }
      } catch (err) {
        console.error('Failed to load performers data:', err);
        setError('Could not load catalog data. Ensure the local server is running.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current && !selectedPerformer && !isComparing && !cinemaScene) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (cinemaScene) {
          setCinemaScene(null);
        } else if (isComparing) {
          setIsComparing(false);
        } else if (selectedPerformer) {
          setSelectedPerformer(null);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
      if (['1', '2', '3', '4', '5', '6', '7', '8'].includes(e.key) && document.activeElement?.tagName !== 'INPUT' && !selectedPerformer && !isComparing && !cinemaScene) {
        const tabMap = { '1': 'family', '2': 'newcomers', '3': 'scenes', '4': 'watchlist', '5': 'favorites', '6': 'all', '7': 'analytics', '8': 'about' };
        setActiveTab(tabMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPerformer, isComparing, cinemaScene, searchQuery]);

  // Quick lookup for queued scene URLs
  const watchlistUrls = useMemo(() => {
    return new Set(watchlist.map(s => s.url).filter(Boolean));
  }, [watchlist]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      family: performers.filter(isFamily).length,
      newcomers: performers.filter(isNewcomer).length,
      scenes: performers.reduce((acc, p) => acc + realScenes(p).length, 0),
      favorites: favorites.size,
      all: performers.length
    };
  }, [performers, favorites]);

  // Tab pool selection
  const currentPool = useMemo(() => {
    switch (activeTab) {
      case 'family':
        return performers.filter(isFamily);
      case 'newcomers':
        return performers.filter(isNewcomer);
      case 'favorites':
        return performers.filter(p => favorites.has(p.id));
      case 'all':
      default:
        return performers;
    }
  }, [performers, activeTab, favorites]);

  // Intelligent Search and Query Parsing with Compound Scenario Tokens & Exact Phrases
  const passesSearch = (p, query) => {
    if (!query) return true;
    let q = query.toLowerCase().trim();

    // 1. Quoted exact phrase matching
    const quotedMatches = [...q.matchAll(/"([^"]+)"/g)].map(m => m[1].toLowerCase().trim());
    if (quotedMatches.length > 0) {
      q = q.replace(/"[^"]+"/g, ' ').trim();
    }

    // 2. Numerical Age filters
    const underMatch = q.match(/\b(under|<)\s*(\d{2})\b/);
    if (underMatch) {
      const maxAge = parseInt(underMatch[2], 10);
      if (!p.age || p.age > maxAge) return false;
      q = q.replace(underMatch[0], ' ').trim();
    }

    const overMatch = q.match(/\b(over|>)\s*(\d{2})\b/);
    if (overMatch) {
      const minAge = parseInt(overMatch[2], 10);
      if (!p.age || p.age < minAge) return false;
      q = q.replace(overMatch[0], ' ').trim();
    }

    // 3. Newcomer & Family quick tokens
    if (/\bnewcomers?\b/.test(q)) {
      if (!isNewcomer(p)) return false;
      q = q.replace(/\bnewcomers?\b/, ' ').trim();
    }

    if (/\bfamily\b/.test(q)) {
      if (!isFamily(p)) return false;
      q = q.replace(/\bfamily\b/, ' ').trim();
    }

    // 4. Physical attribute tokens
    const hairTokens = ['blonde', 'brunette', 'redhead', 'black-hair'];
    for (const h of hairTokens) {
      const cleanH = h.replace('-hair', '');
      if (new RegExp(`\\b${cleanH}\\b`).test(q)) {
        if (!p.hair || !p.hair.toLowerCase().includes(cleanH)) return false;
        q = q.replace(new RegExp(`\\b${cleanH}\\b`), ' ').trim();
      }
    }

    // 5. Build rich haystack
    const haystack = [
      p.name,
      ...(p.aliases || []),
      p.notes,
      p.expanded,
      p.hair,
      p.body,
      p.ethnicity,
      p.nationality,
      ...(p.tags || []),
      ...(p.genres || []),
      ...(p.awards || []),
      ...(p.badges || []),
      ...(p.scenes || []).flatMap(s => [s.title, s.fullTitle || s.title, s.studio, ...(s.genres || [])])
    ].join(' ').toLowerCase();

    // 6. Check quoted exact phrases first
    for (const phrase of quotedMatches) {
      if (!haystack.includes(phrase)) return false;
    }

    // 7. Compound scenario token detection (e.g. "mom swap", "step daughter birthday")
    const compoundPatterns = [
      { name: 'mom-swap', regex: /\bmom\s*swap\b|\bmomswap\b/i },
      { name: 'stepdaughter-birthday', regex: /\bstep\s*daughter\s*birthday\b|\bstepdaughter\s*birthday\b/i },
      { name: 'sister-swap', regex: /\bsister\s*swap\b|\bsisterswap\b/i },
      { name: 'family-swap', regex: /\bfamily\s*swap\b/i },
      { name: 'shared-bed', regex: /\bshared\s*bed\b|\bbed\s*share\b/i },
      { name: 'study-help', regex: /\bstudy\s*help\b|\bhomework\b/i }
    ];

    for (const cp of compoundPatterns) {
      if (cp.regex.test(q)) {
        // Must match either in scenes, genres, or notes
        const matchesCompound = cp.regex.test(haystack) || (p.genres || []).includes(cp.name);
        if (!matchesCompound) return false;
        q = q.replace(cp.regex, ' ').trim();
      }
    }

    // 8. Remaining individual keyword tokens
    const tokens = q.split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;

    return tokens.every(tok => haystack.includes(tok));
  };

  // Check if performer passes facets
  const passesFacetsExcept = (p, skipFacetId = null) => {
    for (const [facetId, selectedVals] of Object.entries(activeFilters)) {
      if (facetId === skipFacetId || !selectedVals || !selectedVals.size) continue;

      let performerVals = [];
      if (facetId === 'ageBracket') {
        const b = getAgeBracket(p.age);
        if (b) performerVals = [b];
      } else if (facetId === 'genre') {
        performerVals = (p.genres || []).filter(g => FAMILY_GENRES.has(g));
      } else if (facetId === 'hair') {
        if (p.hair) performerVals = [p.hair.toLowerCase()];
      } else if (facetId === 'body') {
        if (p.body) performerVals = [p.body.toLowerCase()];
      } else if (facetId === 'ethnicity') {
        if (p.ethnicity) performerVals = [p.ethnicity.toLowerCase()];
      } else if (facetId === 'nationality') {
        if (p.nationality) performerVals = [p.nationality.toLowerCase()];
      } else if (facetId === 'tier') {
        const tiers = Array.isArray(p.tier) ? p.tier : (p.tier ? [p.tier] : []);
        performerVals = tiers.map(t => String(t).toLowerCase());
      }

      if (!performerVals.some(val => selectedVals.has(val.toLowerCase()))) {
        return false;
      }
    }
    return passesSearch(p, searchQuery);
  };

  // Helper to compute overall stardom/rating composite score
  const getPerformerRatingScore = (p) => {
    const scenes = realScenes(p);
    const ratingSum = scenes.reduce((acc, s) => {
      const num = parseInt(s.rating || '80', 10);
      return acc + (isNaN(num) ? 80 : num);
    }, 0);
    const avgSceneRating = scenes.length > 0 ? ratingSum / scenes.length : 78;
    const awardBonus = (p.awards || []).length * 4;
    const tierBonus = (p.tier || []).includes('legend') ? 10 : (p.tier || []).includes('star') ? 5 : 0;
    return Math.min(99, Math.round(avgSceneRating * 0.7 + Math.min(24, scenes.length) * 0.8 + awardBonus + tierBonus));
  };

  // Filtered & Sorted performers (Default: Highest Rated First)
  const filteredPerformers = useMemo(() => {
    return currentPool
      .filter(p => passesFacetsExcept(p, null))
      .sort((a, b) => {
        switch (sortOption) {
          case 'rating':
            return getPerformerRatingScore(b) - getPerformerRatingScore(a);
          case 'smart':
            return calculateExplorationScore(b) - calculateExplorationScore(a);
          case 'scenes':
            return realScenes(b).length - realScenes(a).length;
          case 'newest':
            return (b.active?.from || 0) - (a.active?.from || 0);
          case 'oldest':
            return (a.active?.from || 9999) - (b.active?.from || 9999);
          case 'age':
            return (a.age || 999) - (b.age || 999);
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return getPerformerRatingScore(b) - getPerformerRatingScore(a);
        }
      });
  }, [currentPool, activeFilters, searchQuery, sortOption, refreshTrigger]);

  // Progressive Infinite Batching: Cuts DOM elements from 50,000+ down to ~1,200 (Instant 60/120fps UI!)
  const [visibleCount, setVisibleCount] = useState(36);
  const infiniteSentinelRef = useRef(null);

  // Reset batch count when filter, search, sort, or active tab changes
  useEffect(() => {
    setVisibleCount(36);
  }, [searchQuery, activeFilters, activeTab, sortOption]);

  const visiblePerformers = useMemo(() => {
    return filteredPerformers.slice(0, visibleCount);
  }, [filteredPerformers, visibleCount]);

  // Auto-load next batch as user scrolls near bottom
  useEffect(() => {
    const sentinel = infiniteSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => Math.min(filteredPerformers.length, prev + 36));
      }
    }, { rootMargin: '450px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredPerformers.length, visibleCount]);

  // Dynamic Facet Counts calculation
  const facetCounts = useMemo(() => {
    const counts = { ageBracket: {}, genre: {}, hair: {}, body: {}, ethnicity: {}, nationality: {}, tier: {} };

    for (const p of currentPool) {
      if (passesFacetsExcept(p, 'ageBracket') && p.age) {
        const b = getAgeBracket(p.age);
        if (b) {
          counts.ageBracket[b] = (counts.ageBracket[b] || 0) + 1;
        }
      }
      if (passesFacetsExcept(p, 'genre')) {
        for (const g of (p.genres || []).filter(g => FAMILY_GENRES.has(g))) {
          counts.genre[g] = (counts.genre[g] || 0) + 1;
        }
      }
      if (passesFacetsExcept(p, 'hair') && p.hair) {
        const h = p.hair.toLowerCase();
        counts.hair[h] = (counts.hair[h] || 0) + 1;
      }
      if (passesFacetsExcept(p, 'body') && p.body) {
        const b = p.body.toLowerCase();
        counts.body[b] = (counts.body[b] || 0) + 1;
      }
      if (passesFacetsExcept(p, 'ethnicity') && p.ethnicity) {
        const eth = p.ethnicity.toLowerCase();
        counts.ethnicity[eth] = (counts.ethnicity[eth] || 0) + 1;
      }
      if (passesFacetsExcept(p, 'nationality') && p.nationality) {
        const nat = p.nationality.toLowerCase();
        counts.nationality[nat] = (counts.nationality[nat] || 0) + 1;
      }
      if (passesFacetsExcept(p, 'tier') && p.tier) {
        const tiers = Array.isArray(p.tier) ? p.tier : [p.tier];
        for (const t of tiers) {
          const key = String(t).toLowerCase();
          counts.tier[key] = (counts.tier[key] || 0) + 1;
        }
      }
    }

    const formatCounts = (obj) =>
      Object.entries(obj)
        .map(([val, count]) => ({ val, count }))
        .sort((a, b) => b.count - a.count);

    const ageOrder = ['18-22', '23-26', '27-30', '31-35', '36+'];
    const formatAgeCounts = (obj) =>
      ageOrder
        .filter(key => obj[key])
        .map(val => ({ val, count: obj[val] }));

    return {
      ageBracket: formatAgeCounts(counts.ageBracket),
      genre: formatCounts(counts.genre),
      hair: formatCounts(counts.hair),
      body: formatCounts(counts.body),
      ethnicity: formatCounts(counts.ethnicity),
      nationality: formatCounts(counts.nationality),
      tier: formatCounts(counts.tier)
    };
  }, [currentPool, activeFilters, searchQuery]);

  // Actions
  const handleToggleFilter = (facetId, val) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      const set = new Set(next[facetId] || []);
      if (set.has(val)) set.delete(val);
      else set.add(val);
      if (set.size === 0) delete next[facetId];
      else next[facetId] = set;
      return next;
    });
  };

  const handleResetFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
    setSortOption('name');
  };

  const handleToggleFav = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#f59e0b', '#d4a853', '#fef3c7']
          });
        } catch {}
      }
      return next;
    });
  };

  const handleToggleSeen = (id) => {
    setSeen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRandomSpotlight = () => {
    if (!performers.length) return;
    const randomIndex = Math.floor(Math.random() * performers.length);
    handleOpenDossier(performers[randomIndex]);
  };

  const handleOpenDossier = (p) => {
    if (!p) return;
    recordProfileClick(p.id);
    telemetry.recordClick();
    setSelectedPerformer(p);
  };

  const handleCycleModal = (direction) => {
    if (!selectedPerformer || !filteredPerformers.length) return;
    const currentIndex = filteredPerformers.findIndex(p => p.id === selectedPerformer.id);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex + direction + filteredPerformers.length) % filteredPerformers.length;
    setSelectedPerformer(filteredPerformers[newIndex]);
  };

  // Watchlist Queue Actions
  const handleToggleWatchlist = (scene) => {
    if (!scene || !scene.url) return;
    setWatchlist(prev => {
      const exists = prev.some(s => s.url === scene.url);
      if (exists) {
        return prev.filter(s => s.url !== scene.url);
      } else {
        return [...prev, scene];
      }
    });
  };

  const handleClearWatchlist = () => {
    if (window.confirm('Clear all queued scenes from your watchlist?')) {
      setWatchlist([]);
    }
  };

  // Launch Cinema Modal
  const handlePlayScene = (scene, performer = null) => {
    setCinemaScene({ scene, performer });
  };

  // Stash / Permanently Save a Discovered Scene into Catalog & State
  const handleStashScene = async (scene, performer = null) => {
    if (!scene || !scene.title) return;

    let targetId = performer?.id || scene.performerId;
    let targetName = performer?.name || scene.performer;

    // Auto-detect starlet by name in scene title if not specified
    if (!targetId && !targetName && performers && performers.length) {
      const match = performers.find(p => p.name && scene.title && new RegExp(`\\b${p.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i').test(scene.title));
      if (match) {
        targetId = match.id;
        targetName = match.name;
      }
    }

    const cleanScene = {
      title: scene.title.trim(),
      studio: scene.studio || 'Featured Studio',
      url: scene.url || scene.embedUrl || '',
      thumbnail: scene.thumbnail || (targetId ? `./avatars/${targetId}.jpg` : null),
      duration: scene.duration || '26:15',
      rating: scene.rating || '96%',
      genres: scene.genres || ['family'],
      isReal: true
    };

    // 1. Update React state for performers
    if (targetId) {
      setPerformers(prev => prev.map(p => {
        if (p.id === targetId) {
          const currentScenes = p.scenes || [];
          const exists = currentScenes.some(s => (s.url && cleanScene.url && s.url === cleanScene.url) || s.title?.toLowerCase() === cleanScene.title.toLowerCase());
          if (exists) return p;
          return {
            ...p,
            scenes: [cleanScene, ...currentScenes]
          };
        }
        return p;
      }));

      // Update selectedPerformer if open
      setSelectedPerformer(prev => {
        if (prev && prev.id === targetId) {
          const currentScenes = prev.scenes || [];
          const exists = currentScenes.some(s => (s.url && cleanScene.url && s.url === cleanScene.url) || s.title?.toLowerCase() === cleanScene.title.toLowerCase());
          if (exists) return prev;
          return {
            ...prev,
            scenes: [cleanScene, ...currentScenes]
          };
        }
        return prev;
      });
    }

    // 2. Persist to server backend API
    try {
      await fetch('/api/stash-scene', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performerId: targetId,
          performerName: targetName,
          scene: cleanScene
        })
      });
    } catch (err) {
      console.warn('Could not stash scene to backend:', err.message);
    }
  };

  // Start Head-to-Head Comparison
  const handleStartCompare = (starletA) => {
    setCompareA(starletA);
    const candidates = performers.filter(p => p.id !== starletA.id);
    const starletB = candidates.find(p => isFamily(p)) || candidates[0];
    setCompareB(starletB);
    setIsComparing(true);
    setSelectedPerformer(null);
  };

  // Export JSON
  const handleExportData = () => {
    const payload = {
      favorites: [...favorites],
      seen: [...seen],
      watchlist,
      version: 6,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starlet-userdata-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export CSV Catalog
  const handleExportCsv = () => {
    const headers = [
      'ID', 'Name', 'Age', 'Career Debut', 'Nationality', 'Ethnicity', 'Hair', 'Body',
      'Award Tier', 'Family Genres', 'Verified Scene Count', 'Top Scene Title', 'Top Scene URL'
    ];
    const rows = performers.map(p => {
      const sc = realScenes(p);
      const topScene = sc[0] || {};
      return [
        `"${p.id}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        p.age || '',
        p.active?.from || '',
        `"${p.nationality || ''}"`,
        `"${p.ethnicity || ''}"`,
        `"${p.hair || ''}"`,
        `"${p.body || ''}"`,
        `"${(p.tier || []).join('; ')}"`,
        `"${(p.genres || []).filter(g => FAMILY_GENRES.has(g)).join('; ')}"`,
        sc.length,
        `"${(topScene.title || '').replace(/"/g, '""')}"`,
        `"${topScene.url || ''}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `starlets-catalog-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target.result);
        if (Array.isArray(json.favorites)) setFavorites(new Set(json.favorites));
        if (Array.isArray(json.seen)) setSeen(new Set(json.seen));
        if (Array.isArray(json.watchlist)) setWatchlist(json.watchlist);
        alert(`Backup imported successfully! (${json.favorites?.length || 0} favorites, ${json.seen?.length || 0} seen, ${json.watchlist?.length || 0} queued scenes)`);
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  // If not unlocked yet, ALWAYS show the Live Wallpaper Lounge Cover-Up upfront
  // (Data is fetched silently in the background with zero visible loading text or leak)
  if (!isUnlocked) {
    return (
      <LiveWallpaperLounge
        onShatterTrigger={triggerUnlockHarem}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09070a] text-[var(--accent)] font-serif text-xl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
          <p className="text-sm font-mono tracking-widest uppercase opacity-70">Synchronizing Vault Assets…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09070a] p-4 text-center">
        <div className="glass-raised p-8 rounded-3xl max-w-lg border border-red-500/40">
          <h2 className="text-xl font-bold text-red-400 mb-2">Notice: Local Server Required</h2>
          <p className="text-xs text-[var(--muted)] mb-4">{error}</p>
          <code className="text-[11px] bg-black/60 px-3 py-1.5 rounded block text-zinc-300">
            npm run dev or python -m http.server 8000
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-[#09070a] relative overflow-x-hidden ${isStealthBlur ? 'stealth-blur-active' : ''}`}>
      {/* Lively Wallpaper Ambient Canvas Backdrop */}
      <AmbientBackdrop enabled={true} />

      {/* Hidden File Input for Data Import */}
      <input
        ref={fileImportRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Header - Hidden in FaceMash mode or while in Underworld for zero-lag isolation */}
      {activeTab !== 'facemash' && !cipheredDomain && (
        <Header
          total={tabCounts.all}
          familyCount={tabCounts.family}
          newcomerCount={tabCounts.newcomers}
          favCount={tabCounts.favorites}
          seenCount={seen.size}
          scenesCount={tabCounts.scenes}
          watchlistCount={watchlist.length}
          currentTheme={theme}
          onThemeChange={setTheme}
          onOpenWatchlist={() => setActiveTab('watchlist')}
          onExport={handleExportData}
          onExportCsv={handleExportCsv}
          onImportClick={() => fileImportRef.current?.click()}
          onOpenCalmSanctuary={() => setShowCalmSanctuary(true)}
          onOpenWallpaperLounge={handleResetToIcebergTip}
          onOpenMobileConnect={() => setShowMobileConnect(true)}
          onOpenWalkthrough={() => setShowHaremWelcome(true)}
          isStealthBlur={isStealthBlur}
          onToggleStealthBlur={toggleStealthBlur}
        />
      )}

      {/* Main Directory Area (Hidden while in Ciphered Underworld to ensure maximum 60fps performance) */}
      {!cipheredDomain && (
        <>
          {/* Tab Navigation Bar - Hidden in FaceMash mode */}
          {activeTab !== 'facemash' && (
            <TabBar
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              counts={tabCounts}
              watchlistCount={watchlist.length}
            />
          )}

      {/* Controls Bar */}
      {activeTab !== 'scenes' && activeTab !== 'analytics' && activeTab !== 'watchlist' && activeTab !== 'about' && activeTab !== 'facemash' && activeTab !== 'reddit_hype' && activeTab !== 'admissions' && activeTab !== 'reddit_shorts' && (
        <ControlsBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortOption={sortOption}
          onSortChange={setSortOption}
          onResetFilters={handleResetFilters}
          hasActiveFilters={Object.keys(activeFilters).length > 0 || !!searchQuery}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchInputRef={searchInputRef}
          performers={performers}
          onSelectPerformer={handleOpenDossier}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(s => !s)}
          activeFilterCount={Object.values(activeFilters).flat().length}
        />
      )}

      {/* Active Filter Chips */}
      {activeTab !== 'scenes' && activeTab !== 'analytics' && activeTab !== 'watchlist' && activeTab !== 'about' && activeTab !== 'facemash' && activeTab !== 'reddit_hype' && activeTab !== 'admissions' && activeTab !== 'reddit_shorts' && (
        <ActiveBar
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          activeFilters={activeFilters}
          onRemoveFilter={(facet, val) => handleToggleFilter(facet, val)}
          onClearAll={handleResetFilters}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 sm:p-6 relative z-10">
        {activeTab === 'reddit_shorts' ? (
          <RedditShortsView
            performers={performers}
            onOpenDossier={handleOpenDossier}
          />
        ) : activeTab === 'about' ? (
          <AboutView
            performers={performers}
            onOpenDossier={handleOpenDossier}
            onOpenWalkthrough={() => setShowHaremWelcome(true)}
          />
        ) : activeTab === 'analytics' ? (
          <AnalyticsView
            performers={performers}
            favorites={favorites}
            seen={seen}
            onOpenDossier={handleOpenDossier}
          />
        ) : activeTab === 'reddit_hype' ? (
          <RedditHypeView
            performers={performers}
            onOpenDossier={handleOpenDossier}
          />
        ) : activeTab === 'admissions' ? (
          <AdmitQueueView
            allPerformers={performers}
            onAdmitSuccess={(newPerf) => {
              setPerformers(prev => [newPerf, ...prev]);
            }}
            onOpenDossier={handleOpenDossier}
          />
        ) : activeTab === 'watchlist' ? (
          <WatchlistView
            watchlist={watchlist}
            onRemoveFromWatchlist={handleToggleWatchlist}
            onClearWatchlist={handleClearWatchlist}
            onPlayScene={(s) => handlePlayScene(s)}
            onOpenDossier={handleOpenDossier}
          />
        ) : activeTab === 'facemash' ? (
          <FaceMashArena
            performers={performers}
            onOpenDossier={handleOpenDossier}
            onBack={() => setActiveTab('family')}
          />
        ) : activeTab === 'scenes' ? (
          <SceneShelfView
            performers={performers}
            onOpenDossier={handleOpenDossier}
            onPlayScene={(s) => handlePlayScene(s)}
            onToggleWatchlist={handleToggleWatchlist}
            onStashScene={handleStashScene}
            watchlistUrls={watchlistUrls}
          />
        ) : (
          <div>
            {/* Featured Starlet of the Day - ONLY in All Starlets Tab */}
            {activeTab === 'all' && !searchQuery && Object.keys(activeFilters).length === 0 && (
              <FeaturedOfTheDay
                performers={performers}
                onOpenDossier={handleOpenDossier}
              />
            )}

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Sidebar Facet Filters - Collapsible Drawer via 'showFilters' for vast breathing room */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, width: 0, x: -20 }}
                    animate={{ opacity: 1, width: 'auto', x: 0 }}
                    exit={{ opacity: 0, width: 0, x: -20 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden flex-shrink-0 w-full lg:w-72"
                  >
                    <Sidebar
                      facetCounts={facetCounts}
                      activeFilters={activeFilters}
                      onToggleFilter={handleToggleFilter}
                      onClose={() => setShowFilters(false)}
                      onCloseMobile={() => setShowFilters(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid / List of Performers */}
              <div className="flex-1 w-full min-w-0">
                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-4">
                  <div className="flex items-center gap-3">
                    {!showFilters && (
                      <button
                        onClick={() => setShowFilters(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#161018] border border-[var(--line)] text-xs font-semibold text-[var(--muted)] hover:text-white hover:border-[var(--accent)] transition-all shadow-sm"
                        title="Show Smart Filters sidebar"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent)]" />
                        <span>Show Filters</span>
                      </button>
                    )}
                    <span>
                      Showing <strong>{Math.min(visibleCount, filteredPerformers.length)}</strong> of {filteredPerformers.length} matching ({currentPool.length} in catalog)
                    </span>
                  </div>
                </div>

                {filteredPerformers.length > 0 ? (
                  <>
                    <div
                      className={`grid gap-5 ${
                        viewMode === 'grid'
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                          : 'grid-cols-1'
                      }`}
                    >
                      <AnimatePresence>
                        {visiblePerformers.map(p => (
                          isPerformerCoolingOff(p.id) ? (
                            <CoolingOffCard
                              key={p.id}
                              performer={p}
                              onRestore={() => setRefreshTrigger(t => t + 1)}
                            />
                          ) : (
                            <PerformerCard
                              key={p.id}
                              performer={p}
                              isFav={favorites.has(p.id)}
                              isSeen={seen.has(p.id)}
                              onToggleFav={handleToggleFav}
                              onToggleSeen={handleToggleSeen}
                              onOpenDossier={handleOpenDossier}
                              onSelectGenre={(g) => handleToggleFilter('genre', g)}
                              onStartCompare={handleStartCompare}
                              onPlayScene={(s) => handlePlayScene(s, p)}
                            />
                          )
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Infinite Scroll Sentinel & Batch Extension Controls */}
                    <div ref={infiniteSentinelRef} className="w-full py-4 flex flex-col items-center justify-center">
                      {visibleCount < filteredPerformers.length ? (
                        <div className="flex flex-col items-center justify-center py-6 gap-2.5">
                          <button
                            type="button"
                            onClick={() => setVisibleCount(c => Math.min(filteredPerformers.length, c + 36))}
                            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <span>⚡ Load Next 36 Starlets</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-black/20">
                              {visiblePerformers.length} / {filteredPerformers.length}
                            </span>
                          </button>
                          <span className="text-[11px] font-mono text-zinc-500">
                            Auto-streaming next batch on scroll · Zero UI lag
                          </span>
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs font-mono text-zinc-500">
                          ✦ Reached the end of {filteredPerformers.length} verified starlets ✦
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="glass rounded-3xl p-12 text-center border border-[var(--line)]">
                    <p className="text-base text-[var(--muted)] font-medium mb-2">
                      No performers match the active filters or search query.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="text-xs px-4 py-2 rounded-full bg-[var(--accent)] text-black font-bold hover:bg-[var(--accent-light)] transition-all"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      </>
      )}

      {/* Performer Dossier Modal (Layer 2 root directory only) */}
      <AnimatePresence>
        {!cipheredDomain && selectedPerformer && (
          <PerformerModal
            performer={selectedPerformer}
            allPerformers={performers}
            similarityMatrix={similarityMatrix}
            onClose={() => setSelectedPerformer(null)}
            onTriggerTriFoldLockout={(data) => {
              if (data && data.performer) {
                quarantinePerformer(data.performer.id, {
                  hours: 36,
                  reason: 'Tri-Fold Compulsion Lockout Intercept'
                });
                setRefreshTrigger(t => t + 1);
              }
              setTriFoldLockoutData(data);
            }}
            isFav={favorites.has(selectedPerformer.id)}
            isSeen={seen.has(selectedPerformer.id)}
            onToggleFav={handleToggleFav}
            onToggleSeen={handleToggleSeen}
            onPrev={() => handleCycleModal(-1)}
            onNext={() => handleCycleModal(1)}
            onSelectPerformer={handleOpenDossier}
            onStartCompare={handleStartCompare}
            onPlayScene={(s) => handlePlayScene(s, selectedPerformer)}
            onToggleWatchlist={handleToggleWatchlist}
            onStashScene={handleStashScene}
            watchlistUrls={watchlistUrls}
          />
        )}
      </AnimatePresence>

      {/* Tri-Fold Melody Compulsion Lockout Intercept Modal */}
      <AnimatePresence>
        {triFoldLockoutData && (
          <CompulsionLockoutModal
            data={triFoldLockoutData}
            onClose={() => setTriFoldLockoutData(null)}
          />
        )}
      </AnimatePresence>

      {/* Head-to-Head Comparison Modal */}
      <AnimatePresence>
        {isComparing && compareA && compareB && (
          <CompareModal
            performerA={compareA}
            performerB={compareB}
            allPerformers={performers}
            onClose={() => setIsComparing(false)}
            onSelectA={setCompareA}
            onSelectB={setCompareB}
            onOpenDossier={(p) => {
              setIsComparing(false);
              setSelectedPerformer(p);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cinema / Video Preview Modal */}
      <AnimatePresence>
        {cinemaScene && (
          <CinemaModal
            scene={cinemaScene.scene}
            performer={cinemaScene.performer}
            onClose={() => setCinemaScene(null)}
            isInWatchlist={cinemaScene.scene.url && watchlistUrls.has(cinemaScene.scene.url)}
            onToggleWatchlist={handleToggleWatchlist}
            onStashScene={handleStashScene}
            onOpenDossier={(p) => {
              setCinemaScene(null);
              setSelectedPerformer(p);
            }}
          />
        )}
      </AnimatePresence>

      {/* Cinematic 4-Act Awakening Cutscene */}
      <CinematicAwakening
        isOpen={showAwakeningCutscene}
        performers={performers}
        onComplete={() => setShowAwakeningCutscene(false)}
        onStartTour={(host) => {
          setShowAwakeningCutscene(false);
          setTourHostStarlet(host);
          setShowHaremWelcome(true);
        }}
      />

      {/* "Hi Kaka... Welcome to the Harem" Starlet Greeting & Guided Tour */}
      <HaremWelcomeTour
        isOpen={showHaremWelcome}
        onClose={() => {
          setShowHaremWelcome(false);
          try {
            localStorage.setItem('starlet_walkthrough_completed_v1', 'true');
          } catch {}
        }}
        starlet={tourHostStarlet || spotlightPerformer || performers[0]}
      />

      {/* Analog CRT Line-by-Line Scanline Reveal (Strictly Mobile & Tablets only) */}
      {showRetroBoot && (
        <RetroBootScreen
          onComplete={() => setShowRetroBoot(false)}
        />
      )}

      {/* 4K Live Wallpaper Ambient Lounge Overlay Modal */}
      {showWallpaperLounge && (
        <LiveWallpaperLounge
          onClose={() => setShowWallpaperLounge(false)}
          onStealthUnlock={triggerUnlockHarem}
          isUnlocked={isUnlocked}
        />
      )}

      {/* Calm Focus Sanctuary & Pomodoro Lo-Fi Disguise (Image 2 & 3) */}
      <CalmSanctuary
        isOpen={showCalmSanctuary}
        onClose={() => setShowCalmSanctuary(false)}
        onGestureUnlock={(targetDomain) => {
          // Keep CalmSanctuary active as the hidden first stage disguise layer underneath
          setCipheredDomain(targetDomain);
        }}
        onResetToIcebergTip={handleResetToIcebergTip}
      />

      {/* Ciphered Underworld Sanctuary Modal Stage (Zero Public Footprint) */}
      <AnimatePresence>
        {cipheredDomain && (
          <CipheredUnderworldView
            initialDomain={cipheredDomain}
            performers={performers}
            underworldCache={underworldCache}
            onClose={() => setCipheredDomain(null)}
            onPlayScene={handlePlayScene}
            isStealthBlur={isStealthBlur}
            onToggleStealthBlur={toggleStealthBlur}
          />
        )}
      </AnimatePresence>

      {/* Mobile Phone Wi-Fi Connect Modal */}
      <MobileConnectModal
        isOpen={showMobileConnect}
        onClose={() => setShowMobileConnect(false)}
      />
    </div>
  );
}
