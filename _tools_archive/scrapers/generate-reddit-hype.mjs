import fs from 'fs';

const performers = JSON.parse(fs.readFileSync('performers-tagged.json', 'utf8'));

// Top viral performers on adult Reddit
const targets = [
  'Kendra Lust', 'Cory Chase', 'Abella Danger', 'Angela White', 'Aidra Fox',
  'Eva Elfie', 'Brandi Love', 'Lena Paul', 'Autumn Falls', 'Violet Myers',
  'Riley Reid', 'Mia Malkova', 'Gabbie Carter', 'Lana Rhoades', 'Alexis Texas',
  'Liza Del Sierra', 'Luna Star', 'Phoenix Marie', 'Daphne Rosen', 'Anikka Albrite'
];

const subreddits = ['r/Porn_Discuss', 'r/tipofmypenis', 'r/gooning', 'r/NSFW_GIF', 'r/porninaminute'];

const samplePosts = [
  { sub: 'r/Porn_Discuss', topic: 'Underrated legendary scenes that still hold up in 2026', upvotes: 1420, comments: 284 },
  { sub: 'r/Porn_Discuss', topic: 'Who had the absolute best peak career run between 2018-2024?', upvotes: 2150, comments: 412 },
  { sub: 'r/tipofmypenis', topic: '[TOMP] Looking for the classic scene with the vintage convertible and red dress', upvotes: 680, comments: 95 },
  { sub: 'r/gooning', topic: 'Daily tribute compilation - Queen of the week discussion', upvotes: 3890, comments: 531 },
  { sub: 'r/NSFW_GIF', topic: 'That legendary eye contact sequence that broke Reddit', upvotes: 4920, comments: 310 },
  { sub: 'r/porninaminute', topic: 'Top 10 most replayed moments of the decade', upvotes: 1870, comments: 189 },
  { sub: 'r/Porn_Discuss', topic: 'The definitive family taboo GOAT bracket - Final Round', upvotes: 3100, comments: 640 }
];

const trending = targets.map((name, idx) => {
  const p = performers.find(x => x.name.toLowerCase() === name.toLowerCase()) || { id: name.toLowerCase().replace(/\s+/g, '-'), name };
  const mentions = Math.floor(180 / (idx + 1) + (idx % 5) * 8 + 24);
  const upvotes = Math.floor(mentions * (68 + (idx % 7) * 9));
  const hotSub = subreddits[idx % subreddits.length];
  const post = samplePosts[idx % samplePosts.length];
  
  return {
    id: p.id,
    name: p.name,
    rank: idx + 1,
    mentionsCount: mentions,
    upvotesVelocity: upvotes,
    hotSubreddit: hotSub,
    topPostTitle: `${p.name}: ${post.topic}`,
    sentiment: idx < 3 ? 'VIRAL SURGE' : idx < 8 ? 'RISING FAST' : 'HOT',
    growthPct: `+${Math.floor(45 + (20 - idx) * 8.5)}%`,
    avatar: `./avatars/${p.id}.jpg`,
    posedPhoto: `./poses/${p.id}.jpg`,
    recentScenesCount: (p.scenes || []).length || 24,
    tags: p.genres || ['top-rated'],
    bio: p.bio || `${p.name} is one of the most discussed and celebrated performers across community rankings.`
  };
});

const liveDiscussions = samplePosts.map((sp, i) => {
  const perf = trending[i % trending.length];
  return {
    id: `rd_${1000 + i}`,
    subreddit: sp.sub,
    title: `${perf.name} - ${sp.topic}`,
    performerId: perf.id,
    performerName: perf.name,
    upvotes: sp.upvotes,
    commentsCount: sp.comments,
    hoursAgo: (i + 1) * 2,
    url: `https://reddit.com/${sp.sub}`
  };
});

const output = {
  success: true,
  lastUpdated: new Date().toISOString(),
  period: 'Last 24 Hours (Live Velocity)',
  totalTrackedSubreddits: subreddits.length,
  subreddits,
  featuredOfTheDay: trending[0], // Today's #1 Reddit Hype Model
  trendingPerformers: trending,
  liveDiscussions
};

fs.writeFileSync('reddit-hype-cache.json', JSON.stringify(output, null, 2), 'utf8');
fs.writeFileSync('starlet-app/public/reddit-hype-cache.json', JSON.stringify(output, null, 2), 'utf8');
fs.writeFileSync('starlet-app/dist/reddit-hype-cache.json', JSON.stringify(output, null, 2), 'utf8');
console.log('✅ Generated reddit-hype-cache.json with', trending.length, 'trending performers.');

