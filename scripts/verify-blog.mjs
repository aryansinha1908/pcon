async function verifyHTML() {
  const listingRes = await fetch("http://localhost:3000/blogs");
  const listingHtml = await listingRes.text();

  const checksListing = [
    { name: "Blog theme class", pass: listingHtml.includes("blog-theme") },
    { name: "Wrap container", pass: listingHtml.includes("blog-wrap") },
    { name: "Eyebrow tag", pass: listingHtml.includes("blog-tag") && listingHtml.includes("THE PCON BLOG") },
    { name: "Headline with mint span", pass: listingHtml.includes("Ideas worth") && listingHtml.includes("shipping.") },
    { name: "Category filter chips", pass: listingHtml.includes("blog-filters") && listingHtml.includes("blog-chip") },
    { name: "Featured hero card", pass: listingHtml.includes("blog-feature") && listingHtml.includes("Featured") },
    { name: "Card grid", pass: listingHtml.includes("blog-grid") && listingHtml.includes("blog-card") },
    { name: "SVG Cover Art", pass: listingHtml.includes("<svg") && listingHtml.includes("viewBox") },
    { name: "Category Pill on cover", pass: listingHtml.includes("blog-cat") },
    { name: "Author Avatar Meta", pass: listingHtml.includes("blog-meta") && listingHtml.includes("blog-av") },
    { name: "Footer copyright", pass: listingHtml.includes("© 2026 PCON, NIT Jamshedpur") },
  ];

  console.log("=== LISTING PAGE VERIFICATION ===");
  checksListing.forEach((c) => console.log((c.pass ? "✓" : "✗") + " " + c.name));

  const detailRes = await fetch("http://localhost:3000/blogs/dp-without-tears");
  const detailHtml = await detailRes.text();

  const checksDetail = [
    { name: "Reading progress bar", pass: detailHtml.includes("blog-bar") },
    { name: "Back link", pass: detailHtml.includes("← All posts") },
    { name: "Article Header", pass: detailHtml.includes("blog-phead") },
    { name: "Crumbs Category Pill", pass: detailHtml.includes("blog-pill") && detailHtml.includes("Algorithms") },
    { name: "Read Time", pass: detailHtml.includes("min read") },
    { name: "Dek Excerpt", pass: detailHtml.includes("blog-dek") },
    { name: "Byline Ringed Avatar", pass: detailHtml.includes("blog-av ring") },
    { name: "Written By label", pass: detailHtml.includes("Written by") },
    { name: "Author Name", pass: detailHtml.includes("Aarav Sinha") },
    { name: "Copy Link Button", pass: detailHtml.includes("blog-copy") && detailHtml.includes("Copy link") },
    { name: "21:9 Cover Banner", pass: detailHtml.includes("blog-hcover") },
    { name: "Two column layout", pass: detailHtml.includes("blog-pgrid") && detailHtml.includes("blog-side") },
    { name: "Sticky author card", pass: detailHtml.includes("blog-acard") && detailHtml.includes("blog-av big ring") },
    { name: "Article prose", pass: detailHtml.includes("blog-prose") },
    { name: "H2 headings in content", pass: detailHtml.includes("<h2>Start with the state</h2>") },
    { name: "Blockquote with mint bar", pass: detailHtml.includes("<blockquote>") },
    { name: "Code block", pass: detailHtml.includes("<pre") && detailHtml.includes("<code") },
    { name: "Bottom CTA Card", pass: detailHtml.includes("blog-cta") && detailHtml.includes("Have something to teach?") },
    { name: "Keep reading grid", pass: detailHtml.includes("blog-more") && detailHtml.includes("Keep reading") },
  ];

  console.log("\n=== DETAIL PAGE VERIFICATION ===");
  checksDetail.forEach((c) => console.log((c.pass ? "✓" : "✗") + " " + c.name));

  const allPassed = checksListing.every((c) => c.pass) && checksDetail.every((c) => c.pass);
  console.log("\nAll structural & design checks passed:", allPassed);
}

verifyHTML();

