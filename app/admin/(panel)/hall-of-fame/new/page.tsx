import { requirePageRole } from "@/lib/auth-guards";
import { createFameEntry } from "../../../_actions/hall-of-fame";
import { FameForm } from "../../../_components/hall-of-fame-form";
import { PageHeader } from "../../../_components/page-header";

export const metadata = { title: "Add results" };

export default async function NewFameEntryPage() {
  await requirePageRole("ADMIN");
  return (
    <>
      <PageHeader eyebrow="07 / HALL OF FAME" title="Add results" />
      <FameForm action={createFameEntry} submitLabel="Create entry" />
    </>
  );
}
