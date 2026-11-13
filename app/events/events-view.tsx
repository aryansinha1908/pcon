import Link from "next/link";
import { AddToCalendar, type CalendarEvent } from "@/components/add-to-calendar";
import { ArrowIcon } from "@/components/brand";
import { Countdown } from "@/components/countdown";
import { dateParts, formatEventRange } from "@/lib/event-dates";
import { socialLinks } from "@/lib/site-data";

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  posterUrl: string | null;
  registrationUrl: string | null;
  startDate: Date;
  endDate: Date;
};

const toCalendar = (event: EventRecord): CalendarEvent => ({
  id: event.id,
  title: event.title,
  description: event.description,
  location: event.location,
  registrationUrl: event.registrationUrl,
  start: event.startDate.toISOString(),
  end: event.endDate.toISOString(),
});

/** "CodeQuest: Winter Contest" → "CW", for covers of events without a poster. */
function initials(title: string) {
  const words = title.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "PC").slice(0, 2)).toUpperCase();
}

function Poster({ event, className }: { event: EventRecord; className: string }) {
  return (
    <div className={className}>
      {event.posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- posterUrl is an admin-entered external URL (any https host), so next/image would need every host allow-listed in next.config.ts ahead of time.
        <img src={event.posterUrl} alt="" loading="lazy" />
      ) : (
        <div className="event-cover" aria-hidden="true">
          <span className="event-cover__tag">&lt;{initials(event.title)}<i>/&gt;</i></span>
        </div>
      )}
    </div>
  );
}

function Register({ url }: { url: string | null }) {
  if (!url) return null;
  return (
    <a className="button button--primary" href={url} target="_blank" rel="noopener noreferrer">
      Register <ArrowIcon diagonal />
    </a>
  );
}

function Spotlight({ event, live, now }: { event: EventRecord; live: boolean; now: Date }) {
  return (
    <article className="spotlight" data-live={live} data-reveal>
      <Poster event={event} className="spotlight__media" />
      <div className="spotlight__body">
        <span className={"chip" + (live ? " chip--live spotlight__live" : "")}>{live ? "Live now" : "Next up"}</span>
        <h3>{event.title}</h3>
        <ul className="event-meta">
          <li><span aria-hidden="true">◷</span> <time dateTime={event.startDate.toISOString()}>{formatEventRange(event.startDate, event.endDate)}</time></li>
          {event.location && <li><span aria-hidden="true">◎</span> {event.location}</li>}
        </ul>
        <p className="spotlight__text">{event.description}</p>
        <Countdown
          to={(live ? event.endDate : event.startDate).toISOString()}
          serverNow={now.getTime()}
          label={live ? "ends in" : "starts in"}
          doneLabel={live ? "that's a wrap" : "starting now"}
        />
        <div className="spotlight__actions">
          <Register url={event.registrationUrl} />
          <AddToCalendar event={toCalendar(event)} />
        </div>
      </div>
    </article>
  );
}

