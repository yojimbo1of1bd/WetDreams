async function test() {
  const tests = [
    'https://www.fpo.xxx/search/angela-white/?from_videos=2',
    'https://www.fpo.xxx/search/angela-white/?from=2',
    'https://www.fpo.xxx/search/angela-white/?page=2',
    'https://www.fpo.xxx/search/angela-white/?p=2',
    'https://www.fpo.xxx/search/angela-white/?from_videos=02'
  ];

  for (const u of tests) {
    const res = await fetch(u, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await res.text();
    // Check if the first video is different from page 1's first video (56563)
    const firstVid = html.match(/\/video\/(\d+)\//);
    console.log(u, '-> Status:', res.status, 'First video ID:', firstVid ? firstVid[1] : 'None');
  }
}
test().catch(console.error);
