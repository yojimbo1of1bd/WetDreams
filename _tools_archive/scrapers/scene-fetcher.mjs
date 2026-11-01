import fs from 'node:fs/promises';

function cleanVideoTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/HD\s*\[\d+p\]/gi, '')
    .replace(/HD\s*\d+p/gi, '')
    .replace(/\[\d+p\]/gi, '')
    .replace(/\b1080p\b|\b720p\b|\b4k\b/gi, '')
    .trim();
}

export function parseFpoVideoCards(html) {
  const scenes = [];
  // FPO card pattern:
  // <div class="item ..."> ... <a href="(url)" ...> ... <img src/data-original="(thumb)" ...> ... </a>
  // Or match <a> with /video/ link
  const aRegex = /<a[^>]+href="(https:\/\/www\.fpo\.xxx\/video\/\d+\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;

  while ((match = aRegex.exec(html)) !== null) {
    const url = match[1];
    const inner = match[2];

    // Thumbnail
    const thumbMatch = inner.match(/(?:src|data-src|data-original)=["']([^"']+\.(?:jpg|webp|jpeg|png))["']/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : null;

    // Duration
    const durMatch = inner.match(/(\d{1,2}:\d{2})/);
    const duration = durMatch ? durMatch[1] : null;

    // Rating
    const ratingMatch = inner.match(/(\d{1,3}%)/);
    const rating = ratingMatch ? ratingMatch[1] : null;

    // Text lines for title
    const lines = inner
      .replace(/<[^>]+>/g, '\n')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.includes('%') && !l.match(/^\d{1,2}:\d{2}$/) && l !== 'HD' && !l.match(/^[\d\s,]+$/));

    const candidate = lines.find(l => l.length > 5);
    if (!candidate) continue;

    const fullTitle = cleanVideoTitle(candidate);
    let studio = 'Featured Studio';
    let title = fullTitle;

    // Check if "Studio - Title" or "Studio : Title"
    const parts = fullTitle.split(/\s*[-–:]\s*/);
    if (parts.length > 1 && parts[0].length >= 2 && parts[0].length <= 25) {
      studio = parts[0].trim();
      title = parts.slice(1).join(' - ').trim();
    }

    // Classify family / genre tags
    const lower = `${fullTitle} ${studio}`.toLowerCase();
    const genres = [];
    if (/\bstepmom\b|\bstep-mom\b/.test(lower)) genres.push('stepmom');
    if (/\bstepsis\b|\bstep-sis\b|\bstepsister\b/.test(lower)) genres.push('stepsis');
    if (/\bmom\b|\bmilf\b/.test(lower) && !genres.includes('stepmom')) genres.push('mom');
    if (/\bfamily\b|\btaboo\b/.test(lower)) genres.push('family');
    if (/\bcaught\b/.test(lower)) genres.push('caught');
    if (/\bstudy\b|\btutor\b/.test(lower)) genres.push('study');
    if (/\bshared bed\b|\bbed share\b|\bsleepover\b/.test(lower)) genres.push('shared-bed');
    if (/\bswap\b/.test(lower)) genres.push('swap');
    if (/\bcheating\b|\baffair\b/.test(lower)) genres.push('cheating');

    scenes.push({
      title,
      fullTitle,
      studio,
      url,
      thumbnail,
      duration,
      rating,
      genres,
      isReal: true
    });
  }

  // De-duplicate by URL
  const seenUrls = new Set();
  const deduped = [];
  for (const s of scenes) {
    if (!seenUrls.has(s.url)) {
      seenUrls.add(s.url);
      deduped.push(s);
    }
  }

  return deduped;
}

export async function fetchPerformerScenes(name, targetCount = 30) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const maxPages = Math.ceil(targetCount / 24);
  const allScenes = [];
  const seenUrls = new Set();

  for (let page = 1; page <= maxPages; page++) {
    const url = page === 1
      ? `https://www.fpo.xxx/search/${slug}/`
      : `https://www.fpo.xxx/search/${slug}/?from_videos=${page}`;

    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (!res.ok) break;
      const html = await res.text();
      const pageScenes = parseFpoVideoCards(html);
      if (!pageScenes || pageScenes.length === 0) break;

      for (const s of pageScenes) {
        if (!seenUrls.has(s.url)) {
          seenUrls.add(s.url);
          allScenes.push(s);
        }
      }

      if (allScenes.length >= targetCount) break;
      if (page < maxPages) {
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (e) {
      break;
    }
  }

  return allScenes.slice(0, targetCount);
}

