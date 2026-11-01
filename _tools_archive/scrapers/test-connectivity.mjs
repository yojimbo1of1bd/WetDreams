async function checkConnectivity() {
  const targets = [
    { name: "Wikipedia", url: "https://en.wikipedia.org/api/rest_v1/page/summary/Abella_Danger" },
    { name: "Wikidata", url: "https://www.wikidata.org/w/api.php?action=wbsearchentities&search=Abella+Danger&language=en&format=json" },
    { name: "Reddit", url: "https://www.reddit.com" },
    { name: "FPO", url: "https://www.fpo.xxx" },
    { name: "GitHub", url: "https://api.github.com" },
    { name: "Google", url: "https://www.google.com" },
  ];
  for (const t of targets) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(t.url, { signal: controller.signal, headers: { "User-Agent": "Mozilla/5.0" } });
      clearTimeout(id);
      console.log(`${t.name}: ${res.status}`);
    } catch(e) {
      console.log(`${t.name}: FAILED (${e.message})`);
    }
  }
}
checkConnectivity();

