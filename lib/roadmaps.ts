/**
 * Roadmaps curated by PCON seniors.
 *
 * These types are the contract for roadmap data. Today the content lives in this
 * file; once the admin panel ships, replace the body of `getPathway()` with a
 * fetch from its API and keep the shapes (and every step `id`) the same:
 * juniors' saved progress is keyed on step ids.
 */

export type ResourceKind = "playlist" | "video" | "practice" | "website";

export type Resource = {
  label: string;
  url: string;
  kind: ResourceKind;
  /** Extra guidance from the seniors, e.g. "First 16 videos" or "Sessions 1–7". */
  note?: string;
  /** ISO date this resource was added. Resources added in the last week get a "New" badge. */
  addedAt?: string;
};

export type RoadmapStep = {
  /** Stable, unique across all roadmaps. Never reuse or rename: progress is stored against it. */
  id: string;
  title: string;
  summary?: string;
  resources: Resource[];
  /** Groups steps into stages within a track, e.g. "First years". */
  stage?: string;
  optional?: boolean;
  /** A checkpoint rather than a topic, e.g. reaching 5★ on HackerRank. */
  milestone?: boolean;
  /** ISO date the step was added; applies to all its resources that don't set their own. */
  addedAt?: string;
};

export type RoadmapTint = "mint" | "blue" | "orange" | "violet";

export type Roadmap = {
  slug: string;
  title: string;
  /** Short label used on the overview, e.g. "Option B". */
  kicker: string;
  tagline: string;
  tint: RoadmapTint;
  steps: RoadmapStep[];
  /** Shown as the final, locked node of the track. */
  locked?: string;
  exploreNext?: string[];
  furtherReading?: Resource[];
  channels?: string[];
  tips?: string[];
};

export type Pathway = {
  principles: string[];
  foundation: Roadmap;
  branches: Roadmap[];
};

const playlist = (id: string) => `https://www.youtube.com/playlist?list=${id}`;

const foundation: Roadmap = {
  slug: "foundation",
  title: "Problem solving foundations",
  kicker: "Steps 1 & 2 · Everyone",
  tagline: "Start with basic problem solving to build your logical thinking and coding fundamentals. Everyone must complete this level, regardless of their future domain.",
  tint: "mint",
  steps: [
    {
      id: "foundation-cpp-basics",
      addedAt: "2026-11-12",
      title: "C++ basics",
      summary: "You can learn any other language too, but since our college has traditionally followed C++, it is recommended.",
      resources: [
        { label: "C++ playlist", url: playlist("PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA"), kind: "playlist", note: "Complete the first 30 lectures" },
        { label: "C++ in brief by Luv", url: playlist("PLauivoElc3gh48CgP4cQPrC1wrpAqY9cf"), kind: "playlist", note: "Brief alternative" },
      ],
    },
    {
      id: "foundation-stl",
      addedAt: "2026-11-12",
      title: "STL basics",
      summary: "The C++ Standard Template Library: containers, iterators and algorithms.",
      resources: [{ label: "STL basics by Luv", url: playlist("PLauivoElc3gh3RCiQA82MDI-gJfXQQVnn"), kind: "playlist" }],
    },
    {
      id: "foundation-hackerrank",
      title: "Start solving on HackerRank",
      summary: "After STL, make an account on HackerRank and start solving problems.",
      resources: [{ label: "HackerRank", url: "https://www.hackerrank.com/", kind: "website" }],
    },
    {
      id: "foundation-hackerrank-5-star",
      title: "Achieve 5★ in Problem Solving",
      summary: "This ensures you're comfortable with the basics of DSA and implementation. Further details will be shared after you reach 5★.",
      milestone: true,
      resources: [{ label: "HackerRank Problem Solving", url: "https://www.hackerrank.com/domains/algorithms?badge_type=problem-solving", kind: "practice" }],
    },
  ],
};

const TLE_SHEET = "https://www.tle-eliminators.com/cp-sheet";

