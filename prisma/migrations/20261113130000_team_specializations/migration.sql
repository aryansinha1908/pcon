-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT IF EXISTS "TeamMember_userId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "TeamMember_isActive_order_idx";

-- AlterTable
ALTER TABLE "TeamMember" DROP COLUMN IF EXISTS "position",
DROP COLUMN IF EXISTS "order",
ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "studentId" TEXT,
ADD COLUMN IF NOT EXISTS "photo" TEXT,
ADD COLUMN IF NOT EXISTS "designation" TEXT,
ADD COLUMN IF NOT EXISTS "domain" TEXT,
ADD COLUMN IF NOT EXISTS "github" TEXT,
ADD COLUMN IF NOT EXISTS "linkedin" TEXT,
ADD COLUMN IF NOT EXISTS "portfolio" TEXT,
ADD COLUMN IF NOT EXISTS "email" TEXT,
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "userId" DROP NOT NULL;

-- Remove default on name once column exists
ALTER TABLE "TeamMember" ALTER COLUMN "name" DROP DEFAULT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "MemberSpecialization" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberSpecialization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TeamMember_studentId_key" ON "TeamMember"("studentId");
CREATE INDEX IF NOT EXISTS "TeamMember_isActive_displayOrder_idx" ON "TeamMember"("isActive", "displayOrder");
CREATE INDEX IF NOT EXISTS "TeamMember_batch_idx" ON "TeamMember"("batch");
CREATE INDEX IF NOT EXISTS "TeamMember_studentId_idx" ON "TeamMember"("studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "MemberSpecialization_teamMemberId_name_key" ON "MemberSpecialization"("teamMemberId", "name");
CREATE INDEX IF NOT EXISTS "MemberSpecialization_teamMemberId_idx" ON "MemberSpecialization"("teamMemberId");

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MemberSpecialization" ADD CONSTRAINT "MemberSpecialization_teamMemberId_fkey" FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

