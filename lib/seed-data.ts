export const SEED_CATEGORIES = [
  { name: "Algorithms", slug: "algorithms", hue: 162 },
  { name: "Web Dev", slug: "web-dev", hue: 172 },
  { name: "Computer Science", slug: "computer-science", hue: 150 },
  { name: "Machine Learning", slug: "machine-learning", hue: 185 },
  { name: "Blockchain", slug: "blockchain", hue: 195 },
  { name: "Miscellaneous", slug: "miscellaneous", hue: 140 },
];

export const SEED_AUTHORS = [
  {
    name: "Aarav Sinha",
    roleTitle: "Pre-final year, CSE",
    bio: "Codeforces specialist who runs the Tuesday problem-solving sessions.",
    avatarUrl: null,
  },
  {
    name: "Meera Kapoor",
    roleTitle: "Final year, IT",
    bio: "Leads the web team and maintains the PCON website.",
    avatarUrl: null,
  },
  {
    name: "Rohan Das",
    roleTitle: "Third year, CSE",
    bio: "Systems nerd. Compilers, kernels and anything low level.",
    avatarUrl: null,
  },
  {
    name: "Ishita Verma",
    roleTitle: "Pre-final year, ECE",
    bio: "Reads papers on weekends. Runs the ML reading group.",
    avatarUrl: null,
  },
  {
    name: "Kabir Mehta",
    roleTitle: "Second year, CSE",
    bio: "Curious about how things work under the hood.",
    avatarUrl: null,
  },
  {
    name: "Ananya Roy",
    roleTitle: "Final year, CSE",
    bio: "Backend developer and hackathon regular.",
    avatarUrl: null,
  },
];

export const SEED_POSTS = [
  {
    slug: "dp-without-tears",
    title: "Dynamic programming without the tears",
    excerpt: "Stop memorising recurrences. A way to find the state, the transition and the base case for any DP problem.",
    categorySlug: "algorithms",
    authorName: "Aarav Sinha",
    status: "published",
    isFeatured: true,
    publishedAt: new Date("2026-11-08T10:00:00Z"),
    content: `Every DP problem is the same question in disguise: *what is the smallest piece of information I need to carry forward?* Once you can answer that, the code writes itself.

## Start with the state

Take the classic "maximum sum with no two adjacent elements". At index \`i\` you only care about the best sum up to \`i\`. Nothing else matters.

\`\`\`cpp
dp[i] = max(dp[i-1], dp[i-2] + a[i]);
\`\`\`

> If your state needs more than two or three parameters, you have probably picked the wrong state.

## A checklist

* Define what \`dp[i]\` means in one sentence.
* Write the transition on paper before any code.
* Check the base cases against a tiny input.

Practise this on ten problems and the pattern becomes automatic.`,
  },
  {
    slug: "nextjs-for-club-sites",
    title: "Building our club site with Next.js",
    excerpt: "How we structured routes, content and deployment for the PCON website, and what we would do differently.",
    categorySlug: "web-dev",
    authorName: "Meera Kapoor",
    status: "published",
    isFeatured: false,
    publishedAt: new Date("2026-11-02T10:00:00Z"),
    content: `When we rebuilt the PCON site we wanted something any member could contribute to without learning a CMS.

## Routes

Blogs live under \`/blogs/[id]\`, and the listing sits at \`/blogs\`. Each post is backed by PostgreSQL with an admin interface for submissions.

\`\`\`typescript
export async function generateStaticParams() {
  const posts = await getPublishedBlogs();
  return posts.map((p) => ({ id: p.slug }));
}
\`\`\`

Static generation and incremental revalidation keep every page blazing fast and completely free to host.`,
  },
  {
    slug: "intro-to-llvm",
    title: "Profiling code with LLVM",
    excerpt: "A first look at how compilers see your program, and how to measure where the time actually goes.",
    categorySlug: "computer-science",
    authorName: "Rohan Das",
    status: "published",
    isFeatured: false,
    publishedAt: new Date("2026-10-27T10:00:00Z"),
    content: `Before optimising anything, measure it. LLVM gives us tools that show exactly which functions burn your cycles.

## Build with symbols

\`\`\`bash
clang++ -O2 -g main.cpp -o main
\`\`\`

With debug symbols on, a profiler can map samples back to your source lines with zero ambiguity.`,
  },
  {
    slug: "max-likelihood",
    title: "Maximum likelihood, from scratch",
    excerpt: "Why do we minimise cross-entropy? Derive it from the one principle behind most of ML.",
    categorySlug: "machine-learning",
    authorName: "Ishita Verma",
    status: "published",
    isFeatured: false,
    publishedAt: new Date("2026-10-19T10:00:00Z"),
    content: `Maximum likelihood asks one thing: which parameters make the data we saw most probable?

> Loss functions are not arbitrary. Most of them are a likelihood in disguise.

Work through the coin-flip example first, then the Gaussian case, and the rest follows naturally.`,
  },
  {
    slug: "what-is-a-dll",
    title: "What is a .dll, really?",
    excerpt: "Shared libraries on Windows explained without the jargon, including why “DLL hell” happens.",
    categorySlug: "miscellaneous",
    authorName: "Kabir Mehta",
    status: "published",
    isFeatured: false,
    publishedAt: new Date("2026-10-11T10:00:00Z"),
    content: `A \`.dll\` is a bundle of code that many programs share, so each one does not need its own copy.

## Why it matters

Smaller programs, shared updates and plugin systems all rely on dynamic linking.`,
  },
  {
    slug: "distributed-bitcoin",
    title: "Distributed systems through Bitcoin",
    excerpt: "Consensus, fault tolerance and trust, explained by the most famous distributed system ever built.",
    categorySlug: "blockchain",
    authorName: "Ananya Roy",
    status: "published",
    isFeatured: false,
    publishedAt: new Date("2026-10-03T10:00:00Z"),
    content: `Bitcoin solves a problem that sounds impossible: getting strangers to agree without a referee.

## Longest chain wins

Nodes always follow the longest valid chain, so cheating costs more than honesty pays.`,
  },
];

