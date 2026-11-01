import fs from 'fs';
const raw = JSON.parse(fs.readFileSync('thread_comments.json', 'utf8'));
const comments = raw.data || [];
for (let i = 11; i < 57; i++) {
  const c = comments[i];
  if (c && c.body) {
    console.log(`[#${i+1}] ${c.author}: ${c.body.replace(/\n+/g, ' ')}`);
  }
}

