/**
 * Centralized Team Page data configuration.
 *
 * Replace the dummy member entries below with actual PCON team details.
 * Components (`TeamSection` and `TeamMemberCard`) read exclusively from this file.
 */

export type DepartmentTint = "mint" | "blue" | "orange" | "violet";

export const TEAM_BATCHES = [2026, 2027, 2028, 2029] as const;
export type TeamBatch = (typeof TEAM_BATCHES)[number];

export const TEAM_HERO_BANNER =
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&h=820&q=80";

export type TeamMember = {
  id: string;
  name: string;
  designation: string;
  department: string;
  batch: TeamBatch;
  image: string;
  github: string;
  linkedin: string;
  portfolio?: string;
};

export type TeamDepartment = {
  slug: string;
  index: string;
  name: string;
  tint: DepartmentTint;
  members: TeamMember[];
};

export const teamDepartments: TeamDepartment[] = [
  {
    slug: "app-development",
    index: "01",
    name: "App Development",
    tint: "mint",
    members: [
      {
        id: "app-dev-1",
        name: "Aarav Sharma",
        designation: "App Development Lead",
        department: "App Development",
        batch: 2026,
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-aarav-sharma",
        linkedin: "https://www.linkedin.com/in/placeholder-aarav-sharma",
        portfolio: "https://example.com/aarav-sharma",
      },
      {
        id: "app-dev-2",
        name: "Diya Nair",
        designation: "Senior Mobile Engineer",
        department: "App Development",
        batch: 2027,
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-diya-nair",
        linkedin: "https://www.linkedin.com/in/placeholder-diya-nair",
        portfolio: "https://example.com/diya-nair",
      },
      {
        id: "app-dev-3",
        name: "Kabir Verma",
        designation: "Flutter & Native Coordinator",
        department: "App Development",
        batch: 2028,
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-kabir-verma",
        linkedin: "https://www.linkedin.com/in/placeholder-kabir-verma",
      },
      {
        id: "app-dev-4",
        name: "Ananya Iyer",
        designation: "Android Systems Member",
        department: "App Development",
        batch: 2029,
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-ananya-iyer",
        linkedin: "https://www.linkedin.com/in/placeholder-ananya-iyer",
        portfolio: "https://example.com/ananya-iyer",
      },
    ],
  },
  {
    slug: "machine-learning",
    index: "02",
    name: "Machine Learning",
    tint: "orange",
    members: [
      {
        id: "ml-1",
        name: "Rohan Deshmukh",
        designation: "Machine Learning Lead",
        department: "Machine Learning",
        batch: 2026,
        image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-rohan-deshmukh",
        linkedin: "https://www.linkedin.com/in/placeholder-rohan-deshmukh",
        portfolio: "https://example.com/rohan-deshmukh",
      },
      {
        id: "ml-2",
        name: "Meera Krishnan",
        designation: "Deep Learning Coordinator",
        department: "Machine Learning",
        batch: 2027,
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-meera-krishnan",
        linkedin: "https://www.linkedin.com/in/placeholder-meera-krishnan",
      },
      {
        id: "ml-3",
        name: "Siddharth Joshi",
        designation: "NLP & GenAI Researcher",
        department: "Machine Learning",
        batch: 2028,
        image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-siddharth-joshi",
        linkedin: "https://www.linkedin.com/in/placeholder-siddharth-joshi",
        portfolio: "https://example.com/siddharth-joshi",
      },
      {
        id: "ml-4",
        name: "Tanvi Kulkarni",
        designation: "Computer Vision Member",
        department: "Machine Learning",
        batch: 2029,
        image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-tanvi-kulkarni",
        linkedin: "https://www.linkedin.com/in/placeholder-tanvi-kulkarni",
      },
    ],
  },
  {
    slug: "web-development",
    index: "03",
    name: "Web Development",
    tint: "blue",
    members: [
      {
        id: "web-dev-1",
        name: "Vikramaditya Rao",
        designation: "Web Development Lead",
        department: "Web Development",
        batch: 2026,
        image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-vikramaditya-rao",
        linkedin: "https://www.linkedin.com/in/placeholder-vikramaditya-rao",
        portfolio: "https://example.com/vikramaditya-rao",
      },
      {
        id: "web-dev-2",
        name: "Neha Chatterjee",
        designation: "Full-Stack Coordinator",
        department: "Web Development",
        batch: 2027,
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-neha-chatterjee",
        linkedin: "https://www.linkedin.com/in/placeholder-neha-chatterjee",
        portfolio: "https://example.com/neha-chatterjee",
      },
      {
        id: "web-dev-3",
        name: "Arjun Malhotra",
        designation: "Frontend Systems Architect",
        department: "Web Development",
        batch: 2028,
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-arjun-malhotra",
        linkedin: "https://www.linkedin.com/in/placeholder-arjun-malhotra",
        portfolio: "https://example.com/arjun-malhotra",
      },
      {
        id: "web-dev-4",
        name: "Ishita Sengupta",
        designation: "Backend & Cloud Engineer",
        department: "Web Development",
        batch: 2029,
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-ishita-sengupta",
        linkedin: "https://www.linkedin.com/in/placeholder-ishita-sengupta",
      },
    ],
  },
  {
    slug: "programming",
    index: "04",
    name: "Programming",
    tint: "violet",
    members: [
      {
        id: "prog-1",
        name: "Kunal Mehta",
        designation: "Competitive Programming Lead",
        department: "Programming",
        batch: 2026,
        image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-kunal-mehta",
        linkedin: "https://www.linkedin.com/in/placeholder-kunal-mehta",
        portfolio: "https://example.com/kunal-mehta",
      },
      {
        id: "prog-2",
        name: "Riya Agarwal",
        designation: "Algorithms & ICPC Coordinator",
        department: "Programming",
        batch: 2027,
        image: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-riya-agarwal",
        linkedin: "https://www.linkedin.com/in/placeholder-riya-agarwal",
      },
      {
        id: "prog-3",
        name: "Devansh Tiwari",
        designation: "Problem Setting Lead",
        department: "Programming",
        batch: 2028,
        image: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-devansh-tiwari",
        linkedin: "https://www.linkedin.com/in/placeholder-devansh-tiwari",
        portfolio: "https://example.com/devansh-tiwari",
      },
      {
        id: "prog-4",
        name: "Sneha Bansal",
        designation: "DSA Mentor & Coordinator",
        department: "Programming",
        batch: 2029,
        image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=640&h=800&q=80",
        github: "https://github.com/placeholder-sneha-bansal",
        linkedin: "https://www.linkedin.com/in/placeholder-sneha-bansal",
        portfolio: "https://example.com/sneha-bansal",
      },
    ],
  },
];

export const teamMembers: TeamMember[] = teamDepartments.flatMap(
  (department) => department.members
);