/**
 * Test events taken from the club's Instagram posts (@pconjsr, Oct 2026).
 * The posts don't give exact times, venues or registration links, so the
 * times are placeholders, and dates other than HACKSPHERE'26 (3 Jul 2026)
 * are the days just before each recap post. Fixed ids make `npm run db:seed` safe to re-run.
 */
export const SEED_EVENTS = [
  {
    id: "seed-event-hacksphere-26",
    title: "HACKSPHERE'26",
    description: "A battle of ideas, innovation and problem-solving: PCON's hackathon, where teams built and pitched their projects.",
    startDate: new Date("2026-07-03T09:00:00+05:30"),
    endDate: new Date("2026-07-03T21:00:00+05:30"),
  },
  {
    id: "seed-event-dp-bit-workshop",
    title: "Workshop: Dynamic Programming & Bit Manipulation",
    description: "A hands-on session to strengthen the fundamentals of dynamic programming and bit manipulation, two topics at the heart of competitive programming.",
    startDate: new Date("2026-10-11T17:00:00+05:30"),
    endDate: new Date("2026-10-11T19:00:00+05:30"),
  },
  {
    id: "seed-event-code-pray-submit-26",
    title: "Code, Pray and Submit '26",
    description: "An offline competitive programming contest where participants put their problem-solving skills to the test on challenging problems.",
    startDate: new Date("2026-10-12T10:00:00+05:30"),
    endDate: new Date("2026-10-12T13:00:00+05:30"),
  },
  {
    id: "seed-event-system-design-workshop",
    title: "Workshop: System Design",
    description: "High-level design (architecture, scalability, databases, APIs, caching and load balancing) and low-level design principles for clean, modular, maintainable code.",
    startDate: new Date("2026-10-22T17:00:00+05:30"),
    endDate: new Date("2026-10-22T19:00:00+05:30"),
  },
];

// ───── Achievements and hall of fame ─────
// The entries the two pages launched with. `npm run db:seed` only creates rows
// whose slug is missing, so it never overwrites edits made in the admin panel.

export type SeedFameEntry = {
  slug: string;
  event: string;
  /** YYYY-MM-DD */
  date: string;
  kind: "Contest" | "Hackathon" | "Quiz" | "Other";
  summary?: string;
  link?: string;
  podium: { rank: 1 | 2 | 3; name: string; roll?: string; team?: string[] }[];
  mentions?: { name: string; roll?: string; award?: string }[];
};