const cp: Roadmap = {
  slug: "cp",
  title: "Competitive programming",
  kicker: "Option A",
  tagline: "If you find problem solving interesting, continue with CP. Climb the TLE CP-31 sheet rating by rating, then go deep topic-wise with CSES, CP-Algorithms and the USACO Guide.",
  tint: "mint",
  steps: [
    {
      id: "cp-cp31-basics",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Basic logic, STL & maths",
      summary: "Start solving the CP-31 sheet for basic logical questions, STL and maths.",
      resources: [{ label: "CP-31 sheet", url: TLE_SHEET, kind: "practice", note: "800–1100 rated" }],
    },
    {
      id: "cp-number-theory-two-pointers",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Basic number theory & two pointers",
      resources: [
        { label: "Basic number theory by Luv", url: playlist("PLauivoElc3giVROwL-6g9hO-LlSen_NaV"), kind: "playlist", note: "Lectures 57–64" },
        { label: "Two pointer lectures", url: playlist("PLgUwDviBIf0q7vrFA_HEWcqRqMpCXzYAL"), kind: "playlist" },
        { label: "CP-31 sheet", url: TLE_SHEET, kind: "practice", note: "Complete 1100–1200 rated" },
      ],
    },
    {
      id: "cp-binary-search-bits",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Binary search, bit manipulation & advanced number theory",
      resources: [
        { label: "Binary search by Luv", url: playlist("PLauivoElc3gjE_s-7owHO0RVb_jj7Rx85"), kind: "playlist" },
        { label: "CP-31 sheet", url: TLE_SHEET, kind: "practice", note: "Solve 1200–1300 rated" },
      ],
    },
    {
      id: "cp-recursion-stacks-queues",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Recursion, stacks & queues",
      resources: [
        { label: "Detailed recursion playlist", url: playlist("PLgUwDviBIf0rGlzIn_7rsaR2FQ5e6ZOL9"), kind: "playlist" },
        { label: "Stack and queue by Striver", url: playlist("PLgUwDviBIf0pOd5zvVVSzgpo6BaCpHT9c"), kind: "playlist" },
      ],
    },
    {
      id: "cp-trees-heaps",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Trees & heaps",
      resources: [
        { label: "Trees by Luv", url: playlist("PLauivoElc3ghxyYSr_sVnDUc_ynPk6iXE"), kind: "playlist" },
        { label: "Heaps", url: playlist("PL_z_8CaSLPWdtY9W22VjnPxG30CXNZpI9"), kind: "playlist" },
      ],
    },
    {
      id: "cp-graphs",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Graph theory",
      resources: [
        { label: "Graph theory (part 1)", url: playlist("PL5DyztRVgtRVLwNWS7Rpp4qzVVHJalt22"), kind: "playlist" },
        { label: "Graph theory (part 2)", url: playlist("PL5DyztRVgtRW0Kdd8i1xML7t-ge56XRQR"), kind: "playlist" },
      ],
    },
    {
      id: "cp-dynamic-programming",
      addedAt: "2026-11-12",
      stage: "TLE Eliminators CP-31 sheet",
      title: "Dynamic programming",
      resources: [
        { label: "Dynamic programming", url: playlist("PL_z_8CaSLPWekqhdCPmFohncHwz8TY2Go"), kind: "playlist" },
        { label: "CP-31 sheet", url: TLE_SHEET, kind: "practice", note: "Start solving 1400+ rated" },
      ],
    },
    {
      id: "cp-cses",
      addedAt: "2026-11-12",
      stage: "CSES",
      title: "CSES problem set",
      summary: "Topic-wise problem solving, with the CSES book for CP concepts.",
      resources: [
        { label: "CSES problem set", url: "https://cses.fi/problemset/", kind: "practice" },
        { label: "Competitive Programmer's Handbook (CSES book)", url: "https://cses.fi/book/book.pdf", kind: "website", note: "PDF" },
      ],
    },
    {
      id: "cp-cp-algorithms",
      addedAt: "2026-11-12",
      stage: "CP-Algorithms",
      title: "CP-Algorithms",
      summary: "CP concepts, with topic-wise CSES, Codeforces and SPOJ problems.",
      resources: [{ label: "CP-Algorithms", url: "https://cp-algorithms.com/", kind: "website" }],
    },
    {
      id: "cp-usaco-guide",
      addedAt: "2026-11-12",
      stage: "USACO Guide",
      title: "USACO Guide",
      summary: "CP concepts and topic-wise problems for practice.",
      resources: [{ label: "USACO Guide", url: "https://usaco.guide/", kind: "website" }],
    },
  ],
  tips: ["Make sure you practise the questions rating-wise and topic-wise.", "All the best!"],
};

