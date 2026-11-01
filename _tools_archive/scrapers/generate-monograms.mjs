// language: Node.js, file: generate-monograms.mjs
// Generates beautiful offline SVG avatars in ./avatars/{id}.svg
// and creates an SVG-based local fallback so that every performer has a crisp, gorgeous offline portrait.

import fs from 'node:fs/promises';
import path from 'node:path';

const AVATAR_DIR = path.resolve('avatars');

// Vibrant, stylish gradients matching the dark theme
const PALETTES = [
  ['#8B5CF6', '#EC4899'], // Violet to Pink
  ['#3B82F6', '#10B981'], // Blue to Emerald
  ['#F59E0B', '#EF4444'], // Amber to Red
  ['#6366F1', '#8B5CF6'], // Indigo to Violet
  ['#EC4899', '#F43F5E'], // Pink to Rose
  ['#14B8A6', '#06B6D4'], // Teal to Cyan
  ['#F97316', '#EAB308'], // Orange to Yellow
  ['#A855F7', '#6366F1'], // Purple to Indigo
  ['#06B6D4', '#3B82F6'], // Cyan to Blue
  ['#10B981', '#14B8A6'], // Emerald to Teal
  ['#D946EF', '#8B5CF6'], // Fuchsia to Purple
  ['#E11D48', '#FB7185'], // Rose
];

function getHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateSvgAvatar(name, hair) {
  const hash = getHash(name);
  const palette = PALETTES[hash % PALETTES.length];
  const initials = getInitials(name);
  
  // Decorative geometric subtle background pattern
  const c1 = palette[0];
  const c2 = palette[1];
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <radialGradient id="glow-${hash}" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="rgba(255,255,255,0.25)" />
      <stop offset="100%" stop-color="rgba(0,0,0,0.4)" />
    </radialGradient>
  </defs>
  <!-- Background circle with gradient -->
  <circle cx="100" cy="100" r="100" fill="url(#grad-${hash})" />
  <circle cx="100" cy="100" r="100" fill="url(#glow-${hash})" />
  
  <!-- Subtle inner ring accent -->
  <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2.5" />
  
  <!-- Monogram Initials -->
  <text x="100" y="112" font-family="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="68" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle"
        letter-spacing="1" style="text-shadow: 0 4px 12px rgba(0,0,0,0.45);">${initials}</text>
  
  <!-- Sub-label with hair/vibe cue -->
  <text x="100" y="156" font-family="'Inter', sans-serif" font-size="12" font-weight="600"
        fill="rgba(255,255,255,0.75)" text-anchor="middle" letter-spacing="2" text-transform="uppercase">${(hair || '').slice(0, 10)}</text>
</svg>`;
}

async function main() {
  await fs.mkdir(AVATAR_DIR, { recursive: true });
  const performers = JSON.parse(await fs.readFile('performers.json', 'utf8'));

  console.log(`Generating offline vector portrait avatars for ${performers.length} performers...`);
  let count = 0;

  for (const p of performers) {
    const svgPath = path.join(AVATAR_DIR, `${p.id}.svg`);
    const svgContent = generateSvgAvatar(p.name, p.hair);
    await fs.writeFile(svgPath, svgContent, 'utf8');
    count++;
  }

  console.log(`Successfully generated ${count} offline vector avatars in ./avatars/!`);
}

main().catch(console.error);

