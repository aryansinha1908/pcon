import { ArrowIcon } from "@/components/brand";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { focusAreas } from "@/lib/site-data";

const codeLines = [
  <><span className="syntax-purple">const</span> <span className="syntax-blue">future</span> = <span className="syntax-yellow">"yours to build"</span>;</>,
  <><span className="syntax-purple">for</span> (<span className="syntax-orange">idea</span> <span className="syntax-purple">of</span> <span className="syntax-blue">possibilities</span>) {"{"}</>,
  <>{"  "}<span className="syntax-blue">learn</span>(idea);</>,
  <>{"  "}<span className="syntax-blue">build</span>(idea);</>,
  <>{"  "}<span className="syntax-blue">share</span>(idea);</>,
  <>{"}"}</>,
];

export default function HomePage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <section className="hero shell" aria-labelledby="hero-title">
          <div className="hero__copy">
            <div className="eyebrow"><span className="status-dot" /> THE CODING COMMUNITY AT NIT JAMSHEDPUR</div>
            <h1 id="hero-title">Code for<br /><span>the future.</span></h1>
            <p className="hero__intro">A community of curious minds, ambitious ideas, and the code that brings them to life.</p>
            <div className="hero__actions">
              <a className="button button--primary" href="#community">Find your people <ArrowIcon /></a>
              <a className="text-link" href="#about">Get to know PCON <span aria-hidden="true">↓</span></a>
            </div>
            <div className="hero__note"><span className="note-line" /> From bits to big ideas — together.</div>
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
            <div className="hero-art__badge"><span className="badge-mark">P</span><span>PCON<br /><small>NIT JSR</small></span></div>
            <div className="hero-art__tag hero-art__tag--bottom">01000011 <span>✳</span> 01001111</div>
          </div>
          <div className="hero__index"><span>01</span><i /> SCROLL TO EXPLORE</div>
        </section>

        <section className="ticker" aria-label="PCON values">
          <div className="ticker__track"><span>THINK DEEPLY</span><i>✳</i><span>BUILD BOLDLY</span><i>✳</i><span>LEARN TOGETHER</span><i>✳</i><span>CODE FOR THE FUTURE</span><i>✳</i><span>THINK DEEPLY</span><i>✳</i><span>BUILD BOLDLY</span><i>✳</i><span>LEARN TOGETHER</span><i>✳</i><span>CODE FOR THE FUTURE</span><i>✳</i></div>
        </section>

        <section className="about section-pad shell" id="about">
          <div className="section-label"><span>01 / WHO WE ARE</span><i /></div>
          <div className="about__grid">
            <h2>More than a club.<br /><span>A place to become.</span></h2>
            <div className="about__copy">
              <p>We are the Programming Club of NIT Jamshedpur: a community of enthusiastic minds who believe the future belongs to those who know how to build it.</p>
              <p>From the first line of code to the next big idea, we make space to learn, experiment, and grow — together.</p>
              <a className="text-link text-link--dark" href="#domains">Explore what we do <ArrowIcon /></a>
            </div>
          </div>
          <div className="about__quote"><span className="quote-mark">“</span><p>If you think bits are the alphabets of the future,<br className="desktop-only" /> you are one of us.</p><span className="quote-by">THE PCON WAY</span></div>
        </section>

        <section className="domains section-pad" id="domains">
          <div className="shell">
            <div className="domains__heading">
              <div><div className="section-label section-label--light"><span>02 / WHAT WE EXPLORE</span><i /></div><h2>Find your<br /><span>next frontier.</span></h2></div>
              <p>One community, many directions. Follow what fascinates you — and find the people who’ll build alongside you.</p>
            </div>
            <div className="domain-grid">
              {focusAreas.map((area) => (
                <article className={"domain-card domain-card--" + area.tint} key={area.number}>
                  <div className="domain-card__top"><span>{area.number} / 04</span><span className="domain-card__symbol">{area.symbol}</span></div>
                  <h3>{area.name}</h3><p>{area.description}</p>
                  <a href="#community" aria-label={"Explore " + area.name}><ArrowIcon diagonal /></a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="community section-pad shell" id="community">
          <div className="community__ornament" aria-hidden="true"><span>{"{"}</span><span>;</span><span>{"}"}</span></div>
          <div className="section-label"><span>03 / YOUR NEXT CHAPTER</span><i /></div>
          <div className="community__content">
            <h2>Curious minds<br />welcome.</h2>
            <div className="community__aside"><p>Bring a question, an idea, or just the willingness to try. There’s room to start wherever you are.</p><a className="button button--dark" href="mailto:pcon@nitjsr.ac.in">Let’s build something <ArrowIcon /></a></div>
          </div>
          <div className="community__bottom"><span>PROGRAMMING CLUB OF NIT JAMSHEDPUR</span><span>CODE · CREATE · COLLABORATE</span></div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
