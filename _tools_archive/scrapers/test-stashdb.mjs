async function testStashDB() {
  try {
    const query = JSON.stringify({
      query: `query {
        searchPerformer(term: "Abella Danger", limit: 1) {
          id
          name
        }
      }`
    });
    const res = await fetch("https://stashdb.org/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "StarletApp/1.0"
      },
      body: query
    });
    console.log("StashDB status:", res.status);
    const text = await res.text();
    console.log("StashDB response:", text.slice(0, 500));
  } catch(e) {
    console.error("StashDB error:", e.message);
  }
}
testStashDB();

