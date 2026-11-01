async function inspectCard() {
  const res = await fetch('https://www.fpo.xxx/search/Mackenzie%20Mace/');
  const html = await res.text();
  const cardMatch = html.match(/<div class="item[^>]*>[\s\S]*?<\/div>\s*<\/div>/i) || html.match(/<a[^>]+href="https:\/\/www\.fpo\.xxx\/video\/\d+[^"]*"[^>]*>[\s\S]*?<\/a>/i);
  console.log(cardMatch ? cardMatch[0].slice(0, 800) : 'none');
}
inspectCard();
