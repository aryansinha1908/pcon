import type { Metadata } from "next";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPublicEvents } from "@/lib/events";
import { baseOpenGraph } from "@/lib/site-url";
import { EventsView } from "./events-view";
import "./events.css";

// Events are live, admin-edited data — never prerender/cache this page at
// build time (that would freeze the list at whatever it was when `next
// build` ran, and also fails CI, which points DATABASE_URL at a placeholder
// that doesn't exist). Always render fresh, per request.
export const dynamic = "force-dynamic";

const description = "Contests, hackathons, workshops and talks from the Programming Club of NIT Jamshedpur — what's coming up, and what we've run before.";

export const metadata: Metadata = {
  title: "Events",
  description,
  alternates: { canonical: "/events" },
  openGraph: { ...baseOpenGraph, title: "Events · PCON", description, url: "/events" },
};

export default async function EventsPage() {
  const events = await getPublicEvents();
  return (
    <div className="site-shell" id="top">
      <ScrollReveal />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <EventsView events={events} now={new Date()} />
      </main>
      <SiteFooter />
    </div>
  );
}
