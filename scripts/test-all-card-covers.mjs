async function testCovers() {
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch("http://localhost:3000/blogs");
      if (res.ok) break;
    } catch {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  const res = await fetch("http://localhost:3000/blogs");
  const html = await res.text();

  // Find all cards
  const coverCount = (html.match(/class="[^"]*blog-cover[^"]*"/g) || []).length;
  const svgCount = (html.match(/<svg\s+viewBox="0 0 400 225"/g) || []).length;
  const cardCount = (html.match(/class="[^"]*blog-card[^"]*"/g) || []).length;
  const featureCount = (html.match(/class="[^"]*blog-feature[^"]*"/g) || []).length;

  console.log("Total Cards in Grid:", cardCount);
  console.log("Featured Cards:", featureCount);
  console.log("Total Blog Cover Elements:", coverCount);
  console.log("Total SVG Cover Art Elements:", svgCount);

  // Check specific categories
  const hasWebDevArt = html.includes('fill="#ff7a6b"'); // Web Dev traffic lights
  const hasCSArt = html.includes("run_pass"); // CS compiler passes
  const hasMLArt = html.includes('d="M50 175 C130 165'); // ML curve
  const hasDllArt = html.includes(".dll"); // Misc DLL art

  console.log("Web Dev Browser Art present:", hasWebDevArt);
  console.log("Computer Science Pipeline Art present:", hasCSArt);
  console.log("Machine Learning Curve Art present:", hasMLArt);
  console.log("Miscellaneous .dll Art present:", hasDllArt);

  const allPresent = coverCount >= 6 && svgCount >= 6 && hasWebDevArt && hasCSArt && hasMLArt && hasDllArt;
  console.log("ALL BLOG COVERS PRESENT AND VISIBLE:", allPresent);
}

testCovers();