export const SEED_HALL_OF_FAME: SeedFameEntry[] = [
  {
    slug: "hacksphere-26",
    event: "HACKSPHERE'26",
    date: "2026-07-03",
    kind: "Hackathon",
    summary: "A battle of ideas, innovation and problem-solving. The judges called it a genuinely tough decision.",
    link: "https://www.instagram.com/p/DeeIT_8iNbb/",
    podium: [
      { rank: 1, name: "Lakshya Kumar Sudhera", roll: "2025UGCS055" },
      { rank: 2, name: "Raunak Shrivastava", roll: "2025UGEE045" },
      { rank: 3, name: "Satyam Sagar", roll: "2025UGCS010" },
    ],
    mentions: [{ name: "Raushan Kumar", roll: "2025UGMM037", award: "Best UI/UX" }],
  },
  {
    slug: "code-pray-and-submit-26",
    event: "Code, Pray and Submit '26",
    // Results post: 14 Oct 2026; the contest ran shortly before it.
    date: "2026-10-12",
    kind: "Contest",
    summary: "An offline competitive programming contest run alongside the club's DP and bit manipulation workshop.",
    link: "https://www.instagram.com/p/DefyF29n_wG/",
    podium: [
      { rank: 1, name: "Rajput Suraj", roll: "2025UGCS111" },
      { rank: 2, name: "Satyam Sagar", roll: "2025UGCS010" },
      { rank: 3, name: "Dheeraj Verma", roll: "2025UGCS047" },
    ],
  },
  {
    slug: "march-codekarma-2024",
    event: "March CodeKarma 2024",
    date: "2024-03-09",
    kind: "Contest",
    summary: "The club's monthly programming contest. Special mentions went to the coders who broke into the top five.",
    podium: [
      { rank: 1, name: "Om Raj", roll: "2023UGCS022" },
      { rank: 2, name: "Abhinav Vishen", roll: "2023UGCS010" },
      { rank: 3, name: "Khushi Malviya", roll: "2023UGMM074" },
    ],
    mentions: [
      { name: "Sujal Bhatu", roll: "2023UGCS119" },
      { name: "Apoorva Singh", roll: "2023UGCS025" },
    ],
  },
];

/** From the seniors' club deck. Photos are in public/achievements/. */
export const SEED_ACHIEVEMENTS = [
  {
    slug: "icpc-kanpur-2025",
    title: "ICPC Asia Kanpur Regional 2025",
    organiser: "ICPC · CSJM University, Kanpur",
    year: 2025,
    dates: "22–23 Dec 2025",
    kind: "ICPC",
    result: "Rank 54",
    tier: "rank",
    highlight: "1st among all NITs",
    imageUrl: "/achievements/icpc-kanpur-25.jpg",
    imageAlt: "PCON's team in front of the ICPC Kanpur Site 2025 welcome banner",
    featured: true,
  },
  {
    slug: "jpmc-code-for-good-2025",
    title: "Code for Good 2025",
    organiser: "JPMorgan Chase",
    year: 2025,
    kind: "Hackathon",
    result: "Winner",
    tier: "winner",
    imageUrl: "/achievements/jpmc-code-for-good-25.jpg",
    imageAlt: "The winning team at JPMorgan Chase Code for Good 2025",
  },
  {
    slug: "isro-bah-2025",
    title: "Bharatiya Antariksh Hackathon 2025",
    organiser: "ISRO",
    year: 2025,
    kind: "Hackathon",
    result: "Finalist",
    tier: "finalist",
    imageUrl: "/achievements/isro-bah-25.jpg",
    imageAlt: "PCON's finalist team outside an ISRO centre, beside a rocket model",
  },
  {
    slug: "icpc-amritapuri-2025",
    title: "ICPC Asia Amritapuri Regional 2025",
    organiser: "ICPC · Amrita Vishwa Vidyapeetham",
    year: 2025,
    kind: "ICPC",
    result: "Rank 183",
    tier: "rank",
    highlight: "Out of 360+ teams",
    imageUrl: "/achievements/icpc-amritapuri-25.jpg",
    imageAlt: "PCON's team at the ICPC Amritapuri Site Regionals 2025",
  },
  {
    slug: "adobe-gensolve-2024",
    title: "Adobe GenSolve 2024",
    organiser: "Adobe",
    year: 2024,
    kind: "Hackathon",
    result: "Winner",
    tier: "winner",
    imageUrl: "/achievements/adobe-gensolve-24.jpg",
    imageAlt: "PCON members receiving the Adobe GenSolve 2024 award on stage",
  },
  {
    slug: "myntra-hackerramp-2024",
    title: "Myntra WeForShe HackerRamp'24",
    organiser: "Myntra",
    year: 2024,
    kind: "Hackathon",
    result: "Runner-up",
    tier: "runner-up",
    imageUrl: "/achievements/myntra-hackerramp-24.jpg",
    imageAlt: "PCON's runner-up team in front of the Myntra logo wall",
  },
];
