async function testFPO() {
  const names = ['Mackenzie Mace', 'Myra Moans', 'Gracie Gates', 'Jazmin Luv', 'Lana Smalls', 'Nicole Aniston'];
  for (const name of names) {
    try {
      const res = await fetch(`https://www.fpo.xxx/search/${encodeURIComponent(name)}/`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });
      const html = await res.text();
      // Match video card thumbnails
      const thumbs = [...html.matchAll(/(https:\/\/[^"'\s]+\.(?:jpg|webp|jpeg))/gi)].map(m => m[1]);
      const sceneThumb = thumbs.find(t => t.includes('tbi') || t.includes('thumb') || t.includes('poster'));
      console.log(`[FPO THUMB] ${name}:`, sceneThumb || 'none');
    } catch (e) {
      console.log(`[FPO ERROR] ${name}:`, e.message);
    }
  }
}
testFPO();
