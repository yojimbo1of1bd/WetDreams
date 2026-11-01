#!/usr/bin/env node
/**
 * harvest-targeted-seven.mjs
 * 
 * High-volume harvester dedicated to:
 * 1. family_swaps (swap, mom swap, sister swap, wife swap, family swap)
 * 2. cuckold_voyeur (cuckold, hotwife, watching, voyeur, humiliation)
 * 3. wild_orgies (orgy, group sex, sex party, multiple girls)
 * 4. gangbang_trains (gangbang, train, bukkake, surrounded)
 * 5. anal_choreography (anal, backdoor, tight ass, anal creampie)
 * 6. facial_cumshot (facial, cumshot, finish on face, swallow)
 * 7. study_grades (study, tutor, failing grades, math teacher, homework)
 * 
 * Fetches multiple pages from FPO, pulls matching scenes from performers-tagged.json,
 * deduplicates, updates underworld-scenes-cache.json, and syncs to starlet-app.
 */

import fs from 'node:fs/promises';
import { existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { parseFpoVideoCards } from './scene-fetcher.mjs';

const TARGET_SPECS = [
  {
    id: 'family_swaps',
    title: 'Family & Spousal Swaps',
    regex: /\b(swap|momswap|mom\s*swap|sister\s*swap|sis\s*swap|family\s*swap|daughter\s*swap|wife\s*swap|swapped|swapping|trade\s*wives|trading\s*wives)\b/i,
    queries: ['swap', 'mom-swap', 'sister-swap', 'wife-swap', 'family-swap', 'daughter-swap'],
    pagesPerQuery: 3
  },
  {
    id: 'cuckold_voyeur',
    title: 'Cuckold, Hotwife & Voyeurism',
    regex: /\b(cuck|cuckold|cuckolding|cuckquean|hotwife|watching|voyeur|humiliation|bull|clean\s*up|cheating\s*wife)\b/i,
    queries: ['cuckold', 'hotwife', 'cuck', 'watching-wife', 'cuckquean'],
    pagesPerQuery: 3
  },
  {
    id: 'wild_orgies',
    title: 'Wild Orgies & Group Parties',
    regex: /\b(orgy|orgies|group\s*sex|party|multiple\s*girls|room\s*full|foursome|fivesome|wild\s*party)\b/i,
    queries: ['orgy', 'wild-orgy', 'group-sex', 'sex-party', 'multiple-girls'],
    pagesPerQuery: 3
  },
  {
    id: 'gangbang_trains',
    title: 'Gangbangs, Trains & Bukkake',
    regex: /\b(gangbang|gang-bang|train|bukkake|surrounded|shared\s*by\s*all|multiple\s*guys|double\s*team)\b/i,
    queries: ['gangbang', 'bukkake', 'gangbang-train', 'gang-bang'],
    pagesPerQuery: 3
  },
  {
    id: 'anal_choreography',
    title: 'Anal Artistry & Deep Passion',
    regex: /\b(anal|backdoor|ass\s*fuck|anal\s*creampie|gaping)\b/i,
    queries: ['anal-passion', 'anal-art', 'tight-anal', 'anal-creampie'],
    pagesPerQuery: 2
  },
  {
    id: 'facial_cumshot',
    title: 'Facial Finishes & Cumshots',
    regex: /\b(facial|cumshot|creampie|finish\s*on\s*face|covered|swallow|face\s*shot)\b/i,
    queries: ['facial', 'facial-cumshot', 'cum-on-face', 'facial-finish'],
    pagesPerQuery: 2
  },
  {
    id: 'study_grades',
    title: 'Study Sessions & Tutors',
    regex: /\b(study|studying|tutor|tutoring|failing|grade|grades|exam|report\s*card|test|homework|math\s*teacher|detention)\b/i,
    queries: ['study-tutor', 'teacher-student', 'math-tutor', 'failing-grades'],
    pagesPerQuery: 2
  }
];

async function fetchFpoPage(query, page = 1) {
  try {
    const pageSuffix = page > 1 ? `?from_videos=${page}` : '';
    const url = `https://www.fpo.xxx/search/${encodeURIComponent(query)}/${pageSuffix}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseFpoVideoCards(html);
  } catch (err) {
    return [];
  }
}

async function run() {
  console.log('⚡ [Starting Targeted 7-Category Harvester]');
  const cachePath = path.resolve('underworld-scenes-cache.json');
  let cache = {};
  if (existsSync(cachePath)) {
    try {
      cache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
    } catch (e) {}
  }

  // 1. Ingest matching scenes from performers-tagged.json
  const performersPath = path.resolve('performers-tagged.json');
  let performers = [];
  if (existsSync(performersPath)) {
    performers = JSON.parse(await fs.readFile(performersPath, 'utf8'));
  }

  console.log(`📚 Catalog has ${performers.length} performers. Cross-indexing matching scenes...`);

  for (const spec of TARGET_SPECS) {
    const list = cache[spec.id] || [];
    const urlSet = new Set(list.map(s => s.url || s.title));

    let matchedFromCatalog = 0;
    performers.forEach(p => {
      (p.scenes || []).forEach(s => {
        if (!s || !s.title) return;
        const corpus = `${s.title} ${(s.tags || []).join(' ')} ${(p.genres || []).join(' ')}`;
        if (spec.regex.test(corpus)) {
          const key = s.url || s.title;
          if (!urlSet.has(key)) {
            urlSet.add(key);
            list.push({
              ...s,
              performer: p.name,
              performerId: p.id,
              subdomainId: spec.id,
              quality: s.quality || '1080p HD',
              verifiedAt: new Date().toISOString()
            });
            matchedFromCatalog++;
          }
        }
      });
    });

    console.log(`[${spec.id}] Matched ${matchedFromCatalog} scenes from local catalog. Initial count: ${list.length}`);
    cache[spec.id] = list;
  }

  // 2. Fetch live web scenes from FPO for queries
  for (const spec of TARGET_SPECS) {
    console.log(`\n🔍 Fetching live FPO web scenes for [${spec.id}] (${spec.title})...`);
    const list = cache[spec.id] || [];
    const urlSet = new Set(list.map(s => s.url || s.title));
    let newWebCount = 0;

    for (const q of spec.queries) {
      for (let page = 1; page <= spec.pagesPerQuery; page++) {
        const cards = await fetchFpoPage(q, page);
        for (const c of cards) {
          const key = c.url || c.title;
          if (!urlSet.has(key)) {
            urlSet.add(key);
            list.push({
              ...c,
              subdomainId: spec.id,
              quality: '1080p HD',
              verifiedAt: new Date().toISOString()
            });
            newWebCount++;
          }
        }
      }
    }
    console.log(`[${spec.id}] Added ${newWebCount} fresh web scenes. Total now: ${list.length}`);
    cache[spec.id] = list;
  }

  // Also preserve gangbang_orgy if present or populate it
  if (!cache.gangbang_orgy) {
    cache.gangbang_orgy = [...(cache.gangbang_trains || []), ...(cache.wild_orgies || [])];
  }

  // 3. Write cache to disk
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\n💾 Saved updated cache to ${cachePath}`);

  // 4. Sync to starlet-app/public and dist
  const publicPath = path.resolve('starlet-app', 'public', 'underworld-scenes-cache.json');
  const distPath = path.resolve('starlet-app', 'dist', 'underworld-scenes-cache.json');

  copyFileSync(cachePath, publicPath);
  console.log(`📋 Copied to ${publicPath}`);

  if (existsSync(path.resolve('starlet-app', 'dist'))) {
    copyFileSync(cachePath, distPath);
    console.log(`📋 Copied to ${distPath}`);
  }

  // Summary
  console.log('\n📊 === SUMMARY FOR REQUESTED 7 SUBDOMAINS ===');
  for (const spec of TARGET_SPECS) {
    console.log(`  ✓ ${spec.id.padEnd(22)}: ${(cache[spec.id] || []).length} scenes`);
  }
}

run().catch(err => {
  console.error('Fatal error in harvester:', err);
  process.exit(1);
});
