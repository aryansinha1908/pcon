import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/brand";
import { PodiumReveal } from "@/components/podium-reveal";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatAchievementDate, getHallOfFame, podiumBoard, yearOf, type FameEntry, type Mention, type Placement } from "@/lib/hall-of-fame";
import { baseOpenGraph } from "@/lib/site-url";
import "./hall-of-fame.css";

const description = "The PCON hall of fame: winners and top finishers from contests, hackathons and other events run by the Programming Club of NIT Jamshedpur.";

// Entries are edited in the admin panel: render per request (and never query
// the database at build time, where CI has no real database).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hall of Fame",
  description,
  alternates: { canonical: "/hall-of-fame" },
  openGraph: { ...baseOpenGraph, title: "Hall of Fame · PCON", description, url: "/hall-of-fame" },
};

const RANK_LABEL = { 1: "1st", 2: "2nd", 3: "3rd" } as const;
const RANK_WORD = { 1: "First place", 2: "Second place", 3: "Third place" } as const;

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

function Crown() {
  return (
    <svg className="podium__crown" viewBox="0 0 48 32" aria-hidden="true">
      <path d="M4 10l10 9 10-16 10 16 10-9-4 20H8L4 10z" fill="currentColor" />
      <circle cx="4" cy="9" r="3" fill="currentColor" />
      <circle cx="24" cy="3" r="3" fill="currentColor" />
      <circle cx="44" cy="9" r="3" fill="currentColor" />
    </svg>
  );
}

function PodiumPlace({ place }: { place: Placement }) {
  return (
    <div className={`podium__place podium__place--${place.rank}`} role="listitem">
      <div className="podium__person">
        {place.rank === 1 && <Crown />}
        <span className="podium__avatar" aria-hidden="true">{initials(place.name)}</span>
        <strong>{place.name}</strong>
        {place.roll && <span className="roll">{place.roll}</span>}
        {place.team?.length ? <small>{place.team.join(" · ")}</small> : null}
        <span className="sr-only">{RANK_WORD[place.rank]}</span>
      </div>
      <div className="podium__step" aria-hidden="true">
        <span className="podium__rank">{place.rank}</span>
        <small>{RANK_LABEL[place.rank]}</small>
      </div>
    </div>
  );
}

