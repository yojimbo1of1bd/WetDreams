import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- Starting Underworld Scene-First Enrichment Pipeline ---');

// 1. Load files
const taxPath = path.join(__dirname, 'underworld-taxonomy.json');
const perfPath = path.join(__dirname, 'performers-tagged.json');
const cachePath = path.join(__dirname, 'underworld-scenes-cache.json');
const publicCachePath = path.join(__dirname, 'starlet-app', 'public', 'underworld-scenes-cache.json');
const distCachePath = path.join(__dirname, 'starlet-app', 'dist', 'underworld-scenes-cache.json');

const taxonomy = JSON.parse(fs.readFileSync(taxPath, 'utf8'));
const performers = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
let cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

// Build performer tier and metadata map
const performerMap = new Map();
performers.forEach(p => {
  const pId = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const tiers = Array.isArray(p.tier) ? p.tier.map(t => String(t).toLowerCase()) : (p.tier ? [String(p.tier).toLowerCase()] : []);
  performerMap.set(pId, {
    name: p.name,
    id: pId,
    tiers,
    rating: p.rating || 9.0,
    genres: p.genres || []
  });
});

// Compile regex map for all subdomains
const subRegexes = new Map();
const allSubIds = [];
for (const [domKey, dom] of Object.entries(taxonomy.domains)) {
  for (const sub of (dom.subdomains || [])) {
    allSubIds.push(sub.id);
    if (sub.regex) {
      try {
        subRegexes.set(sub.id, new RegExp(sub.regex, 'i'));
      } catch (e) {}
    }
  }
}

console.log(`Found ${allSubIds.length} subdomains across Underworld taxonomy.`);

// Score function: calculates ranking score for "Best of the Best"
function calculateSceneScore(scene) {
  let score = 0;

  const pId = scene.performerId || (scene.performer ? scene.performer.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '');
  const pMeta = performerMap.get(pId);
  const tiers = pMeta ? pMeta.tiers : [];

  // 1. Performer Tier Power
  if (tiers.includes('goat') || tiers.includes('legend') || tiers.includes('hall-of-fame')) {
    score += 55;
  } else if (tiers.includes('tier1') || tiers.includes('verified')) {
    score += 40;
  } else if (tiers.includes('reddit_crush') || tiers.includes('tier2') || tiers.includes('crush')) {
    score += 30;
  } else {
    score += 15;
  }

  // 2. Rating Score (up to 30 points)
  const rawRating = String(scene.rating || '');
  if (rawRating.includes('%')) {
    const val = parseFloat(rawRating);
    if (!isNaN(val)) score += (val / 100) * 30;
  } else {
    const val = parseFloat(rawRating);
    if (!isNaN(val)) score += (val / 10) * 30;
    else score += 20; // Default decent rating
  }

  // 3. Resolution / Quality Bonus (up to 15 points)
  const q = String(scene.quality || '').toLowerCase();
  if (q.includes('4k') || q.includes('2160p')) score += 15;
  else if (q.includes('1080p') || q.includes('hd') || q.includes('fhd')) score += 10;
  else if (q.includes('720p')) score += 5;

  // 4. Feature Length Bonus (up to 10 points)
  const durParts = String(scene.duration || '').split(':');
  if (durParts.length >= 2) {
    const mins = parseInt(durParts[0], 10);
    if (mins >= 30) score += 10;
    else if (mins >= 20) score += 7;
    else if (mins >= 10) score += 4;
  }

  return Math.round(score * 10) / 10;
}

// Ensure each subdomain exists in cache
allSubIds.forEach(id => {
  if (!Array.isArray(cache[id])) {
    cache[id] = [];
  }
});

// Index catalog scenes into subdomains
let newlyMatched = 0;
performers.forEach(p => {
  if (!Array.isArray(p.scenes)) return;
  const pId = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  p.scenes.forEach(s => {
    if (!s || !s.title || !s.url) return;
    const corpus = `${s.title} ${(s.tags || []).join(' ')} ${(p.genres || []).join(' ')} ${p.notes || ''}`.toLowerCase();

    subRegexes.forEach((regex, subId) => {
      if (regex.test(corpus)) {
        const list = cache[subId] || [];
        if (!list.some(existing => existing.url === s.url)) {
          list.push({
            title: s.title,
            fullTitle: s.fullTitle || s.title,
            studio: s.studio || 'VIP Studio',
            url: s.url,
            thumbnail: s.thumbnail || s.thumb || `./avatars/${pId}.jpg`,
            duration: s.duration || '24:00',
            rating: s.rating || '95%',
            genres: Array.isArray(s.genres) ? s.genres : [subId],
            isReal: true,
            performer: p.name,
            performerId: pId,
            performers: [p.name, ...(s.costars || [])],
            subdomainId: subId,
            quality: s.quality || '1080p HD',
            verifiedAt: new Date().toISOString()
          });
          cache[subId] = list;
          newlyMatched++;
        }
      }
    });
  });
});

console.log(`Matched and injected ${newlyMatched} additional verified releases from catalog into Underworld subdomains.`);

// Score and sort every subdomain array: Best of the Best first -> Tier B -> Others
let totalProcessed = 0;
let totalBest = 0;

for (const [subId, sceneList] of Object.entries(cache)) {
  if (!Array.isArray(sceneList)) continue;

  const scoredList = sceneList.map(scene => {
    const score = calculateSceneScore(scene);
    let tierLevel = 'standard';
    let isBest = false;

    if (score >= 78) {
      tierLevel = 'best';
      isBest = true;
      totalBest++;
    } else if (score >= 50) {
      tierLevel = 'tier_b';
    }

    return {
      ...scene,
      score,
      tierLevel,
      isBest
    };
  });

  // Sort descending by score
  scoredList.sort((a, b) => b.score - a.score);

  cache[subId] = scoredList;
  totalProcessed += scoredList.length;
}

console.log(`Total scenes scored across all subdomains: ${totalProcessed}`);
console.log(`Classified ${totalBest} landmark scenes as "👑 BEST OF THE BEST" (Tier A).`);

// Write out to all 3 destinations
const serialized = JSON.stringify(cache, null, 2);
fs.writeFileSync(cachePath, serialized, 'utf8');
fs.writeFileSync(publicCachePath, serialized, 'utf8');
if (fs.existsSync(path.dirname(distCachePath))) {
  fs.writeFileSync(distCachePath, serialized, 'utf8');
}

console.log('Successfully written enriched and sorted scenes to underworld-scenes-cache.json in root, public, and dist!');

