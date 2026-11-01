// language: Node.js, file: download-posed-photos.mjs
/**
 * Posed Studio Photography Ingestion Pipeline
 * Sources high-resolution vertical posed portraits from PornPics and FPO Model Archives
 * and saves into ./poses/{id}.jpg for the 50/50 Full-Bleed FaceMash Arena.
 */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const POSE_DIRS = [
  path.resolve('poses'),
  path.resolve('starlet-app/public/poses'),
  path.resolve('starlet-app/dist/poses')
];

async function ensureDirs() {
  for (const d of POSE_DIRS) {
    await fs.mkdir(d, { recursive: true });
  }
}

async function savePoseJpg(id, buffer) {
  for (const dir of POSE_DIRS) {
    try {
      await fs.writeFile(path.join(dir, `${id}.jpg`), buffer);
    } catch (e) {}
  }
}

function cleanSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

async function fetchPosedImage(name, id) {
  const dest = path.join(POSE_DIRS[0], `${id}.jpg`);
  if (existsSync(dest)) {
    return { id, status: 'cached' };
  }

  const slugUnder = cleanSlug(name);
  const firstLetter = slugUnder[0] || 'a';
  const slugDash = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // 1. Try PornPics direct model portrait CDN
  try {
    const ppUrl = `https://cdni.pornpics.com/models/${firstLetter}/${slugUnder}.jpg`;
    const res = await fetch(ppUrl, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 2000 && buf[0] === 0xff && buf[1] === 0xd8) {
        await savePoseJpg(id, buf);
        return { id, status: 'pornpics_model', size: buf.length };
      }
    }
  } catch(e) {}

  // 2. Try FPO models page
  try {
    const fpoUrl = `https://www.fpo.xxx/models/${slugDash}/`;
    const res = await fetch(fpoUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(/(https:\/\/www\.fpo\.xxx\/contents\/models\/[^\s"']+\.jpg)/i);
      if (m) {
        const imgRes = await fetch(m[1], {
          signal: AbortSignal.timeout(5000),
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 2000) {
            await savePoseJpg(id, buf);
            return { id, status: 'fpo_model', size: buf.length };
          }
        }
      }
    }
  } catch(e) {}

  // 3. Fallback: Copy from local avatars if available
  const avatarPath = path.resolve('avatars', `${id}.jpg`);
  if (existsSync(avatarPath)) {
    try {
      const buf = await fs.readFile(avatarPath);
      if (buf.length > 1000) {
        await savePoseJpg(id, buf);
        return { id, status: 'copied_avatar', size: buf.length };
      }
    } catch(e) {}
  }

  return { id, status: 'failed' };
}

async function main() {
  await ensureDirs();
  const raw = await fs.readFile('performers-tagged.json', 'utf8');
  const performers = JSON.parse(raw);

  console.log(`Starting posed photo ingestion for ${performers.length} performers...`);

  let fetched = 0;
  let copied = 0;
  let cached = 0;
  let failed = 0;

  // Process top 250 most popular / hall of fame performers first
  const targetBatch = performers.slice(0, 250);
  const CONCURRENCY = 4;

  for (let i = 0; i < targetBatch.length; i += CONCURRENCY) {
    const chunk = targetBatch.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(p => fetchPosedImage(p.name, p.id)));

    for (const r of results) {
      if (r.status === 'pornpics_model' || r.status === 'fpo_model') fetched++;
      else if (r.status === 'copied_avatar') copied++;
      else if (r.status === 'cached') cached++;
      else failed++;
    }

    const progress = Math.min(i + CONCURRENCY, targetBatch.length);
    process.stdout.write(`\rProgress: ${progress}/${targetBatch.length} | Posed: ${fetched} | Avatar Fallback: ${copied} | Cached: ${cached}`);
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n\nInitial Posed Photo batch complete!');
  console.log(`  -> Fresh Studio Posed Photos: ${fetched}`);
  console.log(`  -> Avatar Copies: ${copied}`);
  console.log(`  -> Cached: ${cached}`);
}

main().catch(console.error);

