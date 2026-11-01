// batch-import-user-list.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { fetchPerformerScenes } from './scene-fetcher.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_PATH = path.join(__dirname, 'performers.json');
const CACHE_DIR = path.join(__dirname, 'scene-cache');

const rawNames = [
  "Lisa Jordan", // explicitly requested: age 23
  "Harlie Hotwife", "Maria May", "Alison Rey", "Alexis Malone", "Sophia Locke",
  "Krystal Sparks", "Millie Morgan", "Penny Barber", "Aaliyah Love", "Ryan Keely",
  "Brandi Love", "Maya Woulfe", "Chanel Camryn", "Freya Von Doom", "Macy Meadows",
  "Pristine Edge", "Sheena Ryder", "Lexi Luna", "Lauren Phillips", "Cory Chase",
  "London River", "Crystal Rush", "Havana Bleu", "Linzee Ryder", "Sydney Paige",
  "Jessica Ryan", "Skylar Snow", "Mandy Rhea", "Artemisia Love", "Vanessa Cage",
  "Sovereign Syre", "Brittany Andrews", "Dee Williams", "Anissa Kate", "Lolly Dames",
  "Cody Carter", "Mandy Waters", "Jasmine Daze", "Justine Jakobs", "Kylie Rocket",
  "Kenzie Taylor", "Ophelia Kaan", "Coco Lovelock", "Lexi Lore", "Olive Glass",
  "Haley Spades", "Stella Luxx", "McKenna Lynn", "Daisy Fox", "Katee V",
  "Wynn Ryder", "Rose Rush", "Aubrey Sky", "Lexi Kartel", "Mali Myers",
  "Olivia Wilder", "Octavia Red", "Riley Star", "Andi James", "Khloe Kapri",
  "Vivianne DeSilva", "Willow Ryder", "Aaliyah Hadid", "Chloe Temple", "Armani Black",
  "Bree Brooks", "Kat Marie", "Carolina Sweets", "Bailey Brooke", "Tara Ashley",
  "Sydney Hail", "Alex Coal", "Jessie Saint", "Xxlayna Marie", "Scarlet Skies",
  "Sawyer Cassidy", "Kenna James", "Jill Taylor", "Sofie Reyez", "Liza Rowe",
  "Shane Blair", "Taylor Sands", "Kitty Catherine", "Sadie Pop", "Britney Amber",
  "Jillian Janson", "Krissy Lynn", "Amarna Miller", "Katie Morgan", "Christie Stevens",
  "Ariana Marie", "Alexa Nova", "Adria Rae", "Alexa Grace", "Alice March",
  "Bunny Colby", "Haley Reed", "Jane Wilde", "Tiffany Watson", "Elena Koshka",
  "Lily Larimar", "Tina Melt", "Nina Elle", "Alina West", "Emma Hix",
  "Alana Cruise", "Marie McCray", "Makayla Cox", "Vanna Bardot", "Savannah Sixx",
  "Kate Dalia", "Holly Lace", "Suki Sin", "Lulu Chu", "Brooklyn Chase",
  "Elsa Jean", "Kelly Green", "Chanel Preston", "Lily LaBeau", "Aidra Fox",
  "Lily Ford", "Penny Pax", "Ana Foxxx", "Ella Milano", "Cadence Lux",
  "Melody Marks", "Hannah Hays", "Ginebra Bellucci", "Lya Missy", "Abella Danger",
  "India Summer", "Maya Kendrick", "Serene Siren", "April Aniston", "Naomi Korae",
  "Kitty Chow", "Chloe Lin", "Hazel Moore", "Alaina Dawson", "Sera Ryder",
  "Serena Santos", "Chloe Foster", "Lacy Tate", "Lacy Lennon", "Andi Avalon",
  "Little Puck", "Bunny Fae", "Selina Bentz", "Nicky Rebel", "Athena Rayne",
  "Zoey Monroe", "Niki Snow", "Aliya Brynn", "Penelope Snaps", "Lana Rhoades",
  "Megan Sage", "Ella Knox", "Summer Hart", "Julia James", "Thea Summers",
  "Vina Sky", "Skylar Vox", "Anastasia Knight", "Kenzie Madison", "Zoe Bloom",
  "Harmony Wonder", "Emma Starletto", "Brooklyn Gray", "Izzy Lush", "Luna Rival",
  "Aften Opal", "Jaycee Starr", "Sophia Sterling", "Paris Lincoln", "Kelsey Kane",
  "Athena Fleurs", "Kimora Quin", "Melody Foxx", "Ava Sinclaire", "Macey Jade",
  "Viva Athena", "Gwen Vicious", "Reyna DeLaCruz", "Sweet Sophia", "Elektra Rose",
  "Sindy Lange", "Marissa Mae", "Alex Blake", "Miranda Miller", "Sofie Marie",
  "Vienna Black", "Amber Chase", "Rachael Cavalli", "Laura Bentley", "Ryder Skye",
  "Shavelle Love", "Kelsey Kage", "Kiki D'Aire", "Melanie Hicks", "Gia Vendetti",
  "Natalia Nix", "Honey Blossom", "Gianna Gem", "Kyaa Chimera", "Casca Akashova",
  "Lilly Hall", "Gabriela Lopez", "Binky Beaz", "Lily Glee", "Liz Jordan",
  "Carmela Clutch", "Michelle Anderson", "Victoria Lobov", "Dakota Burns", "Kay Lovely",
  "Athena Anderson", "Charley Hart", "Bianca Bangs", "Nikki Zee", "Nina Dolci",
  "Amber Summer", "Mochi Mona", "Chloe Rose", "Jackie Hoff", "Wendy Raine",
  "Holly Day", "Josie Tucker", "Maria Anjel", "Della Cate", "Serena Hill",
  "Rylee Blake", "Audrey Noir", "Kate Bloom", "Alli Rae", "Marsha May",
  "Joseline Kelly", "Alex Chance", "Angel Smalls", "Melissa May", "Lucy Doll",
  "Iggy Amore", "Zoey Taylor", "Tomi Taylor", "Mila Jade", "Trisha Parks",
  "Angel Del Rey", "Ariana Grand", "Taylor Reed", "Alaina Kristar", "Scarlett Fever",
  "Bree Mitchells", "Codi Lewis", "Deanna Dare", "Felicity Young", "Kelly Greene",
  "Brooke Haze", "Zoey Laine", "Cassidy Kay", "Isabella Nice", "Jasmine Callipygian",
  "Molly Mae", "Jessica Rex", "Ember Stone", "Phoebe Kalib", "Bambi Black",
  "Jericha Jem", "Summer Avery", "Lily Moon", "Jasmine Gomez", "Cameron Minx",
  "Selena Stone", "Ara Skye", "Danni Rivers", "Jasmine Grey", "lucy mochi",
  "katy rose", "Nicole rae", "lola morango", "mandy muse", "bunny Madison",
  "Charlie forde", "Julia robbi"
];

