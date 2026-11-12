/**
 * Seeds the first admins/owners so nobody has to edit the database by hand.
 *
 *   SEED_ADMIN_EMAILS=you@nitjsr.ac.in            (comma-separated)
 *   SEED_OWNER_EMAILS=president@nitjsr.ac.in      (optional, comma-separated)
 *
 * Run with `npm run db:seed`. Safe to run again: it never lowers anyone's role.
 * The person then signs in with Google using the same email and the account
 * links to the seeded user automatically.
 */
import { PrismaClient, type Role } from "@prisma/client";

const prisma = new PrismaClient();
const RANK: Record<Role, number> = { MEMBER: 0, ADMIN: 1, OWNER: 2 };

function emailsFrom(name: string): string[] {
  return (process.env[name] ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

async function seed(emails: string[], role: Role) {
  for (const email of emails) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      await prisma.user.create({ data: { email, role } });
      console.log(`created ${email} as ${role}`);
    } else if (RANK[existing.role] < RANK[role]) {
      await prisma.user.update({ where: { email }, data: { role } });
      console.log(`promoted ${email} from ${existing.role} to ${role}`);
    } else {
      console.log(`${email} is already ${existing.role}, left unchanged`);
    }
  }
}

async function main() {
  const admins = emailsFrom("SEED_ADMIN_EMAILS");
  const owners = emailsFrom("SEED_OWNER_EMAILS");
  if (admins.length + owners.length === 0) {
    console.log("Nothing to seed: set SEED_ADMIN_EMAILS and/or SEED_OWNER_EMAILS in .env");
    return;
  }
  await seed(admins, "ADMIN");
  await seed(owners, "OWNER");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
