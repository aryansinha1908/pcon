import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/brand";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { FOUNDED, getAchievements, VISION, type ClubAchievement } from "@/lib/club-achievements";
import { baseOpenGraph } from "@/lib/site-url";
import "./achievements.css";

// Achievements are edited in the admin panel: render per request (and never
// query the database at build time, where CI has no real database).
export const dynamic = "force-dynamic";

const description = "PCON at ICPC regionals and national hackathons: the Programming Club of NIT Jamshedpur's results beyond campus.";

export const metadata: Metadata = {
  title: "Achievements",
  description,
  alternates: { canonical: "/achievements" },
  openGraph: { ...baseOpenGraph, title: "Achievements · PCON", description, url: "/achievements" },
};

function Photo({ image, eager = false }: { image: ClubAchievement["image"]; eager?: boolean }) {
  if (!image) return <div className="ach-photo-fallback" aria-hidden="true"><span>{"{ }"}</span></div>;
  // eslint-disable-next-line @next/next/no-img-element -- admin-entered images can live on any host (uploads, Cloudinary, links), so next/image would need every host allow-listed.
  return <img src={image.src} alt={image.alt} loading={eager ? "eager" : "lazy"} />;
}

function Featured({ achievement }: { achievement: ClubAchievement }) {
  const rank = achievement.tier === "rank" ? achievement.result.match(/\d+/)?.[0] : undefined;
  return (
    <article className="feat" data-reveal>
      <div className="feat__photo">
        <Photo image={achievement.image} eager />
      </div>
      <div className="feat__body">
        <span className="chip chip--live">{achievement.kind} · {achievement.year}</span>
        {rank ? (
          <p className="feat__rank" aria-hidden="true"><span>#</span>{rank}</p>
        ) : (
          <p className={`feat__result result--${achievement.tier}`}>{achievement.result}</p>
        )}
        <h3>{achievement.title}</h3>
        {achievement.highlight && <p className="feat__highlight">{achievement.highlight}</p>}
        <dl className="feat__meta">
          <div><dt>Result</dt><dd>{achievement.result}</dd></div>
          <div><dt>Host</dt><dd>{achievement.organiser}</dd></div>
          {achievement.dates && <div><dt>When</dt><dd>{achievement.dates}</dd></div>}
        </dl>
      </div>
    </article>
  );
}

function Card({ achievement }: { achievement: ClubAchievement }) {
  return (
    <div data-reveal>
      <article className="ach-card">
        <div className="ach-card__photo">
          <Photo image={achievement.image} />
          <span className={`result result--${achievement.tier}`}>{achievement.result}</span>
        </div>
        <div className="ach-card__body">
          <span className="ach-card__kind">{achievement.kind} · {achievement.year}</span>
          <h3>{achievement.title}</h3>
          <p className="ach-card__org">{achievement.organiser}</p>
          {achievement.highlight && <p className="ach-card__highlight">{achievement.highlight}</p>}
        </div>
      </article>
    </div>
  );
}

export default async function AchievementsPage() {
  const achievements = await getAchievements();
  const featured = achievements.find((a) => a.featured);
  const rest = achievements.filter((a) => a !== featured);
  const wins = achievements.filter((a) => a.tier === "winner").length;
  const icpc = achievements.filter((a) => a.kind === "ICPC").length;

  return (
    <div className="site-shell" id="top">
      <ScrollReveal />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="ach-hero" aria-labelledby="ach-title">
          <div className="ach-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="eyebrow"><span className="status-dot" /> PCON · Achievements</div>
            <h1 id="ach-title">Where PCON<br /><span>shows up</span></h1>
            <p>
              Since {FOUNDED}, the club has carried its coding culture beyond campus, to the ICPC regionals and
              national hackathons. A few of the milestones.
            </p>
            {achievements.length > 0 && (
              <ul className="ach-stats">
                <li><strong>{achievements.length}</strong><span>milestones</span></li>
                <li><strong>{wins}</strong><span>{wins === 1 ? "win" : "wins"}</span></li>
                <li><strong>{icpc}</strong><span>ICPC regionals</span></li>
                <li><strong>{FOUNDED}</strong><span>est.</span></li>
              </ul>
            )}
          </div>
        </section>

        {featured && (
          <section className="section-pad ach-section" aria-labelledby="feat-title">
            <div className="shell">
              <div className="section-label"><span>01 / Highlight</span><i /></div>
              <h2 id="feat-title">Our <span>best finish</span></h2>
              <Featured achievement={featured} />
            </div>
          </section>
        )}

        <section className="section-pad ach-section ach-section--grid" aria-labelledby="all-title">
          <div className="shell">
            <div className="section-label"><span>{featured ? "02" : "01"} / Milestones</span><i /></div>
            <h2 id="all-title">On the <span>big stages</span></h2>
            {rest.length > 0 ? (
              <div className="ach-grid">
                {rest.map((a) => <Card achievement={a} key={a.id} />)}
              </div>
            ) : (
              <div className="terminal ach-empty">
                <div className="terminal__bar" aria-hidden="true"><i /><i /><i /><span>pcon — achievements</span></div>
                <div className="terminal__body">
                  <div><span className="terminal__prompt">$</span> ls achievements/</div>
                  <div className="terminal__dim">{featured ? "more on the way" : "nothing here yet, the first milestone is coming"} <span className="terminal__caret" aria-hidden="true" /></div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="section-pad ach-section ach-vision" aria-labelledby="vision-title">
          <div className="shell ach-vision__inner">
            <div>
              <div className="section-label"><span>The goal since {FOUNDED}</span><i /></div>
              <h2 id="vision-title">Why we <span>compete</span></h2>
            </div>
            <div className="terminal ach-vision__terminal" data-reveal>
              <div className="terminal__bar" aria-hidden="true"><i /><i /><i /><span>pcon — vision.md</span></div>
              <ol className="terminal__body ach-vision__list">
                {VISION.map((line, i) => (
                  <li key={line}><span className="terminal__prompt" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>{line}</li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="ach-band">
          <div className="shell ach-band__inner" data-reveal>
            <p><span className="terminal__prompt" aria-hidden="true">$</span> cd ../hall-of-fame</p>
            <h2>Winners of <span>our own contests</span></h2>
            <Link className="button button--outline" href="/hall-of-fame">Visit the Hall of Fame <ArrowIcon /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
