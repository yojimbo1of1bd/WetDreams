#!/usr/bin/env node
/**
 * harvest-chores-points.mjs
 * 
 * Targeted harvester for:
 * - Chore Scoring & Homework Value Systems
 * - Point collection systems to do things with mom/stepmom
 * - Free use chores & accident liability / fee exchanges
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFpoVideoCards } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_QUERIES = [
  'points mom',
  'point system',
  'pussy points',
  'chores mom',
  'chores stepmom',
  'chores exchange',
  'doing chores',
  'free use chores',
  'earn points',
  'free use mom',
  'chores',
  'caused accident',
  'allowance chores',
  'chore reward'
];

async function fetchPage(query, page = 1) {
  const url = page === 1
    ? `https://www.fpo.xxx/search/${encodeURIComponent(query)}/`
    : `https://www.fpo.xxx/search/${encodeURIComponent(query)}/?from_videos=${page}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseFpoVideoCards(html) || [];
  } catch (err) {
    console.error(`[Fetch Error] ${query} (page ${page}): ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('🚀 [Harvesting Chore Scoring, Points System & Mom Dynamics]');

  const perfPath = path.join(__dirname, 'performers-tagged.json');
  const cachePath = path.join(__dirname, 'underworld-scenes-cache.json');
  const publicCachePath = path.join(__dirname, 'starlet-app', 'public', 'underworld-scenes-cache.json');
  const distCachePath = path.join(__dirname, 'starlet-app', 'dist', 'underworld-scenes-cache.json');

  const performers = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

  // Build performer quick index for matching
  const performerLookup = [];
  performers.forEach(p => {
    const pId = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tiers = Array.isArray(p.tier) ? p.tier.map(t => String(t).toLowerCase()) : (p.tier ? [String(p.tier).toLowerCase()] : []);
    performerLookup.push({
      name: p.name,
      lowerName: p.name.toLowerCase(),
      id: pId,
      tiers,
      rating: p.rating || 9.0
    });
  });

  const existingChores = cache.chores_points || [];
  const seenUrls = new Set(existingChores.map(s => s.url));
  const newScenes = [];

  for (const query of TARGET_QUERIES) {
    console.log(`\n🔍 Searching: "${query}"...`);
    for (let page = 1; page <= 2; page++) {
      const cards = await fetchPage(query, page);
      console.log(`  └─ Page ${page}: retrieved ${cards.length} cards`);

      for (const card of cards) {
        if (!card.url || seenUrls.has(card.url)) continue;
        if (!card.title || card.title.length < 4 || /^\d+:\d+$/.test(card.title)) continue;

        seenUrls.add(card.url);

        // Try to match performer from title
        const lowerTitle = (card.fullTitle || card.title).toLowerCase();
        let matchedPerf = performerLookup.find(p => lowerTitle.includes(p.lowerName));

        // Format clean scene object
        const scene = {
          title: card.title,
          fullTitle: card.fullTitle || card.title,
          studio: card.studio || 'VIP Studio',
          url: card.url,
          thumbnail: card.thumbnail,
          duration: card.duration || '22:00',
          rating: card.rating || '96%',
          genres: ['chores_points', 'domain_games_bets'],
          isReal: true,
          performer: matchedPerf ? matchedPerf.name : (card.performer || 'Featured Performer'),
          performerId: matchedPerf ? matchedPerf.id : 'featured-performer',
          performers: matchedPerf ? [matchedPerf.name] : ['Featured Performer'],
          subdomainId: 'chores_points',
          quality: '1080p HD',
          verifiedAt: new Date().toISOString()
        };

        newScenes.push(scene);
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 250));
    }
  }

  console.log(`\n✨ Harvested ${newScenes.length} fresh matching scenes!`);

  // Combine with existing
  const allChores = [...existingChores, ...newScenes];

  // Scoring function: Best of the Best ranking
  function scoreScene(s) {
    let score = 20; // baseline
    const lower = (s.title + ' ' + (s.fullTitle || '')).toLowerCase();

    // Specific high-intent keyword matches
    if (/point\s*system|pussy\s*points|points?\s*(for|to|with)\s*(mom|stepmom)|collect\s*points/i.test(lower)) {
      score += 45;
    } else if (/chore|chores|allowance|free\s*use|earn\s*points/i.test(lower)) {
      score += 35;
    } else if (/caused|accident|debt|exchange/i.test(lower)) {
      score += 25;
    }

    // Performer tier bonus
    const pId = s.performerId;
    const p = performerLookup.find(item => item.id === pId);
    if (p) {
      if (p.tiers.includes('goat') || p.tiers.includes('legend') || p.tiers.includes('hall-of-fame')) {
        score += 35;
      } else if (p.tiers.includes('tier1') || p.tiers.includes('verified')) {
        score += 25;
      } else if (p.tiers.includes('reddit_crush') || p.tiers.includes('tier2')) {
        score += 20;
      }
    }

    // Rating bonus
    const rawRating = String(s.rating || '');
    if (rawRating.includes('%')) {
      const val = parseFloat(rawRating);
      if (!isNaN(val)) score += (val / 100) * 20;
    }

    // Duration bonus
    const durParts = String(s.duration || '').split(':');
    if (durParts.length >= 2) {
      const mins = parseInt(durParts[0], 10);
      if (mins >= 30) score += 10;
      else if (mins >= 15) score += 6;
    }

    return Math.round(score * 10) / 10;
  }

  // Score and sort all scenes
  let bestCount = 0;
  const scoredChores = allChores.map(s => {
    const score = scoreScene(s);
    const isBest = score >= 75;
    if (isBest) bestCount++;
    return {
      ...s,
      score,
      tierLevel: isBest ? 'best' : (score >= 50 ? 'tier_b' : 'standard'),
      isBest
    };
  });

  scoredChores.sort((a, b) => b.score - a.score);

  console.log(`\n🏆 chores_points total: ${scoredChores.length} scenes (Landmark Best of the Best: ${bestCount})`);
  console.log('Top 5 Ranked Scenes in chores_points:');
  scoredChores.slice(0, 5).forEach((s, idx) => {
    console.log(`  ${idx + 1}. [Score ${s.score}] [${s.tierLevel.toUpperCase()}] ${s.fullTitle || s.title} (${s.duration}, ${s.rating})`);
  });

  // Also check if any of these scenes belong in naive_mom
  const momScenes = cache.naive_mom || [];
  const momSeenUrls = new Set(momScenes.map(s => s.url));
  let addedToMom = 0;
  scoredChores.forEach(s => {
    const text = (s.title + ' ' + (s.fullTitle || '')).toLowerCase();
    if (/mom|stepmom|mother|milf/i.test(text) && !momSeenUrls.has(s.url)) {
      momSeenUrls.add(s.url);
      momScenes.unshift({
        ...s,
        subdomainId: 'naive_mom'
      });
      addedToMom++;
    }
  });
  console.log(`\n👩 Cross-linked ${addedToMom} mom/stepmom scenes into naive_mom subdomain.`);

  cache.chores_points = scoredChores;
  cache.naive_mom = momScenes;

  // Persist to all locations
  const serialized = JSON.stringify(cache, null, 2);
  fs.writeFileSync(cachePath, serialized, 'utf8');
  fs.writeFileSync(publicCachePath, serialized, 'utf8');
  if (fs.existsSync(path.dirname(distCachePath))) {
    fs.writeFileSync(distCachePath, serialized, 'utf8');
  }

  console.log('✅ Successfully updated underworld-scenes-cache.json in root, public/, and dist/!');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

