import fs from "fs";

function parseFpoHtml(html) {
  // Pattern to extract video blocks
  // In FPO, each video card has:
  // <a href="https://www.fpo.xxx/video/..." ...>
  // thumbnail image: <img ... src="..." or data-src="..."
  // title, duration, rating
  const videos = [];
  const regex = /<a[^>]+href="(https:\/\/www\.fpo\.xxx\/video\/[^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    const url = m[1];
    const inner = m[2];
    
    // Duration
    const durMatch = inner.match(/(\d{1,2}:\d{2})/);
    const duration = durMatch ? durMatch[1] : null;

    // Rating
    const ratingMatch = inner.match(/(\d{1,3}%)/);
    const rating = ratingMatch ? ratingMatch[1] : null;

    // Thumbnail
    const imgMatch = inner.match(/(?:src|data-src)="([^"]+\.(?:jpg|webp|jpeg|png))"/i);
    const thumbnail = imgMatch ? imgMatch[1] : null;

    // Clean title
    // Strip duration, HD, percentage, view counts
    const textLines = inner.replace(/<[^>]+>/g, '\n').split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.includes('%') && !l.match(/^\d{1,2}:\d{2}$/) && l !== 'HD' && !l.match(/^[\d\s,]+$/));
    
    const title = textLines.find(l => l.length > 5) || null;

    if (title && url) {
      // Extract studio if "Studio - Title" or similar
      let studio = null;
      let cleanTitle = title;
      const studioSplit = title.split(/\s*[-–]\s*/);
      if (studioSplit.length > 1 && studioSplit[0].length < 30) {
        studio = studioSplit[0].trim();
        cleanTitle = studioSplit.slice(1).join(' - ').trim();
      }
      videos.push({
        title: cleanTitle,
        fullTitle: title,
        studio: studio || "Featured Studio",
        duration,
        rating,
        thumbnail,
        url,
        isReal: true
      });
    }
  }
  return videos;
}

async function testPerformer(name) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = `https://www.fpo.xxx/search/${slug}/`;
  console.log(`Fetching FPO for ${name} (${url})...`);
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  if (!res.ok) {
    console.error(`Status: ${res.status}`);
    return [];
  }
  const html = await res.text();
  const vids = parseFpoHtml(html);
  console.log(`Found ${vids.length} real scenes for ${name}`);
  return vids;
}

(async () => {
  const v1 = await testPerformer("Kendra Lust");
  console.log("Sample Kendra Lust scene:", JSON.stringify(v1[0], null, 2));
  const v2 = await testPerformer("Emma Starletto");
  console.log("Sample Emma Starletto scene:", JSON.stringify(v2[0], null, 2));
})();

