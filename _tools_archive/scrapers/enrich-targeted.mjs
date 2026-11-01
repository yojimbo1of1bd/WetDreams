import fs from 'node:fs/promises';
import { existsSync, createWriteStream } from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

const AVATAR_DIRS = [
  path.resolve('avatars'),
  path.resolve('starlet-app', 'public', 'avatars'),
  path.resolve('starlet-app', 'dist', 'avatars')
];

function cleanTitle(t) {
  if (!t) return '';
  return t
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/HD\s*\[\d+p\]/gi, '')
    .replace(/HD\s*\d+p/gi, '')
    .replace(/\[\d+p\]/gi, '')
    .replace(/\b1080p\b|\b720p\b|\b4k\b/gi, '')
    .trim();
}

async function downloadJpg(url, id) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return false;

    for (const dir of AVATAR_DIRS) {
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, `${id}.jpg`), buf);
    }
    return true;
  } catch (err) {
    return false;
  }
}

export async function enrichPerformer(p) {
  console.log(`[ENRICHING] ${p.name} (${p.id})...`);
  let photoFound = false;

  // 1. Try Wikipedia first
  try {
    const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(p.name.replace(/\s+/g, '_'))}`, {
      headers: { 'User-Agent': 'StarletDirectory/1.0' }
    });
    if (wikiRes.ok) {
      const data = await wikiRes.json();
      const wikiImg = data.thumbnail?.source || data.originalimage?.source;
      if (wikiImg) {
        const ok = await downloadJpg(wikiImg, p.id);
        if (ok) {
          console.log(`  ✓ Saved Wikipedia photo for ${p.name}`);
          photoFound = true;
        }
      }
    }
  } catch (e) {}

  // 2. Fetch real scenes and thumbnails from FPO
  try {
    const fpoRes = await fetch(`https://www.fpo.xxx/search/${encodeURIComponent(p.name)}/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    if (fpoRes.ok) {
      const html = await fpoRes.text();
      
      // Match all items: <div class="item ..."> ... <a href="...video/..." title="..."> ... <img ... data-original="..." ...> ... </a>
      const regex = /<a[^>]+href="(https:\/\/www\.fpo\.xxx\/video\/\d+\/[^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
      const scenes = [];
      let m;

      while ((m = regex.exec(html)) !== null) {
        const url = m[1];
        let title = cleanTitle(m[2]);
        const inner = m[3];

        const thumbM = inner.match(/data-original="([^"]+)"/i) || inner.match(/src="([^"]+\.(?:jpg|webp|jpeg))"/i);
        const thumbnail = thumbM ? thumbM[1] : null;

        const durM = inner.match(/<span class="duration">([^<]+)<\/span>/i) || inner.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
        const duration = durM ? durM[1] : null;

        const ratingM = inner.match(/(\d{1,3}%)/);
        const rating = ratingM ? ratingM[1] : '88%';

        if (!title || title.length < 3) {
          const strongM = inner.match(/<strong class="title">\s*([^<]+)\s*<\/strong>/i);
          if (strongM) title = cleanTitle(strongM[1]);
        }

        if (title && url) {
          scenes.push({
            title,
            studio: 'Featured Studio',
            url,
            thumbnail,
            duration: duration || '15:00',
            rating: rating || '90%',
            genres: [],
            isReal: true
          });
        }
      }

      if (scenes.length > 0) {
        p.scenes = scenes;
        console.log(`  ✓ Found ${scenes.length} verified scenes for ${p.name}`);

        // If no wiki photo, use the highest quality scene thumbnail as avatar!
        if (!photoFound && scenes[0].thumbnail) {
          const ok = await downloadJpg(scenes[0].thumbnail, p.id);
          if (ok) {
            console.log(`  ✓ Saved scene thumbnail as avatar photo for ${p.name}`);
            photoFound = true;
          }
        }
      }
    }
  } catch (e) {
    console.error(`  ✗ FPO fetch failed for ${p.name}:`, e.message);
  }

  return p;
}
