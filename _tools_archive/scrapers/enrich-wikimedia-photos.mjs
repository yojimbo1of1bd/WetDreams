// language: Node.js, file: enrich-wikimedia-photos.mjs
// Searches Wikimedia Commons / Wikipedia API for high-resolution portraits of performers
// and saves real photographic JPEGs directly into ./avatars/{id}.jpg
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const AVATAR_DIR = path.resolve('avatars');

async function searchCommonsPhoto(name) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&srnamespace=6&format=json&origin=*`;
    const res = await fetch(url, { headers: { 'User-Agent': 'StarletEnricher/1.0' } });
    if (!res.ok) return null;
    const data = await res.json();
    const files = data.query?.search || [];
    
    // Look for files matching the performer's name
    const nameTokens = name.toLowerCase().split(/\s+/);
    const matched = files.filter(f => {
      const title = f.title.toLowerCase();
      // Must contain at least primary surname/firstname and look like an image
      return nameTokens.every(tok => title.includes(tok)) &&
             (title.endsWith('.jpg') || title.endsWith('.jpeg') || title.endsWith('.png'));
    });

    if (matched.length > 0) {
      const chosen = matched[0].title.replace(/^File:/i, '');
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(chosen)}?width=400`;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function searchWikipediaPhoto(name) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'StarletEnricher/1.0' } });
    if (res.ok) {
      const data = await res.json();
      return data.thumbnail?.source || data.originalimage?.source || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

async function downloadPhoto(p) {
  const destJpg = path.join(AVATAR_DIR, `${p.id}.jpg`);
  if (existsSync(destJpg)) {
    return { id: p.id, status: 'already_have' };
  }

  // 1. Try Wikipedia summary
  let photoUrl = await searchWikipediaPhoto(p.name);

  // 2. Try Commons file search
  if (!photoUrl) {
    photoUrl = await searchCommonsPhoto(p.name);
  }

  if (!photoUrl) {
    return { id: p.id, status: 'no_photo' };
  }

  try {
    const imgRes = await fetch(photoUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!imgRes.ok) return { id: p.id, status: 'fetch_failed' };

    const buf = Buffer.from(await imgRes.arrayBuffer());
    if (buf.length > 1000) {
      await fs.writeFile(destJpg, buf);
      return { id: p.id, status: 'saved', bytes: buf.length };
    }
  } catch (e) {
    return { id: p.id, status: 'error', msg: e.message };
  }
  return { id: p.id, status: 'failed' };
}

async function main() {
  await fs.mkdir(AVATAR_DIR, { recursive: true });
  const performers = JSON.parse(await fs.readFile('performers.json', 'utf8'));

  console.log(`Searching Wikimedia Commons and Wikipedia for performer portraits (${performers.length} performers)...`);
  let saved = 0;
  let skipped = 0;

  const BATCH_SIZE = 8;
  for (let i = 0; i < performers.length; i += BATCH_SIZE) {
    const batch = performers.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(downloadPhoto));
    for (const r of results) {
      if (r.status === 'saved') saved++;
      else skipped++;
    }
    process.stdout.write(`\rProgress: ${Math.min(i + BATCH_SIZE, performers.length)}/${performers.length} | Photos saved: ${saved}`);
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nPortrait enrichment complete! Total photo portraits saved to ./avatars/: ${saved}`);
}

main().catch(console.error);

