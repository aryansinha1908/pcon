import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type MemberSeedData = {
  name: string;
  studentId: string;
  batch: number;
  specializations: string[];
};

export const BATCH_2027_CURRENT_TEAM: MemberSeedData[] = [
  // Competitive Programming (13)
  { name: "Harsh Agrawal", studentId: "2023UGCS097", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Shivansh Singh", studentId: "2023UGCS059", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Om Raj", studentId: "2023UGCS022", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Apoorva Singh", studentId: "2023UGCS025", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Aprajita Thakur", studentId: "2023UGCS111", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Mihir Kumar", studentId: "2023UGCS049", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Daksh", studentId: "2023UGEC015", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Ayush", studentId: "2023UGEC049", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Nilanjan", studentId: "2023UGEE008", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Abhinav Vishen", studentId: "2023UGCS010", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Aditya Rai", studentId: "2023UGCS051", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Aditya Tiwari", studentId: "2023UGCS009", batch: 2027, specializations: ["Competitive Programmer"] },
  { name: "Asim Mabatha", studentId: "2023UGCS050", batch: 2027, specializations: ["Competitive Programmer"] },

  // Web Development (16)
  { name: "Hemanvitha Pullela", studentId: "2023UGCS001", batch: 2027, specializations: ["Web Developer"] },
  { name: "Devdutt Sahoo", studentId: "2023UGCS032", batch: 2027, specializations: ["Web Developer"] },
  { name: "Chandrima Hazra", studentId: "2023UGCS017", batch: 2027, specializations: ["Web Developer"] },
  { name: "C. Abhinav Dev", studentId: "2023UGCS099", batch: 2027, specializations: ["Web Developer"] },
  { name: "Harsha Rashmi", studentId: "2023UGCS007", batch: 2027, specializations: ["Web Developer"] },
  { name: "Mohit Patwari", studentId: "2023UGCE041", batch: 2027, specializations: ["Web Developer"] },
  { name: "Abhishek Jawanpuria", studentId: "2023UGEC020", batch: 2027, specializations: ["Web Developer"] },
  { name: "Adarsh Kumar", studentId: "2023UGMM051", batch: 2027, specializations: ["Web Developer"] },
  { name: "Chandrakant Gorain", studentId: "2023UGEE098", batch: 2027, specializations: ["Web Developer"] },
  { name: "Ayush Kumar", studentId: "2023UGCS054", batch: 2027, specializations: ["Web Developer"] },
  {
    name: "Abhishek Kumar",
    studentId: "2023UGCS048",
    batch: 2027,
    specializations: ["Web Developer", "Creative & Content Member"],
  },
  { name: "Ujjwal Kumar Singh", studentId: "2023UGCS030", batch: 2027, specializations: ["Web Developer"] },
  { name: "Priya Raj", studentId: "2023UGCS018", batch: 2027, specializations: ["Web Developer"] },
  { name: "Srijan Swapnil", studentId: "2023UGCS020", batch: 2027, specializations: ["Web Developer"] },
  { name: "Shruti Kumari", studentId: "2023UGCS109", batch: 2027, specializations: ["Web Developer"] },
  { name: "Sparsh Gupta", studentId: "2023UGCS071", batch: 2027, specializations: ["Web Developer"] },

  // Machine Learning (7)
  { name: "Keshav Trivedi", studentId: "2023UGCS080", batch: 2027, specializations: ["Machine Learning Developer"] },
  { name: "Shivagya Sharma", studentId: "2023UGCS035", batch: 2027, specializations: ["Machine Learning Developer"] },
  { name: "Sujal Kumar", studentId: "2023UGCS076", batch: 2027, specializations: ["Machine Learning Developer"] },
  { name: "Ayush Jayaswal", studentId: "2023UGCS092", batch: 2027, specializations: ["Machine Learning Developer"] },
  { name: "Akash Jaiswal", studentId: "2023UGCS055", batch: 2027, specializations: ["Machine Learning Developer"] },
  { name: "Aditya Aryan", studentId: "2023UGEC066", batch: 2027, specializations: ["Machine Learning Developer"] },
  { name: "Aniket Tripathi", studentId: "2023UGEC007", batch: 2027, specializations: ["Machine Learning Developer"] },

  // Android Development (3)
  { name: "Anshu Raj", studentId: "2023UGME058", batch: 2027, specializations: ["Android Developer"] },
  { name: "Ekanagh Sah", studentId: "2023UGPI017", batch: 2027, specializations: ["Android Developer"] },
  { name: "Aayush Kumar", studentId: "2023UGCS086", batch: 2027, specializations: ["Android Developer"] },

  // Creative and Content (2 total assignments, Abhishek Kumar already included above)
  { name: "Roshni Kumari", studentId: "2023UGCS113", batch: 2027, specializations: ["Creative & Content Member"] },
];

export const BATCH_2026_INDUCTEES: MemberSeedData[] = [
  // Competitive Programming (13)
  { name: "Tarun Kumar", studentId: "2022UGCS118", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Arka Chakraborty", studentId: "2022UGCS003", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Hitanshu Gavri", studentId: "2022UGCS093", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Sujal Kumar", studentId: "2022UGEE044", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Ebison Sojan", studentId: "2022UGEE058", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Utkarsh Prakash", studentId: "2022UGEC108", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Sachin Kumar", studentId: "2022UGCS005", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Rounak Kumar", studentId: "2022UGEE085", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Praveen Kumar Pandey", studentId: "2022UGCS095", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Reshab Prasad", studentId: "2022UGEE100", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Prashant Kumar", studentId: "2022UGEC068", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Md Faizan Alam", studentId: "2022UGCS045", batch: 2026, specializations: ["Competitive Programmer"] },
  { name: "Arnab Tripathy", studentId: "2022UGEE034", batch: 2026, specializations: ["Competitive Programmer"] },

  // Web Development (15)
  { name: "Aayush Kumar", studentId: "2022UGCS008", batch: 2026, specializations: ["Web Developer"] },
  { name: "Abhijeet Kumar", studentId: "2022UGCS112", batch: 2026, specializations: ["Web Developer"] },
  { name: "Unnati Chaurasia", studentId: "2022UGEC116", batch: 2026, specializations: ["Web Developer"] },
  { name: "Hrishant Maheshwari", studentId: "2022UGCM002", batch: 2026, specializations: ["Web Developer"] },
  { name: "Ayush Kumar", studentId: "2022UGCS010", batch: 2026, specializations: ["Web Developer"] },
  { name: "Harshit Raj", studentId: "2022UGCE045", batch: 2026, specializations: ["Web Developer"] },
  { name: "Varsha Deogharia", studentId: "2022UGCS055", batch: 2026, specializations: ["Web Developer"] },
  { name: "Sumani Kumari", studentId: "2022UGPI002", batch: 2026, specializations: ["Web Developer"] },
  { name: "Himanshu Kumar Pathak", studentId: "2022UGCS018", batch: 2026, specializations: ["Web Developer"] },
  { name: "Harshit Shrivastav", studentId: "2022UGCS097", batch: 2026, specializations: ["Web Developer"] },
  { name: "Mayank Raj", studentId: "2022UGCS042", batch: 2026, specializations: ["Web Developer"] },
  { name: "Aditya Vikram Singh", studentId: "2022UGEE012", batch: 2026, specializations: ["Web Developer"] },
  { name: "Somesh Dwivedi", studentId: "2022UGCS006", batch: 2026, specializations: ["Web Developer"] },
  { name: "Priya Kumari", studentId: "2022UGCE022", batch: 2026, specializations: ["Web Developer"] },
  { name: "Prem Raj", studentId: "2022UGEE073", batch: 2026, specializations: ["Web Developer"] },

  // Android Development (4)
  { name: "Adarsh Singh", studentId: "2022UGCS012", batch: 2026, specializations: ["Android Developer"] },
  { name: "Pankaj Kumar Gupta", studentId: "2022UGCE075", batch: 2026, specializations: ["Android Developer"] },
  { name: "Sahil Kumar Das", studentId: "2022UGCS004", batch: 2026, specializations: ["Android Developer"] },
  { name: "Vikash Kumar", studentId: "2022UGPI010", batch: 2026, specializations: ["Android Developer"] },

  // Machine Learning (4)
  { name: "Pratap Kumar", studentId: "2022UGCS076", batch: 2026, specializations: ["Machine Learning Developer"] },
  { name: "Abdur Rahman", studentId: "2022UGPI007", batch: 2026, specializations: ["Machine Learning Developer"] },
  { name: "Mitul Patel", studentId: "2022UGCS033", batch: 2026, specializations: ["Machine Learning Developer"] },
  { name: "Pooja Kumari", studentId: "2022UGCS108", batch: 2026, specializations: ["Machine Learning Developer"] },
];

export const BATCH_2025_INDUCTEES: MemberSeedData[] = [
  // Competitive Programming (14)
  { name: "Krish Kumar", studentId: "2021UGCS002", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Mayur Kumar", studentId: "2021UGCS065", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Pushkar Anmol", studentId: "2021UGCS052", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Mohit Kumar Agarwal", studentId: "2021UGCS029", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Sampada Suman", studentId: "2021UGCS122", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Aditya Narayan Singh", studentId: "2021UGEE001", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Yash Garg", studentId: "2021UGCS048", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Akshay Kumar", studentId: "2021UGMM084", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Shivansh Kumar Dubey", studentId: "2021UGCS001", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Pankaj", studentId: "2021PGCAC038", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Palak Thakur", studentId: "2021UGCS100", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Kumar Shivam", studentId: "2021UGCS072", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Anuj Anand", studentId: "2021UGEE003", batch: 2025, specializations: ["Competitive Programmer"] },
  { name: "Joywin Pinto", studentId: "2021UGCS104", batch: 2025, specializations: ["Competitive Programmer"] },

  // Web Development (13)
  { name: "Gautam Kiran", studentId: "2021UGCS086", batch: 2025, specializations: ["Web Developer"] },
  { name: "Prabhat Kumar", studentId: "2021UGCS031", batch: 2025, specializations: ["Web Developer"] },
  { name: "Divya Rani", studentId: "2021UGCS049", batch: 2025, specializations: ["Web Developer"] },
  { name: "Abhi Kumar", studentId: "2021UGCS042", batch: 2025, specializations: ["Web Developer"] },
  { name: "Harsh Raj", studentId: "2021UGCS028", batch: 2025, specializations: ["Web Developer"] },
  { name: "Ritwik Singh", studentId: "2021UGCS047", batch: 2025, specializations: ["Web Developer"] },
  { name: "Aashika Prakash", studentId: "2021UGCS110", batch: 2025, specializations: ["Web Developer"] },
  { name: "Tanushree Ghosh", studentId: "2021UGCS036", batch: 2025, specializations: ["Web Developer"] },
  { name: "Raj Sharma", studentId: "2021UGCS073", batch: 2025, specializations: ["Web Developer"] },
  { name: "Adarsh Tiwari", studentId: "2021UGEE021", batch: 2025, specializations: ["Web Developer"] },
  { name: "Arvindh Iyer", studentId: "2021UGCS013", batch: 2025, specializations: ["Web Developer"] },
  { name: "Akash Kumar", studentId: "2021UGCS040", batch: 2025, specializations: ["Web Developer"] },
  { name: "Shubham Kumar Singh", studentId: "2021UGPI003", batch: 2025, specializations: ["Web Developer"] },

  // App Development (1)
  { name: "Akash Ranjan", studentId: "2021UGEE063", batch: 2025, specializations: ["App Developer"] },

  // Machine Learning (2)
  { name: "Anurag Sarkar", studentId: "2021UGEC049", batch: 2025, specializations: ["Machine Learning Developer"] },
  { name: "Shyam Sundar", studentId: "2021PGCACA043", batch: 2025, specializations: ["Machine Learning Developer"] },
];

function toSocialSlug(name: string, studentId: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${studentId.toLowerCase()}`;
}

async function upsertBatchDataset(label: string, dataset: MemberSeedData[]) {
  console.log(`\nProcessing ${label} (${dataset.length} members)...`);
  let order = 1;

  for (const item of dataset) {
    const primaryDesignation = item.specializations.join(" & ");
    const slug = toSocialSlug(item.name, item.studentId);
    const defaultGithub = `https://github.com/${slug}`;
    const defaultLinkedin = `https://www.linkedin.com/in/${slug}`;

    // Identify record by unique studentId
    let member = await prisma.teamMember.findUnique({
      where: { studentId: item.studentId },
    });

    if (!member) {
      member = await prisma.teamMember.create({
        data: {
          name: item.name,
          studentId: item.studentId,
          batch: item.batch,
          designation: primaryDesignation,
          domain: item.specializations[0],
          github: defaultGithub,
          linkedin: defaultLinkedin,
          displayOrder: order,
          isActive: true,
        },
      });
      console.log(`  [Created] ${item.name} (${item.studentId}) -> Batch ${item.batch}`);
    } else {
      // Update batch and name by studentId, and seed github/linkedin if not already set
      member = await prisma.teamMember.update({
        where: { id: member.id },
        data: {
          name: item.name,
          batch: item.batch,
          designation: member.designation || primaryDesignation,
          domain: member.domain || item.specializations[0],
          github: member.github || defaultGithub,
          linkedin: member.linkedin || defaultLinkedin,
        },
      });
      console.log(`  [Updated] ${item.name} (${item.studentId}) -> Batch ${item.batch}`);
    }

    // Seed specializations idempotently
    for (const specName of item.specializations) {
      await prisma.memberSpecialization.upsert({
        where: {
          teamMemberId_name: {
            teamMemberId: member.id,
            name: specName,
          },
        },
        update: {},
        create: {
          teamMemberId: member.id,
          name: specName,
        },
      });
    }

    order++;
  }
}

export async function seedTeamMembers() {
  // 1. First update the 40-member dataset (2023UG...) to Batch 2027 using studentId
  await upsertBatchDataset("Current Team — Batch 2027", BATCH_2027_CURRENT_TEAM);

  // 2. Seed P-CON Inductees — Batch 2026 (36 members)
  await upsertBatchDataset("P-CON Inductees — Batch 2026", BATCH_2026_INDUCTEES);

  // 3. Seed P-CON Inductees — Batch 2025 (30 members)
  await upsertBatchDataset("P-CON Inductees — Batch 2025", BATCH_2025_INDUCTEES);

  const count2027 = await prisma.teamMember.count({ where: { batch: 2027 } });
  const count2026 = await prisma.teamMember.count({ where: { batch: 2026 } });
  const count2025 = await prisma.teamMember.count({ where: { batch: 2025 } });
  const specCount = await prisma.memberSpecialization.count();

  console.log(`\n========================================`);
  console.log(`Seed Summary:`);
  console.log(`- Batch 2027 (Current Team): ${count2027} members (Expected: 40)`);
  console.log(`- Batch 2026 (Inductees):    ${count2026} members (Expected: 36)`);
  console.log(`- Batch 2025 (Inductees):    ${count2025} members (Expected: 30)`);
  console.log(`- Total Specializations:     ${specCount} assignments (Expected: 107)`);
  console.log(`========================================`);
}

async function main() {
  await seedTeamMembers();
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error("Error seeding team members:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
