// Use global fetch available in Node 18+

async function testPerformer(name) {
  const url = `https://www.babepedia.com/babe/${encodeURIComponent(name.replace(/\s+/g, '_'))}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9'
    }
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Babepedia HTTP ${res.status}`);

  const html = await res.text();
  const ageMatch = html.match(/(\d{1,2})\s*years\s*old/i);
  const hairMatch = html.match(/Hair\s*color:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
  const ethMatch = html.match(/Ethnicity:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
  const natMatch = html.match(/Nationality:<\/span>\s*<span class="value">([^<]+)<\/span>/i);
  const activeMatch = html.match(/Years\s*active:<\/span>\s*<span class="value">(\d{4})/i);

  return {
    name,
    age: ageMatch ? parseInt(ageMatch[1], 10) : null,
    hair: hairMatch ? hairMatch[1].trim().toLowerCase() : null,
    ethnicity: ethMatch ? ethMatch[1].trim().toLowerCase() : null,
    nationality: natMatch ? natMatch[1].trim().toLowerCase() : null,
    activeFrom: activeMatch ? parseInt(activeMatch[1], 10) : null
  };
}

async function run() {
  for (const name of ['Adria Rae', 'Cherie DeVille', 'Keena James', 'Abigail Mac']) {
    try {
      const info = await testPerformer(name);
      console.log('Result for', name, ':', info);
    } catch (e) {
      console.error('Error for', name, ':', e.message);
    }
  }
}

run();
