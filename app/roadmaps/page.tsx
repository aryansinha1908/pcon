import type { Metadata } from "next";
import { ArrowIcon } from "@/components/brand";
import { CodeRain } from "@/components/code-rain";
import { HackerScramble } from "@/components/hacker-scramble";
import { RoadmapHeroTitle } from "@/components/roadmap-hero-title";
import { StepCheck, TrackProgress } from "@/components/roadmap-progress";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPathway, type Resource, type ResourceKind, type Roadmap } from "@/lib/roadmaps";
import "./roadmaps.css";

export const metadata: Metadata = {
  title: "Roadmaps — PCON",
  description: "Learning roadmaps curated by PCON seniors: problem solving foundations, then competitive programming, web development, AI/ML or DevOps.",
};

const KIND_LABEL: Record<ResourceKind, string> = {
  playlist: "Playlist",
  video: "Video",
  practice: "Practice",
  website: "Website",
};

function hostOf(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (host === "youtu.be" || host === "youtube.com") return "YouTube";
  return host;
}

function ResourceIcon({ kind }: { kind: ResourceKind }) {
  const paths: Record<ResourceKind, React.ReactNode> = {
    playlist: <><path d="M3 5h9M3 9h9M3 13h5" /><path d="m12 11 5 3-5 3z" fill="currentColor" /></>,
    video: <><rect x="2.5" y="4.5" width="15" height="11" rx="2.5" /><path d="m8.5 7.8 4 2.2-4 2.2z" fill="currentColor" /></>,
    practice: <><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3.5" /><circle cx="10" cy="10" r=".8" fill="currentColor" /></>,
    website: <><circle cx="10" cy="10" r="7" /><path d="M3 10h14M10 3c2 2.2 2.8 4.5 2.8 7s-.8 4.8-2.8 7c-2-2.2-2.8-4.5-2.8-7S8 5.2 10 3Z" /></>,
  };
  return (
    <svg className="resource__icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[kind]}
    </svg>
  );
}

function ResourceLink({ resource }: { resource: Resource }) {
  return (
    <a className="resource" href={resource.url} target="_blank" rel="noopener noreferrer">
      <ResourceIcon kind={resource.kind} />
      <span className="resource__body">
        <span className="resource__label">{resource.label}</span>
        <span className="resource__meta">
          {KIND_LABEL[resource.kind]} · {hostOf(resource.url)}
          {resource.note && <em>{resource.note}</em>}
        </span>
      </span>
      <span className="resource__arrow" aria-hidden="true"><ArrowIcon diagonal /></span>
    </a>
  );
}

