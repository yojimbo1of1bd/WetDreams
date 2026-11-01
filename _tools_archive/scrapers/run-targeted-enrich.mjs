import fs from 'node:fs/promises';
import path from 'node:path';
import { enrichPerformer } from './enrich-targeted.mjs';

async function main() {
  const jsonPath = path.resolve('starlet-app', 'public', 'performers-tagged.json');
  const performers = JSON.parse(await fs.readFile(jsonPath, 'utf8'));

  const priorityIds = [
    'nicole-aniston', 'myra-moans', 'gracie-gates', 'mackenzie-mace', 'jazmin-luv', 'lana-smalls',
    'rachel-starr', 'gianna-lynn', 'lauren-phillips', 'diana-prince',
    'octavia-red', 'scarlett-alexis', 'matty-mila-perez', 'kylie-rocket',
    'fiona-frost', 'honey-hayes', 'isabelle-ryan', 'merci-rose',
    'natalia-queen', 'kourtney-rae', 'sera-ryder', 'kiara-cole',
    'layla-price', 'summer-brooks', 'mandy-muse', 'rebel-lynn',
    'madi-collins', 'reese-robbins', 'scarlet-skies', 'selena-ivy',
    'alexis-adams', 'keena-james', 'alex-chance', 'alex-grey', 'adria-rae'
  ];

  console.log(`Starting targeted enrichment for ${priorityIds.length} priority starlets...`);

  for (const id of priorityIds) {
    const p = performers.find(x => x.id === id);
    if (!p) {
      console.log(`Performer ${id} not found in catalog.`);
      continue;
    }

    await enrichPerformer(p);
    // Short polite pause
    await new Promise(r => setTimeout(r, 600));
  }

  // Also write updated performers-tagged.json across all target directories
  const data = JSON.stringify(performers, null, 2);
  await fs.writeFile(jsonPath, data, 'utf8');
  await fs.writeFile(path.resolve('performers-tagged.json'), data, 'utf8');
  await fs.writeFile(path.resolve('starlet-app', 'dist', 'performers-tagged.json'), data, 'utf8');

  console.log('Successfully saved enriched performers-tagged.json!');
}

main();
