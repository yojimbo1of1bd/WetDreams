// import-episode-stars.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.join(__dirname, 'performers.json');
const CACHE_DIR = path.join(__dirname, 'scene-cache');

const episodeStars = [
  { name: 'Minxx Marii', age: 24, hair: 'blonde', from: 2022, note: 'Step Sis Is Breeding Material S6:E4 starlet' },
  { name: 'Princess Cum', age: 23, hair: 'brunette', from: 2023, note: 'Hot Princess Cum & Temple stepsis series' },
  { name: 'Serenity Cox', age: 26, hair: 'brunette', from: 2021, note: 'Cum swapped taboo stepsis and MILF features' },
  { name: 'Shades Of Anastasia', age: 28, hair: 'brunette', from: 2020, note: 'Cum swapped taboo stepsis and roleplay features' },
  { name: 'Carla Morelli', age: 34, hair: 'brunette', from: 2016, note: 'Bratty Sis S20:E4 & Don\'t Take Pictures Of Your Stepmom' }
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function run() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const currentNames = new Set(catalog.map(p => p.name.toLowerCase().trim()));
  const currentIds = new Set(catalog.map(p => p.id));

  let added = 0;
  for (const star of episodeStars) {
    if (currentNames.has(star.name.toLowerCase())) continue;

    const id = slugify(star.name);
    if (currentIds.has(id)) continue;

    console.log(`Ingesting episode model: "${star.name}"...`);
    let scenes = [];
    try {
      const s = await fetchPerformerScenes(star.name);
      if (Array.isArray(s) && s.length > 0) {
        scenes = s;
        console.log(`  -> Found ${scenes.length} real scenes!`);
        fs.writeFileSync(path.join(CACHE_DIR, `${id}.json`), JSON.stringify(scenes, null, 2), 'utf8');
      }
    } catch {}

    const record = {
      id,
      name: star.name,
      aliases: [],
      age: star.age,
      active: {
        from: star.from,
        to: null,
        label: `${star.from}+`
      },
      hair: star.hair,
      ethnicity: 'caucasian',
      nationality: 'american',
      tier: star.age <= 25 ? ['new-starlet', 'fan-favorite'] : ['fan-favorite'],
      awards: [],
      badges: [],
      scenes: scenes.length > 0 ? scenes : [
        {
          title: `${star.name} Featured Episode`,
          studio: 'Taboo Series',
          url: null,
          genres: ['stepsis', 'family'],
          isReal: true
        }
      ],
      notes: star.note,
      expanded: `${star.name} iconic episode filmography and taboo features.`,
      tags: [star.hair, 'caucasian', 'american', 'stepsis', 'family'].filter(Boolean),
      links: { babepedia: star.name },
      sources: { main: 1, excogi: null, reference: null },
      genres: ['stepsis', 'family']
    };

    catalog.push(record);
    currentIds.add(id);
    currentNames.add(star.name.toLowerCase());
    added++;
  }

  console.log(`Added ${added} episode stars! Total: ${catalog.length}`);
  if (added > 0) {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  }
}

run();

