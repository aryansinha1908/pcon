-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "organiser" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "dates" TEXT,
    "kind" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "highlight" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hall_of_fame_entries" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "kind" TEXT NOT NULL,
    "summary" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hall_of_fame_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hall_of_fame_placements" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "rank" INTEGER,
    "name" TEXT NOT NULL,
    "roll" TEXT,
    "award" TEXT,
    "team" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "hall_of_fame_placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_slug_key" ON "achievements"("slug");

-- CreateIndex
CREATE INDEX "achievements_year_idx" ON "achievements"("year");

-- CreateIndex
CREATE UNIQUE INDEX "hall_of_fame_entries_slug_key" ON "hall_of_fame_entries"("slug");

-- CreateIndex
CREATE INDEX "hall_of_fame_entries_date_idx" ON "hall_of_fame_entries"("date");

-- CreateIndex
CREATE INDEX "hall_of_fame_placements_entryId_idx" ON "hall_of_fame_placements"("entryId");

-- AddForeignKey
ALTER TABLE "hall_of_fame_placements" ADD CONSTRAINT "hall_of_fame_placements_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "hall_of_fame_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

