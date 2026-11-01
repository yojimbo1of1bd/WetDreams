import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('thread_comments.json', 'utf8'));
const comments = raw.data || [];
console.log('Total comments in thread:', comments.length);

const userMentioned = new Set([
  'vanna bardot', 'alina lopez', 'hazel moore', 'melody marks', 'maya woulfe',
  'kylie quinn', 'haley reed', 'kendra spade', 'leana lovings', 'kenna james', 'keena james',
  'lena paul', 'indica flower', 'liz jordan', 'molly little', 'kenzie taylor',
  'pristine edge', 'electra rayne', 'jayden cole', 'jewelz blu', 'jwelz blue',
  'gianna dior', 'staci carr', 'ivana sugar', 'lilu moon', 'clea gaultier',
  'alexa tomas', 'megan salinas', 'alexis breeze', 'willow ryder', 'nicole kitt',
  'kira noir', 'chanell heart'
].map(s => s.toLowerCase().trim()));

const commentTexts = comments.map(c => c.body).filter(Boolean);

fs.writeFileSync('all_thread_comments_clean.txt', commentTexts.join('\n---\n'), 'utf8');

console.log('Written to all_thread_comments_clean.txt');

