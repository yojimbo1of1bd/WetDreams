async function testPornhubAPI() {
  try {
    const url = "https://www.pornhub.com/webmasters/search?search=Abella+Danger&thumbsize=large";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });
    console.log("Pornhub Webmaster API status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Total video results:", data.videos?.length);
      if (data.videos?.length) {
        console.log("Sample video:", {
          title: data.videos[0].title,
          duration: data.videos[0].duration,
          url: data.videos[0].url,
          publish_date: data.videos[0].publish_date,
          tags: data.videos[0].tags?.slice(0, 5)
        });
      }
    }
  } catch (e) {
    console.error("Pornhub API error:", e);
  }
}
testPornhubAPI();

