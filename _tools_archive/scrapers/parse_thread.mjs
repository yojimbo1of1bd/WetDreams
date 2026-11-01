import fs from 'fs';

const html = fs.readFileSync('reddit_thread_temp.html', 'utf8');

const regex = /<div class="usertext-body[^"]*">[\s\S]*?<div class="md">([\s\S]*?)<\/div>[\s\S]*?<\/div>/g;
let match;
const comments = [];
while ((match = regex.exec(html)) !== null) {
  const text = match[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .trim();
  if (text) comments.push(text);
}

console.log('Total comments found:', comments.length);
fs.writeFileSync('extracted_comments.txt', comments.join('\n---\n'), 'utf8');

// Also let's extract all names mentioned
console.log('--- SAMPLE COMMENTS ---');
comments.slice(0, 30).forEach((c, i) => console.log(`[${i+1}] ${c}`));

