async function testIafd() {
  try {
    const url = "https://www.iafd.com/person.rme/perfid=adanger/gender=f/abella-danger.htm";
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    console.log("IAFD status:", res.status);
    const text = await res.text();
    console.log("IAFD html length:", text.length);
    console.log("IAFD preview:", text.slice(0, 500));
  } catch (e) {
    console.error("IAFD error:", e);
  }
}
testIafd();

