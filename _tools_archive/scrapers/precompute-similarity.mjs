#!/usr/bin/env node
/**
 * precompute-similarity.mjs
 * 
 * Netflix-Style Item-Item Cosine Similarity Precomputation Engine
 * for Starlet Directory.
 * 
 * Features:
 * - High-dimensional weighted sparse vectorization (genres, tiers, studios, era, awards, demographics)
 * - Domain-tuned weighting matrix
 * - Cold-start metadata bootstrapping for newcomers & sparse filmographies
 * - L2 vector normalization for exact cosine similarity
 * - Top-K neighbor pruning & payload optimization (~180 KB output)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_PATH = path.join(__dirname, 'performers-tagged.json');
const OUTPUT_MAIN = path.join(__dirname, 'similarity-matrix.json');
const OUTPUT_APP_PUB = path.join(__dirname, 'starlet-app', 'public', 'similarity-matrix.json');
const OUTPUT_APP_DIST = path.join(__dirname, 'starlet-app', 'dist', 'similarity-matrix.json');

const TOP_K = 12; // Number of similar performers to store per starlet

console.log('⚡ [Netflix Recommender] Loading performer catalog...');
if (!fs.existsSync(INPUT_PATH)) {
  console.error(`❌ Input file not found: ${INPUT_PATH}`);
  process.exit(1);
}

const performers = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
console.log(`✓ Loaded ${performers.length} performers from performers-tagged.json`);

// 1. Build Feature Vocabulary
const featureMap = new Map(); // token -> index
let nextFeatureIndex = 0;

function addFeature(token) {
  if (!token) return -1;
  const key = token.toLowerCase().trim();
  if (!featureMap.has(key)) {
    featureMap.set(key, nextFeatureIndex++);
  }
  return featureMap.get(key);
}

// Well-known adult studios for text mining in notes/expanded
const KNOWN_STUDIOS = [
  'pure taboo', 'brazzers', 'blacked', 'vixen', 'deeper', 'tushy',
  'teamskeet', 'reality kings', 'naughty america', 'wicked', 'digital playground',
  'twistys', 'evil angel', 'hard x', 'sweetheart video', 'mofos', 'babes',
  'propertysex', 'familystrokes', 'taboo heat', 'daughterswap', 'pervmom',
  'mylf', 'nubiles', 'bangbros', 'girlsway', 'slay'
];

function extractStudioMentions(text = '') {
  if (!text) return [];
  const lower = text.toLowerCase();
  return KNOWN_STUDIOS.filter(studio => lower.includes(studio));
}

// Pass 1: Register all feature tokens
performers.forEach(p => {
  // Genres
  (p.genres || []).forEach(g => addFeature(`genre:${g}`));
  
  // Tiers
  const tiers = Array.isArray(p.tier) ? p.tier : (p.tier ? [p.tier] : []);
  tiers.forEach(t => addFeature(`tier:${t}`));

  // Badges
  (p.badges || []).forEach(b => addFeature(`badge:${b}`));

  // Era / Career Debut
  if (p.active?.from) {
    const from = p.active.from;
    const era = from >= 2022 ? 'era:contemporary' :
                from >= 2018 ? 'era:late-2010s' :
                from >= 2010 ? 'era:early-2010s' :
                from >= 2000 ? 'era:2000s' : 'era:vintage';
    addFeature(era);
    // Decade bucket
    addFeature(`decade:${Math.floor(from / 10) * 10}s`);
  }

  // Physical & Demographic
  if (p.hair) addFeature(`hair:${p.hair}`);
  if (p.ethnicity) addFeature(`ethnicity:${p.ethnicity}`);
  if (p.nationality) addFeature(`nationality:${p.nationality}`);

  // Awards
  (p.awards || []).forEach(a => addFeature(`award:${a}`));

  // Studios from verified scenes
  (p.scenes || []).forEach(s => {
    if (s.studio) addFeature(`studio:${s.studio}`);
    (s.genres || []).forEach(sg => addFeature(`genre:${sg}`));
  });

  // Implicit studios extracted from notes & expanded
  const textStudios = extractStudioMentions(`${p.notes || ''} ${p.expanded || ''}`);
  textStudios.forEach(s => addFeature(`studio:${s}`));
  // Co-star graph connections
  (p.coStars || []).forEach(cs => addFeature(`costar:${cs.id}`));
});

const totalFeatures = nextFeatureIndex;
console.log(`✓ Built feature space with ${totalFeatures} unique dimensions across catalog.`);

// 2. Vectorization with Domain Weights
const vectors = performers.map(p => {
  const vec = new Float32Array(totalFeatures);
  const isNewcomer = (p.active?.from && p.active.from >= 2022) ||
                     (Array.isArray(p.tier) ? p.tier.includes('new-starlet') : p.tier === 'new-starlet') ||
                     (p.scenes?.length <= 2);

  // A. Genres: 3.5x weight
  (p.genres || []).forEach(g => {
    const idx = featureMap.get(`genre:${g.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += 3.5;
  });

  // Scene-level genres: 1.0x incremental
  (p.scenes || []).forEach(s => {
    (s.genres || []).forEach(sg => {
      const idx = featureMap.get(`genre:${sg.toLowerCase().trim()}`);
      if (idx !== undefined) vec[idx] += 1.0;
    });
  });

  // B. Tier & Badges: 3.0x weight (boosted to 4.5x for newcomers)
  const tiers = Array.isArray(p.tier) ? p.tier : (p.tier ? [p.tier] : []);
  const tierWeight = isNewcomer ? 4.5 : 3.0;
  tiers.forEach(t => {
    const idx = featureMap.get(`tier:${t.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += tierWeight;
  });

  (p.badges || []).forEach(b => {
    const idx = featureMap.get(`badge:${b.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += 2.0;
  });

  // C. Studios: 2.5x base + scene counts (boosted for cold-start newcomers)
  const studioWeight = isNewcomer ? 4.0 : 2.5;
  const studioCounts = {};
  (p.scenes || []).forEach(s => {
    if (s.studio) {
      const key = s.studio.toLowerCase().trim();
      studioCounts[key] = (studioCounts[key] || 0) + 1;
    }
  });

  // From notes / expanded metadata
  extractStudioMentions(`${p.notes || ''} ${p.expanded || ''}`).forEach(s => {
    studioCounts[s] = (studioCounts[s] || 0) + 2;
  });

  Object.entries(studioCounts).forEach(([studio, count]) => {
    const idx = featureMap.get(`studio:${studio}`);
    if (idx !== undefined) {
      // Sub-linear scaling so starlet with 50 scenes doesn't blow out dimensions
      vec[idx] += studioWeight * Math.log2(1 + count);
    }
  });

  // D. Era / Career Cohort: 1.5x (boosted for newcomers)
  if (p.active?.from) {
    const from = p.active.from;
    const era = from >= 2022 ? 'era:contemporary' :
                from >= 2018 ? 'era:late-2010s' :
                from >= 2010 ? 'era:early-2010s' :
                from >= 2000 ? 'era:2000s' : 'era:vintage';
    const eraIdx = featureMap.get(era);
    if (eraIdx !== undefined) vec[eraIdx] += isNewcomer ? 3.0 : 1.5;

    const decIdx = featureMap.get(`decade:${Math.floor(from / 10) * 10}s`);
    if (decIdx !== undefined) vec[decIdx] += 1.0;
  }

  // E. Awards: 2.0x
  (p.awards || []).forEach(a => {
    const idx = featureMap.get(`award:${a.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += 2.0;
  });

  // F. Demographics: 1.0x
  if (p.hair) {
    const idx = featureMap.get(`hair:${p.hair.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += 1.0;
  }
  if (p.ethnicity) {
    const idx = featureMap.get(`ethnicity:${p.ethnicity.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += 1.2;
  }
  if (p.nationality) {
    const idx = featureMap.get(`nationality:${p.nationality.toLowerCase().trim()}`);
    if (idx !== undefined) vec[idx] += 1.0;
  }

  // G. Co-Star Graph Affinities: 2.2x
  (p.coStars || []).forEach(cs => {
    const idx = featureMap.get(`costar:${cs.id}`);
    if (idx !== undefined) {
      vec[idx] += 2.2 * Math.log2(1 + (cs.weight || 1));
    }
  });

  // L2 Normalization: normalize to unit sphere
  let normSq = 0;
  for (let i = 0; i < totalFeatures; i++) {
    normSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(normSq) || 1.0;
  for (let i = 0; i < totalFeatures; i++) {
    vec[i] /= norm;
  }

  return vec;
});

console.log(`✓ Vectorized ${vectors.length} performers and applied L2 normalization.`);

// 3. Compute Pairwise Cosine Similarity (Dot Product on Unit Vectors)
console.log('⚡ Computing pairwise item-item cosine similarities...');
const t0 = Date.now();

const matrix = {};

for (let i = 0; i < performers.length; i++) {
  const pA = performers[i];
  const vA = vectors[i];
  const candidates = [];

  for (let j = 0; j < performers.length; j++) {
    if (i === j) continue;
    const pB = performers[j];
    const vB = vectors[j];

    // Inner dot product
    let dot = 0;
    for (let k = 0; k < totalFeatures; k++) {
      dot += vA[k] * vB[k];
    }

    if (dot > 0.05) {
      candidates.push({
        id: pB.id,
        name: pB.name,
        score: Math.round(dot * 1000) / 1000,
        matchPct: Math.min(99, Math.max(50, Math.round(dot * 100)))
      });
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  // If candidate pool is too small (cold-start fallback), backfill with same era / tier
  if (candidates.length < TOP_K) {
    const currentIds = new Set(candidates.map(c => c.id));
    for (let j = 0; j < performers.length && candidates.length < TOP_K; j++) {
      if (i === j) continue;
      const pB = performers[j];
      if (!currentIds.has(pB.id)) {
        // Fallback match
        const eraMatch = pB.active?.from && pA.active?.from && Math.abs(pB.active.from - pA.active.from) <= 3;
        const tierMatch = Array.isArray(pA.tier) && Array.isArray(pB.tier) && pA.tier.some(t => pB.tier.includes(t));
        if (eraMatch || tierMatch) {
          candidates.push({
            id: pB.id,
            name: pB.name,
            score: 0.35,
            matchPct: 65
          });
          currentIds.add(pB.id);
        }
      }
    }
  }

  matrix[pA.id] = candidates.slice(0, TOP_K);
}

const elapsed = Date.now() - t0;
console.log(`✓ Precomputation completed in ${elapsed}ms (${performers.length} × ${performers.length} matrix)!`);

// 4. Save Matrix to Targets
const jsonContent = JSON.stringify(matrix);
const byteSize = Buffer.byteLength(jsonContent);
console.log(`✓ Matrix payload size: ${(byteSize / 1024).toFixed(1)} KB (uncompressed)`);

fs.writeFileSync(OUTPUT_MAIN, jsonContent, 'utf8');
console.log(`✓ Saved root matrix: ${OUTPUT_MAIN}`);

// Write to starlet-app public and dist
const pubDir = path.dirname(OUTPUT_APP_PUB);
if (fs.existsSync(pubDir)) {
  fs.writeFileSync(OUTPUT_APP_PUB, jsonContent, 'utf8');
  console.log(`✓ Saved public matrix: ${OUTPUT_APP_PUB}`);
}

const distDir = path.dirname(OUTPUT_APP_DIST);
if (fs.existsSync(distDir)) {
  fs.writeFileSync(OUTPUT_APP_DIST, jsonContent, 'utf8');
  console.log(`✓ Saved dist matrix: ${OUTPUT_APP_DIST}`);
}

// 5. Print Samples
console.log('\n--- Sample Recommendations ---');
const sampleKeys = ['abella-danger', 'angela-white', 'elly-clutch'];
sampleKeys.forEach(key => {
  const p = performers.find(x => x.id === key);
  if (p && matrix[key]) {
    console.log(`\n⭐ ${p.name} (${p.active?.label || 'N/A'}, Tiers: ${p.tier}):`);
    matrix[key].slice(0, 4).forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec.name} — ${rec.matchPct}% match (score: ${rec.score})`);
    });
  }
});

console.log('\n✅ Precomputation successfully finished!');
