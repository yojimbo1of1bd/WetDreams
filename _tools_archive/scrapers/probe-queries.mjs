import { parseFpoVideoCards } from './scene-fetcher.mjs';

const candidates = [
  'mom-son-daughter',
  'mom-daughter',
  'mother-daughter',
  'family-intervention',
  'sharing-mom',
  'sister-and-mom',
  'stepmom-and-stepsis',
  'family-threesome',
  'roleplay',
  'captioned'
];

async function probe() {
  for (const q of candidates) {
    const url = `https://www.fpo.xxx/search/${q}/`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      const html = await res.text();
      const parsed = parseFpoVideoCards(html);
      console.log(`Query: ${q.padEnd(20)} -> ${parsed.length} videos`);
    } catch (e) {
      console.log(`Query: ${q.padEnd(20)} -> Error: ${e.message}`);
    }
  }
}

probe();
