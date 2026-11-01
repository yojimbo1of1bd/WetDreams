// find-cast-episodes.mjs
import { parseFpoVideoCards } from './scene-fetcher.mjs';

async function fetchFpoHtml(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    if (!res.ok) return '';
    return await res.text();
  } catch (e) {
    return '';
  }
}

async function findEpisodeCast() {
  const queries = [
    'https://www.fpo.xxx/search/why-dont-you-just-fuck-him/',
    'https://www.fpo.xxx/search/step-sisters-bff/',
    'https://www.fpo.xxx/search/fine-if-i-get-to-have-sex-with-her-you-can-watch/',
    'https://www.fpo.xxx/search/youre-not-even-breeding-material/',
    'https://www.fpo.xxx/search/cum-swapped-sis/',
    'https://www.fpo.xxx/search/princess-cum/',
    'https://www.fpo.xxx/search/all-my-friends-are-selling-nudes-online/',
    'https://www.fpo.xxx/search/bratty-take-pictures-of-me/'
  ];

  for (const q of queries) {
    const html = await fetchFpoHtml(q);
    const cards = parseFpoVideoCards(html);
    console.log(`\nURL: ${q} (Cards: ${cards.length})`);
    cards.slice(0, 5).forEach(c => {
      console.log(`  -> Title: "${c.fullTitle || c.title}" | Studio: "${c.studio}"`);
    });
  }
}

findEpisodeCast();

