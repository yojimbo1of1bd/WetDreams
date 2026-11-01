// language: Node.js, file: enrich-scenes-all.mjs
/**
 * Real Scene Enrichment Engine
 * 
 * Scrapes and verifies genuine video releases, durations, ratings, thumbnails,
 * and direct streaming URLs for all performers, replacing random search tags
 * with direct scene playback.
 * 
 * Features:
 * - Persistent caching in ./scene-cache/
 * - Polite rate-limiting & connection pooling
 * - Genre tagging & family scenario classifier
 * - Direct URL linking
 */

import fs from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const CACHE_DIR = path.resolve('scene-cache');
if (!existsSync(CACHE_DIR)) {
  mkdirSync(CACHE_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  let limit = Infinity;
  let onlyMissing = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i+1]) {
      limit = parseInt(args[i+1], 10);
      i++;
    } else if (args[i] === '--missing') {
      onlyMissing = true;
    }
  }

  const performersPath = path.resolve('performers.json');
  const performers = JSON.parse(await fs.readFile(performersPath, 'utf8'));

  console.log(`Loaded ${performers.length} performers from performers.json`);

  // Target selection:
  // If onlyMissing, prioritize performers with <= 1 scene or fake scenes
  let targets = performers.slice();
  if (onlyMissing) {
    targets = targets.filter(p => !p.scenes || p.scenes.length <= 1 || p.scenes.some(s => !s.isReal || !s.url));
  } else {
    // Sort performers: those with no real URLs first
    targets.sort((a, b) => {
      const aReal = (a.scenes || []).filter(s => s.isReal && s.url).length;
      const bReal = (b.scenes || []).filter(s => s.isReal && s.url).length;
      return aReal - bReal;
    });
  }

  if (limit < targets.length) {
    targets = targets.slice(0, limit);
  }

  console.log(`Processing ${targets.length} performers (batch limit: ${limit})...`);

  let updatedCount = 0;
  let totalNewScenes = 0;

  for (let i = 0; i < targets.length; i++) {
    const p = targets[i];
    const cacheFile = path.join(CACHE_DIR, `${p.id}.json`);
    let scenes = [];

    if (existsSync(cacheFile)) {
      try {
        scenes = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
      } catch (e) {
        scenes = [];
      }
    }

    if (!scenes || !scenes.length) {
      console.log(`[${i + 1}/${targets.length}] Fetching verified scenes for "${p.name}"...`);
      scenes = await fetchPerformerScenes(p.name);
      if (scenes.length) {
        await fs.writeFile(cacheFile, JSON.stringify(scenes, null, 2), 'utf8');
      }
      // Polite delay between requests
      await delay(350);
    } else {
      console.log(`[${i + 1}/${targets.length}] Cached scenes for "${p.name}" (${scenes.length} scenes)`);
    }

    if (scenes && scenes.length > 0) {
      // Merge verified real scenes
      p.scenes = scenes;
      updatedCount++;
      totalNewScenes += scenes.length;
    }
  }

  // Save back to performers.json
  await fs.writeFile(performersPath, JSON.stringify(performers, null, 2), 'utf8');
  console.log(`\n Successfully updated ${updatedCount} performers with ${totalNewScenes} real scenes!`);
}

main().catch(console.error);

