export const focusAreas = [
  { number: "01", name: "Competitive programming", description: "Sharpen your problem-solving instincts and learn to think in algorithms.", symbol: "{ }", tint: "mint", roadmap: "/roadmaps#cp" },
  { number: "02", name: "Web & app development", description: "Turn ideas into useful products, from your first interface to launch day.", symbol: "</>", tint: "blue", roadmap: "/roadmaps#web" },
  { number: "03", name: "AI & machine learning", description: "Explore intelligent systems and build with the technologies shaping tomorrow.", symbol: "✳", tint: "orange", roadmap: "/roadmaps#ml" },
  { number: "04", name: "Cloud, blockchain & more", description: "Experiment across the stack, follow your curiosity, and find your next frontier.", symbol: "⌘", tint: "violet", roadmap: "/roadmaps#devops" },
];

export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "What we do", href: "/#domains" },
  { label: "Roadmaps", href: "/roadmaps" },
  { label: "Events", href: "/#events" },
  { label: "Blogs", href: "/#blogs" },
  { label: "Community", href: "/#community" },
];

export const heroPillars = [
  { symbol: "{ }", title: "Learn", text: "Workshops, roadmaps and peer sessions." },
  { symbol: "</>", title: "Build", text: "Projects, hackathons and real products." },
  { symbol: "✳", title: "Share", text: "Blogs, talks and a culture of helping out." },
];

export type ClubEvent = { date: string; title: string; description: string; status: "upcoming" | "past" };

// Sample data: replace with real events.
export const events: ClubEvent[] = [
  { date: "Dec 06, 2026", title: "CodeQuest: Winter Contest", description: "A three-hour ICPC-style team contest open to every year. Prizes for the top teams.", status: "upcoming" },
  { date: "Nov 22, 2026", title: "Intro to Competitive Programming", description: "Your first steps into CP: complexity, STL and solving your first Codeforces round.", status: "past" },
  { date: "Oct 18, 2026", title: "Hack the Fest", description: "A 24-hour hackathon to build tools for campus life, with mentors on call all night.", status: "past" },
  { date: "Sep 27, 2026", title: "Web Dev Bootcamp", description: "Four sessions from HTML basics to shipping a full-stack app on the cloud.", status: "past" },
  { date: "Sep 06, 2026", title: "ML Study Jam", description: "Hands-on notebooks covering regression, neural nets and your first Kaggle submission.", status: "past" },
  { date: "Aug 23, 2026", title: "Freshers' Orientation", description: "Meet the club, the domains and the people. Find where you want to start.", status: "past" },
];

export type BlogPost = { tag: string; title: string; author: string };

// Sample data: replace with real posts.
export const blogPosts: BlogPost[] = [
  { tag: "Roadmap", title: "The complete competitive programming roadmap for beginners", author: "Aarav Kumar" },
  { tag: "Roadmap", title: "Web development roadmap: from zero to your first deploy", author: "Priya Singh" },
  { tag: "Roadmap", title: "Machine learning roadmap: what to learn and in what order", author: "Rohan Das" },
  { tag: "Announcement", title: "Hack the Fest is back: everything you need to know", author: "PCON Team" },
  { tag: "Experience", title: "My SDE internship interview experience, round by round", author: "Sneha Verma" },
  { tag: "Experience", title: "What I learnt from my first ICPC regional", author: "Kunal Mehta" },
];

export const socialLinks = [
  { label: "GitHub", href: "https://github.com/pcon-jsr" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/programming-club-of-nit-jamshedpur/" },
  { label: "Instagram", href: "https://www.instagram.com/pconjsr" },
];
