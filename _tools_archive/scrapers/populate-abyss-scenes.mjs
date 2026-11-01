#!/usr/bin/env node
import fs from 'node:fs/promises';
import { existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const ABYSS_SUBS = [
  {
    id: 'taboo_extremes',
    regex: /\b(taboo|forbidden|extreme|nasty|raw|filthy|depraved)\b/i
  },
  {
    id: 'rough_domination',
    regex: /\b(rough|domination|choke|choking|hard|slapped|spanked|hair\s*pull)\b/i
  },
  {
    id: 'bdsm_dungeon',
    regex: /\b(bdsm|bondage|dungeon|ropes|leather|tied\s*up|submissive|collar)\b/i
  },
  {
    id: 'extreme_gangbangs',
    regex: /\b(bukkake|gangbang|train|monster|overload|surrounded|shared\s*by\s*all)\b/i
  },
  {
    id: 'degradation_limits',
    regex: /\b(degradation|gag|gagging|deepthroat|spit|humiliation|messy|drool)\b/i
  }
];

async function main() {
  const cachePath = path.resolve('underworld-scenes-cache.json');
  const perfPath = path.resolve('performers-tagged.json');

  let cache = JSON.parse(await fs.readFile(cachePath, 'utf8'));
  let performers = JSON.parse(await fs.readFile(perfPath, 'utf8'));

  for (const sub of ABYSS_SUBS) {
    const list = cache[sub.id] || [];
    const urlSet = new Set(list.map(s => s.url || s.title));

    performers.forEach(p => {
      (p.scenes || []).forEach(s => {
        if (!s || !s.title) return;
        const corpus = `${s.title} ${(s.tags || []).join(' ')} ${(p.genres || []).join(' ')}`;
        if (sub.regex.test(corpus)) {
          const key = s.url || s.title;
          if (!urlSet.has(key)) {
            urlSet.add(key);
            list.push({
              ...s,
              performer: p.name,
              performerId: p.id,
              subdomainId: sub.id,
              quality: s.quality || '1080p HD',
              verifiedAt: new Date().toISOString()
            });
          }
        }
      });
    });

    console.log(`[${sub.id}] Loaded ${list.length} scenes.`);
    cache[sub.id] = list;
  }

  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), 'utf8');

  // Copy to starlet-app
  const pubPath = path.resolve('starlet-app', 'public', 'underworld-scenes-cache.json');
  copyFileSync(cachePath, pubPath);
  if (existsSync(path.resolve('starlet-app', 'dist'))) {
    copyFileSync(cachePath, path.resolve('starlet-app', 'dist', 'underworld-scenes-cache.json'));
  }

  console.log('✅ Abyssal scenes cached and synced.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

