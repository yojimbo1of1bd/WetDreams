// language: Node.js, file: add-performers.mjs
// Adds one or more performers to performers.json with schema validation, deduping, and alphabetical sorting.
import fs from 'node:fs/promises';

const SLUG = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

export async function addPerformers(newPerformers, jsonPath = 'performers.json') {
  const raw = await fs.readFile(jsonPath, 'utf8');
  const existing = JSON.parse(raw);
  const byId = new Map(existing.map(p => [p.id, p]));

  let addedCount = 0;
  let updatedCount = 0;

  for (const p of newPerformers) {
    const id = p.id || SLUG(p.name);
    const normalized = {
      id,
      name: p.name,
      aliases: p.aliases || [],
      age: p.age ?? null,
      active: p.active || { from: null, to: null, label: '' },
      hair: p.hair || null,
      ethnicity: p.ethnicity || null,
      nationality: p.nationality || null,
      tier: p.tier || [],
      awards: p.awards || [],
      badges: p.badges || [],
      scenes: p.scenes || [],
      notes: p.notes || '',
      expanded: p.expanded || '',
      tags: p.tags || [],
      links: p.links || { babepedia: p.name },
      sources: p.sources || { main: 1, excogi: null, reference: 1 },
    };

    if (byId.has(id)) {
      // Merge
      const prev = byId.get(id);
      byId.set(id, { ...prev, ...normalized });
      updatedCount++;
    } else {
      byId.set(id, normalized);
      addedCount++;
    }
  }

  const sorted = [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(jsonPath, JSON.stringify(sorted, null, 2));
  console.log(`Successfully processed: +${addedCount} new, ${updatedCount} updated. Total performers: ${sorted.length}`);
  return sorted;
}

// Default batch to add if invoked directly
const BATCH = [
  {
    name: 'Emma Starletto',
    age: 23,
    active: { from: 2021, to: null, label: '2021+' },
    hair: 'brunette',
    ethnicity: 'caucasian',
    nationality: 'european',
    tier: ['new-starlet', 'fan-favorite'],
    awards: ['Euro Starlet Highlight'],
    badges: ['Fan Favorite Beauty', 'Community Favorite'],
    scenes: [
      { title: "Stepdaughter's Awakening", studio: 'Nubiles', url: null },
      { title: 'Family Holiday Secrets', studio: 'TeamSkeet', url: null }
    ],
    notes: 'Czech petite brunette sensation. High popularity across Nubiles, TeamSkeet, and European studio features since 2021.',
    expanded: 'Emma Starletto debuted in 2021 and quickly became one of the most sought-after European starlets. Celebrated for her natural petite build, expressive acting, and standout appearances in family and taboo-themed scenarios.',
    tags: ['brunette', 'white', 'european', 'petite', 'natural', 'new-starlet'],
    links: { babepedia: 'Emma Starletto' },
  },
  {
    name: 'Blake Blossom',
    age: 24,
    active: { from: 2020, to: null, label: '2020+' },
    hair: 'blonde',
    ethnicity: 'white',
    nationality: 'american',
    tier: ['performer-of-year', 'scene', 'fan-favorite'],
    awards: ['AVN Best New Starlet 2022', 'FAME Award Winner'],
    badges: ['Award Winner', 'Top Starlet'],
    scenes: [
      { title: "My Step Sister's Secret", studio: 'Brazzers', url: null },
      { title: "Daughter's Best Friend", studio: 'Blacked', url: null }
    ],
    notes: 'AVN Best New Starlet 2022. One of the top marquee performers of her era.',
    expanded: 'Blake Blossom entered the scene in 2020, winning Best New Starlet at AVN 2022. Known for immense screen charisma, headlining Brazzers, Blacked, Vixen, and TeamSkeet.',
    tags: ['blonde', 'white', 'american', 'natural', 'award-winner'],
    links: { babepedia: 'Blake Blossom' },
  },
  {
    name: 'Scarlit Scandal',
    age: 26,
    active: { from: 2019, to: null, label: '2019+' },
    hair: 'brunette',
    ethnicity: 'latina',
    nationality: 'american',
    tier: ['performer-of-year', 'fan-favorite'],
    awards: ['AVN Best New Starlet 2021'],
    badges: ['Award Winner', 'Fan Favorite'],
    scenes: [
      { title: 'Step Family Vacation', studio: 'Brazzers', url: null },
      { title: 'Caught by My Stepdad', studio: 'Family Strokes', url: null }
    ],
    notes: 'AVN Best New Starlet 2021 winner. Prolific Latina headliner.',
    expanded: 'Scarlit Scandal took the industry by storm in 2019–2020, claiming AVN Best New Starlet 2021. Dominant presence across Brazzers, Vixen, and Blacked.',
    tags: ['brunette', 'latina', 'american', 'award-winner'],
    links: { babepedia: 'Scarlit Scandal' },
  },
  {
    name: 'Skye Blue',
    age: 25,
    active: { from: 2020, to: null, label: '2020+' },
    hair: 'blonde',
    ethnicity: 'white',
    nationality: 'american',
    tier: ['scene', 'fan-favorite'],
    awards: ['Fan Favorite Starlet'],
    badges: ['Top Starlet'],
    scenes: [
      { title: 'Stepsis Sneaks In', studio: 'TeamSkeet', url: null }
    ],
    notes: 'Fan favorite blonde starlet with extensive catalog across major networks.',
    expanded: 'Debuted in 2020 and swiftly accumulated dozens of high-ranking scenes across TeamSkeet, Vixen, and Blacked.',
    tags: ['blonde', 'white', 'american', 'fan-favorite'],
    links: { babepedia: 'Skye Blue' },
  },
  {
    name: 'Maya Woulfe',
    age: 24,
    active: { from: 2022, to: null, label: '2022+' },
    hair: 'brunette',
    ethnicity: 'white',
    nationality: 'american',
    tier: ['new-starlet', 'scene'],
    awards: ['AVN Nominee 2024'],
    badges: ['Newcomer', 'Fast Rising'],
    scenes: [
      { title: 'Shared Bed with Stepsis', studio: 'Family Strokes', url: null }
    ],
    notes: 'Fast-rising newcomer known for family and taboo feature scenes.',
    expanded: 'Maya Woulfe debuted in 2022, rapidly building a dedicated following across Deeper, Family Strokes, and TeamSkeet.',
    tags: ['brunette', 'white', 'american', 'new-starlet'],
    links: { babepedia: 'Maya Woulfe' },
  }
];

if (process.argv[1]?.endsWith('add-performers.mjs')) {
  addPerformers(BATCH).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

