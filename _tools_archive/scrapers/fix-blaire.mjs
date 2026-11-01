import fs from 'node:fs/promises';

async function fixBlaire() {
  const raw = await fs.readFile('performers.json', 'utf8');
  const performers = JSON.parse(raw);

  const ivoryIndex = performers.findIndex(p => p.id === 'blaire-ivory');
  if (ivoryIndex === -1) {
    console.log('blaire-ivory not found');
    return;
  }

  const ivory = performers[ivoryIndex];
  const allScenes = ivory.scenes || [];

  // Split scenes
  const johnsonScenes = [];
  const cleanIvoryScenes = [];

  for (const s of allScenes) {
    const text = `${s.title} ${s.fullTitle || ''} ${s.studio || ''} ${s.url || ''}`.toLowerCase();
    if (text.includes('blaire johnson') || text.includes('blaire-johnson')) {
      johnsonScenes.push(s);
    } else if (text.includes('jenna ivory')) {
      // Discard unrelated Jenna Ivory scenes
    } else {
      cleanIvoryScenes.push(s);
    }
  }

  console.log(`Separated scenes: ${cleanIvoryScenes.length} for Blaire Ivory, ${johnsonScenes.length} for Blaire Johnson`);

  // Update Blaire Ivory
  ivory.name = 'Blaire Ivory';
  ivory.aliases = ['Lena Anderson'];
  ivory.age = 28;
  ivory.hair = 'blonde';
  ivory.body = 'slim';
  ivory.ethnicity = 'caucasian';
  ivory.nationality = 'American';
  ivory.tier = ['fan-favorite', 'verified'];
  ivory.active = { from: 2017, to: null, label: 'Active 2017+ · Dallas, TX' };
  ivory.notes = 'Known widely under her performing alias Lena Anderson, famous for intense natural performances and fan-favorite status.';
  ivory.scenes = cleanIvoryScenes;
  ivory.links = {
    babepedia: 'https://www.babepedia.com/babe/Blaire_Ivory',
    iafd: 'https://www.iafd.com/person.rme/perfid=blaireivory'
  };

  // Create Blaire Johnson
  const johnson = {
    id: 'blaire-johnson',
    name: 'Blaire Johnson',
    aliases: [],
    age: 26,
    hair: 'blonde',
    body: 'busty',
    ethnicity: 'caucasian',
    nationality: 'American',
    tier: ['new-starlet', 'verified'],
    active: { from: 2022, to: null, label: 'Active 2022+' },
    notes: 'Contemporary starlet known for busty features, stepfamily storylines, and high-energy studio productions.',
    expanded: 'Frequently featured in premier family and romance studio features.',
    scenes: johnsonScenes,
    genres: ['stepmom', 'stepsis', 'family'],
    tags: ['blonde', 'busty', 'natural', 'stepmom'],
    awards: [],
    badges: ['rising-star'],
    links: {
      babepedia: 'https://www.babepedia.com/babe/Blaire_Johnson'
    },
    sources: { main: null, excogi: null, reference: 1 },
    coStars: []
  };

  performers[ivoryIndex] = ivory;
  performers.push(johnson);

  await fs.writeFile('performers.json', JSON.stringify(performers, null, 2));
  console.log(`✓ Updated performers.json. Total performers: ${performers.length}`);
}

fixBlaire();

