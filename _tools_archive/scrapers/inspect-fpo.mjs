import fs from "fs";
async function inspectFpo() {
  const res = await fetch("https://www.fpo.xxx/search/abella-danger/", {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const html = await res.text();
  fs.writeFileSync("fpo-sample.html", html);
  // Look for links and titles
  const links = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ href: m[1], text: m[2].replace(/<[^>]+>/g, '').trim() }))
    .filter(l => l.href.includes('search') || l.href.includes('video') || l.href.includes('models') || l.text.length > 5);
  console.log("Sample links found:", links.slice(0, 15));
}
inspectFpo();

