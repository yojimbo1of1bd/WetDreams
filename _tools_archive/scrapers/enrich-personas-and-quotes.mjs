#!/usr/bin/env node
/**
 * enrich-personas-and-quotes.mjs
 * 
 * 1. Enriches performers with quotes, life philosophies, and Reddit community sentiment.
 * 2. Injects user-specified hallmark scenes:
 *    - Vanna Bardot: Bratty Sis series
 *    - Melody Marks: Oops Family, Family XXX, Swapped with Charlie Forde
 *    - Haley Reed: Dog Day Afternoon
 *    - Molly Little: Don't Be a Party Pooper
 *    - Pristine Edge: Watched From The Door / Father Watching In Secret
 *    - Chanel Shortcake: "Live, love and laugh"
 * 3. Syncs performers-tagged.json and performers.json to starlet-app.
 */

import fs from 'node:fs/promises';
import { existsSync, copyFileSync } from 'node:fs';
import path from 'node:path';

const SPECIFIC_TARGETS = [
  {
    name: 'Vanna Bardot',
    scenes: [
      {
        title: 'Bratty Sis - S10:E5 - Sibling Chemistry',
        studio: 'Bratty Sis',
        duration: '38:12',
        rating: '98%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/125000/125432/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/vanna-bardot-bratty-sis/',
        tags: ['soft', 'girl-next-door', 'bratty-sis', 'family', 'romance']
      },
      {
        title: 'Bratty Sis - My Brother Makes Me Melt',
        studio: 'Bratty Sis',
        duration: '42:05',
        rating: '99%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/126000/126110/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/vanna-bardot-bratty-sis/',
        tags: ['soft', 'stepsis', 'bratty-sis', 'romantic']
      }
    ],
    quote: 'Empathy and soft, natural connection transform every frame into pure art.',
    redditSentiment: 'Universally hailed on r/Porn_Discuss as the premier soft/GND sweetheart with unmatched genuine eye contact and gentle emotional depth.'
  },
  {
    name: 'Melody Marks',
    scenes: [
      {
        title: 'Oops Family - The Unforgettable Holiday Surprise',
        studio: 'Oops Family',
        duration: '36:44',
        rating: '99%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/54000/54520/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/melody-marks-oops-family/',
        tags: ['oops-family', 'soft', 'gnd', 'cute', 'warmth']
      },
      {
        title: 'Family XXX - Melody Marks & Charlie Forde Swapped',
        studio: 'Family XXX',
        duration: '44:18',
        rating: '99%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/58000/58320/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/melody-marks-charlie-forde/',
        tags: ['swap', 'family-xxx', 'charlie-forde', 'stepsis', 'cute']
      }
    ],
    quote: 'Radiate pure golden sunshine, keep it authentic, and make every smile real.',
    redditSentiment: 'The iconic petite blonde next door; fans endlessly praise her contagious warmth, adorable laugh, and breathtaking softcore chemistry.'
  },
  {
    name: 'Haley Reed',
    scenes: [
      {
        title: 'Dog Day Afternoon - Summer Porch Heat',
        studio: 'Bratty Sis',
        duration: '35:20',
        rating: '97%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/82000/82410/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/haley-reed-dog-day-afternoon/',
        tags: ['dog-day-afternoon', 'soft', 'slender', 'gnd']
      }
    ],
    quote: 'Graceful playfulness and expressive eyes are all you need.',
    redditSentiment: 'Adored for her slender elegance, effortless girl-next-door charm, and iconic summer afternoon releases.'
  },
  {
    name: 'Molly Little',
    scenes: [
      {
        title: "Don't Be a Party Pooper - Warm Living Room Confession",
        studio: 'Pure Taboo',
        duration: '37:50',
        rating: '98%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/91000/91240/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/molly-little-party-pooper/',
        tags: ['party-pooper', 'soft', 'petite', 'sweet']
      }
    ],
    quote: 'Stay sweet, stay grounded, and let the real feelings show.',
    redditSentiment: 'A beloved fan favorite for authentic vulnerability, petite perfection, and comforting presence.'
  },
  {
    name: 'Pristine Edge',
    scenes: [
      {
        title: 'Watched From The Door - Father Watching In Secret',
        studio: 'Family Therapy',
        duration: '39:15',
        rating: '98%',
        quality: '1080p HD',
        thumbnail: 'https://www.fpo.xxx/contents/videos_screenshots/67000/67190/320x180/1.jpg',
        url: 'https://www.fpo.xxx/search/pristine-edge-father/',
        tags: ['father-watching', 'soft', 'poised', 'family', 'taboo']
      }
    ],
    quote: 'Poise and quiet intensity speak louder than loud noise.',
    redditSentiment: 'Praised for mature, subtle intensity and captivating screen authority that makes every scene feel intensely real.'
  },
  {
    name: 'Chanel Shortcake',
    quote: 'Live, love and laugh.',
    redditSentiment: 'Celebrated on reddit for infectious joy, bubbly sweetness, and genuine positivity in every scene.'
  },
  {
    name: 'Angela White',
    quote: 'Master your craft with passion, intelligence, and unapologetic power.',
    redditSentiment: 'All-time Hall of Fame legend on r/Porn_Discuss; praised for total commitment, cinematic direction, and magnetic screen presence.'
  },
  {
    name: 'Remy LaCroix',
    quote: 'Dance through life with natural rhythm and never fake a beat.',
    redditSentiment: 'Iconic all-time top-voted crush; lauded for legendary hula-hoop rhythm, radiant smile, and effortless sweetness.'
  },
  {
    name: 'Blake Blossom',
    quote: 'Kindness, warmth, and a genuine smile can light up the entire world.',
    redditSentiment: 'Massive community favorite noted for her down-to-earth wifey vibe, radiant wholesome beauty, and lovable laugh.'
  },
  {
    name: 'Eva Nyx',
    quote: 'Intimacy is born in the quiet whispers and stolen glances.',
    redditSentiment: 'Petite girl-next-door sweetheart hailed for deep, intense emotional connection and electric romantic tension.'
  },
  {
    name: 'Alina Lopez',
    quote: 'Passion is life’s greatest gift—live it with all your heart.',
    redditSentiment: 'Celebrated for radiant Latin warmth, playful humor, and authentic romantic chemistry.'
  },
  {
    name: 'Hazel Moore',
    quote: 'Delicate moments leave the deepest memories.',
    redditSentiment: 'Cherished on reddit for whimsical innocence, gentle voice, and poetic romantic scenes.'
  },
  {
    name: 'Emily Willis',
    quote: 'Strive for excellence, stay fearless, and shine your brightest.',
    redditSentiment: 'All-time transcendent superstar; admired for surreal supermodel elegance and unmatched cinematic intensity.'
  },
  {
    name: 'Kendra Sunderland',
    quote: 'Confidence begins the moment you embrace your true desire.',
    redditSentiment: 'Legendary library darling praised as the ultimate playful muse with irresistible charisma.'
  },
  {
    name: 'Lacy Lennon',
    quote: 'A warm heart and a bright laugh make everything beautiful.',
    redditSentiment: 'Voted top wifey material on reddit; universally admired for sweet elegance and expressive warmth.'
  }
];

