import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { updateAchievement } from "../../../../_actions/achievements";
import { AchievementForm } from "../../../../_components/achievement-form";
import { PageHeader } from "../../../../_components/page-header";

export const metadata = { title: "Edit achievement" };

export default async function EditAchievementPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("ADMIN");
  const { id } = await params;
  const a = await prisma.achievement.findUnique({ where: { id } });
  if (!a) notFound();

  return (
    <>
      <PageHeader eyebrow="06 / ACHIEVEMENTS" title="Edit achievement" />
      <AchievementForm
        action={updateAchievement.bind(null, a.id)}
        submitLabel="Save changes"
        defaults={{
          title: a.title,
          organiser: a.organiser,
          year: String(a.year),
          dates: a.dates ?? "",
          kind: a.kind,
          result: a.result,
          tier: a.tier,
          highlight: a.highlight ?? "",
          imageUrl: a.imageUrl ?? "",
          imageAlt: a.imageAlt ?? "",
          featured: a.featured,
        }}
      />
    </>
  );
}
