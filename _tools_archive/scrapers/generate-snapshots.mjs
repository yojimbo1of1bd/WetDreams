import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..', '..');
const publicDir = path.join(projectRoot, 'starlet-app', 'public', 'snapshots');
const distDir = path.join(projectRoot, 'starlet-app', 'dist', 'snapshots');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });

function createSvg(title, targetBadge, drawContent, redBoxX, redBoxY, redBoxW, redBoxH) {
  const safeBadge = targetBadge.replace(/&/g, '&amp;');
  const badgeY = Math.max(46, redBoxY - 26);
  const badgeW = targetBadge.length * 7.2 + 28;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 480" width="800" height="480">
  <defs>
    <filter id="redGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#140f16" />
      <stop offset="100%" stop-color="#080609" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="100%" stop-color="#d4a853" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="100%" stop-color="#f43f5e" />
    </linearGradient>
  </defs>

  <!-- Dark Obsidian Stage Background -->
  <rect width="800" height="480" fill="url(#bgGrad)" rx="16" />

  <!-- Top Mock Window Chrome / Header Bar -->
  <rect x="0" y="0" width="800" height="42" fill="#1b141e" rx="16" />
  <circle cx="24" cy="21" r="5" fill="#ef4444" opacity="0.8" />
  <circle cx="40" cy="21" r="5" fill="#f59e0b" opacity="0.8" />
  <circle cx="56" cy="21" r="5" fill="#10b981" opacity="0.8" />
  <text x="80" y="25" fill="#d4a853" font-family="Cinzel, serif" font-weight="700" font-size="12" letter-spacing="1.5">STARLET VIP DIRECTORY · HOMEPAGE UI</text>
  <rect x="660" y="12" width="120" height="18" rx="9" fill="#09070a" stroke="#d4a853" stroke-width="0.8" stroke-opacity="0.4" />
  <text x="675" y="25" fill="#d4a853" font-family="monospace" font-size="9" font-weight="bold">● LIVE VERIFIED</text>

  <!-- Main Viewport Content -->
  <g transform="translate(0, 42)">
    ${drawContent}
  </g>

  <!-- Marked Red Bounding Box with Neon Glow and Target Crosshairs -->
  <g filter="url(#redGlow)">
    <!-- Red Outer Box -->
    <rect x="${redBoxX}" y="${redBoxY}" width="${redBoxW}" height="${redBoxH}" 
          fill="none" stroke="#ef4444" stroke-width="3" stroke-dasharray="8,4" rx="10" />
    <!-- Glowing Corner Accents -->
    <path d="M ${redBoxX} ${redBoxY + 16} L ${redBoxX} ${redBoxY} L ${redBoxX + 16} ${redBoxY}" fill="none" stroke="#ff2222" stroke-width="4.5" />
    <path d="M ${redBoxX + redBoxW - 16} ${redBoxY} L ${redBoxX + redBoxW} ${redBoxY} L ${redBoxX + redBoxW} ${redBoxY + 16}" fill="none" stroke="#ff2222" stroke-width="4.5" />
    <path d="M ${redBoxX} ${redBoxY + redBoxH - 16} L ${redBoxX} ${redBoxY + redBoxH} L ${redBoxX + 16} ${redBoxY + redBoxH}" fill="none" stroke="#ff2222" stroke-width="4.5" />
    <path d="M ${redBoxX + redBoxW - 16} ${redBoxY + redBoxH} L ${redBoxX + redBoxW} ${redBoxY + redBoxH} L ${redBoxX + redBoxW} ${redBoxY + redBoxH - 16}" fill="none" stroke="#ff2222" stroke-width="4.5" />
  </g>

  <!-- Target Identifier Badge Tag -->
  <g transform="translate(${Math.max(16, redBoxX)}, ${badgeY})">
    <rect x="0" y="0" width="${badgeW}" height="24" rx="6" fill="#ef4444" />
    <circle cx="12" cy="12" r="4" fill="#ffffff" />
    <text x="22" y="16" fill="#ffffff" font-family="monospace" font-weight="800" font-size="11" letter-spacing="0.5">${safeBadge}</text>
  </g>
</svg>`;
}

// 1. Step 1: Intelligent Search Bar
const s1 = createSvg(
  'Step 1: Intelligent Search Bar',
  'FEATURE 1: INTELLIGENT SCENARIO & AGE SEARCH',
  `
  <!-- Header Bar -->
  <rect x="20" y="15" width="760" height="75" rx="12" fill="#151017" stroke="#2a1f2e" />
  
  <!-- Search Input Container -->
  <rect x="36" y="28" width="728" height="48" rx="24" fill="#0c080e" stroke="#d4a853" stroke-width="1.5" />
  <circle cx="62" cy="52" r="8" fill="none" stroke="#f59e0b" stroke-width="2" />
  <line x1="68" y1="58" x2="76" y2="66" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" />
  <text x="88" y="56" fill="#f5efe6" font-family="Inter, sans-serif" font-size="14" font-weight="500">mom swap under 24 czech stepsis</text>
  
  <!-- Detected Tokens Row -->
  <g transform="translate(36, 105)">
    <rect x="0" y="0" width="90" height="26" rx="13" fill="#241b26" stroke="#fb7185" stroke-width="1" />
    <text x="14" y="17" fill="#fb7185" font-family="monospace" font-size="11" font-weight="bold">#mom_swap</text>
    
    <rect x="100" y="0" width="85" height="26" rx="13" fill="#241b26" stroke="#60a5fa" stroke-width="1" />
    <text x="114" y="17" fill="#60a5fa" font-family="monospace" font-size="11" font-weight="bold">#under_24</text>
    
    <rect x="195" y="0" width="90" height="26" rx="13" fill="#241b26" stroke="#eab308" stroke-width="1" />
    <text x="210" y="17" fill="#eab308" font-family="monospace" font-size="11" font-weight="bold">#czech_gnd</text>

    <rect x="295" y="0" width="85" height="26" rx="13" fill="#241b26" stroke="#4ade80" stroke-width="1" />
    <text x="310" y="17" fill="#4ade80" font-family="monospace" font-size="11" font-weight="bold">#verified</text>
  </g>

  <!-- Mock Directory Grid Below -->
  <g transform="translate(36, 150)">
    <rect x="0" y="0" width="230" height="260" rx="14" fill="#140e16" stroke="#221724" />
    <rect x="248" y="0" width="230" height="260" rx="14" fill="#140e16" stroke="#221724" />
    <rect x="496" y="0" width="230" height="260" rx="14" fill="#140e16" stroke="#221724" />
  </g>
  `,
  30, 68, 740, 120
);

// 2. Step 2: Game Character Cards
const s2 = createSvg(
  'Step 2: Game Character Inspection Cards',
  'FEATURE 2: 3-COLUMN INSPECTION CARDS & SCROLL-SPY',
  `
  <!-- Top Tabs -->
  <rect x="36" y="15" width="120" height="32" rx="16" fill="#d4a853" />
  <text x="56" y="35" fill="#09070a" font-family="monospace" font-weight="bold" font-size="12">🌐 All Starlets</text>
  <rect x="166" y="15" width="110" height="32" rx="16" fill="#1c1420" stroke="#33243a" />
  <text x="182" y="35" fill="#a69b93" font-family="monospace" font-size="12">🔥 Reddit Hype</text>

  <!-- 3-Column Card Grid -->
  <g transform="translate(36, 65)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="228" height="335" rx="16" fill="#130e15" stroke="#261a29" />
    <circle cx="114" cy="70" r="44" fill="#2c1e30" />
    <text x="114" y="75" fill="#d4a853" font-family="serif" font-size="20" font-weight="bold" text-anchor="middle">VB</text>
    <text x="114" y="140" fill="#ffffff" font-family="serif" font-size="16" font-weight="bold" text-anchor="middle">Vanna Bardot</text>

    <!-- Card 2 (Target Spotlight) -->
    <rect x="250" y="0" width="228" height="335" rx="16" fill="#18111b" stroke="#d4a853" stroke-width="1.5" />
    <circle cx="364" cy="70" r="46" fill="#3b2542" stroke="#d4a853" stroke-width="2" />
    <text x="364" y="76" fill="#fb7185" font-family="serif" font-size="22" font-weight="bold" text-anchor="middle">MM</text>
    <text x="364" y="140" fill="#ffffff" font-family="serif" font-size="17" font-weight="bold" text-anchor="middle">Melody Marks</text>
    <rect x="314" y="152" width="100" height="18" rx="9" fill="#fb7185" fill-opacity="0.2" />
    <text x="364" y="165" fill="#fb7185" font-family="monospace" font-size="10" font-weight="bold" text-anchor="middle">★ STEPSIS SOVEREIGN</text>
    <text x="364" y="195" fill="#f59e0b" font-family="monospace" font-size="13" font-weight="bold" text-anchor="middle">★★★★★ 9.8</text>
    <rect x="274" y="215" width="180" height="28" rx="8" fill="#241b27" />
    <text x="364" y="233" fill="#a69b93" font-family="monospace" font-size="11" text-anchor="middle">100 Verified Releases</text>
    <rect x="274" y="255" width="180" height="34" rx="10" fill="url(#goldGrad)" />
    <text x="364" y="277" fill="#09070a" font-family="Inter, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">Inspect Character Dossier</text>

    <!-- Card 3 -->
    <rect x="500" y="0" width="228" height="335" rx="16" fill="#130e15" stroke="#261a29" />
    <circle cx="614" cy="70" r="44" fill="#2c1e30" />
    <text x="614" y="75" fill="#d4a853" font-family="serif" font-size="20" font-weight="bold" text-anchor="middle">AL</text>
    <text x="614" y="140" fill="#ffffff" font-family="serif" font-size="16" font-weight="bold" text-anchor="middle">Alina Lopez</text>
  </g>
  `,
  275, 95, 250, 360
);

// 3. Step 3: Cinema Player
const s3 = createSvg(
  'Step 3: Ad-Free Native Cinema Player',
  'FEATURE 3: AD-FREE NATIVE STREAMING PROXY & MIRRORS',
  `
  <!-- Modal Backdrop -->
  <rect x="25" y="10" width="750" height="400" rx="20" fill="#0b080d" stroke="#33243a" />
  
  <!-- Video Player Viewport -->
  <rect x="45" y="25" width="710" height="295" rx="12" fill="#000000" stroke="#f59e0b" stroke-width="1.5" />
  <circle cx="400" cy="160" r="32" fill="#f59e0b" />
  <polygon points="392,146 416,160 392,174" fill="#09070a" />
  
  <!-- Sandboxed Shield Bar -->
  <rect x="55" y="35" width="340" height="26" rx="8" fill="#09070a" fill-opacity="0.85" stroke="#10b981" />
  <circle cx="70" cy="48" r="4" fill="#10b981" />
  <text x="82" y="52" fill="#10b981" font-family="monospace" font-size="10" font-weight="bold">SANDBOX STRICT: POPUPS &amp; REDIRECTS BLOCKED</text>

  <!-- Mirror Switcher Gear Dropdown -->
  <g transform="translate(620, 35)">
    <rect x="0" y="0" width="125" height="28" rx="8" fill="#1f1624" stroke="#d4a853" />
    <circle cx="16" cy="14" r="5" fill="#f59e0b" />
    <text x="30" y="18" fill="#ffffff" font-family="monospace" font-size="10" font-weight="bold">⚙️ 1080p 60fps</text>
  </g>

  <!-- Player Bottom Controls -->
  <rect x="45" y="335" width="710" height="60" rx="12" fill="#150f18" />
  <text x="65" y="360" fill="#ffffff" font-family="serif" font-size="15" font-weight="bold">Melody Marks - The Unforgettable Family Swap</text>
  <text x="65" y="380" fill="#a69b93" font-family="monospace" font-size="11">Duration: 34:18 · Resolution: 1080p FHD · Mirror: Eporner CDN</text>
  `,
  35, 68, 730, 310
);

// 4. Step 4: Constellation Graph
const s4 = createSvg(
  'Step 4: Co-Star Constellation Graph',
  'FEATURE 4: CELESTIAL CO-STAR CONSTELLATION GRAPH',
  `
  <!-- Dark Galaxy Canvas -->
  <rect x="25" y="10" width="750" height="400" rx="18" fill="#060508" stroke="#221727" />

  <!-- Constellation Nodes & Connecting Filaments -->
  <g stroke="#d4a853" stroke-width="1.2" stroke-opacity="0.4">
    <line x1="400" y1="200" x2="250" y2="120" />
    <line x1="400" y1="200" x2="550" y2="120" />
    <line x1="400" y1="200" x2="280" y2="290" />
    <line x1="400" y1="200" x2="520" y2="290" />
    <line x1="250" y1="120" x2="550" y2="120" stroke-dasharray="4,4" />
    <line x1="280" y1="290" x2="520" y2="290" stroke-dasharray="4,4" />
  </g>

  <!-- Center Hub Starlet -->
  <circle cx="400" cy="200" r="38" fill="#2d1933" stroke="#f59e0b" stroke-width="3" />
  <text x="400" y="206" fill="#ffffff" font-family="serif" font-size="14" font-weight="bold" text-anchor="middle">Melody</text>

  <!-- Orbital Starlets -->
  <circle cx="250" cy="120" r="26" fill="#1b1420" stroke="#fb7185" stroke-width="2" />
  <text x="250" y="125" fill="#fb7185" font-family="serif" font-size="11" font-weight="bold" text-anchor="middle">Vanna</text>

  <circle cx="550" cy="120" r="26" fill="#1b1420" stroke="#60a5fa" stroke-width="2" />
  <text x="550" y="125" fill="#60a5fa" font-family="serif" font-size="11" font-weight="bold" text-anchor="middle">Alina</text>

  <circle cx="280" cy="290" r="26" fill="#1b1420" stroke="#eab308" stroke-width="2" />
  <text x="280" y="295" fill="#eab308" font-family="serif" font-size="11" font-weight="bold" text-anchor="middle">Hazel</text>

  <circle cx="520" cy="290" r="26" fill="#1b1420" stroke="#4ade80" stroke-width="2" />
  <text x="520" y="295" fill="#4ade80" font-family="serif" font-size="11" font-weight="bold" text-anchor="middle">Kendra</text>
  `,
  190, 75, 420, 310
);

// 5. Step 5: Focus Sanctuary
const s5 = createSvg(
  'Step 5: Focus Sanctuary & Pomodoro',
  'FEATURE 5: FOCUS SANCTUARY CAMOUFLAGE & POMODORO',
  `
  <!-- Ambient Wallpaper Mimic -->
  <rect x="25" y="10" width="750" height="400" rx="18" fill="#101827" stroke="#1f2937" />
  
  <!-- Huge Clock Display -->
  <text x="400" y="210" fill="#ffffff" font-family="monospace" font-size="96" font-weight="800" text-anchor="middle" letter-spacing="-3">25:00</text>
  
  <!-- Pomodoro Chips -->
  <g transform="translate(260, 70)">
    <rect x="0" y="0" width="90" height="28" rx="14" fill="#ffffff" />
    <text x="45" y="18" fill="#000000" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">pomodoro</text>
    <rect x="100" y="0" width="90" height="28" rx="14" fill="#1f2937" />
    <text x="145" y="18" fill="#ffffff" font-family="sans-serif" font-size="11" text-anchor="middle">short break</text>
    <rect x="200" y="0" width="90" height="28" rx="14" fill="#1f2937" />
    <text x="245" y="18" fill="#ffffff" font-family="sans-serif" font-size="11" text-anchor="middle">long break</text>
  </g>

  <!-- Rotating Quote -->
  <text x="400" y="275" fill="#fde68a" font-family="serif" font-style="italic" font-size="14" text-anchor="middle">"Concentrate every minute like a Roman—on doing what's in front of you."</text>
  <text x="400" y="295" fill="#9ca3af" font-family="sans-serif" font-size="11" text-anchor="middle">— Marcus Aurelius</text>

  <!-- Start Button -->
  <rect x="330" y="325" width="140" height="44" rx="22" fill="#ffffff" />
  <text x="400" y="352" fill="#000000" font-family="sans-serif" font-size="15" font-weight="bold" text-anchor="middle">▶ start</text>
  `,
  120, 80, 560, 310
);

// 6. Step 6: Habituation Engine & Lockout
const s6 = createSvg(
  'Step 6: Habituation Engine',
  'FEATURE 6: HABITUATION ENGINE & 36H TRI-FOLD QUARANTINE',
  `
  <!-- Modal Card -->
  <rect x="150" y="20" width="500" height="380" rx="18" fill="#160e15" stroke="#ef4444" stroke-width="2" />
  
  <!-- Red Melody Effect Banner -->
  <rect x="150" y="20" width="500" height="50" rx="18" fill="#ef4444" fill-opacity="0.2" />
  <text x="400" y="50" fill="#fca5a5" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">⚠️ 36-HOUR RESTING QUARANTINE ENFORCED</text>
  
  <!-- Visible Avatar Image (Unblurred) -->
  <circle cx="400" cy="130" r="42" fill="#2c1a2d" stroke="#f59e0b" stroke-width="2" />
  <text x="400" y="136" fill="#f59e0b" font-family="serif" font-size="20" font-weight="bold" text-anchor="middle">BL</text>
  <text x="400" y="190" fill="#ffffff" font-family="serif" font-size="18" font-weight="bold" text-anchor="middle">Brandi Love (Quarantined)</text>
  <text x="400" y="210" fill="#f87171" font-family="monospace" font-size="12" text-anchor="middle">Trigger: Rapid-Abandonment Penalty (ADHD Click Surge)</text>

  <!-- Timer Countdown -->
  <rect x="220" y="235" width="360" height="44" rx="10" fill="#09070a" stroke="#37243b" />
  <text x="400" y="262" fill="#d4a853" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle">Unlock: Day After Next at 12:00 PM</text>

  <!-- Dismiss Button -->
  <rect x="250" y="305" width="300" height="40" rx="20" fill="#241926" stroke="#fb7185" />
  <text x="400" y="330" fill="#ffffff" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle">✕ Close &amp; Explore Other 1,375 Starlets</text>
  `,
  140, 68, 520, 340
);

// 7. Step 7: Admissions Queue & Backup
const s7 = createSvg(
  'Step 7: Admissions Queue & Backup',
  'FEATURE 7: ADMISSIONS QUEUE & DATA SOVEREIGNTY BACKUP',
  `
  <!-- Admissions Tab View -->
  <rect x="30" y="15" width="740" height="390" rx="16" fill="#120c15" stroke="#2a1a2e" />

  <!-- Action Header -->
  <text x="50" y="50" fill="#ffffff" font-family="serif" font-size="18" font-weight="bold">Reddit Hype Ingestion &amp; Admissions Queue</text>
  <rect x="520" y="32" width="230" height="34" rx="17" fill="url(#goldGrad)" />
  <text x="635" y="53" fill="#09070a" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">💾 Export Personal Catalog JSON</text>

  <!-- Candidate Card -->
  <g transform="translate(50, 85)">
    <rect x="0" y="0" width="700" height="120" rx="14" fill="#1b1220" stroke="#3d2746" />
    <circle cx="60" cy="60" r="36" fill="#2d1c33" stroke="#eab308" stroke-width="2" />
    <text x="60" y="66" fill="#eab308" font-family="serif" font-size="18" font-weight="bold" text-anchor="middle">CL</text>
    <text x="120" y="45" fill="#ffffff" font-family="serif" font-size="16" font-weight="bold">Coco Lovelock</text>
    <text x="120" y="70" fill="#a69b93" font-family="monospace" font-size="12">Age 21 · Australian · Hype Velocity: +480% (r/Porn_Discuss)</text>
    
    <rect x="520" y="42" width="160" height="36" rx="18" fill="#10b981" />
    <text x="600" y="64" fill="#ffffff" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">✓ Admit to Vault</text>
  </g>
  `,
  40, 70, 720, 180
);

// 8. Step 8: Hidden Passage 1 - Runes & Colon
const s8 = createSvg(
  'Step 8: Focus Sanctuary Runes',
  'FEATURE 8: HIDDEN PASSAGE 1 — CLOCK COLON & STARDUST RUNES',
  `
  <!-- Stardust Cosmic Canvas -->
  <rect x="25" y="10" width="750" height="400" rx="18" fill="#08070d" stroke="#2c1e36" />
  
  <!-- Clock with Glowing Colon -->
  <g transform="translate(400, 140)">
    <text x="-80" y="0" fill="#ffffff" font-family="monospace" font-size="72" font-weight="800" text-anchor="middle">12</text>
    <circle cx="0" cy="-24" r="7" fill="#f59e0b" filter="url(#redGlow)" />
    <circle cx="0" cy="8" r="7" fill="#f59e0b" filter="url(#redGlow)" />
    <text x="80" y="0" fill="#ffffff" font-family="monospace" font-size="72" font-weight="800" text-anchor="middle">45</text>
  </g>

  <!-- Rune Symbols Guide Bar -->
  <g transform="translate(60, 220)">
    <rect x="0" y="0" width="680" height="150" rx="14" fill="#140f1a" stroke="#d4a853" stroke-width="1.5" />
    <text x="340" y="32" fill="#d4a853" font-family="Cinzel, serif" font-size="14" font-weight="bold" text-anchor="middle">STARDUST GESTURE RUNES (DRAW ANYWHERE ON CANVAS)</text>
    
    <g transform="translate(40, 55)">
      <circle cx="20" cy="25" r="16" fill="none" stroke="#f59e0b" stroke-width="2.5" />
      <text x="20" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">O: Hub</text>

      <line x1="120" y1="10" x2="120" y2="40" stroke="#f59e0b" stroke-width="3" />
      <text x="120" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">I: Tier 1</text>

      <path d="M 210 10 L 210 40 L 230 40" fill="none" stroke="#f59e0b" stroke-width="3" />
      <text x="220" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">L: Tier 2</text>

      <path d="M 330 10 A 18 18 0 0 0 330 40" fill="none" stroke="#f59e0b" stroke-width="3" />
      <text x="325" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">C: Church</text>

      <path d="M 410 40 L 420 10 L 430 30 L 440 10 L 450 40" fill="none" stroke="#f59e0b" stroke-width="2.5" />
      <text x="430" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">M: Swap</text>

      <path d="M 520 10 C 500 15, 540 30, 515 40" fill="none" stroke="#f59e0b" stroke-width="3" />
      <text x="520" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">S: Study</text>

      <path d="M 605 10 L 635 10 L 605 40 L 635 40" fill="none" stroke="#f59e0b" stroke-width="3" />
      <text x="620" y="65" fill="#ffffff" font-family="monospace" font-size="11" text-anchor="middle">Z: Abyss</text>
    </g>
  </g>
  `,
  50, 70, 700, 340
);

// 9. Step 9: Hidden Passage 2 - Console Ciphers
const s9 = createSvg(
  'Step 9: Cryptic Console Ciphers',
  'FEATURE 9: HIDDEN PASSAGE 2 — CRYPTIC CIPHERS & ABYSSAL VAULT',
  `
  <!-- DevTools Terminal Window -->
  <rect x="25" y="10" width="750" height="400" rx="14" fill="#0c0d10" stroke="#1f2430" />
  
  <!-- Terminal Header -->
  <rect x="25" y="10" width="750" height="34" rx="14" fill="#171b24" />
  <text x="45" y="32" fill="#73b7f2" font-family="monospace" font-size="11" font-weight="bold">DevTools Console (F12) · Direct Underworld Portals</text>

  <!-- Console Log Feed -->
  <g transform="translate(45, 65)">
    <text x="0" y="20" fill="#4ade80" font-family="monospace" font-size="13">&gt; window.enter("tier1")</text>
    <text x="0" y="45" fill="#d4a853" font-family="monospace" font-size="12">🌌 [Underworld Portal Engaged]: Tapping into domain_tier1 (Soft / GND Sanctum). Welcome.</text>
    
    <text x="0" y="80" fill="#4ade80" font-family="monospace" font-size="13">&gt; abyss</text>
    <text x="0" y="105" fill="#fb7185" font-family="monospace" font-size="12">💀 [Abyssal Vault Unlocked]: 3,224 extreme scenarios &amp; degradation limits revealed.</text>
    
    <text x="0" y="140" fill="#4ade80" font-family="monospace" font-size="13">&gt; swap</text>
    <text x="0" y="165" fill="#f59e0b" font-family="monospace" font-size="12">🔄 [Underworld Portal Engaged]: Tapping into family_swaps (Kinship &amp; Exchange).</text>
  </g>

  <!-- Underworld Shelves Preview Below -->
  <g transform="translate(45, 270)">
    <rect x="0" y="0" width="710" height="120" rx="10" fill="#160e18" stroke="#f59e0b" stroke-width="1.5" />
    <text x="20" y="30" fill="#f59e0b" font-family="serif" font-size="15" font-weight="bold">👑 The Ciphered Underworld · Active Vault Chamber</text>
    
    <rect x="20" y="45" width="130" height="60" rx="8" fill="#241628" />
    <text x="85" y="80" fill="#ffffff" font-family="sans-serif" font-size="11" text-anchor="middle">Tier 1 GND (12)</text>

    <rect x="160" y="45" width="130" height="60" rx="8" fill="#241628" />
    <text x="225" y="80" fill="#ffffff" font-family="sans-serif" font-size="11" text-anchor="middle">Reddit Crushes (80)</text>

    <rect x="300" y="45" width="130" height="60" rx="8" fill="#241628" />
    <text x="365" y="80" fill="#ffffff" font-family="sans-serif" font-size="11" text-anchor="middle">Family Swaps (420)</text>

    <rect x="440" y="45" width="130" height="60" rx="8" fill="#241628" />
    <text x="505" y="80" fill="#ffffff" font-family="sans-serif" font-size="11" text-anchor="middle">Study Leverage (190)</text>

    <rect x="580" y="45" width="130" height="60" rx="8" fill="#241628" stroke="#ef4444" />
    <text x="645" y="80" fill="#ef4444" font-family="sans-serif" font-size="11" font-weight="bold" text-anchor="middle">The Abyss (3,224)</text>
  </g>
  `,
  35, 68, 730, 350
);

const snapshots = [
  { name: 'step1-search.svg', content: s1 },
  { name: 'step2-cards.svg', content: s2 },
  { name: 'step3-cinema.svg', content: s3 },
  { name: 'step4-constellation.svg', content: s4 },
  { name: 'step5-sanctuary.svg', content: s5 },
  { name: 'step6-habituation.svg', content: s6 },
  { name: 'step7-admissions.svg', content: s7 },
  { name: 'step8-runes.svg', content: s8 },
  { name: 'step9-ciphers.svg', content: s9 }
];

snapshots.forEach(({ name, content }) => {
  fs.writeFileSync(path.join(publicDir, name), content, 'utf8');
  fs.writeFileSync(path.join(distDir, name), content, 'utf8');
  console.log(`Generated snapshot: ${name}`);
});

console.log('Successfully generated all 9 marked vector snapshots in public/snapshots/ and dist/snapshots/!');

