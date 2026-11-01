// language: Node.js, file: tag-genres.mjs
// reads performers.json, adds genres[] to each record + each scene, writes performers-tagged.json
// run: node tag-genres.mjs
import fs from 'node:fs/promises';

const GENRES = [
  { id:'stepmom',      label:'Stepmom',          patterns:[/step\s*mom/i, /stepmother/i, /momswap/i, /mom\s*swap/i] },
  { id:'stepsis',      label:'Stepsis',          patterns:[/step\s*sis/i, /stepsister/i, /step\s*sister/i, /sister\s*swap/i] },
  { id:'stepdaughter', label:'Stepdaughter',     patterns:[/step\s*daughter/i, /stepdaughter/i, /dadcrush/i] },
  { id:'stepdad',      label:'Stepdad',          patterns:[/step\s*dad/i, /stepdad/i] },
  { id:'stepbro',      label:'Stepbrother',      patterns:[/step\s*bro/i, /stepbro/i, /step\s*brother/i] },
  { id:'mom',          label:'Mom / MILF',       patterns:[/\bmom\b/i, /milf/i, /mother/i] },
  { id:'family',       label:'Family (general)', patterns:[/family/i, /taboo/i, /relatives?/i] },
  { id:'birthday',     label:'Birthday Gift',    patterns:[/birthday/i] },
  { id:'persuasion',   label:'Persuasion',       patterns:[/persuad/i, /convinc/i, /coax/i] },
  { id:'permission',   label:'Permission',       patterns:[/permission/i, /ask.*dad/i, /ask.*mom/i] },
  { id:'shared-bed',   label:'Shared Bed',       patterns:[/shared\s*bed/i, /sharing\s*bed/i, /same\s*bed/i, /sharing\s*a\s*bed/i] },
  { id:'swap',         label:'Swap',             patterns:[/(^|\s)swap/i] },
  { id:'cheating',     label:'Cheating',         patterns:[/cheat/i, /affair/i, /infidel/i, /unfaithful/i] },
  { id:'blackmail',    label:'Blackmail',        patterns:[/blackmail/i, /coerc/i, /extort/i] },
  { id:'study',        label:'Study Help',       patterns:[/study/i, /homework/i, /tutor/i, /grades?/i] },
  { id:'sensory',      label:'Sensory Play',     patterns:[/blindfold/i, /sensory/i, /tasting/i, /guess\s*who/i] },
  { id:'siblings',     label:'Siblings',         patterns:[/sibling/i, /\bbrother\b/i, /\bsister\b/i] },
  { id:'caught',       label:'Caught',           patterns:[/caught/i, /busted/i, /discover/i] },
  { id:'sleepover',    label:'Sleepover',        patterns:[/sleepover/i, /night\s*together/i] },
  { id:'vacation',     label:'Vacation',         patterns:[/vacation/i, /\btrip\b/i, /resort/i, /holiday/i] },
];

// filter placeholder "scene titles" that aren't real scene names
const PLACEHOLDER = /^(.*\b(feature|series|scenes?|content|catalog|debut|work|showcase|breakout|classics?|favorites?)\b.*)$/i;

function isRealScene(s){
  if (!s.title) return false;
  const t = s.title.trim();
  if (t.length < 6) return false;
  if (PLACEHOLDER.test(t) && !/\d{4}|\"|\:|Ep\.|Episode|Vol\.|Part/i.test(t)) return false;
  return true;
}

const HAY = rec => [
  rec.name,
  rec.notes,
  rec.expanded,
  ...(rec.tags||[]),
  ...(rec.awards||[]),
  ...(rec.badges||[]),
  ...(rec.scenes||[]).flatMap(s => [s.title, s.studio, s.url]),
].filter(Boolean).join(' \u0001 ');

function tagRecord(rec){
  const hay = HAY(rec);
  const genres = new Set();
  for (const g of GENRES){
    if (g.patterns.some(p => p.test(hay))) genres.add(g.id);
  }
  const scenes = (rec.scenes||[]).map(s => {
    const sh = [s.title, s.studio].filter(Boolean).join(' ');
    const sg = GENRES.filter(g => g.patterns.some(p => p.test(sh))).map(g => g.id);
    return { ...s, genres: sg, isReal: isRealScene(s) };
  });
  return { ...rec, genres: [...genres].sort(), scenes };
}

async function main(){
  const inPath  = process.argv[2] || 'performers.json';
  const outPath = process.argv[3] || 'performers-tagged.json';
  const raw = await fs.readFile(inPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) throw new Error('performers.json is not an array');

  const tagged = data.map(tagRecord);

  const counts = {};
  for (const r of tagged) for (const g of r.genres) counts[g] = (counts[g] || 0) + 1;
  const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
  console.log('genre distribution:');
  for (const [g, n] of sorted) console.log(`  ${g.padEnd(14)} ${String(n).padStart(4)}`);

  await fs.writeFile(outPath, JSON.stringify(tagged, null, 2));
  console.log(`\nwrote ${outPath} — ${tagged.length} records`);

  // Mirror to starlet-app/public/ and dist/
  const pubPath = 'starlet-app/public/performers-tagged.json';
  const distPath = 'starlet-app/dist/performers-tagged.json';
  try {
    await fs.writeFile(pubPath, JSON.stringify(tagged, null, 2));
    console.log(`✓ mirrored to ${pubPath}`);
  } catch {}
  try {
    await fs.writeFile(distPath, JSON.stringify(tagged, null, 2));
    console.log(`✓ mirrored to ${distPath}`);
  } catch {}
}

main().catch(e => { console.error(e); process.exit(1); });
