async function test() {
  const names = ['Nicole Aniston', 'Mackenzie Mace', 'Myra Moans', 'Gracie Gates', 'Jazmin Luv', 'Lana Smalls', 'Rachel Starr', 'Gianna Lynn', 'Lauren Phillips', 'Diana Prince'];
  for (const name of names) {
    try {
      // 1. Wikipedia REST API
      const wikiRes = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name.replace(/\s+/g, '_'))}`, {
        headers: { 'User-Agent': 'StarletEnricher/1.0' }
      });
      if (wikiRes.ok) {
        const d = await wikiRes.json();
        const img = d.thumbnail?.source || d.originalimage?.source;
        if (img) {
          console.log(`[WIKI SUCCESS] ${name}: ${img}`);
          continue;
        }
      }

      // 2. Babepedia Page Scrape for accurate image path
      const bpRes = await fetch(`https://www.babepedia.com/babe/${encodeURIComponent(name.replace(/\s+/g, '_'))}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      if (bpRes.ok) {
        const html = await bpRes.text();
        const m = html.match(/<div id="profimg">[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
                  html.match(/<img[^>]+id="biopic"[^>]+src="([^"]+)"/i) ||
                  html.match(/src="(\/pics\/[^"]+)"/i);
        if (m) {
          const bpUrl = m[1].startsWith('http') ? m[1] : `https://www.babepedia.com${m[1]}`;
          console.log(`[BABEPEDIA SUCCESS] ${name}: ${bpUrl}`);
          continue;
        }
      }

      console.log(`[NOT FOUND] ${name}`);
    } catch (err) {
      console.log(`[ERROR] ${name}: ${err.message}`);
    }
  }
}
test();
