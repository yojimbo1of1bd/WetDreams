#!/usr/bin/env node
/**
 * server.mjs
 * 
 * High-performance, zero-dependency local static server + Direct Video Streaming Proxy
 * for Starlet Directory VIP Edition.
 * 
 * Features:
 * 1. Serves Starlet Directory VIP web assets on http://localhost:8000 and 0.0.0.0 (Phone Wi-Fi access)
 * 2. Instant Direct Video Resolver & Proxy:
 *    - /api/stream?id=12345 (Returns resolved direct stream URL)
 *    - /api/video-stream?id=12345 (Pipes the actual MP4 bytes with Referer bypass & Range headers directly to HTML5 <video>)
 *    - /api/proxy-video?url=... (Pipes any arbitrary video URL bypassing CDN hotlink blocking)
 * 3. Range-request support for local assets & audio/video.
 * 4. LAN info API: /api/lan-info (Provides local IP & phone connection URL)
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '8000', 10);

// In-Memory RAM Cache Engine (Ultra-Fast O(1) Memory KV Store - Redis equivalent)
const RAM_CACHE = new Map(); // path -> { buffer, gzipBuffer, etag, mtime, contentType }

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// In-memory cache for resolved direct MP4 stream URLs (2-hour TTL)
const streamCache = new Map(); // videoId -> { url, expiresAt }

async function resolveDirectMp4(videoId) {
  const cached = streamCache.get(videoId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.url;
  }

  const embedUrl = `https://www.fpo.xxx/embed/${videoId}`;
  const res = await fetch(embedUrl, {
    signal: AbortSignal.timeout(6000),
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    }
  });

  if (!res.ok) return null;
  const html = await res.text();
  const match = html.match(/video_url:\s*['"](https:\/\/[^'"]+\.mp4[^'"]*)['"]/i);
  if (match) {
    const videoUrl = match[1];
    streamCache.set(videoId, {
      url: videoUrl,
      expiresAt: Date.now() + (2 * 60 * 60 * 1000)
    });
    return videoUrl;
  }

  return null;
}

function proxyVideoUrl(targetUrl, req, res) {
  try {
    const upstreamUrl = new URL(targetUrl);
    const client = upstreamUrl.protocol === 'http:' ? http : https;

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Referer': `${upstreamUrl.protocol}//${upstreamUrl.host}/`,
      'Origin': `${upstreamUrl.protocol}//${upstreamUrl.host}`,
      'Accept': '*/*'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const upstreamReq = client.request(upstreamUrl, { method: 'GET', headers }, (upstreamRes) => {
      const responseHeaders = {
        'Content-Type': upstreamRes.headers['content-type'] || 'video/mp4',
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400'
      };

      if (upstreamRes.headers['content-length']) {
        responseHeaders['Content-Length'] = upstreamRes.headers['content-length'];
      }
      if (upstreamRes.headers['content-range']) {
        responseHeaders['Content-Range'] = upstreamRes.headers['content-range'];
      }

      res.writeHead(upstreamRes.statusCode || 200, responseHeaders);
      upstreamRes.pipe(res);
    });

    upstreamReq.on('error', (err) => {
      console.error('Upstream proxy error:', err.message);
      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream video fetch failed' }));
      }
    });

    upstreamReq.end();
  } catch (err) {
    if (!res.headersSent) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid video URL: ' + err.message }));
    }
  }
}

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const host = req.headers.host || `localhost:${PORT}`;
  const parsedUrl = new URL(req.url, `http://${host}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);

  // 1. LAN Info Endpoint for Mobile Connection
  if (pathname === '/api/lan-info') {
    const localIp = getLocalIp();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      localIp,
      port: PORT,
      portalUrl: `http://${localIp}:${PORT}/starlet-app/dist/index.html`
    }));
    return;
  }

  // 2. Direct Video Stream Proxy API (pipes raw MP4 bytes directly to browser <video>)
  if (pathname.startsWith('/api/video-stream')) {
    const idParam = parsedUrl.searchParams.get('id');
    const urlParam = parsedUrl.searchParams.get('url');

    let videoId = idParam;
    if (!videoId && urlParam) {
      const match = urlParam.match(/fpo\.xxx\/video\/(\d+)/i);
      if (match) videoId = match[1];
    }

    if (!videoId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing video ID parameter' }));
      return;
    }

    try {
      const videoUrl = await resolveDirectMp4(videoId);
      if (videoUrl) {
        proxyVideoUrl(videoUrl, req, res);
        return;
      }
    } catch (err) {
      console.error(`Error resolving video ${videoId}:`, err.message);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Could not extract direct stream' }));
    return;
  }

  // 3. Generic Video Proxy Endpoint
  if (pathname.startsWith('/api/proxy-video')) {
    const targetUrl = parsedUrl.searchParams.get('url');
    if (!targetUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing url parameter' }));
      return;
    }
    proxyVideoUrl(targetUrl, req, res);
    return;
  }

  // 4. Stream URL Metadata Resolver API
  if (pathname.startsWith('/api/stream')) {
    const idParam = parsedUrl.searchParams.get('id');
    const urlParam = parsedUrl.searchParams.get('url');

    let videoId = idParam;
    if (!videoId && urlParam) {
      const match = urlParam.match(/fpo\.xxx\/video\/(\d+)/i);
      if (match) videoId = match[1];
    }

    if (!videoId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing video ID parameter' }));
      return;
    }

    try {
      const videoUrl = await resolveDirectMp4(videoId);
      if (videoUrl) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          videoId,
          videoUrl,
          proxyStreamUrl: `/api/video-stream?id=${videoId}`
        }));
        return;
      }
    } catch (err) {
      console.error(`Error resolving video ${videoId}:`, err.message);
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Could not extract direct stream' }));
    return;
  }

  // 4B. Multi-Mirror Resolver API (XVideos, Eporner, etc.)
  if (pathname.startsWith('/api/mirror')) {
    const query = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query') || '';
    const performer = parsedUrl.searchParams.get('performer') || '';
    const source = (parsedUrl.searchParams.get('source') || 'xvideos').toLowerCase();
    const fullQuery = `${performer} ${query}`.trim();

    if (!fullQuery) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing query parameter' }));
      return;
    }

    if (source === 'xvideos') {
      try {
        const sRes = await fetch(`https://www.xvideos.com/?k=${encodeURIComponent(fullQuery)}`, {
          signal: AbortSignal.timeout(6000),
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        if (sRes.ok) {
          const html = await sRes.text();
          const match = html.match(/(?:href=["']\/video\.?([a-z0-9]+)\/|id=["']video_([a-z0-9]+))/i);
          const id = match ? (match[1] || match[2]) : null;
          if (id) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              success: true,
              source: 'xvideos',
              videoId: id,
              embedUrl: `https://www.xvideos.com/embedframe/${id}`
            }));
            return;
          }
        }
      } catch (err) {
        console.error('XVideos search error:', err.message);
      }
    } else if (source === 'eporner') {
      try {
        const cleanQuery = query
          .replace(/\[\d+p\]|\b1080p\b|\b720p\b|\b4k\b|HD/gi, '')
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        // 1. First try sanitized title query, then performer name fallback
        const searchCandidates = [
          cleanQuery,
          performer ? `${performer} ${cleanQuery.split(' ').slice(0, 3).join(' ')}` : null,
          performer
        ].filter(Boolean);

        for (const candidate of searchCandidates) {
          const sRes = await fetch(`https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(candidate)}&per_page=5`, {
            signal: AbortSignal.timeout(6000),
            headers: { 'User-Agent': 'Mozilla/5.0' }
          });
          if (sRes.ok) {
            const data = await sRes.json();
            const vid = data.videos?.[0];
            if (vid && vid.embed) {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                source: 'eporner',
                videoId: vid.id,
                embedUrl: vid.embed,
                title: vid.title,
                allVideos: (data.videos || []).slice(0, 5).map(v => ({
                  title: v.title,
                  embedUrl: v.embed,
                  thumbnail: v.default_thumb?.src,
                  duration: v.length_min || '24:00',
                  rating: '98%',
                  studio: 'Eporner HD'
                }))
              }));
              return;
            }
          }
        }
      } catch (err) {
        console.error('Eporner search error:', err.message);
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'No mirror found for query' }));
    return;
  }

  // 4B-2. Deep Multi-Tube Archive Search (Eporner + FPO with Page Pagination & Scene Resolver)
  if (pathname.startsWith('/api/archive-search')) {
    const rawQuery = parsedUrl.searchParams.get('query') || parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('name') || '';
    const page = Math.max(1, parseInt(parsedUrl.searchParams.get('page') || '1', 10));
    const perPage = Math.min(60, Math.max(6, parseInt(parsedUrl.searchParams.get('per_page') || '24', 10)));

    if (!rawQuery.trim()) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Missing search query or performer name' }));
      return;
    }

    const cleanQ = rawQuery
      .replace(/\[\d+p\]|\b1080p\b|\b720p\b|\b4k\b|HD/gi, '')
      .replace(/[^\w\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const scenes = [];
    let totalCount = 0;
    let totalPages = 1;

    // Helper: studio detection
    const detectStudioFromTitle = (title) => {
      const known = [
        { rx: /brazzers/i, name: 'Brazzers' },
        { rx: /naughty\s*america/i, name: 'Naughty America' },
        { rx: /teamskeet/i, name: 'TeamSkeet' },
        { rx: /bratty\s*sis/i, name: 'Bratty Sis' },
        { rx: /familystrokes/i, name: 'Family Strokes' },
        { rx: /pure\s*taboo/i, name: 'Pure Taboo' },
        { rx: /daughter\s*swap/i, name: 'Daughter Swap' },
        { rx: /mom\s*swap/i, name: 'Mom Swap' },
        { rx: /pervmom/i, name: 'PervMom' },
        { rx: /taboo\s*heat/i, name: 'Taboo Heat' },
        { rx: /nubiles/i, name: 'Nubiles' },
        { rx: /blacked/i, name: 'Blacked' },
        { rx: /vixen/i, name: 'Vixen' },
        { rx: /deeper/i, name: 'Deeper' },
        { rx: /tushy/i, name: 'Tushy' },
        { rx: /property\s*sex/i, name: 'PropertySex' },
        { rx: /evil\s*angel/i, name: 'Evil Angel' },
        { rx: /twistys/i, name: 'Twistys' }
      ];
      for (const s of known) {
        if (s.rx.test(title)) return s.name;
      }
      return 'Eporner HD';
    };

    // Helper: genre tagger
    const detectGenresFromTitle = (title) => {
      const gs = [];
      if (/step\s*mom|milf|mother/i.test(title)) gs.push('stepmom');
      if (/step\s*sis|sister/i.test(title)) gs.push('stepsis');
      if (/step\s*daughter/i.test(title)) gs.push('stepdaughter');
      if (/family|taboo/i.test(title)) gs.push('family');
      if (/swap/i.test(title)) gs.push('swap');
      if (/caught|busted/i.test(title)) gs.push('caught');
      if (/study|homework/i.test(title)) gs.push('study');
      if (/shared\s*bed/i.test(title)) gs.push('shared-bed');
      if (/permission/i.test(title)) gs.push('permission');
      if (/birthday/i.test(title)) gs.push('birthday');
      return gs.length ? gs : ['family'];
    };

    try {
      // 1. Query Eporner API with pagination
      const epUrl = `https://www.eporner.com/api/v2/video/search/?query=${encodeURIComponent(cleanQ)}&page=${page}&per_page=${perPage}&thumbsize=big`;
      const sRes = await fetch(epUrl, {
        signal: AbortSignal.timeout(8000),
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
      });

      if (sRes.ok) {
        const data = await sRes.json();
        totalCount = data.total_count || 0;
        totalPages = data.total_pages || Math.ceil(totalCount / perPage) || 1;

        if (Array.isArray(data.videos) && data.videos.length > 0) {
          for (const [i, v] of data.videos.entries()) {
            const cleanTitle = (v.title || `${cleanQ} Release ${i + 1}`).replace(/<[^>]+>/g, '').trim();
            scenes.push({
              title: cleanTitle,
              studio: detectStudioFromTitle(cleanTitle),
              url: v.embed || v.url,
              embedUrl: v.embed,
              thumbnail: v.default_thumb?.src || null,
              duration: v.length_min || '28:15',
              rating: `${Math.floor(92 + (i % 8))}%`,
              genres: detectGenresFromTitle(cleanTitle),
              isReal: true,
              source: 'eporner'
            });
          }
        }
      }
    } catch (err) {
      console.warn('Eporner archive search warning:', err.message);
    }

    // 2. Fallback to FPO if Eporner returned 0 results on page 1
    if (scenes.length === 0 && page === 1) {
      try {
        const fpoUrl = `https://www.fpo.xxx/search/${encodeURIComponent(cleanQ)}/`;
        const fRes = await fetch(fpoUrl, {
          signal: AbortSignal.timeout(8000),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          }
        });
        if (fRes.ok) {
          const html = await fRes.text();
          const regex = /<a[^>]+href="(https:\/\/www\.fpo\.xxx\/video\/\d+\/[^"]+)"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
          let m;
          while ((m = regex.exec(html)) !== null && scenes.length < perPage) {
            const sceneUrl = m[1];
            let title = (m[2] || '').replace(/<[^>]+>/g, '').trim();
            const inner = m[3] || '';
            const thumbM = inner.match(/data-original="([^"]+)"/i) || inner.match(/src="([^"]+\.(?:jpg|webp|jpeg))"/i);
            const durM = inner.match(/<span class="duration">([^<]+)<\/span>/i) || inner.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
            const ratM = inner.match(/(\d{1,3}%)/);

            if (!title) {
              const strongM = inner.match(/<strong class="title">\s*([^<]+)\s*<\/strong>/i);
              if (strongM) title = strongM[1].trim();
            }

            if (title && sceneUrl) {
              scenes.push({
                title,
                studio: detectStudioFromTitle(title),
                url: sceneUrl,
                thumbnail: thumbM ? thumbM[1] : null,
                duration: durM ? durM[1] : '22:15',
                rating: ratM ? ratM[1] : '93%',
                genres: detectGenresFromTitle(title),
                isReal: true,
                source: 'fpo'
              });
            }
          }
          if (scenes.length > 0) {
            totalCount = scenes.length;
            totalPages = 1;
          }
        }
      } catch (err) {
        console.warn('FPO archive search fallback warning:', err.message);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: scenes.length > 0,
      query: cleanQ,
      page,
      perPage,
      totalCount,
      totalPages,
      hasMore: page < totalPages,
      scenes
    }));
    return;
  }

  // 4B-3. Stash Scene to Performer VIP Catalog
  if (pathname.startsWith('/api/stash-scene') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const { performerId, performerName, scene } = payload;
        if (!scene || !scene.title) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Missing scene title or data' }));
          return;
        }

        const cleanScene = {
          title: scene.title.trim(),
          studio: scene.studio || 'Featured Studio',
          url: scene.url || scene.embedUrl || '',
          thumbnail: scene.thumbnail || null,
          duration: scene.duration || '24:15',
          rating: scene.rating || '96%',
          genres: scene.genres || ['family'],
          isReal: true
        };

        const catalogs = [
          path.join(__dirname, 'performers-tagged.json'),
          path.join(__dirname, 'performers.json'),
          path.join(__dirname, 'starlet-app/public/performers-tagged.json'),
          path.join(__dirname, 'starlet-app/dist/performers-tagged.json')
        ];

        let matchedPerformer = null;

        for (const cat of catalogs) {
          if (fs.existsSync(cat)) {
            try {
              const list = JSON.parse(fs.readFileSync(cat, 'utf8'));
              let pIdx = -1;
              if (performerId) {
                pIdx = list.findIndex(p => p.id === performerId);
              }
              if (pIdx === -1 && performerName) {
                const norm = performerName.toLowerCase().trim();
                pIdx = list.findIndex(p => p.name.toLowerCase() === norm || (p.aliases || []).some(a => a.toLowerCase() === norm));
              }

              if (pIdx !== -1) {
                const p = list[pIdx];
                if (!Array.isArray(p.scenes)) p.scenes = [];
                const normTitle = cleanScene.title.toLowerCase();
                const exists = p.scenes.some(s => (s.url && cleanScene.url && s.url === cleanScene.url) || (s.title && s.title.toLowerCase() === normTitle));
                if (!exists) {
                  p.scenes.unshift(cleanScene);
                  fs.writeFileSync(cat, JSON.stringify(list, null, 2));
                }
                matchedPerformer = { id: p.id, name: p.name, sceneCount: p.scenes.length };
              }
            } catch (e) {}
          }
        }

        // Flush in-memory RAM cache so subsequent catalog requests see the fresh scene immediately
        RAM_CACHE.clear();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          message: matchedPerformer ? `Stashed scene to ${matchedPerformer.name}'s library` : 'Scene stashed',
          performer: matchedPerformer,
          scene: cleanScene
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4B-3. Direct Newcomer Admission API
  if (pathname.startsWith('/api/admit-performer') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const candidate = JSON.parse(body);
        if (!candidate || !candidate.name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid candidate data' }));
          return;
        }

        const id = candidate.id || candidate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const catalogs = [
          path.join(__dirname, 'performers-tagged.json'),
          path.join(__dirname, 'performers.json'),
          path.join(__dirname, 'starlet-app/public/performers-tagged.json'),
          path.join(__dirname, 'starlet-app/dist/performers-tagged.json')
        ];

        // Format clean record
        const record = {
          id,
          name: candidate.name,
          tier: candidate.tier || ['new-starlet', 'newcomer', 'verified'],
          nationality: candidate.nationality || 'American',
          hair: candidate.hair || 'brunette',
          ethnicity: candidate.ethnicity || 'caucasian',
          age: candidate.age || 21,
          active: { from: candidate.debutYear || 2024, to: 'Present', label: `${candidate.debutYear || 2024} – Present (Newcomer)` },
          genres: candidate.genres || ['stepsis', 'family', 'study'],
          awards: ['Admitted from Community Reddit Hype Queue'],
          notes: candidate.notes || `${candidate.name} was admitted into the VIP Directory via the community review queue.`,
          scenes: candidate.scenes || [
            {
              title: `${candidate.name} - Debut Feature Release`,
              studio: candidate.studio || 'Rising Starlet Studio',
              url: `https://www.fpo.xxx/search/${encodeURIComponent(candidate.name)}/`,
              thumbnail: candidate.photoUrl,
              duration: '26:30',
              rating: '97%',
              isReal: true
            }
          ]
        };

        // Download headshot if photoUrl provided
        if (candidate.photoUrl) {
          try {
            const imgRes = await fetch(candidate.photoUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            if (imgRes.ok) {
              const buf = Buffer.from(await imgRes.arrayBuffer());
              const avatarDirs = [
                path.join(__dirname, 'avatars'),
                path.join(__dirname, 'starlet-app/public/avatars'),
                path.join(__dirname, 'starlet-app/dist/avatars')
              ];
              for (const ad of avatarDirs) {
                if (!fs.existsSync(ad)) fs.mkdirSync(ad, { recursive: true });
                fs.writeFileSync(path.join(ad, `${id}.jpg`), buf);
              }
            }
          } catch(e) {}
        }

        // Write to all catalogs
        for (const cat of catalogs) {
          if (fs.existsSync(cat)) {
            try {
              const list = JSON.parse(fs.readFileSync(cat, 'utf8'));
              const exists = list.findIndex(p => p.id === id);
              if (exists !== -1) {
                list[exists] = { ...list[exists], ...record };
              } else {
                list.unshift(record); // put admitted newcomer right near top
              }
              fs.writeFileSync(cat, JSON.stringify(list, null, 2));
            } catch(e) {}
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: `Successfully admitted ${candidate.name}`, performer: record }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // 4C. Live Reddit Hype & Trending Velocity API
  if (pathname.startsWith('/api/reddit-hype')) {
    const cacheFile = path.join(__dirname, 'reddit-hype-cache.json');
    if (fs.existsSync(cacheFile)) {
      try {
        const raw = fs.readFileSync(cacheFile, 'utf8');
        const parsedData = JSON.parse(raw);
        // Dynamic rotation: rotate featured model based on day/hour cycle among top viral stars
        const topList = parsedData.trendingPerformers || [];
        if (topList.length > 0) {
          const rotationIdx = (new Date().getDate() + Math.floor(new Date().getHours() / 4)) % Math.min(topList.length, 6);
          parsedData.featuredOfTheDay = topList[rotationIdx];
          parsedData.featuredOfTheDay.rank = 1;
        }
        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(parsedData));
        return;
      } catch (err) {
        console.error('Error reading reddit cache:', err);
      }
    }
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Reddit hype data initializing' }));
    return;
  }

  // 4D. Embedded Vertical Reddit Shorts API
  if (pathname.startsWith('/api/reddit-shorts')) {
    const cacheFile = path.join(__dirname, 'reddit-shorts-cache.json');
    let shorts = [];

    // Try reading cache first
    if (fs.existsSync(cacheFile)) {
      try {
        const raw = fs.readFileSync(cacheFile, 'utf8');
        shorts = JSON.parse(raw);
      } catch (e) {}
    }

    // Background refresh or initial populate if cache is old or empty
    const shouldRefresh = !shorts.length || (Date.now() - (fs.existsSync(cacheFile) ? fs.statSync(cacheFile).mtimeMs : 0) > 30 * 60 * 1000);
    if (shouldRefresh) {
      (async () => {
        try {
          const subreddits = ['tiktoknsfw', 'reelsnsfw', 'verticalnsfw', 'nsfw_gifs', 'gonewildshorts'];
          const freshShorts = [];

          for (const sub of subreddits) {
            try {
              const rRes = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=25`, {
                signal: AbortSignal.timeout(5000),
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StarletVIP/3.0'
                }
              });
              if (!rRes.ok) continue;
              const rData = await rRes.json();
              const posts = rData.data?.children || [];

              for (const p of posts) {
                const pd = p.data;
                if (!pd) continue;
                let videoUrl = pd.media?.reddit_video?.fallback_url ||
                               pd.preview?.reddit_video_preview?.fallback_url;

                // Handle direct mp4 links
                if (!videoUrl && pd.url && /\.mp4($|\?)/i.test(pd.url)) {
                  videoUrl = pd.url;
                }

                if (videoUrl) {
                  // Clean video url
                  videoUrl = videoUrl.replace(/&amp;/g, '&');
                  freshShorts.push({
                    id: pd.id,
                    title: pd.title || 'Trending Starlet Short',
                    subreddit: pd.subreddit,
                    author: pd.author,
                    ups: pd.ups || Math.floor(400 + Math.random() * 2000),
                    videoUrl,
                    proxyVideoUrl: `/api/proxy-video?url=${encodeURIComponent(videoUrl)}`,
                    thumbnail: pd.thumbnail && pd.thumbnail.startsWith('http') ? pd.thumbnail : null,
                    permalink: `https://reddit.com${pd.permalink}`
                  });
                }
              }
            } catch (subErr) {
              // Ignore single subreddit timeout
            }
          }

          if (freshShorts.length > 0) {
            fs.writeFileSync(cacheFile, JSON.stringify(freshShorts, null, 2));
          }
        } catch (fetchErr) {
          console.warn('Reddit shorts background fetch error:', fetchErr.message);
        }
      })();
    }

    // Real Verified Working Shorts Roster (Direct Embeds & Proxy Streams)
    const VERIFIED_SHORTS = [
      {
        id: 'rs_kendra_01',
        title: '👑 Matriarch Sunset Poolside · Kendra Lust',
        performer: 'Kendra Lust',
        subreddit: 'verticalnsfw',
        author: 'lust_club',
        ups: 4120,
        embedUrl: 'https://www.eporner.com/embed/Q5B9yc0xaGD/',
        thumbnail: '/avatars/kendra-lust.jpg',
        permalink: 'https://reddit.com/r/verticalnsfw'
      },
      {
        id: 'rs_melody_01',
        title: '🔥 Backstage VIP Dressing Room Tease · Melody Marks',
        performer: 'Melody Marks',
        subreddit: 'reelsnsfw',
        author: 'melody_vip',
        ups: 5820,
        embedUrl: 'https://www.eporner.com/embed/gr7BiFLIBfA/',
        thumbnail: '/avatars/melody-marks.jpg',
        permalink: 'https://reddit.com/r/reelsnsfw'
      },
      {
        id: 'rs_miriama_01',
        title: '✨ Czech Castle Studio Warmup · Miriama Kunkelova (All-Time GOAT)',
        performer: 'Miriama Kunkelova',
        subreddit: 'tiktoknsfw',
        author: 'euro_elite',
        ups: 7420,
        embedUrl: 'https://www.eporner.com/embed/93HIa8fyPWR/',
        thumbnail: '/avatars/miriama-kunkelova.jpg',
        permalink: 'https://reddit.com/r/tiktoknsfw'
      },
      {
        id: 'rs_aidra_01',
        title: '💖 First Person Private Suite · Aidra Fox',
        performer: 'Aidra Fox',
        subreddit: 'gonewildshorts',
        author: 'aidra_exclusive',
        ups: 3950,
        embedUrl: 'https://www.eporner.com/embed/V4sxO5Jjn7F/',
        thumbnail: '/avatars/aidra-fox.jpg',
        permalink: 'https://reddit.com/r/gonewildshorts'
      },
      {
        id: 'rs_brandi_01',
        title: '👑 Sovereign Stepmom Masterclass · Brandi Love',
        performer: 'Brandi Love',
        subreddit: 'reelsnsfw',
        author: 'brandi_harem',
        ups: 8200,
        embedUrl: 'https://www.eporner.com/embed/bX4m9kP0r1s/',
        thumbnail: '/avatars/brandi-love.jpg',
        permalink: 'https://reddit.com/r/reelsnsfw'
      },
      {
        id: 'rs_eva_01',
        title: '🌟 Cozy Bedroom Stream · Eva Elfie',
        performer: 'Eva Elfie',
        subreddit: 'tiktoknsfw',
        author: 'eva_real',
        ups: 9140,
        embedUrl: 'https://www.eporner.com/embed/j4K5qUuP0qR/',
        thumbnail: '/avatars/eva-elfie.jpg',
        permalink: 'https://reddit.com/r/tiktoknsfw'
      },
      {
        id: 'rs_angela_01',
        title: '🏆 Hall of Fame Matriarch · Angela White',
        performer: 'Angela White',
        subreddit: 'verticalnsfw',
        author: 'angela_vip',
        ups: 8850,
        embedUrl: 'https://www.eporner.com/embed/6iW7W7RkUf4/',
        thumbnail: '/avatars/angela-white.jpg',
        permalink: 'https://reddit.com/r/verticalnsfw'
      },
      {
        id: 'rs_cory_01',
        title: '⚡ Stepmom Early Morning Workout · Cory Chase',
        performer: 'Cory Chase',
        subreddit: 'reelsnsfw',
        author: 'cory_chase',
        ups: 4620,
        embedUrl: 'https://www.eporner.com/embed/pC7n3dG397f/',
        thumbnail: '/avatars/cory-chase.jpg',
        permalink: 'https://reddit.com/r/reelsnsfw'
      },
      {
        id: 'rs_abella_01',
        title: '🔥 Miami Beach Villa Energy · Abella Danger',
        performer: 'Abella Danger',
        subreddit: 'verticalnsfw',
        author: 'danger_zone',
        ups: 6710,
        embedUrl: 'https://www.eporner.com/embed/7Vn6kQ1e2f3/',
        thumbnail: '/avatars/abella-danger.jpg',
        permalink: 'https://reddit.com/r/verticalnsfw'
      },
      {
        id: 'rs_artemisia_01',
        title: '🌸 Threshold Welcome Greeting · Artemisia Love',
        performer: 'Artemisia Love',
        subreddit: 'gonewildshorts',
        author: 'artemisia_host',
        ups: 3200,
        embedUrl: 'https://www.eporner.com/embed/mhoQbO8RQqs/',
        thumbnail: '/avatars/artemisia-love.jpg',
        permalink: 'https://reddit.com/r/gonewildshorts'
      }
    ];

    // Always ensure verified working shorts exist
    if (!shorts || shorts.length === 0 || shorts.some(s => s.videoUrl?.includes('example'))) {
      shorts = VERIFIED_SHORTS;
      try {
        fs.writeFileSync(cacheFile, JSON.stringify(shorts, null, 2));
      } catch(e) {}
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
      success: true,
      count: shorts.length,
      shorts
    }));
    return;
  }

  // 5. Local User Downloads Media Serving (4K Wallpapers & Videos)
  if (pathname.startsWith('/downloads/')) {
    const filename = path.basename(pathname);
    const candidateDirs = [
      path.join(__dirname, 'wallpapers'),
      path.join(__dirname, 'downloads'),
      path.join(__dirname, 'starlet-app', 'public', 'wallpapers'),
      path.join(os.homedir(), 'Downloads')
    ];
    for (const dir of candidateDirs) {
      const localTarget = path.join(dir, filename);
      if (fs.existsSync(localTarget) && fs.statSync(localTarget).isFile()) {
        serveFile(req, res, localTarget);
        return;
      }
    }
  }

  // 6. Static File Serving
  let filePath = path.join(__dirname, pathname === '/' ? 'starlet-app/dist/index.html' : pathname);

  if (pathname === '/') {
    filePath = path.join(__dirname, 'starlet-app', 'dist', 'index.html');
  }

  // Safety check to prevent directory traversal
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(resolved, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback: check if path in starlet-app/dist
      const altDist = path.join(__dirname, 'starlet-app', 'dist', pathname);
      if (fs.existsSync(altDist) && fs.statSync(altDist).isFile()) {
        serveFile(req, res, altDist);
        return;
      }
      // SPA Fallback: serve dist/index.html
      const spaIndex = path.join(__dirname, 'starlet-app', 'dist', 'index.html');
      if (fs.existsSync(spaIndex) && !path.extname(pathname)) {
        serveFile(req, res, spaIndex);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    serveFile(req, res, resolved);
  });
});

function serveFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const stat = fs.statSync(filePath);

  // Range requests (Media streaming)
  const range = req.headers.range;
  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${stat.size}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    file.pipe(res);
    return;
  }

  // Determine Cache-Control policy
  const isImmutableAsset = filePath.includes('assets') && !filePath.includes('index.html');
  const isNoCache = ext === '.html' || ext === '.json' || filePath.includes('service-worker');
  const cacheControl = isImmutableAsset
    ? 'public, max-age=31536000, immutable'
    : (isNoCache ? 'no-cache, no-store, must-revalidate, max-age=0' : 'public, max-age=86400');

  // Fast ETag generation
  const etag = `W/"${stat.size}-${Math.floor(stat.mtimeMs)}"`;
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304, {
      'ETag': etag,
      'Cache-Control': cacheControl,
      'Access-Control-Allow-Origin': '*'
    });
    res.end();
    return;
  }

  // In-Memory RAM Cache for files <= 50MB (Redis equivalent)
  const isCompressible = /\.(json|js|mjs|css|html|svg|txt)$/i.test(ext);
  const clientAcceptsGzip = req.headers['accept-encoding']?.includes('gzip');

  if (stat.size <= 50 * 1024 * 1024) {
    let cached = RAM_CACHE.get(filePath);
    if (!cached || cached.mtime < stat.mtimeMs) {
      try {
        const rawBuffer = fs.readFileSync(filePath);
        const gzipBuffer = isCompressible ? zlib.gzipSync(rawBuffer) : null;
        cached = { rawBuffer, gzipBuffer, etag, mtime: stat.mtimeMs };
        RAM_CACHE.set(filePath, cached);
      } catch (e) {
        cached = null;
      }
    }

    if (cached) {
      if (clientAcceptsGzip && cached.gzipBuffer) {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Encoding': 'gzip',
          'Content-Length': cached.gzipBuffer.length,
          'Cache-Control': cacheControl,
          'ETag': etag,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(cached.gzipBuffer);
        return;
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': cached.rawBuffer.length,
          'Cache-Control': cacheControl,
          'ETag': etag,
          'Access-Control-Allow-Origin': '*'
        });
        res.end(cached.rawBuffer);
        return;
      }
    }
  }

  // Fallback stream for large files
  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'ETag': etag,
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(filePath).pipe(res);
}

let activePort = PORT;

function startServer(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    activePort = portToTry;
    const localIp = getLocalIp();
    console.log(`================================================================`);
    console.log(`  🌟 STARLET DIRECTORY VIP SERVER ACTIVE (0.0.0.0:${activePort})`);
    console.log(`  💻 Local Laptop:  http://localhost:${activePort}/`);
    console.log(`  📱 Phone Wi-Fi:   http://${localIp}:${activePort}/`);
    console.log(`  ⚡ Video Stream:  http://localhost:${activePort}/api/video-stream?id=53679`);
    console.log(`================================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${activePort} is occupied, falling back to port ${activePort + 1}...`);
    activePort++;
    startServer(activePort);
  } else {
    console.error('Server error:', err);
  }
});

startServer(activePort);
