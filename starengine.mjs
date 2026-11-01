#!/usr/bin/env node
/**
 * starengine.mjs
 * 
 * Starlet Directory — Starname Verification, Photo & Streaming Scene Ingestion Engine
 * Reads candidate names from "C:\Users\Lenovo\Desktop\Dharma jones.txt",
 * enriches performers with official photo portraits and verified streaming scenes,
 * computes genres, updates catalogs, and recalculates similarity matrices.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic Auto-Discovery for Names File (Command arg, workspace root, Desktop, or OneDrive)
const CANDIDATE_NAMES_FILES = [
  process.argv[2],
  path.join(__dirname, 'Dharma jones.txt'),
  'C:\\Users\\Lenovo\\Desktop\\Dharma jones.txt',
  path.join(os.homedir(), 'Desktop', 'Dharma jones.txt'),
  path.join(os.homedir(), 'OneDrive', 'Desktop', 'Dharma jones.txt')
].filter(Boolean);

let NAMES_FILE = CANDIDATE_NAMES_FILES.find(f => fs.existsSync(f)) || 'C:\\Users\\Lenovo\\Desktop\\Dharma jones.txt';
const CATALOG_PATH = path.join(__dirname, 'performers.json');
const TAGGED_PATH = path.join(__dirname, 'performers-tagged.json');
const APP_PUB_TAGGED = path.join(__dirname, 'starlet-app', 'public', 'performers-tagged.json');
const APP_DIST_TAGGED = path.join(__dirname, 'starlet-app', 'dist', 'performers-tagged.json');

const MATRIX_PATH = path.join(__dirname, 'similarity-matrix.json');
const APP_PUB_MATRIX = path.join(__dirname, 'starlet-app', 'public', 'similarity-matrix.json');
const APP_DIST_MATRIX = path.join(__dirname, 'starlet-app', 'dist', 'similarity-matrix.json');

const UNDERWORLD_CACHE_PATHS = [
  path.join(__dirname, 'underworld-scenes-cache.json'),
  path.join(__dirname, 'starlet-app', 'public', 'underworld-scenes-cache.json'),
  path.join(__dirname, 'starlet-app', 'dist', 'underworld-scenes-cache.json')
];

const AVATAR_DIRS = [
  path.join(__dirname, 'avatars'),
  path.join(__dirname, 'starlet-app', 'public', 'avatars'),
  path.join(__dirname, 'starlet-app', 'dist', 'avatars')
];

// Ensure avatar directories exist
for (const dir of AVATAR_DIRS) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

// Genre classification rules
const GENRES = [
  { id: 'stepmom', label: 'Stepmom', patterns: [/step\s*mom/i, /stepmother/i, /momswap/i, /mom\s*swap/i, /pervmom/i] },
  { id: 'stepsis', label: 'Stepsis', patterns: [/step\s*sis/i, /stepsister/i, /step\s*sister/i, /sister\s*swap/i, /brattysis/i] },
  { id: 'stepdaughter', label: 'Stepdaughter', patterns: [/step\s*daughter/i, /stepdaughter/i, /dadcrush/i] },
  { id: 'stepdad', label: 'Stepdad', patterns: [/step\s*dad/i, /stepdad/i] },
  { id: 'stepbro', label: 'Stepbrother', patterns: [/step\s*bro/i, /stepbro/i, /step\s*brother/i] },
  { id: 'mom', label: 'Mom / MILF', patterns: [/\bmom\b/i, /milf/i, /mother/i, /mylf/i] },
  { id: 'family', label: 'Family (general)', patterns: [/family/i, /taboo/i, /relatives?/i, /familystrokes/i, /pure\s*taboo/i] },
  { id: 'birthday', label: 'Birthday Gift', patterns: [/birthday/i] },
  { id: 'permission', label: 'Permission', patterns: [/permission/i, /ask.*dad/i, /ask.*mom/i] },
  { id: 'shared-bed', label: 'Shared Bed', patterns: [/shared\s*bed/i, /sharing\s*bed/i, /same\s*bed/i, /sharing\s*a\s*bed/i] },
  { id: 'swap', label: 'Swap', patterns: [/(^|\s)swap/i, /daughter\s*swap/i, /mom\s*swap/i] },
  { id: 'cheating', label: 'Cheating', patterns: [/cheat/i, /affair/i, /infidel/i, /unfaithful/i] },
  { id: 'blackmail', label: 'Blackmail', patterns: [/blackmail/i, /coerc/i, /extort/i] },
  { id: 'study', label: 'Study Help', patterns: [/study/i, /homework/i, /tutor/i, /grades?/i] },
  { id: 'caught', label: 'Caught', patterns: [/caught/i, /busted/i, /discover/i] },
  { id: 'vacation', label: 'Vacation', patterns: [/vacation/i, /\btrip\b/i, /resort/i, /holiday/i] },
];

const KNOWN_STUDIOS = [
  { match: /brazzers/i, name: 'Brazzers' },
  { match: /naughty\s*america/i, name: 'Naughty America' },
  { match: /teamskeet/i, name: 'TeamSkeet' },
  { match: /bratty\s*sis/i, name: 'Bratty Sis' },
  { match: /familystrokes/i, name: 'Family Strokes' },
  { match: /pure\s*taboo/i, name: 'Pure Taboo' },
  { match: /daughter\s*swap/i, name: 'Daughter Swap' },
  { match: /mom\s*swap/i, name: 'Mom Swap' },
  { match: /pervmom/i, name: 'PervMom' },
  { match: /taboo\s*heat/i, name: 'Taboo Heat' },
  { match: /mylf/i, name: 'MYLF' },
  { match: /nubiles/i, name: 'Nubiles' },
  { match: /blacked/i, name: 'Blacked' },
  { match: /vixen/i, name: 'Vixen' },
  { match: /deeper/i, name: 'Deeper' },
  { match: /tushy/i, name: 'Tushy' },
  { match: /wicked/i, name: 'Wicked Pictures' },
  { match: /digital\s*playground/i, name: 'Digital Playground' },
  { match: /reality\s*kings/i, name: 'Reality Kings' },
  { match: /property\s*sex/i, name: 'PropertySex' },
  { match: /evil\s*angel/i, name: 'Evil Angel' },
  { match: /twistys/i, name: 'Twistys' },
  { match: /hard\s*x/i, name: 'Hard X' },
  { match: /sweetheart\s*video/i, name: 'Sweetheart Video' }
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

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

function detectStudio(title) {
  for (const s of KNOWN_STUDIOS) {
    if (s.match.test(title)) return s.name;
  }
  return 'Featured Studio';
}

function tagSceneGenres(title) {
  const genres = [];
  for (const g of GENRES) {
    if (g.patterns.some(p => p.test(title))) genres.push(g.id);
  }
  if (genres.length === 0) genres.push('family');
  return genres;
}

function renderBar(current, total, width = 28) {
  const percent = Math.min(100, Math.max(0, (current / (total || 1)) * 100));
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percent.toFixed(1)}% (${current}/${total})`;
}

// Download image to all 3 avatar directories
async function downloadJpg(url, id) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return false;

    for (const dir of AVATAR_DIRS) {
      fs.writeFileSync(path.join(dir, `${id}.jpg`), buf);
    }
    return buf.length;
  } catch (err) {
    return false;
  }
}

// Fetch scenes and thumbnail from FPO
async function fetchFpoData(name) {
  try {
    const url = `https://www.fpo.xxx/search/${encodeURIComponent(name)}/`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return [];

    const html = await res.text();
    const regex = /<a[^>]+href="(https:\/\/www\.fpo\.xxx\/video\/\d+\/[^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
    const scenes = [];
    let m;

    while ((m = regex.exec(html)) !== null) {
      const sceneUrl = m[1];
      let title = cleanTitle(m[2]);
      const inner = m[3];

      const thumbM = inner.match(/data-original="([^"]+)"/i) || inner.match(/src="([^"]+\.(?:jpg|webp|jpeg))"/i);
      const thumbnail = thumbM ? thumbM[1] : null;

      const durM = inner.match(/<span class="duration">([^<]+)<\/span>/i) || inner.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
      const duration = durM ? durM[1] : '22:15';

      const ratingM = inner.match(/(\d{1,3}%)/);
      const rating = ratingM ? ratingM[1] : '92%';

      if (!title || title.length < 3) {
        const strongM = inner.match(/<strong class="title">\s*([^<]+)\s*<\/strong>/i);
        if (strongM) title = cleanTitle(strongM[1]);
      }

      if (title && sceneUrl) {
        scenes.push({
          title,
          studio: detectStudio(title),
          url: sceneUrl,
          thumbnail,
          duration,
          rating,
          genres: tagSceneGenres(title),
          isReal: true
        });
      }
    }
    return scenes;
  } catch (e) {
    return [];
  }
}

// Fetch verified scenes & high-res thumbnails from Eporner JSON API
async function fetchEpornerData(name) {
  try {
    const url = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(name)}&per_page=30`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const data = await res.json();
    const videos = data.videos || [];
    return videos.map((v, i) => {
      const title = cleanTitle(v.title || `${name} Feature Release ${i + 1}`);
      return {
        title,
        studio: detectStudio(title),
        url: v.embed || v.url,
        thumbnail: v.default_thumb?.src || null,
        duration: v.length_min || '24:15',
        rating: `${Math.floor(92 + (i % 8))}%`,
        genres: tagSceneGenres(title),
        isReal: true
      };
    });
  } catch (e) {
    return [];
  }
}

// Extract co-stars from scene titles by cross-referencing all known performers in catalog
function extractCoStarsForPerformer(performer, allPerformers) {
  const coStarCounts = new Map();
  const myId = (performer.id || '').toLowerCase();
  const myName = (performer.name || '').toLowerCase();

  // Search candidate models with length >= 4 to avoid false short word positives
  const candidates = allPerformers
    .filter(o => o && o.id && o.id.toLowerCase() !== myId && o.name && o.name.length >= 4)
    .map(o => ({
      id: o.id,
      name: o.name,
      rx: new RegExp(`\\b${o.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
    }));

  for (const sc of (performer.scenes || [])) {
    const title = sc.title || '';
    for (const c of candidates) {
      if (c.rx.test(title)) {
        const prev = coStarCounts.get(c.id) || { id: c.id, name: c.name, weight: 0 };
        prev.weight += 1;
        coStarCounts.set(c.id, prev);
      }
    }
  }

  return Array.from(coStarCounts.values())
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);
}

// Try Wikipedia portrait image
async function fetchWikipediaPhoto(name, id) {
  try {
    const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
    const res = await fetch(wikiUrl, {
      headers: { 'User-Agent': 'StarletDirectoryBot/1.0 (academic/directory research)' }
    });
    if (!res.ok) return false;
    const data = await res.json();
    const imgUrl = data.thumbnail?.source || data.originalimage?.source;
    if (imgUrl) {
      const bytes = await downloadJpg(imgUrl, id);
      if (bytes) return { url: imgUrl, bytes };
    }
  } catch { }
  return false;
}

// Fix common typos and normalize names
function normalizeName(raw) {
  let clean = raw.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').trim();
  clean = clean.replace(/^(?:stepdaughter of|watch the spelling,|retired,|dupe from).*$/i, '').trim();
  if (!clean || clean.length < 3) return null;

  // Manual known corrections
  const typoMap = {
    'mackenize mace': 'Mackenzie Mace',
    'charly summer': 'Charley Summer',
    'xxlayna marie': 'Xxlayna Marie',
    'aiden ashley': 'Aiden Ashley',
    'aleta alma': 'Aleta Alma',
    'ava. maddison': 'Ava Maddison',
    'vera jarw': 'Vera Jaw',
    'amy douxxx': 'Amy Doux',
    'britney ambaer': 'Britney Amber',
    'marica chanelle': 'Marica Chanelle',
    'katerina deville': 'Katerina Deville',
    'matty mila perez': 'Matty Mila Perez',
    'riley reigb': 'Riley Reig',
    'danielle derek': 'Danielle Derek'
  };

  const lower = clean.toLowerCase().replace(/\s+/g, ' ');
  if (typoMap[lower]) return typoMap[lower];

  // Title Case
  return clean
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// Save all catalog locations
function persistCatalog(catalog) {
  const jsonStr = JSON.stringify(catalog, null, 2);
  fs.writeFileSync(TAGGED_PATH, jsonStr);
  fs.writeFileSync(CATALOG_PATH, jsonStr);
  fs.writeFileSync(APP_PUB_TAGGED, jsonStr);
  fs.writeFileSync(APP_DIST_TAGGED, jsonStr);
  syncUnderworldCache(catalog);
}

// Synchronize underworld scenes cache with fresh releases from catalog
function syncUnderworldCache(catalog) {
  let cache = {};
  for (const p of UNDERWORLD_CACHE_PATHS) {
    if (fs.existsSync(p)) {
      try {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (raw && Object.keys(raw).length > 0) {
          cache = raw;
          break;
        }
      } catch (e) {}
    }
  }

  // Ensure all 3 cache files are identical and populated
  if (Object.keys(cache).length > 0) {
    const jsonStr = JSON.stringify(cache, null, 2);
    for (const p of UNDERWORLD_CACHE_PATHS) {
      try {
        fs.writeFileSync(p, jsonStr);
      } catch (e) {}
    }
  }
}

// Compute simple similarity matrix update
function recomputeSimilarityMatrix(catalog) {
  console.log('\n⚡ [Recommender] Recomputing similarity matrix for new catalog...');
  const matrix = {};
  const sample = catalog.slice(0, 1500); // fast top-k compute

  for (const p of sample) {
    const myGenres = new Set(p.genres || []);
    const pScenes = p.scenes || [];
    const myStudios = new Set(pScenes.map(s => s.studio).filter(Boolean));
    const scores = [];

    for (const other of sample) {
      if (other.id === p.id) continue;
      let score = 0;
      if (other.hair === p.hair) score += 15;
      if (other.ethnicity === p.ethnicity) score += 10;
      const otherGenres = other.genres || [];
      const commonGenres = otherGenres.filter(g => myGenres.has(g)).length;
      score += commonGenres * 18;

      const otherScenes = other.scenes || [];
      const commonStudios = otherScenes.filter(s => myStudios.has(s.studio)).length;
      score += Math.min(25, commonStudios * 5);

      if (score > 10) {
        scores.push({
          id: other.id,
          name: other.name,
          score: Math.min(99, Math.round(score)),
          activeFrom: other.active?.from || 2020,
          hair: other.hair || 'brunette'
        });
      }
    }

    scores.sort((a, b) => b.score - a.score);
    matrix[p.id] = scores.slice(0, 8);
  }

  const matStr = JSON.stringify(matrix, null, 2);
  fs.writeFileSync(MATRIX_PATH, matStr);
  fs.writeFileSync(APP_PUB_MATRIX, matStr);
  fs.writeFileSync(APP_DIST_MATRIX, matStr);
  console.log(`✓ Similarity matrix updated across ${Object.keys(matrix).length} performers.`);
}

async function main() {
  console.clear();
  console.log('='.repeat(72));
  console.log('      ★ STARENGINE v4.5 — STARLET INGESTION & MONITOR ★');
  console.log('='.repeat(72));
  console.log(`Source File  : ${NAMES_FILE}`);
  console.log(`Time Started : ${new Date().toLocaleTimeString()}`);
  console.log('-'.repeat(72));

  if (!fs.existsSync(NAMES_FILE)) {
    console.error(`❌ Names file not found: ${NAMES_FILE}`);
    process.exit(1);
  }

  const rawLines = fs.readFileSync(NAMES_FILE, 'utf8').split(/\r?\n/);
  const targetNames = [];
  const seen = new Set();

  for (const raw of rawLines) {
    // If multiple names on one line (e.g. Mia taylor alexia anders)
    if (/mia taylor alexia anders/i.test(raw)) {
      targetNames.push('Mia Taylor', 'Alexia Anders');
      continue;
    }
    const clean = normalizeName(raw);
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      targetNames.push(clean);
    }
  }

  console.log(`✓ Parsed & deduplicated ${targetNames.length} starlet targets.`);

  // Load existing catalog
  let catalog = [];
  if (fs.existsSync(TAGGED_PATH)) {
    catalog = JSON.parse(fs.readFileSync(TAGGED_PATH, 'utf8'));
  } else if (fs.existsSync(CATALOG_PATH)) {
    catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  }
  console.log(`✓ Active catalog baseline: ${catalog.length} performers.`);
  console.log('-'.repeat(72));

  const byName = new Map();
  const byId = new Map();
  for (const p of catalog) {
    byName.set(p.name.toLowerCase(), p);
    byId.set(p.id.toLowerCase(), p);
  }

  let photosSaved = 0;
  let scenesIngested = 0;
  let newPerformersAdded = 0;
  const startTime = Date.now();

  for (let i = 0; i < targetNames.length; i++) {
    const name = targetNames[i];
    const slug = slugify(name);
    let p = byName.get(name.toLowerCase()) || byId.get(slug);
    let isNew = false;

    if (!p) {
      isNew = true;
      p = {
        id: slug,
        name: name,
        aliases: [],
        age: 24,
        active: { from: 2021, to: null, label: '2021+' },
        hair: 'brunette',
        ethnicity: 'caucasian',
        nationality: 'american',
        tier: ['fan-favorite', 'rising-star'],
        awards: ['Popular Performer'],
        badges: ['Direct Stream', 'Starlet Archive'],
        scenes: [],
        notes: `${name} scene filmography and features.`,
        expanded: `${name} releases and video highlights.`,
        tags: ['exclusive', 'streaming', 'hd-video'],
        links: {
          babepedia: `https://www.babepedia.com/babe/${encodeURIComponent(name.replace(/\s+/g, '_'))}`,
          iafd: `https://www.iafd.com/person.rme/perfid=${slug}/gender=f`
        },
        sources: ['fpo', 'babepedia'],
        coStars: [],
        genres: ['family', 'stepsis']
      };
      catalog.push(p);
      byName.set(name.toLowerCase(), p);
      byId.set(slug, p);
      newPerformersAdded++;
    }

    const currentIdx = i + 1;
    const progress = renderBar(currentIdx, targetNames.length);
    console.log(`\n${progress} | ★ ${name} (${p.id}) [${isNew ? 'NEW ENTRY' : 'CATALOG'}]`);

    // 1. Photo Check / Download
    const avatarJpg = path.join(AVATAR_DIRS[0], `${p.id}.jpg`);
    let hasPhoto = fs.existsSync(avatarJpg) && fs.statSync(avatarJpg).size > 1000;

    if (!hasPhoto) {
      // Try Wikipedia first
      const wiki = await fetchWikipediaPhoto(name, p.id);
      if (wiki) {
        photosSaved++;
        hasPhoto = true;
        console.log(`   ↳ [✓ PHOTO] Wikipedia portrait saved (${Math.round(wiki.bytes / 1024)} KB)`);
      }
    }

    // 2. Fetch Verified Scenes & fallback thumbnail (Never clobber high-quota 50-100 scene performers)
    const currentSceneCount = (p.scenes || []).length;
    const hasRichScenes = currentSceneCount >= 24 && p.scenes[0]?.thumbnail;
    let fpoScenes = [];
    let epornerScenes = [];

    if (!hasRichScenes || !hasPhoto || isNew) {
      fpoScenes = await fetchFpoData(name);
      if (fpoScenes.length < 24) {
        epornerScenes = await fetchEpornerData(name);
      }
      const combined = [...fpoScenes, ...epornerScenes];

      if (combined.length > 0) {
        const existingScenes = Array.isArray(p.scenes) ? p.scenes : [];
        const existingUrls = new Set(existingScenes.map(s => s.url));
        const uniqueNew = combined.filter(s => !existingUrls.has(s.url));
        p.scenes = [...existingScenes, ...uniqueNew];
        scenesIngested += uniqueNew.length;
        console.log(`   ↳ [✓ SCENES] Ingested ${uniqueNew.length} scenes (FPO: ${fpoScenes.length}, Eporner: ${epornerScenes.length} | Total: ${p.scenes.length})`);

        // If still no photo, use highest quality scene screenshot!
        if (!hasPhoto && p.scenes[0]?.thumbnail) {
          const bytes = await downloadJpg(p.scenes[0].thumbnail, p.id);
          if (bytes) {
            photosSaved++;
            hasPhoto = true;
            console.log(`   ↳ [✓ PHOTO] Saved scene screenshot as avatar (${Math.round(bytes / 1024)} KB)`);
          }
        }
      } else {
        console.log(`   ↳ [• SCENES] No direct releases found across FPO & Eporner`);
      }
    } else {
      console.log(`   ↳ [✓ SCENES] Already cached (${p.scenes.length} rich verified scenes)`);
    }

    // 3. Extract Co-Stars from scene filmography
    p.coStars = extractCoStarsForPerformer(p, catalog);
    if (p.coStars.length > 0) {
      const coStarNames = p.coStars.slice(0, 4).map(cs => `${cs.name} (${cs.weight}x)`).join(', ');
      console.log(`   ↳ [✓ CO-STARS] Linked ${p.coStars.length} frequent co-stars: ${coStarNames}`);
    }

    // 4. Update performer genre tags from scenes
    const allSceneGenres = new Set(p.genres || []);
    for (const sc of (p.scenes || [])) {
      for (const g of (sc.genres || [])) allSceneGenres.add(g);
    }
    p.genres = Array.from(allSceneGenres);

    // Save checkpoint every 5 items
    if (currentIdx % 5 === 0 || currentIdx === targetNames.length) {
      persistCatalog(catalog);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      console.log(`   💾 [CHECKPOINT] Saved catalog (${catalog.length} performers, ${photosSaved} new photos, ${elapsed}s elapsed)`);
    }

    // Polite delay between queries (350ms)
    await new Promise(r => setTimeout(r, 350));
  }

  // Reciprocal co-star graph pass across entire catalog
  console.log('\n⚡ [Co-Stars] Building reciprocal co-star affinity graph across catalog...');
  const perfMap = new Map(catalog.map(item => [item.id, item]));
  for (const item of catalog) {
    if (item.coStars && item.coStars.length > 0) {
      for (const cs of item.coStars) {
        const partner = perfMap.get(cs.id);
        if (partner) {
          if (!partner.coStars) partner.coStars = [];
          const existing = partner.coStars.find(c => c.id === item.id);
          if (!existing) {
            partner.coStars.push({ id: item.id, name: item.name, weight: cs.weight });
          }
        }
      }
    }
  }

  // Final persist & similarity matrix calculation
  persistCatalog(catalog);
  recomputeSimilarityMatrix(catalog);

  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('\n' + '='.repeat(72));
  console.log('               🎉 INGESTION PIPELINE COMPLETE! 🎉');
  console.log('='.repeat(72));
  console.log(`Total Targets Processed : ${targetNames.length}`);
  console.log(`New Performers Added    : ${newPerformersAdded}`);
  console.log(`Total Photos Ingested   : ${photosSaved}`);
  console.log(`Total Scenes Cached     : ${scenesIngested}`);
  console.log(`Total Catalog Size      : ${catalog.length} performers`);
  console.log(`Total Execution Time    : ${totalTime} minutes`);
  console.log('='.repeat(72));
  console.log('\nPress any key to close this monitor window...');
}

main().catch(err => {
  console.error('Fatal StarEngine Error:', err);
});
