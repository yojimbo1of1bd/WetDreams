#!/usr/bin/env node
/**
 * enrich-daughter-dynamics.mjs
 * 
 * Ingestion and cross-classification engine for:
 * 1. Parental Permission (Solo blessing & Duo/Joint participation)
 * 2. Persuasion, Teasing & Boundary Testing ("Just once", "Just touch", "Nagging / Begging", "Pretend dates")
 * 3. Academic & Tutoring Exchanges cross-indexed with family archetypes
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseFpoVideoCards } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_QUERIES = [
  'father and son share',
  'dad joins',
  'dad permission',
  'permission dad',
  'just touch it',
  'just feel it',
  'just once',
  'begging stepsis',
  'begging daughter',
  'date stepsis',
  'study daughter',
  'tutor stepdaughter'
];

async function fetchPage(query, page = 1) {
  const url = page === 1
    ? `https://www.fpo.xxx/search/${encodeURIComponent(query)}/`
    : `https://www.fpo.xxx/search/${encodeURIComponent(query)}/?from_videos=${page}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseFpoVideoCards(html) || [];
  } catch (err) {
    console.error(`[Fetch Warning] ${query} (page ${page}): ${err.message}`);
    return [];
  }
}

async function main() {
  console.log('🚀 [Starting Parental Permission, Persuasion & Daughter Dynamics Pipeline]');

  const taxPath = path.join(__dirname, 'underworld-taxonomy.json');
  const perfPath = path.join(__dirname, 'performers-tagged.json');
  const cachePath = path.join(__dirname, 'underworld-scenes-cache.json');
  const publicCachePath = path.join(__dirname, 'starlet-app', 'public', 'underworld-scenes-cache.json');
  const distCachePath = path.join(__dirname, 'starlet-app', 'dist', 'underworld-scenes-cache.json');

  const taxonomy = JSON.parse(fs.readFileSync(taxPath, 'utf8'));
  const performers = JSON.parse(fs.readFileSync(perfPath, 'utf8'));
  const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};

  // Build performer lookup
  const performerLookup = [];
  performers.forEach(p => {
    const pId = p.id || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tiers = Array.isArray(p.tier) ? p.tier.map(t => String(t).toLowerCase()) : (p.tier ? [String(p.tier).toLowerCase()] : []);
    performerLookup.push({
      name: p.name,
      lowerName: p.name.toLowerCase(),
      id: pId,
      tiers,
      rating: p.rating || 9.0
    });
  });

  // Extract fresh target releases from tube
  const harvested = [];
  for (const query of TARGET_QUERIES) {
    console.log(`🔍 Querying: "${query}"...`);
    for (let page = 1; page <= 2; page++) {
      const cards = await fetchPage(query, page);
      console.log(`  └─ Page ${page}: retrieved ${cards.length} cards`);
      for (const card of cards) {
        if (!card.url || !card.title || card.title.length < 4 || /^\d+:\d+$/.test(card.title)) continue;
        const lowerTitle = (card.fullTitle || card.title).toLowerCase();
        const matchedPerf = performerLookup.find(p => lowerTitle.includes(p.lowerName));

        harvested.push({
          title: card.title,
          fullTitle: card.fullTitle || card.title,
          studio: card.studio || 'VIP Studio',
          url: card.url,
          thumbnail: card.thumbnail,
          duration: card.duration || '24:00',
          rating: card.rating || '95%',
          genres: [],
          isReal: true,
          performer: matchedPerf ? matchedPerf.name : (card.performer || 'Featured Performer'),
          performerId: matchedPerf ? matchedPerf.id : 'featured-performer',
          performers: matchedPerf ? [matchedPerf.name] : ['Featured Performer'],
          quality: '1080p HD',
          verifiedAt: new Date().toISOString()
        });
      }
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`\n✨ Harvested ${harvested.length} fresh online candidates.`);

  // Prepare destination lists
  const dadPermList = cache.dad_permission || [];
  const gradEscList = cache.gradual_escalation || [];
  const studyList = cache.study_grades || [];
  const daughterList = cache.naive_daughter || [];

  const dadPermUrls = new Set(dadPermList.map(s => s.url));
  const gradEscUrls = new Set(gradEscList.map(s => s.url));
  const studyUrls = new Set(studyList.map(s => s.url));
  const daughterUrls = new Set(daughterList.map(s => s.url));

  // Regex rules
  const dadPermRegex = /\b(permission|ask\s*permission|dad'?s\s*permission|hall\s*pass|dad\s*allows|father\s*approves|dad\s*lets|father\s*and\s*son|dad\s*joins?|sharing\s*with\s*dad)\b/i;
  const gradEscRegex = /\b(kissing|touching|poking|pulling\s*pant|pulling\s*skirt|grinding|massage|oil|slow\s*burn|teasing|just\s*once|just\s*touch|touch\s*it|feel\s*it|just\s*the\s*tip|begging|nagging|tricked|persuaded?|pretend\s*date|practice\s*date)\b/i;
  const studyRegex = /\b(study|studying|tutor|tutoring|failing|grade|grades|exam|report\s*card|test|homework)\b/i;
  const daughterRegex = /\b(naive\s*daughter|stepdaughter|step-?daughter|innocent\s*daughter|needs\s*guidance)\b/i;

  // Ingest freshly harvested
  let newDadPerm = 0;
  let newGradEsc = 0;
  let newStudy = 0;
  let newDaughter = 0;

  harvested.forEach(s => {
    const text = (s.title + ' ' + (s.fullTitle || '')).toLowerCase();

    if (dadPermRegex.test(text) && !dadPermUrls.has(s.url)) {
      dadPermUrls.add(s.url);
      dadPermList.push({ ...s, subdomainId: 'dad_permission' });
      newDadPerm++;
    }
    if (gradEscRegex.test(text) && !gradEscUrls.has(s.url)) {
      gradEscUrls.add(s.url);
      gradEscList.push({ ...s, subdomainId: 'gradual_escalation' });
      newGradEsc++;
    }
    if (studyRegex.test(text) && !studyUrls.has(s.url)) {
      studyUrls.add(s.url);
      studyList.push({ ...s, subdomainId: 'study_grades' });
      newStudy++;
    }
    if (daughterRegex.test(text) && !daughterUrls.has(s.url)) {
      daughterUrls.add(s.url);
      daughterList.push({ ...s, subdomainId: 'naive_daughter' });
      newDaughter++;
    }
  });

  // Cross-Index existing naive_daughter scenes into behavioral subdomains
  console.log('\n🔄 Cross-indexing existing naive_daughter repository into behavioral shelves...');
  let crossDadPerm = 0;
  let crossGradEsc = 0;
  let crossStudy = 0;

  daughterList.forEach(s => {
    const text = (s.title + ' ' + (s.fullTitle || '')).toLowerCase();

    if (dadPermRegex.test(text) && !dadPermUrls.has(s.url)) {
      dadPermUrls.add(s.url);
      dadPermList.push({ ...s, subdomainId: 'dad_permission' });
      crossDadPerm++;
    }
    if (gradEscRegex.test(text) && !gradEscUrls.has(s.url)) {
      gradEscUrls.add(s.url);
      gradEscList.push({ ...s, subdomainId: 'gradual_escalation' });
      crossGradEsc++;
    }
    if (studyRegex.test(text) && !studyUrls.has(s.url)) {
      studyUrls.add(s.url);
      studyList.push({ ...s, subdomainId: 'study_grades' });
      crossStudy++;
    }
  });

  console.log(`  ├─ dad_permission added: +${newDadPerm} fresh, +${crossDadPerm} cross-indexed (Total: ${dadPermList.length})`);
  console.log(`  ├─ gradual_escalation added: +${newGradEsc} fresh, +${crossGradEsc} cross-indexed (Total: ${gradEscList.length})`);
  console.log(`  ├─ study_grades added: +${newStudy} fresh, +${crossStudy} cross-indexed (Total: ${studyList.length})`);
  console.log(`  └─ naive_daughter added: +${newDaughter} fresh (Total: ${daughterList.length})`);

  // Score & Rank each list
  function scoreAndSort(list) {
    const scored = list.map(s => {
      let score = 25;
      const lower = (s.title + ' ' + (s.fullTitle || '')).toLowerCase();

      // Performer tier bonus
      const p = performerLookup.find(item => item.id === s.performerId);
      if (p) {
        if (p.tiers.includes('goat') || p.tiers.includes('legend') || p.tiers.includes('hall-of-fame')) score += 35;
        else if (p.tiers.includes('tier1') || p.tiers.includes('verified')) score += 25;
        else if (p.tiers.includes('reddit_crush') || p.tiers.includes('tier2')) score += 20;
      }

      // Keyword specificity
      if (/father\s*and\s*son|dad\s*joins?|just\s*touch|just\s*once|begging|tutor\s*stepdaughter/i.test(lower)) {
        score += 35;
      }

      // Rating bonus
      const rawRating = String(s.rating || '');
      if (rawRating.includes('%')) {
        const val = parseFloat(rawRating);
        if (!isNaN(val)) score += (val / 100) * 20;
      }

      // Duration bonus
      const durParts = String(s.duration || '').split(':');
      if (durParts.length >= 2) {
        const mins = parseInt(durParts[0], 10);
        if (mins >= 30) score += 10;
        else if (mins >= 15) score += 5;
      }

      const isBest = score >= 75;
      return {
        ...s,
        score: Math.round(score * 10) / 10,
        tierLevel: isBest ? 'best' : (score >= 50 ? 'tier_b' : 'standard'),
        isBest
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  cache.dad_permission = scoreAndSort(dadPermList);
  cache.gradual_escalation = scoreAndSort(gradEscList);
  cache.study_grades = scoreAndSort(studyList);
  cache.naive_daughter = scoreAndSort(daughterList);

  // Write out to all destinations
  const serialized = JSON.stringify(cache, null, 2);
  fs.writeFileSync(cachePath, serialized, 'utf8');
  fs.writeFileSync(publicCachePath, serialized, 'utf8');
  if (fs.existsSync(path.dirname(distCachePath))) {
    fs.writeFileSync(distCachePath, serialized, 'utf8');
  }

  console.log('\n✅ Successfully updated underworld-scenes-cache.json in root, public/, and dist/!');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});