const web: Roadmap = {
  slug: "web",
  title: "Web development",
  kicker: "Option B",
  tagline: "If you're not into CP, you can start with web development.",
  tint: "blue",
  steps: [
    { id: "web-html", stage: "First years", title: "HTML", resources: [{ label: "HTML", url: "https://youtu.be/HcOc7P5BMi4", kind: "video" }] },
    { id: "web-css", stage: "First years", title: "CSS", resources: [{ label: "CSS", url: "https://youtu.be/ESnrn1kAD4E", kind: "video" }] },
    { id: "web-javascript", stage: "Next step", title: "JavaScript", resources: [{ label: "JavaScript playlist", url: playlist("PLu71SKxNbfoBuX3f4EOACle2y-tRC5Q37"), kind: "playlist" }] },
    { id: "web-react", stage: "Next step", title: "React.js", resources: [{ label: "React.js playlist", url: playlist("PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige"), kind: "playlist" }] },
    { id: "web-backend", stage: "Next step", title: "Backend development", resources: [{ label: "Backend development playlist", url: playlist("PL8p2I9GklV456iofeMKReMTvWLr7Ki9At"), kind: "playlist" }] },
    { id: "web-nextjs", stage: "Next step", title: "Next.js", resources: [{ label: "Next.js playlist", url: playlist("PLC3y8-rFHvwjOKd6gdf4QtV1uYNiQnruI"), kind: "playlist" }] },
  ],
  channels: ["FreeCodeCamp", "Codevolution", "Net Ninja"],
  locked: "More advanced content will be shared once you complete this.",
};

const ml: Roadmap = {
  slug: "ml",
  title: "Data science & AI/ML",
  kicker: "Option C",
  tagline: "If data science interests you, start with Python after achieving 5★.",
  tint: "orange",
  steps: [
    { id: "ml-python", title: "Python (foundations)", resources: [{ label: "Python playlist", url: playlist("PLu71SKxNbfoBsMugTFALhdLlZ5VOqCg2s"), kind: "playlist" }] },
    { id: "ml-maths", title: "Mathematics for ML", resources: [{ label: "Mathematics for ML playlist", url: playlist("PLKnIA16_RmvbYFaaeLY28cWeqV-3vADST"), kind: "playlist" }] },
    {
      id: "ml-machine-learning",
      title: "Machine learning",
      resources: [
        { label: "Basic", url: playlist("PLTDARY42LDV7WGmlzZtY-w9pemyPrKNUZ"), kind: "playlist" },
        { label: "Detailed", url: playlist("PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH"), kind: "playlist" },
        { label: "Basic implementation", url: playlist("PLeo1K3hjS3uvCeTYTeyfe0-rN5r8zn9rw"), kind: "playlist" },
      ],
    },
    { id: "ml-deep-learning", title: "Deep learning", resources: [{ label: "Deep learning playlist", url: playlist("PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn"), kind: "playlist" }] },
  ],
  locked: "This is a starter roadmap. ML is vast — after this you can explore further.",
  exploreNext: ["NLP (Natural Language Processing)", "Computer Vision", "Generative AI (GenAI)"],
  tips: ["Don't just rely on videos. Also explore articles and tutorials."],
  furtherReading: [
    { label: "Medium", url: "https://medium.com/", kind: "website" },
    { label: "DataCamp", url: "https://www.datacamp.com/", kind: "website" },
  ],
};

const devopsPlaylist = playlist("PLhN2ZHCXoZ_KSJ2BeTn4kmOwNI-zgGzho");
const devopsStage = (id: string, title: string, sessions: string): RoadmapStep => ({
  id: `devops-${id}`,
  title,
  resources: [{ label: "Complete DevOps training", url: devopsPlaylist, kind: "playlist", note: `Sessions ${sessions}` }],
});

const devops: Roadmap = {
  slug: "devops",
  title: "DevOps",
  kicker: "Option D",
  tagline: "51 sessions of complete DevOps training, from Linux to infrastructure as code.",
  tint: "violet",
  steps: [
    devopsStage("fundamentals", "DevOps fundamentals, Linux & architecture", "1–7"),
    devopsStage("git", "Git & version control", "8–12"),
    devopsStage("cicd", "Maven & Jenkins (CI/CD)", "13–20"),
    devopsStage("ansible", "Ansible (configuration management)", "21–25"),
    devopsStage("docker", "Docker & containerization", "26–32"),
    devopsStage("kubernetes", "Kubernetes & monitoring (Prometheus)", "33–38"),
    devopsStage("aws", "AWS cloud services", "39–44"),
    devopsStage("terraform", "Terraform (infrastructure as code)", "45–51"),
  ],
};

const pathway: Pathway = {
  principles: [
    "Consistency matters more than speed",
    "No domain depends on another",
    "Resources are shared time to time",
  ],
  foundation,
  branches: [cp, web, ml, devops],
};

/** All roadmap content. Async so it can later be swapped for the admin panel's API. */
export async function getPathway(): Promise<Pathway> {
  return pathway;
}
