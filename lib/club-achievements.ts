/**
 * Club achievements for /achievements: how PCON members have done at
 * competitions outside the club (ICPC regionals, national hackathons).
 * Source: the seniors' club deck. Winners of PCON's own contests live in
 * lib/hall-of-fame.ts instead.
 *
 * To add one, append an entry; photos go in public/achievements/. `result`
 * is the short badge ("Winner", "Rank 54"), `tier` picks its colour.
 * Set `featured: true` on the one to spotlight at the top.
 */

export type ClubAchievement = {
  slug: string;
  title: string;
  organiser: string;
  year: number;
  /** Optional exact dates, shown when known. */
  when?: string;
  kind: "ICPC" | "Hackathon";
  result: string;
  tier: "winner" | "runner-up" | "finalist" | "rank";
  /** One-line context under the title, e.g. "1st among all NITs". */
  highlight?: string;
  image: { src: string; width: number; height: number; alt: string };
  featured?: boolean;
};

export const clubAchievements: ClubAchievement[] = [
  {
    slug: "icpc-kanpur-2025",
    title: "ICPC Asia Kanpur Regional 2025",
    organiser: "ICPC · CSJM University, Kanpur",
    year: 2025,
    when: "22–23 Dec 2025",
    kind: "ICPC",
    result: "Rank 54",
    tier: "rank",
    highlight: "1st among all NITs",
    image: { src: "/achievements/icpc-kanpur-25.jpg", width: 648, height: 845, alt: "PCON's team in front of the ICPC Kanpur Site 2025 welcome banner" },
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
    image: { src: "/achievements/jpmc-code-for-good-25.jpg", width: 432, height: 768, alt: "The winning team at JPMorgan Chase Code for Good 2025" },
  },
  {
    slug: "isro-bah-2025",
    title: "Bharatiya Antariksh Hackathon 2025",
    organiser: "ISRO",
    year: 2025,
    kind: "Hackathon",
    result: "Finalist",
    tier: "finalist",
    image: { src: "/achievements/isro-bah-25.jpg", width: 768, height: 576, alt: "PCON's finalist team outside an ISRO centre, beside a rocket model" },
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
    image: { src: "/achievements/icpc-amritapuri-25.jpg", width: 661, height: 690, alt: "PCON's team at the ICPC Amritapuri Site Regionals 2025" },
  },
  {
    slug: "adobe-gensolve-2024",
    title: "Adobe GenSolve 2024",
    organiser: "Adobe",
    year: 2024,
    kind: "Hackathon",
    result: "Winner",
    tier: "winner",
    image: { src: "/achievements/adobe-gensolve-24.jpg", width: 896, height: 465, alt: "PCON members receiving the Adobe GenSolve 2024 award on stage" },
  },
  {
    slug: "myntra-hackerramp-2024",
    title: "Myntra WeForShe HackerRamp'24",
    organiser: "Myntra",
    year: 2024,
    kind: "Hackathon",
    result: "Runner-up",
    tier: "runner-up",
    image: { src: "/achievements/myntra-hackerramp-24.jpg", width: 640, height: 480, alt: "PCON's runner-up team in front of the Myntra logo wall" },
  },
];

/** From the club deck: PCON was officially established in 2017. */
export const FOUNDED = 2017;

/** The club's stated vision, from the seniors' deck. */
export const VISION = [
  "Improve the coding and development culture in our college.",
  "Compete in programming competitions such as ACM-ICPC, SIH, GSoC and the Adobe Hackathon.",
  "Establish a healthy competitive environment within college.",
];
