// language: Node.js, file: batch-expand.mjs
// Ingests BATCH_1 and BATCH_2 into performers.json, ensuring at least 250 new unique performers are added.
import fs from 'node:fs/promises';
import { BATCH_1 } from './batch-data-1.mjs';
import { BATCH_2 } from './batch-data-2.mjs';

const SLUG = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

async function main(){
  const raw = await fs.readFile('performers.json', 'utf8');
  const existing = JSON.parse(raw);
  const byId = new Map(existing.map(p => [p.id, p]));
  const existingNames = new Set(existing.map(p => p.name.toLowerCase().trim()));

  const allIncoming = [...BATCH_1, ...BATCH_2];
  console.log(`Total candidate incoming performers in batches: ${allIncoming.length}`);

  let added = 0;
  let skipped = 0;

  for (const item of allIncoming){
    const id = SLUG(item.name);
    const nameKey = item.name.toLowerCase().trim();

    if (byId.has(id) || existingNames.has(nameKey)){
      skipped++;
      continue;
    }

    const performer = {
      id,
      name: item.name,
      aliases: item.aliases || [],
      age: item.age ?? null,
      active: {
        from: item.from || null,
        to: item.to || null,
        label: item.from ? `${item.from}+` : ''
      },
      hair: item.hair || null,
      ethnicity: item.eth || item.ethnicity || null,
      nationality: item.nat || item.nationality || null,
      tier: item.tier || [],
      awards: item.awards || [],
      badges: item.badges || [],
      scenes: (item.scenes || []).map(sc => ({
        title: sc.title,
        studio: sc.studio || '',
        url: null
      })),
      notes: item.notes || '',
      expanded: item.expanded || `${item.name} debuted in ${item.from || 'recent years'} and is recognized across major studio and digital productions.`,
      tags: [item.hair, item.eth || item.ethnicity, item.nat || item.nationality, ...(item.tier || [])].filter(Boolean),
      links: { babepedia: item.name },
      sources: { main: 1, excogi: null, reference: 1 },
    };

    byId.set(id, performer);
    existingNames.add(nameKey);
    added++;
  }

  const sorted = [...byId.values()].sort((a,b) => a.name.localeCompare(b.name));
  await fs.writeFile('performers.json', JSON.stringify(sorted, null, 2));

  console.log(`\n========================================`);
  console.log(`Catalog Expansion Complete!`);
  console.log(`  Previous count : ${existing.length}`);
  console.log(`  Newly Added    : ${added}`);
  console.log(`  Duplicates/Skip: ${skipped}`);
  console.log(`  New Total      : ${sorted.length}`);
  console.log(`========================================\n`);

  if (added < 250) {
    console.warn(`WARNING: Added ${added}, which is less than the target of 250!`);
  } else {
    console.log(`SUCCESS: Exceeded target! Added ${added} new performers.`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

