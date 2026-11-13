import { requirePageRole } from "@/lib/auth-guards";
import { createAchievement } from "../../../_actions/achievements";
import { AchievementForm } from "../../../_components/achievement-form";
import { PageHeader } from "../../../_components/page-header";

export const metadata = { title: "Add achievement" };

export default async function NewAchievementPage() {
  await requirePageRole("ADMIN");
  return (
    <>
      <PageHeader eyebrow="06 / ACHIEVEMENTS" title="Add achievement" />
      <AchievementForm action={createAchievement} submitLabel="Create achievement" />
    </>
  );
}
