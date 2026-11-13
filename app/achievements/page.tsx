import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/brand";
import { ScrollReveal } from "@/components/scroll-reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { clubAchievements, FOUNDED, VISION, type ClubAchievement } from "@/lib/club-achievements";
import { baseOpenGraph } from "@/lib/site-url";
import "./achievements.css";

const description = "PCON at ICPC regionals and national hackathons: rank 54 and 1st among NITs at ICPC Kanpur 2025, wins at Code for Good and Adobe GenSolve, and more from the Programming Club of NIT Jamshedpur.";

export const metadata: Metadata = {
  title: "Achievements",
  description,
  alternates: { canonical: "/achievements" },
  openGraph: { ...baseOpenGraph, title: "Achievements · PCON", description, url: "/achievements" },
};

function ResultBadge({ achievement }: { achievement: ClubAchievement }) {
  return <span className={`result result--${achievement.tier}`}>{achievement.result}</span>;
}

function Featured({ achievement }: { achievement: ClubAchievement }) {
  const rank = achievement.result.match(/\d+/)?.[0];
  return (
    <article className="feat" data-reveal>
      <div className="feat__photo">
        <Image src={achievement.image.src} width={achievement.image.width} height={achievement.image.height} alt={achievement.image.alt} sizes="(max-width: 900px) 100vw, 40vw" priority />
      </div>
      <div className="feat__body">
        <span className="chip chip--live">{achievement.kind} · {achievement.year}</span>
        {rank && (
          <p className="feat__rank" aria-hidden="true">
            <span>#</span>{rank}
          </p>
        )}
        <h3>{achievement.title}</h3>
        {achievement.highlight && <p className="feat__highlight">{achievement.highlight}</p>}
        <dl className="feat__meta">
          <div><dt>Result</dt><dd>{achievement.result}</dd></div>
          <div><dt>Host</dt><dd>{achievement.organiser}</dd></div>
          {achievement.when && <div><dt>When</dt><dd>{achievement.when}</dd></div>}
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
          <Image src={achievement.image.src} width={achievement.image.width} height={achievement.image.height} alt={achievement.image.alt} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" />
          <ResultBadge achievement={achievement} />
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

export default function AchievementsPage() {
  const featured = clubAchievements.find((a) => a.featured);
  const rest = clubAchievements.filter((a) => a !== featured).sort((a, b) => b.year - a.year);
  const wins = clubAchievements.filter((a) => a.tier === "winner").length;
  const icpc = clubAchievements.filter((a) => a.kind === "ICPC").length;

  return (
    <div className="site-shell" id="top">
      <ScrollReveal />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <section className="ach-hero" aria-labelledby="ach-title">
          <div className="ach-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="eyebrow"><span className="status-dot" /> PCON · ACHIEVEMENTS</div>
            <h1 id="ach-title">Where PCON<br /><span>shows up.</span></h1>
            <p>
              Since {FOUNDED}, the club has carried its coding culture beyond campus, to the ICPC regionals and
              national hackathons. A few of the milestones.
            </p>
            <ul className="ach-stats">
              <li><strong>#1</strong><span>NIT at ICPC Kanpur &apos;25</span></li>
              <li><strong>{wins}</strong><span>national hackathon wins</span></li>
              <li><strong>{icpc}</strong><span>ICPC regionals in 2025</span></li>
              <li><strong>{FOUNDED}</strong><span>est.</span></li>
            </ul>
          </div>
        </section>

        {featured && (
          <section className="section-pad ach-section" aria-labelledby="feat-title">
            <div className="shell">
              <div className="section-label"><span>01 / HIGHLIGHT</span><i /></div>
              <h2 id="feat-title">Best NIT <span>at ICPC Kanpur.</span></h2>
              <Featured achievement={featured} />
            </div>
          </section>
        )}

        <section className="section-pad ach-section ach-section--grid" aria-labelledby="all-title">
          <div className="shell">
            <div className="section-label"><span>02 / MILESTONES</span><i /></div>
            <h2 id="all-title">On the <span>big stages.</span></h2>
            <div className="ach-grid">
              {rest.map((a) => <Card achievement={a} key={a.slug} />)}
            </div>
          </div>
        </section>

        <section className="section-pad ach-section ach-vision" aria-labelledby="vision-title">
          <div className="shell ach-vision__inner">
            <div>
              <div className="section-label"><span>03 / THE GOAL SINCE {FOUNDED}</span><i /></div>
              <h2 id="vision-title">Why we <span>compete.</span></h2>
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
            <h2>Winners of <span>our own contests.</span></h2>
            <Link className="button button--outline" href="/hall-of-fame">Visit the Hall of Fame <ArrowIcon /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
