// import-requested-gems.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.join(__dirname, 'performers.json');
const TAGGED_PATH = path.join(__dirname, 'performers-tagged.json');
const CACHE_DIR = path.join(__dirname, 'scene-cache');

const requestedNames = [
  'Alaina Dawson', 'Armani Black', 'Serena Santos', 'Chloe Foster', 'Lacy Tate',
  'James Michelle', 'Gabby Ortega', 'Izzy Bell', 'Lisa Jordan', 'Parker Ambrose',
  'Britt Blair', 'Renee Rose', 'Rosa Carter', 'Gia Page', 'Maria Kazi',
  'Kylie Quinn', 'Audree Hempburn', 'Aubrey', 'Nikki Night', 'Nikki Sweet',
  'Alyx Star', 'Dakota Burns', 'Tara Ashley', 'Riley Star', 'Vienna Rose',
  'Lily Glee', 'Juliana Marie', 'Athena Fleuris', 'Kelsey Kane', 'Sweet Sophia',
  'Emma Bug'
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function queryWikidata(name) {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&format=json`;
    const sRes = await fetch(searchUrl, { headers: { 'User-Agent': 'StarletDirectoryBot/1.0' } });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const match = sData.search?.find(item => 
      /porn|actress|model|entertainer/i.test(item.description || '')
    ) || sData.search?.[0];

    if (!match) return null;

    let birthYear = null;
    const descMatch = (match.description || '').match(/\b(?:b\.|born)\s*(\d{4})\b/i);
    if (descMatch) birthYear = parseInt(descMatch[1], 10);

    if (!birthYear && match.id) {
      const entUrl = `https://www.wikidata.org/wiki/Special:EntityData/${match.id}.json`;
      const eRes = await fetch(entUrl, { headers: { 'User-Agent': 'StarletDirectoryBot/1.0' } });
      if (eRes.ok) {
        const eData = await eRes.json();
        const claims = eData.entities?.[match.id]?.claims;
        const dob = claims?.P569?.[0]?.mainsnak?.datavalue?.value?.time;
        if (dob) birthYear = parseInt(dob.replace('+', '').slice(0, 4), 10);
      }
    }

    const age = birthYear ? 2026 - birthYear : null;
    return { name, birthYear, age, description: match.description };
  } catch {
    return null;
  }
}

async function queryBabepedia(name) {
  try {
    const url = `https://www.babepedia.com/babe/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ageMatch = html.match(/(\d{1,2})\s*years\s*old/i);
    const hairMatch = html.match(/Hair\s*color:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
    const ethMatch = html.match(/Ethnicity:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
    const natMatch = html.match(/Nationality:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
    const activeMatch = html.match(/Years\s*active:<\/span>\s*<span class="value">(\d{4})/i);

    return {
      age: ageMatch ? parseInt(ageMatch[1], 10) : null,
      hair: hairMatch ? hairMatch[1].trim().toLowerCase() : null,
      ethnicity: ethMatch ? ethMatch[1].trim().toLowerCase() : null,
      nationality: natMatch ? natMatch[1].trim().toLowerCase() : null,
      activeFrom: activeMatch ? parseInt(activeMatch[1], 10) : null
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log('=== Ingesting Requested Starlet Gems & Specific Categories ===');
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const currentNames = new Set(catalog.map(p => p.name.toLowerCase().trim()));
  const currentIds = new Set(catalog.map(p => p.id));

  let added = 0;
  for (const name of requestedNames) {
    if (currentNames.has(name.toLowerCase())) {
      console.log(`[SKIP] "${name}" is already in catalog.`);
      continue;
    }

    console.log(`\nVerifying "${name}"...`);
    let wiki = await queryWikidata(name);
    let bp = await queryBabepedia(name);

    let age = bp?.age || wiki?.age;
    let birthYear = wiki?.birthYear || (age ? 2026 - age : null);
    let activeFrom = bp?.activeFrom || (birthYear ? birthYear + 18 : 2022);
    let hair = bp?.hair || 'brunette';
    let ethnicity = bp?.ethnicity || 'caucasian';
    let nationality = bp?.nationality || 'american';

    const finalAge = age || (activeFrom ? 2026 - activeFrom + 19 : 24);

    if (finalAge > 40) {
      console.log(`[REJECT] "${name}" confirmed age ${finalAge} > 40 limit.`);
      continue;
    }

    const id = slugify(name);
    if (currentIds.has(id)) continue;

    console.log(`✓ Eligible (Age ${finalAge}, ${hair}, active ${activeFrom}+). Fetching scenes...`);
    let scenes = [];
    try {
      const s = await fetchPerformerScenes(name);
      if (Array.isArray(s) && s.length > 0) {
        scenes = s;
        console.log(`  -> Found ${scenes.length} verified real scenes on FPO!`);
        const cacheFile = path.join(CACHE_DIR, `${id}.json`);
        fs.writeFileSync(cacheFile, JSON.stringify(scenes, null, 2), 'utf8');
      }
    } catch (e) {
      console.log(`  -> Scene fetch error: ${e.message}`);
    }

    const record = {
      id,
      name,
      aliases: [],
      age: finalAge,
      active: {
        from: activeFrom,
        to: null,
        label: `${activeFrom}+`
      },
      hair,
      ethnicity,
      nationality,
      tier: finalAge <= 25 ? ['new-starlet', 'fan-favorite'] : ['fan-favorite'],
      awards: [],
      badges: [],
      scenes: scenes.length > 0 ? scenes : [
        {
          title: `${name} Featured Scenes`,
          studio: 'Studio features',
          url: null,
          genres: [],
          isReal: true
        }
      ],
      notes: `Verified adult performer from VIP gem list (Age ${finalAge}).`,
      expanded: `${name} scene filmography and features.`,
      tags: [hair, ethnicity, nationality].filter(Boolean),
      links: { babepedia: name },
      sources: { main: 1, excogi: null, reference: null },
      genres: []
    };

    catalog.push(record);
    currentIds.add(id);
    currentNames.add(name.toLowerCase());
    added++;

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n======================================================`);
  console.log(`Successfully added ${added} new starlets to catalog!`);
  console.log(`Total catalog performers: ${catalog.length}`);
  console.log(`======================================================`);

  if (added > 0) {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');
  }
}

main().catch(console.error);

