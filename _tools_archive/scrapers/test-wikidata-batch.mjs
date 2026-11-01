async function queryWikidata(name) {
  try {
    const searchUrl = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&format=json`;
    const sRes = await fetch(searchUrl, { headers: { 'User-Agent': 'StarletDirectoryBot/1.0 (contact: local)' } });
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const match = sData.search?.find(item => 
      /porn|actress|model|entertainer/i.test(item.description || '')
    ) || sData.search?.[0];

    if (!match) return null;

    // Check if description has birth year e.g. "(b. 1988)"
    const descMatch = (match.description || '').match(/\b(?:b\.|born)\s*(\d{4})\b/i);
    let birthYear = descMatch ? parseInt(descMatch[1], 10) : null;

    if (!birthYear && match.id) {
      const entUrl = `https://www.wikidata.org/wiki/Special:EntityData/${match.id}.json`;
      const eRes = await fetch(entUrl, { headers: { 'User-Agent': 'StarletDirectoryBot/1.0' } });
      if (eRes.ok) {
        const eData = await eRes.json();
        const claims = eData.entities?.[match.id]?.claims;
        const dob = claims?.P569?.[0]?.mainsnak?.datavalue?.value?.time;
        if (dob) {
          birthYear = parseInt(dob.replace('+', '').slice(0, 4), 10);
        }
      }
    }

    const age = birthYear ? 2026 - birthYear : null;
    return {
      name,
      id: match.id,
      description: match.description,
      birthYear,
      age
    };
  } catch (err) {
    return { name, error: err.message };
  }
}

async function run() {
  const names = ['Adria Rae', 'Cherie DeVille', 'Keena James', 'Abigail Mac', 'Riley Reid', 'Kendra Lust'];
  for (const n of names) {
    const res = await queryWikidata(n);
    console.log(res);
  }
}

run();

