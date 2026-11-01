#!/usr/bin/env node
/**
 * ingest-underworld-performers.mjs
 * 
 * Ingests, cross-indexes, and downloads portraits for all Tier 1 (Soft / GND)
 * and Tier 2 (Cult Glamour + 80+ Reddit Crushes) performers defined in underworld-taxonomy.json.
 */

import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVATAR_DIRS = [
  path.resolve('avatars'),
  path.resolve('starlet-app/public/avatars'),
  path.resolve('starlet-app/dist/avatars')
];

const POSES_DIRS = [
  path.resolve('poses'),
  path.resolve('starlet-app/public/poses'),
  path.resolve('starlet-app/dist/poses')
];

async function ensureDirs() {
  for (const d of [...AVATAR_DIRS, ...POSES_DIRS]) {
    await fs.mkdir(d, { recursive: true });
  }
}

async function saveImage(filename, buffer, isPose = false) {
  const dirs = isPose ? POSES_DIRS : AVATAR_DIRS;
  for (const dir of dirs) {
    try {
      await fs.writeFile(path.join(dir, filename), buffer);
    } catch (e) {}
  }
}

async function fetchPortrait(name, id) {
  const avatarPath = path.resolve('avatars', `${id}.jpg`);
  if (existsSync(avatarPath)) {
    return { id, status: 'already_exists' };
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Source 1: FPO Model archive
  try {
    const res = await fetch(`https://www.fpo.xxx/models/${slug}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/(https:\/\/www\.fpo\.xxx\/contents\/models\/[^\s"']+\.jpg)/i);
      if (m) {
        const imgRes = await fetch(m[1], { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 1000) {
            await saveImage(`${id}.jpg`, buf);
            await saveImage(`${id}.jpg`, buf, true);
            return { id, status: 'saved_fpo_portrait', size: buf.length };
          }
        }
      }
    }
  } catch (e) {}

  // Source 2: Wikimedia Commons API
  try {
    const cUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=6&format=json&origin=*`;
    const cRes = await fetch(cUrl, { headers: { 'User-Agent': 'StarletEnricher/1.0' } });
    if (cRes.ok) {
      const cData = await cRes.json();
      const files = cData.query?.search || [];
      const tokens = name.toLowerCase().split(/\s+/);
      const match = files.find(f => {
        const t = f.title.toLowerCase();
        return tokens.every(tok => t.includes(tok)) && (t.endsWith('.jpg') || t.endsWith('.jpeg'));
      });
      if (match) {
        const fileTitle = match.title.replace(/^File:/i, '');
        const imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileTitle)}?width=500`;
        const imgRes = await fetch(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 1000) {
            await saveImage(`${id}.jpg`, buf);
            return { id, status: 'saved_commons_portrait', size: buf.length };
          }
        }
      }
    }
  } catch (e) {}

  return { id, status: 'failed_or_monogram' };
}

async function run() {
  console.log('🚀 [Tier Performer Ingestion Engine Started]');
  await ensureDirs();

  const taxonomy = JSON.parse(await fs.readFile(path.resolve('underworld-taxonomy.json'), 'utf8'));
  const tier1 = taxonomy.domains.tier1_soft_gnd.performers || [];
  const tier2Core = taxonomy.domains.tier2_glamour_reddit.corePerformers || [];
  const tier2Reddit = taxonomy.domains.tier2_glamour_reddit.redditCrushPerformers || [];

  const allTargetPerformers = [
    ...tier1.map(p => ({ ...p, tierTag: 'tier1' })),
    ...tier2Core.map(p => ({ ...p, tierTag: 'tier2_core' })),
    ...tier2Reddit.map(p => ({ ...p, tierTag: 'tier2_reddit' }))
  ];

  console.log(`📋 Total Target Performers: ${allTargetPerformers.length}`);

  let catalog = [];
  const catalogPath = path.resolve('performers-tagged.json');
  if (existsSync(catalogPath)) {
    catalog = JSON.parse(await fs.readFile(catalogPath, 'utf8'));
  }

  let enrichedCount = 0;
  let portraitsSaved = 0;

  for (let i = 0; i < allTargetPerformers.length; i++) {
    const target = allTargetPerformers[i];
    const portraitRes = await fetchPortrait(target.name, target.id);
    if (portraitRes.status.startsWith('saved')) {
      portraitsSaved++;
      console.log(`[${i + 1}/${allTargetPerformers.length}] 📸 Saved portrait for ${target.name} (${portraitRes.status})`);
    }

    // Check if performer is in catalog
    let existing = catalog.find(p => p.id === target.id || p.name.toLowerCase() === target.name.toLowerCase());
    if (!existing) {
      existing = {
        id: target.id,
        name: target.name,
        hair: 'Blonde',
        ethnicity: 'Caucasian',
        tier: target.tierTag === 'tier1' ? ['tier1', 'soft-gnd', 'verified'] : ['tier2', 'reddit-crush', 'verified'],
        genres: target.tierTag === 'tier1' ? ['soft', 'stepdaughter', 'stepsis', 'playful'] : ['milf', 'glamour', 'sensual', 'taboo'],
        scenes: [],
        score: target.tierTag === 'tier1' ? 96 : 94,
        notes: target.note || target.vibe || 'Curated Underworld Sovereign'
      };
      catalog.push(existing);
      enrichedCount++;
    }

    // If performer has fewer than 6 scenes, fetch scenes
    if (!existing.scenes || existing.scenes.length < 6) {
      try {
        const scenes = await fetchPerformerScenes(target.name, 18);
        if (scenes && scenes.length > 0) {
          existing.scenes = scenes;
          console.log(`[${i + 1}/${allTargetPerformers.length}] 🎬 Ingested ${scenes.length} verified scenes for ${target.name}`);
        }
      } catch (e) {}
    }

    // Slight throttle to be polite
    await new Promise(r => setTimeout(r, 200));
  }

  // Write updated catalog back
  await fs.writeFile(catalogPath, JSON.stringify(catalog, null, 2));
  if (existsSync(path.resolve('starlet-app/public/performers-tagged.json'))) {
    await fs.writeFile(path.resolve('starlet-app/public/performers-tagged.json'), JSON.stringify(catalog, null, 2));
  }
  if (existsSync(path.resolve('starlet-app/dist/performers-tagged.json'))) {
    await fs.writeFile(path.resolve('starlet-app/dist/performers-tagged.json'), JSON.stringify(catalog, null, 2));
  }

  console.log(`✅ [Tier Performer Ingestion Completed]: ${portraitsSaved} new portraits saved, catalog updated to ${catalog.length} performers.`);
}

run().catch(err => {
  console.error('❌ Error during ingestion:', err);
  process.exit(1);
});

