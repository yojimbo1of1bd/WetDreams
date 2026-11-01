import fs from 'fs';

const s = fs.readFileSync('reddit_api.json', 'utf8');
const scriptMatches = s.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
console.log('Script tags count:', scriptMatches.length);

for (let i = 0; i < scriptMatches.length; i++) {
  const sc = scriptMatches[i];
  if (sc.includes('1uvi7kq') || sc.includes('crush') || sc.includes('Porn_Discuss') || sc.includes('comment')) {
    console.log(`Script ${i} length ${sc.length}, preview: ${sc.slice(0, 200)}`);
  }
}

// Let's also search for any performer names in the text
const performers = JSON.parse(fs.readFileSync('performers-tagged.json', 'utf8'));
const foundInHtml = [];
for (const p of performers) {
  if (p.name && p.name.length > 4 && s.toLowerCase().includes(p.name.toLowerCase())) {
    foundInHtml.push(p.name);
  }
}
console.log('Performers found in reddit_api.json:', foundInHtml);

