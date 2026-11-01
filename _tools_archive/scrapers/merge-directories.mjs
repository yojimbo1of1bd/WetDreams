// language: Node.js, file: merge-directories.mjs
// reads all three HTML files, extracts their embedded data, normalizes, dedupes by name.
import fs from 'node:fs/promises';

const SLUG = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');

function parseYearRange(label){
  // "2018-2023" | "2018+" | "2016-2020, 2023+"
  const m = String(label).match(/(\d{4})/);
  const from = m ? parseInt(m[1],10) : null;
  const to = /\+/.test(label) ? null : (String(label).match(/(\d{4})(?!.*\d{4})/) || [])[1];
  return { from, to: to ? parseInt(to,10) : null };
}

// --- extract v4 main (the big one) ---
async function fromV4(path){
  const html = await fs.readFile(path,'utf8');
  // the array sits between "const mainPerformers=[" and "];"
  const m = html.match(/const\s+mainPerformers\s*=\s*(\[[\s\S]*?\]);/);
  if (!m) throw new Error('mainPerformers not found');
   const cleaned = m[1].replace(/\bbp\("([^"]*)"\)/g, '"$1"');
  let arr;
  try { arr = JSON.parse(cleaned); }
  catch { arr = (new Function('return ' + cleaned))(); }
  return arr.map(p => ({
    id: SLUG(p.name),
    name: p.name,
    aliases: [],
    age: p.age ? parseInt(p.age,10) : null,
    active: { ...parseYearRange(p.period||''), label: p.period||'' },
    hair: p.hair || null,
    ethnicity: p.ethnicity || null,
    nationality: p.nationality || null,
    tier: p.tier || [],
    awards: p.awards || [],
    badges: [],
    scenes: p.video ? [{ title: p.video, studio: p.content ? p.content.split(',')[0].trim() : '', url: null }] : [],
    notes: p.notes || '',
    expanded: p.content || '',
    tags: [p.hair, p.ethnicity, p.nationality].filter(Boolean),
    links: { babepedia: p.babepedia || null },
    sources: { main: 1, excogi: null, reference: null },
  }));
}

// --- extract v7 excogi (the starlets[] array) ---
async function fromV7(path){
  const html = await fs.readFile(path,'utf8');
  const m = html.match(/const\s+starlets\s*=\s*(\[[\s\S]*?\]);\s*\n\s*let\s+seenIds/);
  if (!m) throw new Error('starlets not found');
  const arr = JSON.parse(m[1]);
  return arr.map(s => ({
    id: SLUG(s.name),
    name: s.name,
    aliases: [],
    age: s.age ?? null,
    active: { ...parseYearRange(s.active||''), label: s.active||'' },
    height: s.height || null,
    hair: s.hair || null,
    body: s.body || null,
    ethnicity: s.ethnicity || null,
    nationality: null,
    tier: [],
    awards: [],
    badges: s.badges || [],
    scenes: (s.scenes||[]).map(sc => ({ title: sc.title, studio: '', url: sc.url || null })),
    notes: s.desc || '',
    expanded: s.expanded || '',
    tags: s.tags || [],
    links: {},
    sources: { main: null, excogi: 1, reference: null },
  }));
}

