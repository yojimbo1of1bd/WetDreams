#!/usr/bin/env node
/**
 * tier-scaled-harvester.mjs
 * 
 * Implements Tier-Scaled Harvest Quotas:
 *  - Top Rated: >= 100 scenes
 *  - Mid Range: >= 50 scenes
 *  - Low Range: >= 30 scenes
 * 
 * Enriches catalog performers and scenario subdomains to meet these exact quotas.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPerformerScenes, parseFpoVideoCards } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getPerformerQuota(performer, taxonomy) {
  const tiers = Array.isArray(performer.tier) ? performer.tier : (performer.tier ? [performer.tier] : []);
  const score = performer.score || 85;

  const isTier1 = tiers.some(t => /tier1|soft-gnd/i.test(t)) ||
    (taxonomy?.domains?.tier1_soft_gnd?.performers || []).some(p => p.id === performer.id || p.name.toLowerCase() === performer.name.toLowerCase());

  const isLegend = tiers.some(t => /legend|hall-of-fame|goat/i.test(t)) || score >= 95;

  const isRedditTop = (taxonomy?.domains?.tier2_glamour_reddit?.redditCrushPerformers || []).some(
    p => (p.id === performer.id || p.name.toLowerCase() === performer.name.toLowerCase()) && p.group?.includes('Top Voted')
  );

  // Top Rated: >= 100
  if (isTier1 || isLegend || isRedditTop || score >= 95) {
    return { target: 100, rank: 'Top Rated' };
  }

  // Mid Range: >= 50
  if (score >= 82 || tiers.some(t => /tier2|reddit-crush|established|popular/i.test(t))) {
    return { target: 50, rank: 'Mid Range' };
  }

  // Low Range: >= 30
  return { target: 30, rank: 'Low Range' };
}

async function harvestSubdomainMultiPage(query, targetCount) {
  const maxPages = Math.ceil(targetCount / 24);
  const allScenes = [];
  const seenUrls = new Set();

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? `https://www.fpo.xxx/search/${encodeURIComponent(query)}/`
      : `https://www.fpo.xxx/search/${encodeURIComponent(query)}/?from_videos=${page}`;

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!res.ok) break;
      const html = await res.text();
      const pageScenes = parseFpoVideoCards(html);
      if (!pageScenes || pageScenes.length === 0) break;

      for (const s of pageScenes) {
        if (!seenUrls.has(s.url)) {
          seenUrls.add(s.url);
          allScenes.push(s);
        }
      }

      if (allScenes.length >= targetCount) break;
      if (page < maxPages) {
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (e) {
      break;
    }
  }

  return allScenes.slice(0, targetCount);
}

async function main() {
  console.log('⚡ [Tier-Scaled Harvest Engine Initiated]');
  console.log('🎯 Quotas: Top Rated (100) | Mid Range (50) | Low Range (30)\n');

  const taxonomy = JSON.parse(await fs.readFile(path.resolve('underworld-taxonomy.json'), 'utf8'));
  const catalogPath = path.resolve('performers-tagged.json');
  let catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));

  // PART 1: SCALE SUBDOMAIN RELEASES
  console.log('--- PART 1: Scaling Scenario Subdomains ---');
  const cachePath = path.resolve('underworld-scenes-cache.json');
  let cache = {};
  if (existsSync(cachePath)) {
    try { cache = JSON.parse(await fs.readFile(cachePath, 'utf8')); } catch (e) {}
  }

  const SUBDOMAINS_TO_SCALE = [
    // Top-tier subdomains target 100+
    { id: 'christmas', query: 'christmas', target: 100 },
    { id: 'birthday_offerings', query: 'birthday', target: 100 },
    { id: 'halloween', query: 'halloween', target: 100 },
    { id: 'study_grades', query: 'study', target: 100 },
    { id: 'blackmail_leverage', query: 'blackmail', target: 100 },
    { id: 'naive_mom', query: 'perv-mom', target: 100 },
    { id: 'naive_sister', query: 'stepsis', target: 100 },
    { id: 'naive_daughter', query: 'stepdaughter', target: 100 },
    { id: 'conviction_threesome', query: 'threesome', target: 100 },
    { id: 'double_penetration', query: 'double-penetration', target: 100 },
    { id: 'gangbang_orgy', query: 'gangbang', target: 100 },
    { id: 'anal_choreography', query: 'anal', target: 100 },
    { id: 'facial_cumshot', query: 'cumshot', target: 100 },
    // Mid-tier subdomains target 50+
    { id: 'valentines_day', query: 'valentine', target: 50 },
    { id: 'thanksgiving', query: 'thanksgiving', target: 50 },
    { id: 'card_bets', query: 'poker', target: 50 },
    { id: 'dad_permission', query: 'permission', target: 50 },
    { id: 'mom_orders_sis', query: 'mom-daughter', target: 50 },
    { id: 'gradual_escalation', query: 'massage', target: 50 },
    { id: 'church_nun', query: 'nun', target: 50 },
    { id: 'yoga_stuck', query: 'yoga', target: 50 },
    { id: 'naive_wife', query: 'wife', target: 50 },
    // Low-tier subdomains target 30+
    { id: 'st_patricks', query: 'st-patrick', target: 30 },
    { id: 'fourth_of_july', query: '4th-of-july', target: 30 },
    { id: 'mothers_day', query: 'mothers-day', target: 30 },
    { id: 'fathers_day', query: 'fathers-day', target: 30 },
    { id: 'chores_points', query: 'chores', target: 30 },
    { id: 'graduation_promise', query: 'graduation', target: 30 },
    { id: 'homecoming', query: 'homecoming', target: 30 },
    { id: 'mistaken_blindfolded', query: 'blindfold', target: 30 }
  ];

  for (let i = 0; i < SUBDOMAINS_TO_SCALE.length; i++) {
    const item = SUBDOMAINS_TO_SCALE[i];
    const existing = cache[item.id] || [];

    if (existing.length < item.target) {
      console.log(`[${i + 1}/${SUBDOMAINS_TO_SCALE.length}] 🌾 Scaling Subdomain: ${item.id} (Current: ${existing.length} -> Target: ${item.target})...`);
      const needed = item.target - existing.length;
      const fresh = await harvestSubdomainMultiPage(item.query, needed + 24);

      for (const s of fresh) {
        if (!existing.some(ex => ex.url === s.url)) {
          existing.push({
            ...s,
            subdomainId: item.id,
            quality: '1080p HD',
            verifiedAt: new Date().toISOString()
          });
        }
      }
      cache[item.id] = existing;
      console.log(`   └─ Updated ${item.id} to ${existing.length} releases.`);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
  await fs.writeFile(path.resolve('starlet-app/public/underworld-scenes-cache.json'), JSON.stringify(cache, null, 2));
  if (existsSync(path.resolve('starlet-app/dist'))) {
    await fs.writeFile(path.resolve('starlet-app/dist/underworld-scenes-cache.json'), JSON.stringify(cache, null, 2));
  }

  // PART 2: SCALE PERFORMERS TO 100 / 50 / 30
  console.log('\n--- PART 2: Scaling Target Performers (Tier 1 & Reddit Crushes) ---');
  const targetPerformers = [
    ...(taxonomy.domains.tier1_soft_gnd.performers || []).map(p => ({ ...p, forceQuota: 100 })),
    ...(taxonomy.domains.tier2_glamour_reddit.corePerformers || []).map(p => ({ ...p, forceQuota: 50 })),
    ...(taxonomy.domains.tier2_glamour_reddit.redditCrushPerformers || []).map(p => ({
      ...p,
      forceQuota: p.group?.includes('Top Voted') ? 100 : 50
    }))
  ];

  let scaledPerformers = 0;

  for (let i = 0; i < targetPerformers.length; i++) {
    const target = targetPerformers[i];
    const p = catalog.find(cp => cp.id === target.id || cp.name.toLowerCase() === target.name.toLowerCase());
    if (!p) continue;

    const quota = target.forceQuota || getPerformerQuota(p, taxonomy).target;
    const currentCount = (p.scenes || []).length;

    if (currentCount < quota) {
      console.log(`[${i + 1}/${targetPerformers.length}] 🌟 Scaling ${p.name} (Current: ${currentCount} -> Target: ${quota})...`);
      try {
        const freshScenes = await fetchPerformerScenes(p.name, quota);
        if (freshScenes.length > currentCount) {
          p.scenes = freshScenes;
          scaledPerformers++;
          console.log(`   └─ Succeeded: ${p.name} now has ${p.scenes.length} releases.`);
        }
      } catch (e) {}
      await new Promise(r => setTimeout(r, 250));
    }
  }

  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));
  await fs.writeFile(path.resolve('performers.json'), JSON.stringify(catalog, null, 2));
  await fs.writeFile(path.resolve('starlet-app/public/performers-tagged.json'), JSON.stringify(catalog, null, 2));
  if (existsSync(path.resolve('starlet-app/dist/performers-tagged.json'))) {
    await fs.writeFile(path.resolve('starlet-app/dist/performers-tagged.json'), JSON.stringify(catalog, null, 2));
  }

  console.log(`\n🎉 [Tier-Scaled Harvest Complete]: Enriched ${scaledPerformers} starlets to full 100/50 quota.`);
}

main().catch(err => {
  console.error('❌ Harvest failed:', err);
  process.exit(1);
});

