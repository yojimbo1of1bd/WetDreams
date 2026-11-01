// inspect-video-page.mjs
const url = 'https://www.fpo.xxx/video/319533/x0-5-free-sex-videos-step-bro-sister-fucking-21-08-26-minxx-marii-step-sis-is-breeding-material-xxx-xxx-1wrx/';

async function test() {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML Length:', html.length);

  // Check for embed URL or player
  const embedMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  console.log('Embed iframe:', embedMatch ? embedMatch[1] : 'None');

  // Check for video_url, video_alt_url
  const vUrl = html.match(/video_url:\s*['"]([^'"]+)['"]/);
  console.log('video_url:', vUrl ? vUrl[1] : 'None');

  // Check for KVS player configuration
  const kvs = html.match(/var\s+flashvars\s*=\s*\{([\s\S]*?)\};/);
  if (kvs) {
    console.log('\n--- Flashvars found ---');
    console.log(kvs[1].slice(0, 800));
  }

  // Check if FPO has an embed endpoint like /embed/{id} or /player/
  const embedLink = html.match(/https:\/\/www\.fpo\.xxx\/embed\/\d+/);
  console.log('Embed link:', embedLink ? embedLink[0] : 'None');
}

test();

