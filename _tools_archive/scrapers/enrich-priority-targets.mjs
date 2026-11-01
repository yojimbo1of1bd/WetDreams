import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const AVATAR_DIRS = [
  path.resolve('avatars'),
  path.resolve('starlet-app/public/avatars')
];

async function ensureDirs() {
  for (const d of AVATAR_DIRS) {
    await fs.mkdir(d, { recursive: true });
  }
}

async function saveImage(id, buffer) {
  for (const dir of AVATAR_DIRS) {
    await fs.writeFile(path.join(dir, `${id}.jpg`), buffer);
  }
}

async function fetchAvatar(p) {
  const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // 1. Try FPO models page
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
            await saveImage(p.id, buf);
            return { id: p.id, status: 'saved_model_portrait', size: buf.length };
          }
        }
      }
    }
  } catch(e) {}

  // 2. Try Wikimedia Commons
  try {
    const cUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(p.name)}&srnamespace=6&format=json&origin=*`;
    const cRes = await fetch(cUrl, { headers: { 'User-Agent': 'StarletEnricher/1.0' } });
    if (cRes.ok) {
      const cData = await cRes.json();
      const files = cData.query?.search || [];
      const tokens = p.name.toLowerCase().split(/\s+/);
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
            await saveImage(p.id, buf);
            return { id: p.id, status: 'saved_commons_portrait', size: buf.length };
          }
        }
      }
    }
  } catch(e) {}

  // 3. Fallback: video thumbnail from FPO
  try {
    const sRes = await fetch(`https://www.fpo.xxx/search/${slug}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (sRes.ok) {
      const html = await sRes.text();
      const m = html.match(/(https:\/\/www\.fpo\.xxx\/contents\/videos_screenshots\/[^\s"']+\.jpg)/i);
      if (m) {
        const imgRes = await fetch(m[1], { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (imgRes.ok) {
          const buf = Buffer.from(await imgRes.arrayBuffer());
          if (buf.length > 1000) {
            await saveImage(p.id, buf);
            return { id: p.id, status: 'saved_scene_thumbnail', size: buf.length };
          }
        }
      }
    }
  } catch(e) {}

  return { id: p.id, status: 'failed' };
}

async function run() {
  await ensureDirs();
  const raw = await fs.readFile('performers-tagged.json', 'utf8');
  const performers = JSON.parse(raw);

  const targets = [
    'aidra-fox',
    'gina-gerson',
    'heather-harmon',
    'jenna-presley',
    'kagney-linn-karter',
    'kayden-kross',
    'liza-del-sierra',
    'luna-star',
    'misty-stone',
    'phoenix-marie',
    'priya-rai',
    'puma-swede',
    'savana-styles',
    'shae-marks'
  ];

  console.log(`Starting targeted enrichment for ${targets.length} performers...`);

  for (const tid of targets) {
    const p = performers.find(item => item.id === tid);
    if (!p) {
      console.log(`Target ${tid} not found in database!`);
      continue;
    }

    // 1. Fetch Avatar
    console.log(`[Avatar] Fetching headshot for ${p.name}...`);
    const aRes = await fetchAvatar(p);
    console.log(`  -> Avatar result:`, aRes);

    // 2. Fetch Verified Scenes
    console.log(`[Scenes] Fetching full filmography for ${p.name}...`);
    const scenes = await fetchPerformerScenes(p.name);
    console.log(`  -> Scenes found: ${scenes.length}`);
    if (scenes.length > 0) {
      p.scenes = scenes;
    }
  }

  // Save updated performers-tagged.json
  await fs.writeFile('performers-tagged.json', JSON.stringify(performers, null, 2), 'utf8');
  await fs.writeFile('starlet-app/public/performers-tagged.json', JSON.stringify(performers, null, 2), 'utf8');
  await fs.writeFile('starlet-app/dist/performers-tagged.json', JSON.stringify(performers, null, 2), 'utf8');
  console.log('Successfully updated performers-tagged.json across root, public, and dist!');
}

run().catch(console.error);