function Track({ roadmap, index }: { roadmap: Roadmap; index: string }) {
  const ids = roadmap.steps.map((step) => step.id);
  return (
    <section className={`track track--${roadmap.tint}`} id={roadmap.slug} aria-labelledby={`${roadmap.slug}-title`}>
      <div className="shell">
        <header className="track__header">
          <div>
            <div className="section-label"><span>{index} / {roadmap.kicker.toUpperCase()}</span><i /></div>
            <h2 id={`${roadmap.slug}-title`}>{roadmap.title}</h2>
            <p>{roadmap.tagline}</p>
          </div>
          {ids.length > 0 && <TrackProgress ids={ids} label={roadmap.title} resettable />}
        </header>

        <ol className="timeline">
          {roadmap.steps.map((step, i) => {
            const showStage = step.stage && step.stage !== roadmap.steps[i - 1]?.stage;
            return (
              <li className={"timeline__item" + (step.milestone ? " timeline__item--milestone" : "")} key={step.id}>
                {showStage && <div className="timeline__stage">{step.stage}</div>}
                <span className="timeline__node" aria-hidden="true">{step.milestone ? "★" : String(i + 1).padStart(2, "0")}</span>
                <article className="step-card">
                  <div className="step-card__head">
                    <div>
                      {step.milestone && <span className="chip chip--live">Milestone</span>}
                      {step.optional && <span className="chip">Optional</span>}
                      <h3>{step.title}</h3>
                    </div>
                    <StepCheck id={step.id} title={step.title} />
                  </div>
                  {step.summary && <p className="step-card__summary">{step.summary}</p>}
                  {step.resources.length > 0 && (
                    <div className="step-card__resources">
                      {step.resources.map((resource) => <ResourceLink resource={resource} key={resource.label + resource.url} />)}
                    </div>
                  )}
                </article>
              </li>
            );
          })}

          {(roadmap.locked || roadmap.exploreNext || roadmap.furtherReading || roadmap.channels || roadmap.tips) && (
            <li className={"timeline__item " + (roadmap.locked ? "timeline__item--locked" : "timeline__item--finish")}>
              <span className="timeline__node" aria-hidden="true">
                {roadmap.locked ? (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="4.5" y="9" width="11" height="8" rx="2" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" /></svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5.5 17.5v-14M5.5 4h9l-2 3.25 2 3.25h-9" /></svg>
                )}
              </span>
              <article className={"step-card " + (roadmap.locked ? "step-card--locked" : "step-card--finish")}>
                {roadmap.locked && <h3>{roadmap.locked}</h3>}
                {roadmap.exploreNext && (
                  <div className="step-card__group">
                    <span>Explore next</span>
                    <div className="chip-row">{roadmap.exploreNext.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
                  </div>
                )}
                {roadmap.tips?.map((tip) => <p className="step-card__summary" key={tip}>{tip}</p>)}
                {roadmap.furtherReading && (
                  <div className="step-card__resources">
                    {roadmap.furtherReading.map((resource) => <ResourceLink resource={resource} key={resource.url} />)}
                  </div>
                )}
                {roadmap.channels && (
                  <div className="step-card__group">
                    <span>Other channels to explore</span>
                    <div className="chip-row">{roadmap.channels.map((item) => <span className="chip" key={item}>{item}</span>)}</div>
                  </div>
                )}
              </article>
            </li>
          )}
        </ol>
      </div>
    </section>
  );
}

const ROADMAP_PHRASES = [
  "STEP 1: MASTER PROBLEM SOLVING",
  "STEP 2: HIT 5★ ON HACKERRANK",
  "STEP 3: CHOOSE YOUR DIRECTION",
  "CP • DEV • AI/ML • CLOUD",
];

export default async function RoadmapsPage() {
  const { principles, foundation, branches } = await getPathway();
  const tracks = [foundation, ...branches];
  const fiveStar = foundation.steps.at(-1);

  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <section className="roadmaps-hero" aria-labelledby="roadmaps-title">
          <div className="roadmaps-hero__backdrop" aria-hidden="true" />
          <CodeRain />
          <div className="shell">
            <div className="eyebrow"><span className="status-dot" /> CURATED BY SENIORS, FOR JUNIORS</div>
            <RoadmapHeroTitle prefix="Find your " highlight="path." />
            <div className="roadmaps-hero__scramble-wrap">
              <HackerScramble phrases={ROADMAP_PHRASES} />
            </div>
            <ul className="chip-row" aria-label="Principles">
              {principles.map((principle) => <li className="chip" key={principle}>{principle}</li>)}
            </ul>
          </div>
        </section>

        <section className="pathway" aria-labelledby="pathway-title">
          <div className="shell">
            <h2 className="sr-only" id="pathway-title">How the roadmaps fit together</h2>
            <div className="pathway__trunk">
              <a className="pathway__node" href="#foundation">
                <span className="pathway__step">STEP 1</span>
                <strong>Problem solving</strong>
                <small>{foundation.steps.filter((step) => !step.milestone).map((step) => step.title.replace(/^Start solving on /, "")).join(" → ")}</small>
              </a>
              <span className="pathway__arrow" aria-hidden="true"><ArrowIcon /></span>
              <a className="pathway__node pathway__node--milestone" href="#foundation">
                <span className="pathway__step">STEP 2 · MANDATORY FOR ALL</span>
                <strong>{fiveStar?.title}</strong>
                <TrackProgress ids={foundation.steps.map((step) => step.id)} label={foundation.title} />
              </a>
            </div>
            <div className="pathway__fork-label">STEP 3 · CHOOSE YOUR DIRECTION</div>
            <ul className="pathway__branches">
              {branches.map((branch) => (
                <li className={`pathway__branch track--${branch.tint}`} key={branch.slug}>
                  <a href={`#${branch.slug}`}>
                    <span className="pathway__step">{branch.kicker.toUpperCase()}</span>
                    <strong>{branch.title}</strong>
                    <small>{branch.steps.length ? `${branch.steps.length} steps` : "Unlocks after 5★"}</small>
                    {branch.steps.length > 0 && <TrackProgress ids={branch.steps.map((step) => step.id)} label={branch.title} />}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <nav className="track-nav" aria-label="Roadmap tracks">
          <div className="shell track-nav__inner">
            {tracks.map((track) => <a className={`track-nav__chip track--${track.tint}`} href={`#${track.slug}`} key={track.slug}>{track.slug === "foundation" ? "Foundation" : track.title}</a>)}
          </div>
        </nav>

        {tracks.map((track, i) => <Track roadmap={track} index={String(i + 1).padStart(2, "0")} key={track.slug} />)}
      </main>
      <SiteFooter />
    </div>
  );
}
