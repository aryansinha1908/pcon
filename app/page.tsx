import Image from "next/image";
import Link from "next/link";
import { ArrowIcon } from "@/components/brand";
import { BuildOnScroll } from "@/components/build-on-scroll";
import { CodeRain } from "@/components/code-rain";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { blogPosts, events, focusAreas, heroPillars } from "@/lib/site-data";

const codeLines = [
  <><span className="syntax-purple">const</span> <span className="syntax-blue">future</span> = <span className="syntax-yellow">&quot;yours to build&quot;</span>;</>,
  <><span className="syntax-purple">for</span> (<span className="syntax-orange">idea</span> <span className="syntax-purple">of</span> <span className="syntax-blue">possibilities</span>) {"{"}</>,
  <>{"  "}<span className="syntax-blue">learn</span>(idea);</>,
  <>{"  "}<span className="syntax-blue">build</span>(idea);</>,
  <>{"  "}<span className="syntax-blue">share</span>(idea);</>,
  <>{"}"}</>,
];

const tickerWords = ["THINK DEEPLY", "BUILD BOLDLY", "LEARN TOGETHER", "CODE FOR THE FUTURE"];

const upcomingEvents = events.filter((event) => event.status === "upcoming");
const pastEvents = events.filter((event) => event.status === "past");

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export default function HomePage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero__backdrop" aria-hidden="true" />
          <CodeRain />
          <div className="shell hero__inner">
            <div className="hero__copy">
              <div className="eyebrow"><span className="status-dot" /> THE CODING COMMUNITY AT NIT JAMSHEDPUR</div>
              <h1 id="hero-title">Code for <span>the future.</span></h1>
              <p className="hero__intro">A community of curious minds, ambitious ideas, and the code that brings them to life.</p>
              <div className="hero__actions">
                <a className="button button--primary" href="#community">Find your people <ArrowIcon /></a>
                <a className="button button--outline" href="#about">Get to know PCON <span aria-hidden="true">↓</span></a>
              </div>
            </div>

            <div className="hero-art" aria-hidden="true">
              <div className="hero-art__halo" />
              <div className="hero-art__orbit hero-art__orbit--one" />
              <div className="hero-art__orbit hero-art__orbit--two" />
              <div className="hero-art__cross hero-art__cross--one">+</div>
              <div className="hero-art__cross hero-art__cross--two">+</div>
              <div className="hero-art__tag hero-art__tag--top"><span className="tag-pulse" /> ideas in motion</div>
              <div className="code-window">
                <div className="code-window__bar"><span className="window-dots"><i /><i /><i /></span><span>future.ts</span><span className="code-window__menu">···</span></div>
                <div className="code-window__body">
                  {codeLines.map((line, index) => <div className="code-line" key={index}><span>{String(index + 1).padStart(2, "0")}</span><code>{line}</code></div>)}
                  <div className="code-cursor" />
                </div>
              </div>
              <div className="hero-art__badge"><Image className="badge-mark" src="/pcon-logo.png" alt="" width={50} height={30} /><span>PCON<br /><small>NIT JSR</small></span></div>
              <div className="hero-art__tag hero-art__tag--bottom">01000011 <span>✳</span> 01001111</div>
            </div>

            <ul className="hero-pillars">
              {heroPillars.map((pillar) => (
                <li className="hero-pillar" key={pillar.title}>
                  <span className="hero-pillar__symbol" aria-hidden="true">{pillar.symbol}</span>
                  <strong>{pillar.title}</strong>
                  <p>{pillar.text}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="shell hero__index" aria-hidden="true"><span>↓</span><i /> SCROLL TO WATCH IT BUILD</div>
        </section>

        <section className="ticker" aria-label="PCON values">
          <div className="ticker__track">
            {[...tickerWords, ...tickerWords].map((word, index) => <span key={index}>{word}<i aria-hidden="true">✳</i></span>)}
          </div>
        </section>

        <BuildOnScroll />

        <section className="about section-pad" id="about" data-build-section>
          <div className="shell">
            <div className="section-label"><span>01 / WHO WE ARE</span><i /></div>
            <div className="about__grid">
              <h2 data-build>More than a club.<br /><span>A place to become.</span></h2>
              <div className="about__copy" data-build>
                <p>We are the Programming Club of NIT Jamshedpur: a community of enthusiastic minds who believe the future belongs to those who know how to build it.</p>
                <p>From the first line of code to the next big idea, we make space to learn, experiment, and grow — together.</p>
                <a className="text-link text-link--dark" href="#domains">Explore what we do <ArrowIcon /></a>
              </div>
            </div>
            <div className="about__quote" data-build><span className="quote-mark">“</span><p>If you think bits are the alphabets of the future,<br className="desktop-only" /> you are one of us.</p><span className="quote-by">THE PCON WAY</span></div>
          </div>
        </section>

        <section className="domains section-pad" id="domains" data-build-section>
          <div className="shell">
            <div className="section-heading">
              <div><div className="section-label"><span>02 / WHAT WE EXPLORE</span><i /></div><h2>Find your<br /><span>next frontier.</span></h2></div>
              <p>One community, many directions. Follow what fascinates you — and find the people who’ll build alongside you.</p>
            </div>
            <div className="domain-grid">
              {focusAreas.map((area) => (
                <article className={"domain-card domain-card--" + area.tint} key={area.number} data-build>
                  <div className="domain-card__top"><span>{area.number} / 04</span><span className="domain-card__symbol">{area.symbol}</span></div>
                  <h3>{area.name}</h3><p>{area.description}</p>
                  <Link href={area.roadmap} aria-label={area.name + " roadmap"}><ArrowIcon diagonal /></Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="events section-pad" id="events" data-build-section>
          <div className="shell">
            <div className="section-heading">
              <div><div className="section-label"><span>03 / WHAT’S HAPPENING</span><i /></div><h2>Events &amp;<br /><span>contests.</span></h2></div>
              <p>Contests, hackathons, bootcamps and study jams — there’s always something being built on campus.</p>
            </div>
            <div className="event-grid">
              {upcomingEvents.length === 0 && (
                <article className="event-card event-card--empty" data-build>
                  <span className="chip">Upcoming</span>
                  <h3>No upcoming events</h3>
                  <p>Check back soon — the next contest is always around the corner.</p>
                </article>
              )}
              {[...upcomingEvents, ...pastEvents].slice(0, 6).map((event) => (
                <article className={"event-card" + (event.status === "upcoming" ? " event-card--upcoming" : "")} key={event.title} data-build>
                  <div className="event-card__top">
                    <time>{event.date}</time>
                    <span className={"chip" + (event.status === "upcoming" ? " chip--live" : "")}>{event.status === "upcoming" ? "Upcoming" : "Past"}</span>
                  </div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </article>
              ))}
            </div>
            <div className="section-more"><a className="button button--outline" href="/events">View all events <ArrowIcon /></a></div>
          </div>
        </section>

        <section className="blogs section-pad" id="blogs" data-build-section>
          <div className="shell">
            <div className="section-heading">
              <div><div className="section-label"><span>04 / FROM THE CLUB</span><i /></div><h2>Recent<br /><span>writing.</span></h2></div>
              <p>Roadmaps, announcements and interview experiences, written by members for members.</p>
            </div>
            <div className="blog-grid">
              {blogPosts.map((post) => (
                <a className="blog-card" href={post.tag === "Roadmap" ? "/roadmaps" : "/blogs"} key={post.title} data-build>
                  <span className="chip">{post.tag}</span>
                  <h3>{post.title}</h3>
                  <span className="blog-card__author">
                    <span className="avatar" aria-hidden="true">{initials(post.author)}</span>
                    {post.author}
                    <span className="blog-card__arrow"><ArrowIcon diagonal /></span>
                  </span>
                </a>
              ))}
            </div>
            <div className="section-more"><a className="button button--outline" href="/blogs">Read more <ArrowIcon /></a></div>
          </div>
        </section>

        <section className="community section-pad" id="community" data-build-section>
          <div className="shell">
            <div className="community__ornament" aria-hidden="true"><span>{"{"}</span><span>;</span><span>{"}"}</span></div>
            <div className="section-label"><span>05 / YOUR NEXT CHAPTER</span><i /></div>
            <div className="community__content">
              <h2 data-build>Curious minds<br />welcome.</h2>
              <div className="community__aside" data-build><p>Bring a question, an idea, or just the willingness to try. There’s room to start wherever you are.</p><a className="button button--dark" href="mailto:pcon@nitjsr.ac.in">Let’s build something <ArrowIcon /></a></div>
            </div>
            <div className="community__bottom"><span>PROGRAMMING CLUB OF NIT JAMSHEDPUR</span><span>CODE · CREATE · COLLABORATE</span></div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
