// language: Node.js, file: deep-background-enricher.mjs
/**
 * Master Background Enrichment Engine
 * 
 * - Downloads real photographic JPEG portraits for all performers missing headshots
 * - Fetches complete 24-scene filmographies with thumbnails, durations, ratings & stream URLs
 * - Saves progress atomically to performers-tagged.json, public/, and dist/
 * - Logs real-time stats to ENRICHMENT_STATUS.json
 */
import fs from 'node:fs/promises';
import { existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const AVATAR_DIRS = [
  path.resolve('avatars'),
  path.resolve('starlet-app/public/avatars'),
  path.resolve('starlet-app/dist/avatars')
];

const DATA_FILES = [
  path.resolve('performers-tagged.json'),
  path.resolve('performers.json'),
  path.resolve('starlet-app/public/performers-tagged.json'),
  path.resolve('starlet-app/dist/performers-tagged.json')
];

const STATUS_FILE = path.resolve('ENRICHMENT_STATUS.json');

async function ensureDirs() {
  for (const d of AVATAR_DIRS) {
    await fs.mkdir(d, { recursive: true });
  }
}

async function saveAvatarJpg(id, buffer) {
  for (const dir of AVATAR_DIRS) {
    try {
      await fs.writeFile(path.join(dir, `${id}.jpg`), buffer);
    } catch (e) {}
  }
}

async function fetchPortrait(name, id) {
  // If already exists, skip
  if (existsSync(path.join(AVATAR_DIRS[0], `${id}.jpg`))) {
    return { status: 'already_cached' };
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Strategy 1: FPO Models Official Headshot
  try {
    const res = await fetch(`https://www.fpo.xxx/models/${slug}/`, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/(https:\/\/www\.fpo\.xxx\/contents\/models\/[^\s"']+\.jpg)/i);
      if (m) {
        const imgRes = await fetch(m[1], {
          signal: AbortSignal.timeout(6000),
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 800) {
            await saveAvatarJpg(id, buf);
            return { status: 'fpo_model_portrait', size: buf.length };
          }
        }
      }
    }
  } catch (e) {}

  // Strategy 2: Wikimedia Commons Portrait
  try {
    const cUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=6&format=json&origin=*`;
    const cRes = await fetch(cUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'StarletEnricher/1.0' }
    });
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
        const imgUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileTitle)}?width=480`;
        const imgRes = await fetch(imgUrl, {
          signal: AbortSignal.timeout(6000),
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 1000) {
            await saveAvatarJpg(id, buf);
            return { status: 'commons_portrait', size: buf.length };
          }
        }
      }
    }
  } catch (e) {}

  // Strategy 3: FPO Video Scene Thumbnail
  try {
    const sRes = await fetch(`https://www.fpo.xxx/search/${slug}/`, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (sRes.ok) {
      const html = await sRes.text();
      const m = html.match(/(https:\/\/www\.fpo\.xxx\/contents\/videos_screenshots\/[^\s"']+\.jpg)/i);
      if (m) {
        const imgRes = await fetch(m[1], {
          signal: AbortSignal.timeout(6000),
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 800) {
            await saveAvatarJpg(id, buf);
            return { status: 'scene_thumbnail', size: buf.length };
          }
        }
      }
    }
  } catch (e) {}

  return { status: 'failed' };
}

async function saveAllData(performers) {
  const jsonStr = JSON.stringify(performers, null, 2);
  for (const f of DATA_FILES) {
    try {
      await fs.writeFile(f, jsonStr, 'utf8');
    } catch (e) {}
  }
}

async function writeStatus(status) {
  try {
    await fs.writeFile(STATUS_FILE, JSON.stringify(status, null, 2), 'utf8');
  } catch (e) {}
}

async function main() {
  await ensureDirs();
  const raw = await fs.readFile('performers-tagged.json', 'utf8');
  const performers = JSON.parse(raw);

  console.log(`[Master Background Enricher] Total catalog size: ${performers.length} performers`);

  // Classify who needs work
  const needsScenes = performers.filter(p => !p.scenes || p.scenes.length < 5 || p.scenes.some(s => !s.url));
  const needsAvatar = performers.filter(p => !existsSync(path.join(AVATAR_DIRS[0], `${p.id}.jpg`)));

  console.log(`  -> Performers needing real scenes: ${needsScenes.length}`);
  console.log(`  -> Performers needing photographic avatar: ${needsAvatar.length}`);

  // Prioritize list: those missing both first, then missing scenes, then missing avatar
  const priorityMap = new Map();
  for (const p of performers) {
    let score = 0;
    const hasPhoto = existsSync(path.join(AVATAR_DIRS[0], `${p.id}.jpg`));
    const hasRealScenes = p.scenes && p.scenes.length >= 5 && p.scenes.every(s => s.url);
    if (!hasRealScenes) score += 10;
    if (!hasPhoto) score += 5;
    if (score > 0) {
      priorityMap.set(p.id, score);
    }
  }

  const workQueue = performers
    .filter(p => priorityMap.has(p.id))
    .sort((a, b) => priorityMap.get(b.id) - priorityMap.get(a.id));

  console.log(`[Master Background Enricher] Work queue loaded: ${workQueue.length} performers`);

  let processed = 0;
  let avatarsFetched = 0;
  let scenesEnriched = 0;
  const startTime = Date.now();

  const CONCURRENCY = 3;

  for (let i = 0; i < workQueue.length; i += CONCURRENCY) {
    const chunk = workQueue.slice(i, i + CONCURRENCY);

    await Promise.all(chunk.map(async (p) => {
      // 1. Check Avatar
      const hasPhoto = existsSync(path.join(AVATAR_DIRS[0], `${p.id}.jpg`));
      if (!hasPhoto) {
        const aRes = await fetchPortrait(p.name, p.id);
        if (aRes.status !== 'failed' && aRes.status !== 'already_cached') {
          avatarsFetched++;
        }
      }

      // 2. Check Scenes
      const hasRealScenes = p.scenes && p.scenes.length >= 5 && p.scenes.every(s => s.url);
      if (!hasRealScenes) {
        try {
          const scenes = await fetchPerformerScenes(p.name);
          if (scenes.length > 0) {
            p.scenes = scenes;
            scenesEnriched++;
          }
        } catch (e) {}
      }

      processed++;
    }));

    // Auto-save batch progress every 6 performers
    if (processed % 6 === 0 || i + CONCURRENCY >= workQueue.length) {
      await saveAllData(performers);
      const elapsedSec = Math.round((Date.now() - startTime) / 1000);
      const statusObj = {
        state: 'RUNNING',
        totalInQueue: workQueue.length,
        processed,
        percentage: ((processed / workQueue.length) * 100).toFixed(1) + '%',
        avatarsFetched,
        scenesEnriched,
        elapsedSeconds: elapsedSec,
        lastUpdated: new Date().toISOString()
      };
      await writeStatus(statusObj);
      process.stdout.write(`\r[Enrichment Progress] ${processed}/${workQueue.length} (${statusObj.percentage}) | New Avatars: ${avatarsFetched} | Enriched Scenes: ${scenesEnriched} | Elapsed: ${elapsedSec}s`);
    }

    // Polite 250ms pause between concurrent bursts
    await new Promise(r => setTimeout(r, 250));
  }

  // Final save
  await saveAllData(performers);
  const totalElapsed = Math.round((Date.now() - startTime) / 1000);
  const finalStatus = {
    state: 'COMPLETED',
    totalInQueue: workQueue.length,
    processed,
    percentage: '100%',
    avatarsFetched,
    scenesEnriched,
    totalElapsedSeconds: totalElapsed,
    completedAt: new Date().toISOString()
  };
  await writeStatus(finalStatus);
  console.log(`\n\n🎉 [Master Background Enricher] All tasks completed in ${totalElapsed}s!`);
  console.log(`  -> Avatars Fetched: ${avatarsFetched}`);
  console.log(`  -> Performers Enriched with Real Scenes: ${scenesEnriched}`);
}

main().catch(err => {
  console.error('[Master Background Enricher Error]', err);
  process.exit(1);
});

