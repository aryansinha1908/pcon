import { notFound } from "next/navigation";
import { requirePageRole } from "@/lib/auth-guards";
import { toSiteLocal } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { updateEvent } from "../../../../_actions/events";
import { EventForm } from "../../../../_components/event-form";
import { PageHeader } from "../../../../_components/page-header";

export const metadata = { title: "Edit event" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePageRole("ADMIN");
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) notFound();

  return (
    <>
      <PageHeader eyebrow="02 / EVENTS" title="Edit event" />
      <EventForm
        action={updateEvent.bind(null, event.id)}
        submitLabel="Save changes"
        defaults={{
          title: event.title,
          description: event.description,
          location: event.location ?? "",
          posterUrl: event.posterUrl ?? "",
          registrationUrl: event.registrationUrl ?? "",
          startDate: toSiteLocal(event.startDate),
          endDate: toSiteLocal(event.endDate),
        }}
      />
    </>
  );
}
