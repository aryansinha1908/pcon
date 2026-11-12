import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeamSection } from "@/components/team-section";
import { teamDepartments } from "@/lib/team";
import "./team.css";

export const metadata: Metadata = {
  title: "Team — PCON",
  description: "Meet the members of the Programming Club of NIT Jamshedpur across App Development, Machine Learning, Web Development, and Programming.",
};

export default function TeamPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main>
        <section className="team-hero" aria-labelledby="team-title">
          <div className="team-hero__backdrop" aria-hidden="true" />
          <div className="shell">
            <div className="eyebrow">
              <span className="status-dot" /> PROGRAMMING CLUB OF NIT JAMSHEDPUR
            </div>
            <h1 id="team-title">
              Meet the <span>team.</span>
            </h1>
            <p className="team-hero__subtitle">
              The builders, mentors, and problem solvers driving PCON across every technical vertical.
            </p>
          </div>
        </section>

        <nav className="team-nav" aria-label="Team departments">
          <div className="shell team-nav__inner">
            {teamDepartments.map((dept) => (
              <a
                key={dept.slug}
                href={`#${dept.slug}`}
                className={`team-nav__link team-nav__link--${dept.tint}`}
              >
                {dept.name}
              </a>
            ))}
          </div>
        </nav>

        {teamDepartments.map((department) => (
          <TeamSection key={department.slug} department={department} />
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}

