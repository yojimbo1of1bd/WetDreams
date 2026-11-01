#!/usr/bin/env node
/**
 * build-costar-graph.mjs
 * 
 * Implements Plan v2.0 - Phase 1: Bipartite Co-Star Graph Construction
 * 
 * 1. Analyzes shared multi-actress scenes across the catalog.
 * 2. Builds weighted bi-directional co-star graph edges.
 * 3. Extracts co-star scenario affinities (e.g. who appears together in Swaps, MSD, FFM).
 * 4. Outputs costar-graph.json and enriches performer records with co-star connections.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('🕸️  [Plan v2.0] Building Bipartite Co-Star Graph...');

  const performersRaw = await fs.readFile(path.join(__dirname, 'performers.json'), 'utf8');
  const performers = JSON.parse(performersRaw);
  const perfMap = new Map(performers.map(p => [p.id, p]));

  let canonicalScenes = [];
  try {
    const scenesRaw = await fs.readFile(path.join(__dirname, 'canonical-scenes.json'), 'utf8');
    canonicalScenes = JSON.parse(scenesRaw);
    console.log(`✓ Loaded ${canonicalScenes.length} canonical scenes.`);
  } catch {
    console.log('⚠️  canonical-scenes.json not found, harvesting from performer scenes directly...');
  }

  // 1. Gather all scenes across catalog
  const allScenes = new Map(); // url or id -> scene
  for (const s of canonicalScenes) {
    if (s.url) allScenes.set(s.url, s);
  }

  for (const p of performers) {
    for (const s of (p.scenes || [])) {
      if (!s.url) continue;
      if (!allScenes.has(s.url)) {
        allScenes.set(s.url, {
          title: s.title,
          fullTitle: s.fullTitle || s.title,
          studio: s.studio,
          url: s.url,
          genres: s.genres || [],
          performers: [p.id],
          isReal: s.isReal
        });
      } else {
        const existing = allScenes.get(s.url);
        if (!existing.performers.includes(p.id)) {
          existing.performers.push(p.id);
        }
      }
    }
  }

  console.log(`✓ Processed ${allScenes.size} unique scenes.`);

  // 2. Build pairwise co-star edges
  // pairKey "idA:idB" (sorted) -> { count, scenarios: Set, scenes: [] }
  const pairEdges = new Map();
  // id -> Map(coStarId -> { count, scenarios: Set, scenes: [] })
  const adjacency = new Map();

  for (const p of performers) {
    adjacency.set(p.id, new Map());
  }

  let multiCastScenesCount = 0;

  for (const scene of allScenes.values()) {
    const cast = scene.performers;
    if (cast.length > 1) {
      multiCastScenesCount++;

      for (let i = 0; i < cast.length; i++) {
        for (let j = i + 1; j < cast.length; j++) {
          const idA = cast[i];
          const idB = cast[j];

          // Key sorted
          const pairKey = idA < idB ? `${idA}:${idB}` : `${idB}:${idA}`;
          if (!pairEdges.has(pairKey)) {
            pairEdges.set(pairKey, {
              p1: idA,
              p2: idB,
              weight: 0,
              genres: new Set(),
              scenes: []
            });
          }

          const edge = pairEdges.get(pairKey);
          edge.weight++;
          for (const g of (scene.genres || [])) edge.genres.add(g);
          edge.scenes.push({
            title: scene.title,
            studio: scene.studio,
            url: scene.url
          });

          // Update adjacency maps
          const updateAdj = (fromId, toId) => {
            if (!adjacency.has(fromId)) adjacency.set(fromId, new Map());
            const map = adjacency.get(fromId);
            if (!map.has(toId)) {
              map.set(toId, { id: toId, weight: 0, genres: new Set(), sharedScenes: [] });
            }
            const rec = map.get(toId);
            rec.weight++;
            for (const g of (scene.genres || [])) rec.genres.add(g);
            rec.sharedScenes.push(scene.title);
          };

          updateAdj(idA, idB);
          updateAdj(idB, idA);
        }
      }
    }
  }

  console.log(`✓ Analyzed ${multiCastScenesCount} multi-cast scenes.`);
  console.log(`✓ Formed ${pairEdges.size} bi-directional co-star edges across the network.`);

  // 3. Attach top co-stars to each performer record
  let enrichedPerformers = 0;
  for (const p of performers) {
    const coMap = adjacency.get(p.id);
    if (coMap && coMap.size > 0) {
      const coStarList = [...coMap.values()]
        .map(entry => {
          const costar = perfMap.get(entry.id);
          return {
            id: entry.id,
            name: costar ? costar.name : entry.id,
            avatar: costar ? costar.avatar : null,
            weight: entry.weight,
            genres: [...entry.genres],
            sharedScenes: entry.sharedScenes.slice(0, 5)
          };
        })
        .sort((a, b) => b.weight - a.weight);

      p.coStars = coStarList;
      enrichedPerformers++;
    } else {
      p.coStars = [];
    }
  }

  console.log(`✓ Attached co-star network dossiers to ${enrichedPerformers} performers.`);

  // 4. Save costar-graph.json
  const graphData = {
    generatedAt: new Date().toISOString(),
    totalNodes: performers.length,
    totalEdges: pairEdges.size,
    nodes: performers.map(p => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      tier: p.tier,
      degree: (p.coStars || []).length
    })),
    edges: [...pairEdges.values()].map(e => ({
      source: e.p1,
      target: e.p2,
      weight: e.weight,
      genres: [...e.genres]
    }))
  };

  const graphPath = path.join(__dirname, 'costar-graph.json');
  const pubGraphPath = path.join(__dirname, 'starlet-app', 'public', 'costar-graph.json');
  const distGraphPath = path.join(__dirname, 'starlet-app', 'dist', 'costar-graph.json');

  await fs.writeFile(graphPath, JSON.stringify(graphData, null, 2));
  await fs.writeFile(pubGraphPath, JSON.stringify(graphData, null, 2));
  try {
    await fs.writeFile(distGraphPath, JSON.stringify(graphData, null, 2));
  } catch {}

  console.log(`✓ Saved costar-graph.json to root and starlet-app/public.`);

  // Save updated performers.json
  await fs.writeFile(path.join(__dirname, 'performers.json'), JSON.stringify(performers, null, 2));
  console.log(`✓ performers.json enriched with co-star graph linkages.`);
}

main().catch(err => {
  console.error('Fatal error in build-costar-graph:', err);
  process.exit(1);
});