function NothingScheduled() {
  const follow = socialLinks.filter((link) => link.label !== "GitHub");
  return (
    <div className="terminal events-empty" data-reveal>
      <div className="terminal__bar" aria-hidden="true"><i /><i /><i /><span>pcon — events</span></div>
      <div className="terminal__body">
        <div><span className="terminal__prompt">$</span> pcon events --next</div>
        <div className="terminal__dim">no events scheduled yet <span className="terminal__caret" aria-hidden="true" /></div>
        <div className="events-empty__hint">
          Something is always in the works. Follow the club to hear first:{" "}
          {follow.map((link, i) => (
            <span key={link.href}>
              {i > 0 && " · "}
              <a href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Ticket({ event }: { event: EventRecord }) {
  const when = dateParts(event.startDate);
  return (
    // The reveal wrapper keeps the reveal's transition off the ticket's own hover lift.
    <div data-reveal>
    <article className="ticket">
      <div className="ticket__stub">
        <span className="ticket__weekday">{when.weekday}</span>
        <strong>{when.day}</strong>
        <span className="ticket__month">{when.month} {when.year}</span>
      </div>
      <div className="ticket__body">
        <h3>{event.title}</h3>
        <ul className="event-meta">
          <li><span aria-hidden="true">◷</span> <time dateTime={event.startDate.toISOString()}>{formatEventRange(event.startDate, event.endDate)}</time></li>
          {event.location && <li><span aria-hidden="true">◎</span> {event.location}</li>}
        </ul>
        <p>{event.description}</p>
        <div className="ticket__actions">
          {event.registrationUrl && (
            <a className="text-link text-link--dark" href={event.registrationUrl} target="_blank" rel="noopener noreferrer">
              Register <ArrowIcon diagonal />
            </a>
          )}
          <AddToCalendar event={toCalendar(event)} compact />
        </div>
      </div>
    </article>
    </div>
  );
}

function PastTimeline({ events }: { events: EventRecord[] }) {
  const years = new Map<number, EventRecord[]>();
  for (const event of events) {
    const year = dateParts(event.startDate).year;
    years.set(year, [...(years.get(year) ?? []), event]);
  }
  return (
    <div className="past">
      {[...years].map(([year, list]) => (
        <section className="past-year" key={year} aria-label={String(year)}>
          <div className="past-year__label" aria-hidden="true">
            <strong>{year}</strong>
            <span>{list.length} event{list.length === 1 ? "" : "s"}</span>
          </div>
          <ol className="past-year__list">
            {list.map((event) => {
              const when = dateParts(event.startDate);
              return (
                <li className="past-event" key={event.id} data-reveal>
                  <span className="past-event__node" aria-hidden="true" />
                  <div className="past-event__card">
                    <div className="past-event__text">
                      <time dateTime={event.startDate.toISOString()}>{when.day} {when.month} {when.year}</time>
                      <h3>{event.title}</h3>
                      <p>{event.description}</p>
                      {event.location && <span className="past-event__where"><span aria-hidden="true">◎</span> {event.location}</span>}
                    </div>
                    {event.posterUrl && <Poster event={event} className="past-event__thumb" />}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

/** The /events page body. Pure: give it the public events and the current time. */
export function EventsView({ events, now }: { events: EventRecord[]; now: Date }) {
  const live = events.filter((e) => e.startDate <= now && e.endDate >= now).sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
  const upcoming = events.filter((e) => e.startDate > now).sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const past = events.filter((e) => e.endDate < now).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const spotlight = live[0] ?? upcoming[0];
  const rest = [...live, ...upcoming].filter((e) => e !== spotlight);
  const since = events.length ? Math.min(...events.map((e) => dateParts(e.startDate).year)) : null;
  const scheduled = live.length + upcoming.length;

  return (
    <>
      <section className="events-hero" aria-labelledby="events-title">
        <div className="events-hero__backdrop" aria-hidden="true" />
        <div className="shell">
          <div className="eyebrow"><span className="status-dot" /> WHAT&apos;S HAPPENING AT PCON</div>
          <h1 id="events-title">Contests, builds<br /><span>and everything between.</span></h1>
          <p>Workshops, hackathons and contests, run by the club for the club. Register for what&apos;s next, or see what we&apos;ve done before.</p>
          {events.length > 0 && (
          <div className="events-hero__term">
            <span className="terminal__prompt" aria-hidden="true">$</span> pcon events --list
            <ul className="events-hero__stats">
              <li><strong>{scheduled}</strong> {live.length ? "live / upcoming" : "upcoming"}</li>
              <li><strong>{past.length}</strong> run so far</li>
              {since && <li>since <strong>{since}</strong></li>}
            </ul>
          </div>
          )}
        </div>
      </section>

      <section className="section-pad events-section" id="next" aria-labelledby="next-title">
        <div className="shell">
          <div className="section-label"><span>01 / {live.length ? "HAPPENING NOW" : "COMING UP"}</span><i /></div>
          <h2 id="next-title">{live.length ? <>Happening <span>right now.</span></> : <>Next <span>on the calendar.</span></>}</h2>
          {spotlight ? <Spotlight event={spotlight} live={live.includes(spotlight)} now={now} /> : <NothingScheduled />}

          {rest.length > 0 && (
            <div className="tickets" id="upcoming">
              <h3 className="tickets__title">Also on the calendar</h3>
              {rest.map((event) => <Ticket event={event} key={event.id} />)}
            </div>
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="section-pad events-section events-section--past" id="past" aria-labelledby="past-title">
          <div className="shell">
            <div className="section-label"><span>02 / WHAT WE&apos;VE RUN</span><i /></div>
            <h2 id="past-title">Past <span>events.</span></h2>
            <PastTimeline events={past} />
          </div>
        </section>
      )}

      <section className="events-band">
        <div className="shell events-band__inner" data-reveal>
          <p><span className="terminal__prompt" aria-hidden="true">$</span> cat hall-of-fame.txt</p>
          <h2>Who took home <span>the trophies?</span></h2>
          <Link className="button button--outline" href="/hall-of-fame">See the winners <ArrowIcon /></Link>
        </div>
      </section>
    </>
  );
}