function Mentions({ names }: { names?: Mention[] }) {
  if (!names?.length) return null;
  return (
    <div className="fame-mentions">
      <span>Special mentions</span>
      <ul>
        {names.map((mention) => (
          <li key={mention.roll ?? mention.name}>
            {mention.name}
            {mention.roll && <span className="roll">{mention.roll}</span>}
            {mention.award && <small>{mention.award}</small>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Plaque({ achievement }: { achievement: FameEntry }) {
  const podium = [...achievement.podium].sort((a, b) => a.rank - b.rank);
  return (
    <div data-reveal>
      <article className="plaque" id={achievement.slug}>
        <header className="plaque__head">
          <span className="chip">{achievement.kind}</span>
          <time dateTime={achievement.date}>{formatAchievementDate(achievement.date)}</time>
        </header>
        <h3>{achievement.event}</h3>
        <ol className="plaque__rows">
          {podium.map((place) => (
            <li key={place.rank} className={`plaque__row plaque__row--${place.rank}`}>
              <span className="plaque__medal" aria-hidden="true">{place.rank}</span>
              <span className="sr-only">{RANK_WORD[place.rank]}: </span>
              <span className="plaque__name">
                <span>{place.name}{place.roll && <span className="roll">{place.roll}</span>}</span>
                {place.team?.length ? <small>{place.team.join(" · ")}</small> : null}
              </span>
            </li>
          ))}
        </ol>
        {achievement.mentions?.length ? <p className="plaque__mentions"><span className="plaque__label">Special mentions:</span> {achievement.mentions.map((m, i) => (
              <span key={m.roll ?? m.name}>
                {i > 0 && ", "}
                {m.name}
                {m.roll && <span className="roll">{m.roll}</span>}
                {m.award && ` (${m.award})`}
              </span>
            ))}</p> : null}
        {achievement.link && (
          <a className="text-link text-link--dark plaque__link" href={achievement.link} target="_blank" rel="noopener noreferrer">
            Full results <ArrowIcon diagonal />
          </a>
        )}
      </article>
    </div>
  );
}

export default async function HallOfFamePage() {
  const achievements = await getHallOfFame();
  const latest = achievements[0];
  const board = podiumBoard(achievements);
  const repeatWinners = board.filter((entry) => entry.total >= 2);
  const finishes = achievements.reduce((sum, a) => sum + a.podium.length, 0);
  const years = [...new Set(achievements.map(yearOf))];

  return (
    <div className="site-shell" id="top">
      <ScrollReveal />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="fame-hero" aria-labelledby="fame-title">
          <div className="fame-hero__beams" aria-hidden="true"><i /><i /></div>
          <div className="shell">
            <div className="eyebrow fame-hero__eyebrow"><span className="status-dot" /> PCON · HALL OF FAME</div>
            <h1 id="fame-title">Hall of <span>Fame.</span></h1>
            <p>Every contest, hackathon and challenge the club runs ends with someone on top. These are the people who got there.</p>
            {achievements.length > 0 && (
              <dl className="fame-stats">
                <div><dt>Events</dt><dd>{achievements.length}</dd></div>
                <div><dt>Podium finishes</dt><dd>{finishes}</dd></div>
                <div><dt>Winners</dt><dd>{board.length}</dd></div>
              </dl>
            )}
          </div>
        </section>

        {latest ? (
          <section className="section-pad fame-latest" aria-labelledby="latest-title">
            <div className="shell">
              <div className="section-label"><span>01 / LATEST CHAMPIONS</span><i /></div>
              <h2 id="latest-title">{latest.event}</h2>
              <p className="fame-latest__meta">
                <span className="chip">{latest.kind}</span>
                <time dateTime={latest.date}>{formatAchievementDate(latest.date)}</time>
              </p>
              {latest.summary && <p className="fame-latest__summary">{latest.summary}</p>}
              <PodiumReveal label={`${latest.event} podium`}>
                {[...latest.podium].sort((a, b) => a.rank - b.rank).map((place) => <PodiumPlace place={place} key={place.rank} />)}
              </PodiumReveal>
              <Mentions names={latest.mentions} />
            </div>
          </section>
        ) : (
          <section className="section-pad fame-latest">
            <div className="shell">
              <div className="terminal fame-empty">
                <div className="terminal__bar" aria-hidden="true"><i /><i /><i /><span>pcon — trophy-case</span></div>
                <div className="terminal__body">
                  <div><span className="terminal__prompt">$</span> ls trophy-case/</div>
                  <div className="terminal__dim">empty, for now. the first names go up after the next contest <span className="terminal__caret" aria-hidden="true" /></div>
                </div>
              </div>
            </div>
          </section>
        )}

        {achievements.length > 0 && (
          <section className="section-pad fame-wall" aria-labelledby="wall-title">
            <div className="shell">
              <div className="section-label"><span>02 / WALL OF FAME</span><i /></div>
              <h2 id="wall-title">Every <span>podium.</span></h2>
              {years.map((year) => (
                <div className="fame-year" key={year}>
                  <h3 className="fame-year__label"><span>{year}</span><i aria-hidden="true" /></h3>
                  <div className="plaques">
                    {achievements.filter((a) => yearOf(a) === year).map((a) => <Plaque achievement={a} key={a.id} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {repeatWinners.length > 0 && (
          <section className="section-pad fame-board" aria-labelledby="board-title">
            <div className="shell">
              <div className="section-label"><span>03 / REPEAT WINNERS</span><i /></div>
              <h2 id="board-title">Most <span>podiums.</span></h2>
              <ol className="board">
                {repeatWinners.map((entry, i) => (
                  <li key={entry.roll ?? entry.name} data-reveal>
                    <span className="board__pos">{String(i + 1).padStart(2, "0")}</span>
                    <span className="board__name"><span>{entry.name}{entry.roll && <span className="roll">{entry.roll}</span>}</span><small>{entry.events.join(" · ")}</small></span>
                    <span className="board__count"><strong>{entry.total}</strong> podiums{entry.golds ? <> · <em>{entry.golds} wins</em></> : null}</span>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        <section className="fame-band">
          <div className="shell fame-band__inner" data-reveal>
            <p><span className="terminal__prompt" aria-hidden="true">$</span> echo &quot;your name here&quot;</p>
            <h2>Want your name <span>on this wall?</span></h2>
            <div className="fame-band__actions">
              <Link className="button button--primary" href="/events">See upcoming events <ArrowIcon /></Link>
              <Link className="button button--outline" href="/achievements">Club achievements <ArrowIcon /></Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
