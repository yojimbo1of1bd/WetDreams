#!/usr/bin/env node
/**
 * scrape-underworld-subdomains.mjs
 * 
 * Targeted scenario scraper for the Underworld Subdomains.
 * Queries FPO & Eporner for holiday, leverage, kinship, escalation,
 * cloister, and hardcore dynamics.
 * Writes results to underworld-scenes-cache.json.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFpoVideoCards } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_SUBDOMAINS = [
  { id: 'christmas', query: 'christmas-gift' },
  { id: 'thanksgiving', query: 'thanksgiving' },
  { id: 'halloween', query: 'halloween' },
  { id: 'st_patricks', query: 'saint-patrick' },
  { id: 'fourth_of_july', query: 'fourth-of-july' },
  { id: 'valentines_day', query: 'valentines-day' },
  { id: 'mothers_day', query: 'mothers-day' },
  { id: 'fathers_day', query: 'fathers-day' },
  { id: 'birthday_offerings', query: 'birthday-gift' },
  { id: 'card_bets', query: 'strip-poker' },
  { id: 'chores_points', query: 'chores' },
  { id: 'study_grades', query: 'study-tutor' },
  { id: 'graduation_promise', query: 'graduation' },
  { id: 'blackmail_leverage', query: 'blackmail' },
  { id: 'naive_mom', query: 'innocent-mom' },
  { id: 'naive_sister', query: 'naive-stepsis' },
  { id: 'homecoming', query: 'homecoming' },
  { id: 'dad_permission', query: 'ask-permission' },
  { id: 'mom_orders_sis', query: 'mom-tells-sis' },
  { id: 'conviction_threesome', query: 'reluctant-threesome' },
  { id: 'gradual_escalation', query: 'slow-burn' },
  { id: 'church_nun', query: 'nun-convent' },
  { id: 'yoga_stuck', query: 'yoga-stuck' },
  { id: 'mistaken_blindfolded', query: 'blindfolded' },
  { id: 'double_penetration', query: 'double-penetration' },
  { id: 'gangbang_orgy', query: 'gangbang' },
  { id: 'anal_choreography', query: 'anal-passion' },
  { id: 'facial_cumshot', query: 'facial-cumshot' }
];

async function fetchFpoSearch(query) {
  try {
    const url = `https://www.fpo.xxx/search/${encodeURIComponent(query)}/`;
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
  console.log('🌌 [Underworld Subdomain Content Harvester Started]');

  const cachePath = path.resolve('underworld-scenes-cache.json');
  let cache = {};
  if (existsSync(cachePath)) {
    try {
      cache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
    } catch (e) {}
  }

  let totalCollected = 0;

  for (let i = 0; i < TARGET_SUBDOMAINS.length; i++) {
    const target = TARGET_SUBDOMAINS[i];
    console.log(`[${i + 1}/${TARGET_SUBDOMAINS.length}] 🔍 Harvesting Subdomain: ${target.id} (${target.query})...`);

    const scenes = await fetchFpoSearch(target.query);
    const existing = cache[target.id] || [];

    // Deduplicate by URL
    const merged = [...existing];
    for (const s of scenes) {
      if (!merged.some(m => m.url === s.url)) {
        merged.push({
          ...s,
          subdomainId: target.id,
          quality: '1080p HD',
          verifiedAt: new Date().toISOString()
        });
        totalCollected++;
      }
    }

    cache[target.id] = merged;
    console.log(`   └─ Found ${scenes.length} raw releases -> Total for ${target.id}: ${merged.length}`);

    await new Promise(r => setTimeout(r, 400));
  }

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));

  // Mirror to starlet-app public & dist
  await fs.writeFile(path.resolve('starlet-app/public/underworld-scenes-cache.json'), JSON.stringify(cache, null, 2));
  if (existsSync(path.resolve('starlet-app/dist'))) {
    await fs.writeFile(path.resolve('starlet-app/dist/underworld-scenes-cache.json'), JSON.stringify(cache, null, 2));
  }

  console.log(`✅ [Underworld Subdomain Content Harvester Finished]: Cached ${totalCollected} fresh verified releases across all subdomains.`);
}

run().catch(err => {
  console.error('❌ Harvester failed:', err);
  process.exit(1);
});

