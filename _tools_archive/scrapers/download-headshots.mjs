// language: Node.js, file: download-headshots.mjs
// Downloads performer headshot avatars into local ./avatars/ folder for 100% offline browsing.
// Usage: node download-headshots.mjs [limit]
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const AVATAR_DIR = path.resolve('avatars');

async function downloadAvatar(name, id) {
  const dest = path.join(AVATAR_DIR, `${id}.jpg`);
  if (existsSync(dest)) {
    return { id, status: 'cached' };
  }

  const url = `https://www.babepedia.com/pics/${encodeURIComponent(name.replace(/\s+/g, '_'))}.jpg`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) {
      return { id, status: 'not_found', code: res.status };
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    // Only save if it's a real JPEG (starts with FF D8)
    if (buffer.length > 500 && buffer[0] === 0xff && buffer[1] === 0xd8) {
      await fs.writeFile(dest, buffer);
      return { id, status: 'downloaded', size: buffer.length };
    } else {
      return { id, status: 'invalid_image' };
    }
  } catch (err) {
    return { id, status: 'error', error: err.message };
  }
}

async function main() {
  await fs.mkdir(AVATAR_DIR, { recursive: true });

  const raw = await fs.readFile('performers.json', 'utf8');
  const performers = JSON.parse(raw);
  const limit = parseInt(process.argv[2], 10) || performers.length;
  const targetPool = performers.slice(0, limit);

  console.log(`Starting avatar download for ${targetPool.length} performers (saving to ./avatars/)...`);

  let downloaded = 0;
  let cached = 0;
  let missing = 0;

  // Process in small batches of 6 concurrent downloads
  const BATCH_SIZE = 6;
  for (let i = 0; i < targetPool.length; i += BATCH_SIZE) {
    const batch = targetPool.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(p => downloadAvatar(p.name, p.id)));

    for (const r of results) {
      if (r.status === 'downloaded') downloaded++;
      else if (r.status === 'cached') cached++;
      else missing++;
    }

    const progress = Math.min(i + BATCH_SIZE, targetPool.length);
    process.stdout.write(`\rProgress: ${progress}/${targetPool.length} | New: ${downloaded} | Cached: ${cached} | Missing/Fallback: ${missing}`);
    // Brief courtesy pause between batches
    await new Promise(r => setTimeout(r, 120));
  }

  console.log('\n\nAvatar download run completed!');
  console.log(`  Downloaded: ${downloaded}`);
  console.log(`  Already Cached: ${cached}`);
  console.log(`  Missing/Initial Fallback: ${missing}`);
  console.log(`Avatars directory: ${AVATAR_DIR}\n`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