// --- extract reference file panels ---
// (signature scenes + debut-at-18 cards)
async function fromReference(path){
  const html = await fs.readFile(path,'utf8');
  const out = [];

  // signature scene cards — one record per <article class="scene-card">
  const sceneRe = /<article class="scene-card">([\s\S]*?)<\/article>/g;
  let m;
  while ((m = sceneRe.exec(html))) {
    const card = m[1];
    const performer = (card.match(/<div class="performer">([^<]+)<\/div>/)||[])[1];
    const title = (card.match(/<div class="scene-title">([^<]+)<\/div>/)||[])[1];
    const studio = (card.match(/<div class="studio">([^<]+)<\/div>/)||[])[1];
    const desc = (card.match(/<div class="desc">([\s\S]*?)<\/div>/)||[])[1];
    if (!performer) continue;
    out.push({
      id: SLUG(performer.split('&')[0].trim()),
      name: performer.split('&')[0].trim(),
      aliases: performer.includes('&') ? performer.split('&').map(x=>x.trim()) : [],
      age: null,
      active: { from: null, to: null, label: '' },
      tier: [], awards: [], badges: [],
      scenes: [{ title: title || '', studio: (studio||'').replace(/^Studio:\s*/,''), url: null }],
      notes: (desc||'').replace(/<[^>]+>/g,'').trim(),
      expanded: '',
      tags: [],
      links: {},
      sources: { main: null, excogi: null, reference: 1 },
    });
  }

  // debut-at-18 cards
  const debutRe = /<article class="debut-card">([\s\S]*?)<\/article>/g;
  while ((m = debutRe.exec(html))) {
    const card = m[1];
    const name = (card.match(/<div class="name">([^<]+)<\/div>/)||[])[1];
    const meta = (card.match(/<div class="meta">([^<]+)<\/div>/)||[])[1];
    const desc = (card.match(/<div class="desc">([\s\S]*?)<\/div>/)||[])[1];
    if (!name) continue;
    const ageM = (meta||'').match(/at\s+(\d{2})/);
    const yearM = (meta||'').match(/(\d{4})/);
    out.push({
      id: SLUG(name),
      name,
      aliases: [],
      age: ageM ? parseInt(ageM[1],10) : null,
      active: { from: yearM ? parseInt(yearM[1],10) : null, to: null, label: meta||'' },
      tier: [], awards: [], badges: [],
      scenes: [],
      notes: (desc||'').replace(/<[^>]+>/g,'').trim(),
      expanded: '',
      tags: [],
      links: {},
      sources: { main: null, excogi: null, reference: 1 },
    });
  }
  return out;
}

// --- merge ---
function merge(a, b){
  const out = { ...a };
  for (const k of Object.keys(b)){
    const va = a[k], vb = b[k];
    if (vb === null || vb === undefined) continue;
    if (Array.isArray(va) && Array.isArray(vb)) {
      const seen = new Set(va.map(x => typeof x === 'string' ? x : JSON.stringify(x)));
      out[k] = [...va, ...vb.filter(x => !seen.has(typeof x === 'string' ? x : JSON.stringify(x)))];
    } else if (typeof va === 'object' && va && typeof vb === 'object' && !Array.isArray(va) && !Array.isArray(vb)) {
      // merge objects field by field, skipping null/undefined in b
      const merged = { ...va };
      for (const sk of Object.keys(vb)){
        if (vb[sk] !== null && vb[sk] !== undefined) merged[sk] = vb[sk];
      }
      out[k] = merged;
    } else {
      out[k] = vb;
    }
  }
  // sources: union, never overwrite with null
  out.sources = {
    main: a.sources.main || b.sources.main,
    excogi: a.sources.excogi || b.sources.excogi,
    reference: a.sources.reference || b.sources.reference,
  };
  return out;
}

const [,, v4Path, v7Path, refPath, outPath] = process.argv;
if (!outPath){ console.error('usage: node merge-directories.mjs v4.html v7.html reference.html out.json'); process.exit(1); }

const [main, excogi, reference] = await Promise.all([
  fromV4(v4Path),
  fromV7(v7Path),
  fromReference(refPath),
]);

const byId = new Map();
for (const rec of [...main, ...excogi, ...reference]){
  if (byId.has(rec.id)) byId.set(rec.id, merge(byId.get(rec.id), rec));
  else byId.set(rec.id, rec);
}

const merged = [...byId.values()].sort((a,b)=>a.name.localeCompare(b.name));
await fs.writeFile(outPath, JSON.stringify(merged, null, 2));
console.log(`merged ${main.length} + ${excogi.length} + ${reference.length} → ${merged.length} unique performers → ${outPath}`);