// language: Node.js, file: batch-expand-3.mjs
import fs from 'node:fs/promises';
import { BATCH_3 } from './batch-data-3.mjs';

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function main() {
  const existingRaw = await fs.readFile('performers.json', 'utf8');
  const existing = JSON.parse(existingRaw);

  const seenIds = new Set(existing.map(p => p.id));
  const seenNames = new Set(existing.map(p => p.name.toLowerCase().trim()));

  let addedCount = 0;
  let updatedCount = 0;

  for (const item of BATCH_3) {
    const id = item.id || slugify(item.name);
    const nameLower = item.name.toLowerCase().trim();

    if (seenIds.has(id) || seenNames.has(nameLower)) {
      // Performer exists: merge or update fields
      const idx = existing.findIndex(p => p.id === id || p.name.toLowerCase().trim() === nameLower);
      if (idx !== -1) {
        existing[idx] = {
          ...existing[idx],
          ...item,
          scenes: Array.from(new Set([...(existing[idx].scenes || []), ...(item.scenes || [])])),
          awards: Array.from(new Set([...(existing[idx].awards || []), ...(item.awards || [])])),
          badges: Array.from(new Set([...(existing[idx].badges || []), ...(item.badges || [])]))
        };
        updatedCount++;
      }
    } else {
      existing.push({
        id,
        ...item
      });
      seenIds.add(id);
      seenNames.add(nameLower);
      addedCount++;
    }
  }

  await fs.writeFile('performers.json', JSON.stringify(existing, null, 2), 'utf8');
  console.log(`Ingested Batch 3!`);
  console.log(`  Newly added: ${addedCount}`);
  console.log(`  Updated/Enriched: ${updatedCount}`);
  console.log(`  Total performers now: ${existing.length}`);
}

main().catch(console.error);