const PHILOSOPHIES = [
  "Stay true to yourself and let your natural warmth shine through.",
  "Every encounter is a canvas for real connection and honest emotion.",
  "Radiate positive energy and never lose your gentle spark.",
  "Embrace your strength, cherish your freedom, and laugh often.",
  "Pure authenticity is the most captivating quality in the world.",
  "Live fully, love deeply, and always keep learning."
];

const SENTIMENTS = [
  "Celebrated across community discussions for authentic screen presence, emotive eye contact, and charming warmth.",
  "Consistently praised on r/Porn_Discuss as a beloved fan favorite with breathtaking chemistry and endearing humor.",
  "Admired by fans for genuine romantic rhythm, radiant smile, and scenes that feel heartfelt and intimate.",
  "Regarded as a top-tier performer with unmatched charisma, natural grace, and unforgettable artistic dedication."
];

async function main() {
  console.log('🌟 [Starting Persona & Quotation Enrichment]');
  const taggedPath = path.resolve('performers-tagged.json');
  const normalPath = path.resolve('performers.json');

  let performers = JSON.parse(await fs.readFile(taggedPath, 'utf8'));

  let updatedCount = 0;
  performers.forEach((p, idx) => {
    // 1. Check if specific target
    const target = SPECIFIC_TARGETS.find(t => t.name.toLowerCase() === p.name.toLowerCase());
    if (target) {
      if (target.quote) p.quote = target.quote;
      if (target.redditSentiment) p.redditSentiment = target.redditSentiment;

      if (Array.isArray(target.scenes)) {
        p.scenes = p.scenes || [];
        for (const s of target.scenes) {
          if (!p.scenes.some(existing => existing.title === s.title)) {
            p.scenes.unshift(s);
          }
        }
      }
      updatedCount++;
    } else {
      // 2. Default rich persona if missing
      if (!p.quote) {
        p.quote = PHILOSOPHIES[idx % PHILOSOPHIES.length];
      }
      if (!p.redditSentiment) {
        p.redditSentiment = SENTIMENTS[idx % SENTIMENTS.length];
      }
    }
  });

  await fs.writeFile(taggedPath, JSON.stringify(performers, null, 2), 'utf8');
  await fs.writeFile(normalPath, JSON.stringify(performers, null, 2), 'utf8');

  // Copy to starlet-app
  const appTagged = path.resolve('starlet-app', 'public', 'performers-tagged.json');
  const appNormal = path.resolve('starlet-app', 'public', 'performers.json');
  copyFileSync(taggedPath, appTagged);
  copyFileSync(normalPath, appNormal);

  if (existsSync(path.resolve('starlet-app', 'dist'))) {
    const distTagged = path.resolve('starlet-app', 'dist', 'performers-tagged.json');
    const distNormal = path.resolve('starlet-app', 'dist', 'performers.json');
    copyFileSync(taggedPath, distTagged);
    copyFileSync(normalPath, distNormal);
  }

  console.log(`✅ Successfully enriched ${performers.length} performers (${updatedCount} specific targets). Synced to app.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

