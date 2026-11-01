import fs from 'fs';

const raw = JSON.parse(fs.readFileSync('thread_comments.json', 'utf8'));
const comments = raw.data || [];

const userMentioned = new Set([
  'vanna bardot', 'alina lopez', 'hazel moore', 'melody marks', 'maya woulfe',
  'kylie quinn', 'haley reed', 'kendra spade', 'leana lovings', 'kenna james', 'keena james',
  'lena paul', 'indica flower', 'liz jordan', 'molly little', 'kenzie taylor',
  'pristine edge', 'electra rayne', 'jayden cole', 'jewelz blu', 'jwelz blue',
  'gianna dior', 'staci carr', 'ivana sugar', 'lilu moon', 'clea gaultier',
  'alexa tomas', 'megan salinas', 'alexis breeze', 'willow ryder', 'nicole kitt',
  'kira noir', 'chanell heart'
].map(s => s.toLowerCase().trim()));

// Load existing performers
const performers = JSON.parse(fs.readFileSync('performers-tagged.json', 'utf8'));
const nameToObj = new Map();
performers.forEach(p => {
  if (p.name) nameToObj.set(p.name.toLowerCase().trim(), p);
  if (p.aliases) {
    p.aliases.forEach(a => nameToObj.set(a.toLowerCase().trim(), p));
  }
});

console.log('=== EXTRACTING NAMES FROM REDDIT COMMENTS ===');
const foundNewInDb = new Set();
const potentialNames = [];

comments.forEach((c, idx) => {
  const body = c.body || '';
  const bodyLower = body.toLowerCase();
  
  // Find matches in DB
  const matchedThisComment = [];
  nameToObj.forEach((p, name) => {
    if (name.length > 3 && bodyLower.includes(name)) {
      if (!userMentioned.has(name) && !userMentioned.has(p.name.toLowerCase())) {
        matchedThisComment.push(p.name);
        foundNewInDb.add(p.name);
      }
    }
  });

  console.log(`[#${idx+1}] (Score: ${c.score}, Author: ${c.author}):`);
  console.log(`Text: ${body}`);
  if (matchedThisComment.length) {
    console.log(`-> Matched New Stars: ${matchedThisComment.join(', ')}`);
  }
  console.log('--------------------------------------------------');
});

console.log('\n================ SUMMARY OF NEW STARS ================');
console.log('Matched in DB:', Array.from(foundNewInDb).sort());

