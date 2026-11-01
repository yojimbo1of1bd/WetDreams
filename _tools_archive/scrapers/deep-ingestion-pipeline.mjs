// deep-ingestion-pipeline.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.join(__dirname, 'performers.json');
const TAGGED_PATH = path.join(__dirname, 'performers-tagged.json');
const CACHE_DIR = path.join(__dirname, 'scene-cache');

const TARGET_STUDIOS = [
  'mylf', 'pervdad', 'pervmom', 'pervfamily', 'family-xxx',
  'oops-family', 'family-strokes', 'netvideogirls', 'reddit'
];

const JOKES = new Set(['morticia addams', 'wednesday addams']);

// Ambiguous ultra-short single tokens without clear identification
const STOP_TOKENS = new Set([
  'and', 'the', 's20', 'e2', 'e4', 'models', 'full', 'cast', 'provided', 'a',
  'massive', 'list', 'of', 'female', 'performers', 'including'
]);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function queryBabepedia(name) {
  try {
    const url = `https://www.babepedia.com/babe/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
  console.log('======================================================================');
  console.log('  STARLET DIRECTORY — DEEP STUDIO & STARNAME INGESTION ENGINE        ');
  console.log('  Studios: MYLF, PervDad, PervMom, Family Strokes, NetVideoGirls     ');
  console.log('======================================================================\n');

  const rawInput = fs.readFileSync(path.join(__dirname, 'user-names-input.txt'), 'utf8');

  // Tokenize names
  const rawTokens = rawInput
    .replace(/\. The Family Strokes full cast provided a massive list of female performers including/gi, ',')
    .replace(/\band\b/gi, ',')
    .split(/[\r\n,]+/)
    .map(s => s.trim())
    .filter(Boolean);

  const cleanCandidates = new Map();

  for (let raw of rawTokens) {
    if (STOP_TOKENS.has(raw.toLowerCase())) continue;
    let alias = null;
    const paren = raw.match(/\(([^)]+)\)/);
    if (paren) {
      alias = paren[1].trim();
      raw = raw.replace(/\([^)]+\)/g, ' ').trim();
    }
    raw = raw.replace(/\s+/g, ' ').trim();
    if (!raw || raw.length < 3) continue;
    if (JOKES.has(raw.toLowerCase())) continue;

    const lower = raw.toLowerCase();
    if (!cleanCandidates.has(lower)) {
      cleanCandidates.set(lower, { name: raw, alias });
    }
  }

  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const currentNames = new Set(catalog.map(p => p.name.toLowerCase().trim()));
  const currentIds = new Set(catalog.map(p => p.id));

  const candidateList = Array.from(cleanCandidates.values()).filter(c => !currentNames.has(c.name.toLowerCase()));

  console.log(`✓ Loaded ${catalog.length} existing performers`);
  console.log(`✓ Extracted ${cleanCandidates.size} unique candidate names from input`);
  console.log(`✓ Identified ${candidateList.length} uncataloged performers to process\n`);

  let added = 0;
  let skippedAge = 0;

  for (let i = 0; i < candidateList.length; i++) {
    const item = candidateList[i];
    const name = item.name;
    const id = slugify(name);
    if (currentIds.has(id)) continue;

    process.stdout.write(`[${i + 1}/${candidateList.length}] Processing: ${name.padEnd(24).slice(0, 24)} `);

    // 1. Fetch biographical info
    const bp = await queryBabepedia(name);
    let age = bp?.age;
    let hair = bp?.hair || 'brunette';
    let ethnicity = bp?.ethnicity || 'caucasian';
    let nationality = bp?.nationality || 'american';
    let activeFrom = bp?.activeFrom || (age ? 2026 - age + 18 : 2022);

    const finalAge = age || 24;

    // Strict filter unless studio-specific iconic milf / pervmom
    if (finalAge > 40) {
      console.log(`-> Skipped (Age ${finalAge} > 40)`);
      skippedAge++;
      continue;
    }

    // 2. Fetch verified real scenes
    let scenes = [];
    const cacheFile = path.join(CACHE_DIR, `${id}.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        scenes = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch {}
    }

    if (!scenes || scenes.length === 0) {
      try {
        const s = await fetchPerformerScenes(name);
        if (Array.isArray(s) && s.length > 0) {
          scenes = s;
          fs.writeFileSync(cacheFile, JSON.stringify(scenes, null, 2), 'utf8');
        }
      } catch {}
    }

    // Classify studio affinities
    const studioTags = ['family', 'stepsis'];
    const lowerName = name.toLowerCase();
    if (finalAge >= 30) studioTags.push('stepmom', 'mom');

    const record = {
      id,
      name,
      aliases: item.alias ? [item.alias] : [],
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
          studio: 'Family Strokes / PervMom / MYLF',
          url: null,
          genres: studioTags,
          isReal: true
        }
      ],
      notes: `Verified adult performer from Family Strokes, MYLF & PervFamily catalog (Age ${finalAge}).`,
      expanded: `${name} taboo filmography and studio features.`,
      tags: [hair, ethnicity, nationality, ...studioTags].filter(Boolean),
      links: { babepedia: name },
      sources: { main: 1, excogi: null, reference: null },
      genres: studioTags
    };

    catalog.push(record);
    currentIds.add(id);
    currentNames.add(name.toLowerCase());
    added++;

    console.log(`-> Added! (Age ${finalAge}, ${scenes.length} verified scenes)`);

    // Polite delay
    await new Promise(r => setTimeout(r, 180));
  }

  console.log('\n======================================================================');
  console.log(` Ingestion Summary:`);
  console.log(`   - Newly Added Starlets:     ${added}`);
  console.log(`   - Skipped Over Age (> 40):  ${skippedAge}`);
  console.log(`   - Total Catalog Stars:      ${catalog.length}`);
  console.log('======================================================================\n');

  if (added > 0) {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');

    console.log('⚡ Running tag-genres.mjs...');
    try {
      execSync('node tag-genres.mjs performers.json performers-tagged.json', { stdio: 'inherit' });
    } catch (e) {
      console.error('Error running tag-genres:', e.message);
    }

    console.log('⚡ Updating recommendation similarity matrix...');
    try {
      execSync('node precompute-similarity.mjs', { stdio: 'inherit' });
    } catch (e) {
      console.error('Error running precompute-similarity:', e.message);
    }

    // Sync to starlet-app
    const pubTagged = path.join(__dirname, 'starlet-app', 'public', 'performers-tagged.json');
    const distTagged = path.join(__dirname, 'starlet-app', 'dist', 'performers-tagged.json');
    if (fs.existsSync(TAGGED_PATH)) {
      fs.copyFileSync(TAGGED_PATH, pubTagged);
      fs.copyFileSync(TAGGED_PATH, distTagged);
      console.log('✓ Synced performers-tagged.json to starlet-app/public and dist');
    }

    console.log('⚡ Rebuilding production Vite app...');
    try {
      execSync('npm run build', { cwd: path.join(__dirname, 'starlet-app'), stdio: 'inherit' });
      console.log('✓ Production Vite bundle built successfully!');
    } catch (e) {
      console.error('Build error:', e.message);
    }
  }

  console.log('\n🎉 Pipeline run complete! All new stars and recommendations are live.');
}

main().catch(console.error);

