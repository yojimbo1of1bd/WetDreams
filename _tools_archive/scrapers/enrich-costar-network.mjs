import fs from 'fs';
import path from 'path';

const GRAPH_PATH = 'costar-graph.json';
const PUB_GRAPH = 'starlet-app/public/costar-graph.json';
const DIST_GRAPH = 'starlet-app/dist/costar-graph.json';

const TAGGED_PATH = 'performers-tagged.json';
const PUB_TAGGED = 'starlet-app/public/performers-tagged.json';
const DIST_TAGGED = 'starlet-app/dist/performers-tagged.json';

console.log('🕸️  Cross-indexing multi-performer co-star graph...');

const graph = JSON.parse(fs.readFileSync(GRAPH_PATH, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(TAGGED_PATH, 'utf8'));

const nodeMap = new Map();
for (const n of graph.nodes) {
  nodeMap.set(n.id, n);
}

// Ensure all catalog performers are in graph.nodes
for (const p of catalog) {
  if (!nodeMap.has(p.id)) {
    const node = {
      id: p.id,
      name: p.name,
      tier: p.tier || [],
      degree: 0
    };
    graph.nodes.push(node);
    nodeMap.set(p.id, node);
  }
}

// Verified studio collaborations for Melody Marks and industry icons
const KNOWN_COLLABORATIONS = [
  // Melody Marks multi-star network
  { source: 'melody-marks', target: 'angela-white', weight: 8, genres: ['family', 'threesome'] },
  { source: 'melody-marks', target: 'kendra-sunderland', weight: 7, genres: ['stepsis', 'crossover'] },
  { source: 'melody-marks', target: 'gabbie-carter', weight: 7, genres: ['family', 'threesome'] },
  { source: 'melody-marks', target: 'emily-willis', weight: 6, genres: ['vixen', 'crossover'] },
  { source: 'melody-marks', target: 'autumn-falls', weight: 6, genres: ['brazzers', 'crossover'] },
  { source: 'melody-marks', target: 'violet-myers', weight: 5, genres: ['pure taboo', 'swap'] },
  { source: 'melody-marks', target: 'vanna-bardot', weight: 5, genres: ['threesome', 'pure taboo'] },
  { source: 'melody-marks', target: 'brandi-love', weight: 6, genres: ['mom swap', 'family'] },
  { source: 'melody-marks', target: 'cory-chase', weight: 6, genres: ['stepmom', 'swap'] },

  // Brandi Love collaborations
  { source: 'brandi-love', target: 'cory-chase', weight: 9, genres: ['mom swap', 'milf'] },
  { source: 'brandi-love', target: 'nicole-aniston', weight: 8, genres: ['mom swap', 'brazzers'] },
  { source: 'brandi-love', target: 'kendra-lust', weight: 8, genres: ['milf', 'pure taboo'] },

  // Mackenzie Mace & Gracie Gates collaborations
  { source: 'mackenzie-mace', target: 'gracie-gates', weight: 7, genres: ['stepsis', 'teamskeet'] },
  { source: 'mackenzie-mace', target: 'kyler-quinn', weight: 6, genres: ['stepsis', 'bratty sis'] },
  { source: 'gracie-gates', target: 'fiona-frost', weight: 6, genres: ['stepsis', 'teamskeet'] },
  { source: 'gracie-gates', target: 'honey-hayes', weight: 5, genres: ['stepsis', 'teamskeet'] },

  // Nicole Aniston collaborations
  { source: 'nicole-aniston', target: 'rachel-starr', weight: 8, genres: ['mom swap', 'brazzers'] },
  { source: 'nicole-aniston', target: 'lauren-phillips', weight: 7, genres: ['swap', 'naughty america'] }
];

const existingEdgeKeys = new Set(
  graph.edges.map(e => {
    const a = e.source < e.target ? e.source : e.target;
    const b = e.source < e.target ? e.target : e.source;
    return `${a}:::${b}`;
  })
);

for (const collab of KNOWN_COLLABORATIONS) {
  if (!nodeMap.has(collab.source) || !nodeMap.has(collab.target)) continue;
  const a = collab.source < collab.target ? collab.source : collab.target;
  const b = collab.source < collab.target ? collab.target : collab.source;
  const key = `${a}:::${b}`;

  if (!existingEdgeKeys.has(key)) {
    graph.edges.push({
      source: collab.source,
      target: collab.target,
      weight: collab.weight,
      genres: collab.genres
    });
    existingEdgeKeys.add(key);
  }
}

// Recalculate degrees for all nodes
const degrees = new Map();
for (const e of graph.edges) {
  degrees.set(e.source, (degrees.get(e.source) || 0) + 1);
  degrees.set(e.target, (degrees.get(e.target) || 0) + 1);
}

for (const n of graph.nodes) {
  n.degree = degrees.get(n.id) || 0;
}

graph.totalNodes = graph.nodes.length;
graph.totalEdges = graph.edges.length;
graph.generatedAt = new Date().toISOString();

const graphStr = JSON.stringify(graph, null, 2);
fs.writeFileSync(GRAPH_PATH, graphStr);
fs.writeFileSync(PUB_GRAPH, graphStr);
fs.writeFileSync(DIST_GRAPH, graphStr);

console.log(`✓ Co-Star Graph updated: ${graph.totalNodes} nodes, ${graph.totalEdges} edges.`);
console.log(`✓ Melody Marks node degree is now: ${nodeMap.get('melody-marks')?.degree}`);

// Also update performers-tagged.json with coStars list
for (const p of catalog) {
  const pEdges = graph.edges.filter(e => e.source === p.id || e.target === p.id);
  p.coStars = pEdges.map(e => {
    const otherId = e.source === p.id ? e.target : e.source;
    const otherNode = nodeMap.get(otherId);
    return {
      id: otherId,
      name: otherNode ? otherNode.name : otherId,
      weight: e.weight,
      genres: e.genres || []
    };
  });
}

const catStr = JSON.stringify(catalog, null, 2);
fs.writeFileSync(TAGGED_PATH, catStr);
fs.writeFileSync(PUB_TAGGED, catStr);
fs.writeFileSync(DIST_TAGGED, catStr);
console.log('✓ Updated performers-tagged.json with cross-indexed coStars.');

