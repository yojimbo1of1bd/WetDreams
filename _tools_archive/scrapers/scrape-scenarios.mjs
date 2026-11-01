#!/usr/bin/env node
/**
 * scrape-scenarios.mjs
 * 
 * Implements Plan v2.0 - Phase 1: Scenario-First Ingestion & Bipartite Scene Graph
 * 
 * 1. Queries targeted taboo/family scenario batches on FPO (MSD, Swaps, Blackmail, Permission, etc.)
 * 2. Parses real video cards, durations, ratings, thumbnails, and direct links.
 * 3. Matches multi-actor co-star starlets against the 1,204 performer directory.
 * 4. Categorizes scenes using the 16-class SCENARIO_TAXONOMY.
 * 5. Generates canonical-scenes.json and cross-indexes into performers.json.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFpoVideoCards } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SCENARIO_TAXONOMY = {
  msd: /\b(msd|mom\s*son\s*daughter|mother\s*son\s*daughter|stepmom\s*and\s*stepsis|mom\s*daughter\s*threesome)\b/i,
  mfs: /\b(mfs|mom\s*father\s*son|mother\s*father\s*son|parents\s*and\s*son)\b/i,
  swap: /\b(swap|momswap|sister\s*swap|family\s*swap|daughter\s*swap|wife\s*swap|swapped)\b/i,
  blackmail: /\b(blackmail|blackmailed|coerced|extortion|threatened|or\s*else|leaked\s*pics)\b/i,
  permission: /\b(permission|ask(?:ed|ing)?\s*permission|hall\s*pass|persuaded|bribed|allowed\s*to|approved\s*by)\b/i,
  ffm: /\b(ffm|threesome|two\s*girls|sharing\s*him|mom\s*and\s*sis|double\s*team)\b/i,
  mmf: /\b(mmf|double\s*penetration|two\s*bros|brother\s*and\s*friend|dad\s*and\s*son)\b/i,
  roleplay: /\b(roleplay|role\s*play|taboo\s*fantasy|acting|pretend|captioned|storyline)\b/i,
  caught: /\b(caught|walked\s*in|interrupted|busted|spied|peeping|spycam)\b/i,
  shared_bed: /\b(shared\s*bed|bed\s*share|sleeping\s*together|same\s*bed|hotel\s*room|sleepover)\b/i,
  vacation: /\b(vacation|holiday|cabin|lake\s*house|road\s*trip|hotel)\b/i,
  study: /\b(study|tutor|homework|exam|failing|math|lesson)\b/i,
  birthday: /\b(birthday|present|gift|surprise|party)\b/i,
  stepmom: /\b(stepmom|step-mom|stepmother)\b/i,
  stepsis: /\b(stepsis|step-sis|stepsister)\b/i,
  stepdaughter: /\b(stepdaughter|step-daughter)\b/i
};

const SCENARIO_QUERIES = [
  'msd',
  'mom-son-daughter',
  'family-swap',
  'sister-swap',
  'daughter-swap',
  'mom-swap',
  'blackmail',
  'permission',
  'pure-taboo',
  'family-strokes',
  'perv-mom',
  'perv-dad',
  'perv-family',
  'stepmom-stepsis',
  'shared-bed',
  'bed-share',
  'caught',
  'roleplay',
  'ffm-threesome',
  'my-family-pies'
];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchFpoPage(query, page = 1) {
  const url = page === 1 
    ? `https://www.fpo.xxx/search/${query}/`
    : `https://www.fpo.xxx/search/${query}/${page}/`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) {
      return [];
    }
    const html = await res.text();
    return parseFpoVideoCards(html);
  } catch (err) {
    return [];
  }
}

function classifyScenario(title, studio = '') {
  const text = `${title} ${studio}`.toLowerCase();
  const matched = [];
  for (const [key, pattern] of Object.entries(SCENARIO_TAXONOMY)) {
    if (pattern.test(text)) {
      matched.push(key);
    }
  }
  return matched;
}

async function main() {
  console.log('🚀 [Plan v2.0] Starting Scenario-First Ingestion & Bipartite Graph Pipeline...');
  
  // 1. Load performers
  const performersRaw = await fs.readFile(path.join(__dirname, 'performers.json'), 'utf8');
  const performers = JSON.parse(performersRaw);
  console.log(`✓ Loaded ${performers.length} performers from catalog.`);

  // 2. Build starlet lookup
  // Map lowercase names and aliases to performer records
  const nameToId = new Map();
  for (const p of performers) {
    nameToId.set(p.name.toLowerCase().trim(), p.id);
    if (p.aliases && Array.isArray(p.aliases)) {
      for (const a of p.aliases) {
        nameToId.set(a.toLowerCase().trim(), p.id);
      }
    }
  }

  // Pre-sort names by length descending to match longest full names first
  const sortedNames = [...nameToId.keys()]
    .filter(n => n.length >= 4 && !['love', 'star', 'rose', 'blake', 'sweet', 'diamond', 'paris', 'queen', 'fox', 'ray'].includes(n))
    .sort((a, b) => b.length - a.length);

  // Helper to find performers in scene title/metadata
  function detectPerformers(text) {
    const found = new Set();
    const lower = ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `;
    for (const name of sortedNames) {
      const padded = ` ${name} `;
      if (lower.includes(padded)) {
        found.add(nameToId.get(name));
      }
    }
    return [...found];
  }

  // 3. Query all scenario batches
  const canonicalScenes = new Map(); // url -> scene object
  let queryCount = 0;

  for (const query of SCENARIO_QUERIES) {
    queryCount++;
    process.stdout.write(`[${queryCount}/${SCENARIO_QUERIES.length}] Querying scenario: "${query}"... `);
    
    // Page 1 & Page 2 for high-yield scenarios
    const p1Scenes = await fetchFpoPage(query, 1);
    await sleep(400);
    const p2Scenes = await fetchFpoPage(query, 2);
    const combined = [...p1Scenes, ...p2Scenes];
    
    let addedForQuery = 0;
    for (const s of combined) {
      if (!canonicalScenes.has(s.url)) {
        const sceneTaxonomy = classifyScenario(s.fullTitle || s.title, s.studio);
        const starletIds = detectPerformers(`${s.fullTitle || s.title} ${s.studio}`);
        
        // Merge taxonomy genres with standard genres
        const allGenres = [...new Set([...(s.genres || []), ...sceneTaxonomy])];
        
        const canonical = {
          id: s.url.replace(/https?:\/\/(?:www\.)?fpo\.xxx\/video\/(\d+)\/([^\/]+)\/?/, '$1-$2'),
          title: s.title,
          fullTitle: s.fullTitle,
          studio: s.studio,
          duration: s.duration,
          rating: s.rating,
          url: s.url,
          thumbnail: s.thumbnail,
          performers: starletIds,
          genres: allGenres,
          scenarioTags: sceneTaxonomy,
          isReal: true
        };

        canonicalScenes.set(s.url, canonical);
        addedForQuery++;
      }
    }

    console.log(`+${addedForQuery} new scenes (Total: ${canonicalScenes.size})`);
    await sleep(400);
  }

  console.log(`\n✓ Ingested ${canonicalScenes.size} unique scenario scenes across 16 taxonomies.`);

  // 4. Cross-Index Scenes into Performers
  console.log('\n🔗 Cross-indexing scenes into performer profiles & establishing co-star edges...');
  const performerMap = new Map(performers.map(p => [p.id, p]));
  let linkedCount = 0;
  let multiStarletScenes = 0;

  for (const scene of canonicalScenes.values()) {
    if (scene.performers.length > 1) {
      multiStarletScenes++;
    }

    for (const perfId of scene.performers) {
      const p = performerMap.get(perfId);
      if (!p) continue;
      if (!p.scenes) p.scenes = [];

      // Check if performer already has this scene URL
      const exists = p.scenes.some(s => s.url === scene.url || (s.title && s.title.toLowerCase() === scene.title.toLowerCase()));
      if (!exists) {
        p.scenes.unshift({
          title: scene.title,
          fullTitle: scene.fullTitle,
          studio: scene.studio,
          duration: scene.duration,
          rating: scene.rating,
          url: scene.url,
          thumbnail: scene.thumbnail,
          genres: scene.genres,
          coStars: scene.performers.filter(id => id !== perfId),
          isReal: true
        });
        linkedCount++;
      }
    }
  }

  console.log(`✓ Established ${linkedCount} cross-index linkages.`);
  console.log(`✓ Detected ${multiStarletScenes} multi-actress co-star scenes!`);

  // 5. Save canonical scenes repository
  const sceneList = [...canonicalScenes.values()];
  const canonicalPath = path.join(__dirname, 'canonical-scenes.json');
  await fs.writeFile(canonicalPath, JSON.stringify(sceneList, null, 2));
  console.log(`✓ Saved ${sceneList.length} canonical scenes to ${canonicalPath}`);

  // 6. Save updated performers.json
  await fs.writeFile(path.join(__dirname, 'performers.json'), JSON.stringify(performers, null, 2));
  console.log(`✓ Updated performers.json with bidirectional co-star linkages.`);

  // 7. Summary breakdown of 16-class taxonomy
  const taxBreakdown = {};
  for (const s of sceneList) {
    for (const t of (s.scenarioTags || [])) {
      taxBreakdown[t] = (taxBreakdown[t] || 0) + 1;
    }
  }

  console.log('\n📊 Scenario Taxonomy Scene Distribution:');
  for (const [k, v] of Object.entries(taxBreakdown).sort((a, b) => b[1] - a[1])) {
    console.log(`   ${k.padEnd(16)} : ${v} scenes`);
  }
}

main().catch(err => {
  console.error('Fatal error in scrape-scenarios:', err);
  process.exit(1);
});

