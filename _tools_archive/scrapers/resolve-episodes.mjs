// resolve-episodes.mjs
import { fetchPerformerScenes, parseFpoVideoCards } from './scene-fetcher.mjs';

async function searchKeywords(query) {
  const slug = encodeURIComponent(query.replace(/\s+/g, '-').replace(/[^\w\-]/g, ''));
  const url = `https://www.fpo.xxx/search/${slug}/`;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return [];
    const html = await res.text();
    return parseFpoVideoCards(html);
  } catch (e) {
    return [];
  }
}

async function run() {
  const searchQueries = [
    'Why dont you just fuck him',
    'if I get to have sex with her you can watch',
    'breeding material',
    'princess cum',
    'cum swapped sis',
    'selling nudes online',
    'take pictures of me Bratty Sis',
    'Bratty Sis S20',
    'Bratty Sis S20 E4',
    'Step Siblings S20 E2'
  ];

  console.log('Resolving specific episodes and actresses...');
  for (const q of searchQueries) {
    const cards = await searchKeywords(q);
    console.log(`\n=== Query: "${q}" (Found: ${cards.length} cards) ===`);
    cards.slice(0, 5).forEach(c => {
      console.log(`  * Title: ${c.fullTitle || c.title}`);
      console.log(`    Studio: ${c.studio} | Dur: ${c.duration} | Rating: ${c.rating}`);
      console.log(`    URL: ${c.url}`);
    });
  }
}

run();

