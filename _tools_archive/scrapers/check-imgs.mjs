import fs from 'fs';
const html = fs.readFileSync('fpo-sample.html', 'utf8');
const imgs = [...html.matchAll(/<img[^>]+(?:src|data-src|data-original)=["']([^"']+)["'][^>]*>/gi)];
console.log('Images found:', imgs.length);
console.log('Sample images:', imgs.slice(0, 10).map(m => m[1]));

