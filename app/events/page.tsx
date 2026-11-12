import type { Metadata } from "next";
import { ArrowIcon } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatDate } from "@/lib/format";
import { getPublicEvents } from "@/lib/events";
import { ScrollReveal } from "./scroll-reveal";
import "./events.css";

export const metadata: Metadata = {
  title: "Events — PCON",
  description: "Contests, hackathons, workshops and talks from the Programming Club of NIT Jamshedpur — what's coming up, and what we've run before.",
};

function EventCard({
  event,
  upcoming,
}: {
  event: { id: string; title: string; description: string; location: string | null; posterUrl: string | null; registrationUrl: string | null; startDate: Date; endDate: Date };
  upcoming: boolean;
}) {
  const sameDay = event.startDate.toDateString() === event.endDate.toDateString();
  return (
    <article className={"event-card" + (upcoming ? " event-card--upcoming" : "")} data-reveal>
      {event.posterUrl && (
        <div className="event-card__poster">
          {/* eslint-disable-next-line @next/next/no-img-element -- posterUrl is an
              admin-entered external URL (any https host), so next/image would need
              every host allow-listed in next.config.ts ahead of time. */}
          <img src={event.posterUrl} alt="" loading="lazy" />
        </div>
      )}
      <div className="event-card__top">
        <time dateTime={event.startDate.toISOString()}>
          {formatDate(event.startDate, true)}
          {!sameDay && <> – {formatDate(event.endDate, true)}</>}
        </time>
        {upcoming && <span className="chip chip--live">Upcoming</span>}
      </div>
      <h3>{event.title}</h3>
      <p>{event.description}</p>
      {event.location && <span className="event-card__location">{event.location}</span>}
      {event.registrationUrl && (
        <a className="text-link text-link--dark event-card__cta" href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
          Register <ArrowIcon diagonal />
        </a>
      )}
    </article>
  );
}

export default async function EventsPage() {
  const events = await getPublicEvents();
  const now = new Date();
  const upcoming = events.filter((e) => e.endDate >= now).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const past = events.filter((e) => e.endDate < now);

  return (
    <div className="site-shell" id="top">
      <ScrollReveal />
      <SiteHeader />
      <main>
        <section className="events-hero" aria-labelledby="events-title">
          <div className="events-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="eyebrow"><span className="status-dot" /> WHAT&apos;S HAPPENING AT PCON</div>
            <h1 id="events-title">Contests, builds<br /><span>and everything between.</span></h1>
            <p>Workshops, hackathons and contests, run by the club for the club. Register for what&apos;s next, or see what we&apos;ve done before.</p>
          </div>
        </section>

        <section className="section-pad events-section" id="upcoming" aria-labelledby="upcoming-title">
          <div className="shell">
            <div className="section-label"><span>01 / COMING UP</span><i /></div>
            <h2 id="upcoming-title">Upcoming events</h2>
            {upcoming.length === 0 ? (
              <div className="event-grid">
                <div className="event-card event-card--empty" data-reveal>
                  <span className="chip">Nothing scheduled</span>
                  <p>No upcoming events right now — check back soon, or follow the club to hear first.</p>
                </div>
              </div>
            ) : (
              <div className="event-grid">
                {upcoming.map((event, i) => (
                  <EventCard event={event} upcoming={i === 0} key={event.id} />
                ))}
              </div>
            )}
          </div>
        </section>

        {past.length > 0 && (
          <section className="section-pad events-section events-section--past" id="past" aria-labelledby="past-title">
            <div className="shell">
              <div className="section-label"><span>02 / WHAT WE&apos;VE RUN</span><i /></div>
              <h2 id="past-title">Past events</h2>
              <div className="event-grid">
                {past.map((event) => (
                  <EventCard event={event} upcoming={false} key={event.id} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
