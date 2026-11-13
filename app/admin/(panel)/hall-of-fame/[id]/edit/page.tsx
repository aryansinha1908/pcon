import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { updateFameEntry } from "../../../../_actions/hall-of-fame";
import { FameForm } from "../../../../_components/hall-of-fame-form";
import { PageHeader } from "../../../../_components/page-header";

export const metadata = { title: "Edit results" };

export default async function EditFameEntryPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("ADMIN");
  const { id } = await params;
  const entry = await prisma.hallOfFameEntry.findUnique({
    where: { id },
    include: { placements: { orderBy: [{ rank: "asc" }, { order: "asc" }] } },
  });
  if (!entry) notFound();

  const place = (rank: 1 | 2 | 3) => {
    const p = entry.placements.find((x) => x.rank === rank);
    return { name: p?.name ?? "", roll: p?.roll ?? "", team: p?.team.join(", ") ?? "" };
  };
  const mentions = entry.placements
    .filter((p) => p.rank === null)
    .map((m) => [m.name, m.roll ?? "", m.award ?? ""].join(" | ").replace(/( \| )+$/, ""))
    .join("\n");

  return (
    <>
      <PageHeader eyebrow="07 / HALL OF FAME" title="Edit results" />
      <FameForm
        action={updateFameEntry.bind(null, entry.id)}
        submitLabel="Save changes"
        defaults={{
          event: entry.event,
          date: entry.date.toISOString().slice(0, 10),
          kind: entry.kind,
          summary: entry.summary ?? "",
          link: entry.link ?? "",
          places: { 1: place(1), 2: place(2), 3: place(3) },
          mentions,
        }}
      />
    </>
  );
}
