// parse-names-test.mjs
import fs from 'fs';

const rawText = fs.readFileSync('user-names-input.txt', 'utf8');
const lines = rawText.split(/[\r\n,]+/).map(s => s.trim()).filter(Boolean);

console.log('Total tokens:', lines.length);

