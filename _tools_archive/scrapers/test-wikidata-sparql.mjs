async function testWikidataSPARQL() {
  try {
    // SPARQL query: films/works starring Kendra Lust or Abella Danger (Q19816568)
    const sparql = `
      SELECT ?work ?workLabel ?pubDate WHERE {
        ?work wdt:P161 wd:Q19816568 .
        OPTIONAL { ?work wdt:P577 ?pubDate . }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT 20
    `;
    const url = "https://query.wikidata.org/sparql?query=" + encodeURIComponent(sparql) + "&format=json";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "StarletApp/1.0 (contact@example.org)"
      }
    });
    console.log("Wikidata SPARQL status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Wikidata works found:", data.results.bindings.map(b => ({
        title: b.workLabel.value,
        date: b.pubDate?.value
      })));
    }
  } catch (e) {
    console.error("Wikidata SPARQL error:", e);
  }
}
testWikidataSPARQL();

