import { requirePageRole } from "@/lib/auth-guards";
import { createEvent } from "../../../_actions/events";
import { EventForm } from "../../../_components/event-form";
import { PageHeader } from "../../../_components/page-header";

export const metadata = { title: "Add event" };

export default async function NewEventPage() {
  await requirePageRole("ADMIN");
  return (
    <>
      <PageHeader eyebrow="02 / EVENTS" title="Add event" />
      <EventForm action={createEvent} submitLabel="Create event" />
    </>
  );
}
