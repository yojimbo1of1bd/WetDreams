// reddit-scene-scraper.mjs
// ---------------------------------------------------------
// Public Reddit scraper for scene information.
//
// Usage (sandboxed, network required – you will need to run
// this script with BypassSandbox:true):
//   node reddit-scene-scraper.mjs subreddits.txt > scenes.json
//
// * subreddits.txt – one subreddit name per line (e.g. "Porn_Discuss")
// * The script fetches the newest 200 posts from each subreddit,
//   extracts lines that match a scene pattern, and outputs an array
//   of scene objects.
// ---------------------------------------------------------

import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const INPUT_FILE = process.argv[2] ?? "subreddits.txt";
const LIMIT = 200; // max posts per subreddit (Reddit caps at 100 per request)

// Simple scene regex – adjust if your posts use a different format
// Expected: "Studio – Title (Year)" or "Studio - Title (Year)"
const SCENE_REGEX = /([\w\s&'\-]+)\s*[\-–]\s*([\w\s'\-]+)\s*\((\d{4})\)/g;

async function fetchPosts(sub) {
  const url = `https://www.reddit.com/r/${sub}/new.json?limit=${Math.min(LIMIT, 100)}`;
  const res = await fetch(url, { headers: { "User-Agent": "StarletDirectoryBot/1.0" } });
  if (!res.ok) throw new Error(`Failed to fetch /r/${sub}: ${res.status}`);
  const data = await res.json();
  return data.data.children.map(c => c.data);
}

function extractScenes(text) {
  const scenes = [];
  let match;
  while ((match = SCENE_REGEX.exec(text))) {
    scenes.push({
      studio: match[1].trim(),
      title: match[2].trim(),
      year: parseInt(match[3]),
      source: "reddit",
    });
  }
  return scenes;
}

(async () => {
  const subreddits = fs.readFileSync(INPUT_FILE, "utf-8")
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean);

  const allScenes = [];

  for (const sub of subreddits) {
    try {
      console.error(`Fetching posts from /r/${sub} …`);
      const posts = await fetchPosts(sub);
      for (const post of posts) {
        // Prefer selftext (text posts) then title if it looks like a scene line
        const bodies = [];
        if (post.selftext) bodies.push(post.selftext);
        if (post.title) bodies.push(post.title);
        for (const body of bodies) {
          const scenes = extractScenes(body);
          if (scenes.length) {
            // Attach Reddit metadata for later reference
            scenes.forEach(s => (s.reddit = { subreddit: sub, id: post.id, url: `https://reddit.com${post.permalink}` }));
            allScenes.push(...scenes);
          }
        }
      }
    } catch (e) {
      console.error(`⚠️  Error processing /r/${sub}: ${e.message}`);
    }
  }

  const outPath = path.join(process.cwd(), "reddit-scenes.json");
  fs.writeFileSync(outPath, JSON.stringify(allScenes, null, 2), "utf-8");
  console.log(`✅ Wrote ${allScenes.length} scene entries to ${outPath}`);
})();

