/**
 * Hall of fame for /hall-of-fame: winners of events the club organised.
 * (Club-level achievements at external competitions live in lib/club-achievements.ts.)
 *
 * To add results, append an entry below (any order; the page sorts newest
 * first). `podium` takes up to three places; for team events, give the team
 * name as `name` and its members in `team`. `roll` is the winner's roll number
 * (e.g. "2025UGCS010"); it is shown on the page and keeps two people with the
 * same name apart. `mentions` are optional honourable mentions, with an `award`
 * for a named prize such as "Best UI/UX".
 * `link` can point to the results post or standings.
 */

export type Mention = { name: string; roll?: string; award?: string };

export type Placement = { rank: 1 | 2 | 3; name: string; roll?: string; team?: string[] };

export type Achievement = {
  slug: string;
  event: string;
  /** Day the event was held, YYYY-MM-DD. */
  date: string;
  kind: "Contest" | "Hackathon" | "Quiz" | "Other";
  summary?: string;
  link?: string;
  podium: Placement[];
  mentions?: Mention[];
};

const ACHIEVEMENTS: Achievement[] = [
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


/** Newest first. */
export const achievements = [...ACHIEVEMENTS].sort((a, b) => b.date.localeCompare(a.date));

export const yearOf = (achievement: Achievement) => Number(achievement.date.slice(0, 4));

/** "9 Mar 2024", read as a calendar day (no timezone shift). */
export function formatAchievementDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(Date.UTC(year, month - 1, day));
}

/** Everyone who has made a podium, with their finishes, most podiums first. */
export function podiumBoard(list: Achievement[] = achievements) {
  const board = new Map<string, { name: string; roll?: string; golds: number; total: number; events: string[] }>();
  for (const achievement of list) {
    for (const place of achievement.podium) {
      const people = place.team?.length ? place.team.map((name) => ({ name, roll: undefined })) : [{ name: place.name, roll: place.roll }];
      for (const person of people) {
        // Roll numbers identify people reliably; fall back to the name.
        const key = person.roll ?? person.name;
        const entry = board.get(key) ?? { name: person.name, roll: person.roll, golds: 0, total: 0, events: [] };
        entry.total += 1;
        if (place.rank === 1) entry.golds += 1;
        entry.events.push(achievement.event);
        board.set(key, entry);
      }
    }
  }
  return [...board.values()].sort((a, b) => b.total - a.total || b.golds - a.golds || a.name.localeCompare(b.name));
}