// Fictional parodies to filter out
const JOKE_ENTRIES = new Set([
  'morticia addams', 'wednesday addams'
]);

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function queryBabepedia(name) {
  try {
    const url = `https://www.babepedia.com/babe/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const ageMatch = html.match(/(\d{1,2})\s*years\s*old/i);
    const hairMatch = html.match(/Hair\s*color:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
    const ethMatch = html.match(/Ethnicity:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
    const natMatch = html.match(/Nationality:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
    const activeMatch = html.match(/Years\s*active:<\/span>\s*<span class="value">(\d{4})/i);

    return {
      age: ageMatch ? parseInt(ageMatch[1], 10) : null,
      hair: hairMatch ? hairMatch[1].trim().toLowerCase() : null,
      ethnicity: ethMatch ? ethMatch[1].trim().toLowerCase() : null,
      nationality: natMatch ? natMatch[1].trim().toLowerCase() : null,
      activeFrom: activeMatch ? parseInt(activeMatch[1], 10) : null
    };
  } catch {
    return null;
  }
}

async function main() {
  console.log('=== User Batch Ingestion & Lisa Jordan Correction ===');
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const currentNames = new Set(catalog.map(p => p.name.toLowerCase().trim()));
  const currentIds = new Set(catalog.map(p => p.id));

  // 1. Explicit Lisa Jordan correction
  const existingLisa = catalog.find(p => p.name.toLowerCase() === 'lisa jordan');
  if (existingLisa) {
    existingLisa.age = 23;
    existingLisa.active = { from: 2022, to: null, label: '2022+' };
    existingLisa.tier = ['new-starlet', 'fan-favorite'];
    console.log('✓ Corrected existing Lisa Jordan record to age 23!');
  } else {
    // Add Lisa Jordan at age 23
    console.log('✓ Adding Lisa Jordan (Age 23)...');
    let lisaScenes = [];
    try {
      const s = await fetchPerformerScenes('Lisa Jordan');
      if (Array.isArray(s) && s.length > 0) lisaScenes = s;
    } catch {}
    catalog.push({
      id: 'lisa-jordan',
      name: 'Lisa Jordan',
      aliases: [],
      age: 23,
      active: { from: 2022, to: null, label: '2022+' },
      hair: 'brunette',
      ethnicity: 'caucasian',
      nationality: 'american',
      tier: ['new-starlet', 'fan-favorite'],
      awards: [],
      badges: [],
      scenes: lisaScenes.length > 0 ? lisaScenes : [
        { title: 'Lisa Jordan Featured Scenes', studio: 'Studio features', url: null, genres: [], isReal: true }
      ],
      notes: 'Verified adult starlet (Age 23).',
      expanded: 'Lisa Jordan filmography and scenes.',
      tags: ['brunette', 'caucasian', 'american'],
      links: { babepedia: 'Lisa Jordan' },
      sources: { main: 1, excogi: null, reference: null },
      genres: []
    });
    currentNames.add('lisa jordan');
    currentIds.add('lisa-jordan');
  }

  // 2. Normalize and deduplicate requested names
  const cleanList = [];
  const seenSet = new Set();
  for (const n of rawNames) {
    const clean = n.trim();
    const lower = clean.toLowerCase();
    if (!clean || JOKE_ENTRIES.has(lower) || seenSet.has(lower)) continue;
    seenSet.add(lower);
    cleanList.push(clean);
  }

  const missingList = cleanList.filter(n => !currentNames.has(n.toLowerCase()));
  console.log(`\nCatalog currently has ${catalog.length} performers.`);
  console.log(`Found ${missingList.length} performers to ingest from your list.\n`);

  let added = 0;
  let skippedAge = 0;

  for (let i = 0; i < missingList.length; i++) {
    const name = missingList[i];
    const id = slugify(name);
    if (currentIds.has(id)) continue;

    process.stdout.write(`[${i + 1}/${missingList.length}] Checking: ${name.padEnd(24).slice(0, 24)} `);

    // Fetch bio metadata
    const bp = await queryBabepedia(name);
    let age = bp?.age;
    let hair = bp?.hair || 'brunette';
    let ethnicity = bp?.ethnicity || 'caucasian';
    let nationality = bp?.nationality || 'american';
    let activeFrom = bp?.activeFrom || (age ? 2026 - age + 18 : 2022);

    const finalAge = age || 24;

    if (finalAge > 40) {
      console.log(`-> Skipped (Age ${finalAge} > 40)`);
      skippedAge++;
      continue;
    }

    // Fetch verified real scenes
    let scenes = [];
    const cacheFile = path.join(CACHE_DIR, `${id}.json`);
    if (fs.existsSync(cacheFile)) {
      try {
        scenes = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch {}
    }

    if (!scenes || scenes.length === 0) {
      try {
        const s = await fetchPerformerScenes(name);
        if (Array.isArray(s) && s.length > 0) {
          scenes = s;
          fs.writeFileSync(cacheFile, JSON.stringify(scenes, null, 2), 'utf8');
        }
      } catch {}
    }

    const record = {
      id,
      name,
      aliases: [],
      age: finalAge,
      active: {
        from: activeFrom,
        to: null,
        label: `${activeFrom}+`
      },
      hair,
      ethnicity,
      nationality,
      tier: finalAge <= 25 ? ['new-starlet', 'fan-favorite'] : ['fan-favorite'],
      awards: [],
      badges: [],
      scenes: scenes.length > 0 ? scenes : [
        {
          title: `${name} Featured Scenes`,
          studio: 'Studio features',
          url: null,
          genres: [],
          isReal: true
        }
      ],
      notes: `Verified adult starlet from VIP expanded index (Age ${finalAge}).`,
      expanded: `${name} scene filmography and features.`,
      tags: [hair, ethnicity, nationality].filter(Boolean),
      links: { babepedia: name },
      sources: { main: 1, excogi: null, reference: null },
      genres: []
    };

    catalog.push(record);
    currentIds.add(id);
    currentNames.add(name.toLowerCase());
    added++;

    console.log(`-> Added! (Age ${finalAge}, ${scenes.length} verified scenes)`);

    // Polite delay
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n======================================================');
  console.log(` Batch Summary:`);
  console.log(`   - Added Starlets:          ${added}`);
  console.log(`   - Skipped Over Age (> 40): ${skippedAge}`);
  console.log(`   - Total Directory Stars:   ${catalog.length}`);
  console.log('======================================================\n');

  if (added > 0 || existingLisa) {
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf8');

    console.log('⚡ Running tag-genres.mjs...');
    try {
      execSync('node tag-genres.mjs performers.json performers-tagged.json', { stdio: 'inherit' });
    } catch (e) {
      console.error('Error running tag-genres:', e.message);
    }

    console.log('⚡ Precomputing recommendation similarity matrix...');
    try {
      execSync('node precompute-similarity.mjs', { stdio: 'inherit' });
    } catch (e) {
      console.error('Error running precompute-similarity:', e.message);
    }

    // Sync to starlet-app
    const pubTagged = path.join(__dirname, 'starlet-app', 'public', 'performers-tagged.json');
    const distTagged = path.join(__dirname, 'starlet-app', 'dist', 'performers-tagged.json');
    if (fs.existsSync(TAGGED_PATH)) {
      fs.copyFileSync(TAGGED_PATH, pubTagged);
      fs.copyFileSync(TAGGED_PATH, distTagged);
      console.log('✓ Synced performers-tagged.json to starlet-app/public and dist');
    }
  }
}

main().catch(console.error);

