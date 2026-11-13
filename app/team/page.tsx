import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeamSection } from "@/components/team-section";
import { TEAM_HERO_BANNER } from "@/lib/team";
import { getActiveTeamMembers } from "@/lib/team-db";
import { TeamHeading } from "./team-heading";
import "./team.css";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the team of the Programming Club of NIT Jamshedpur across batches.",
};

export default async function TeamPage() {
  const members = await getActiveTeamMembers();

  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main className="team-page" id="main" tabIndex={-1}>
        <section className="team-hero" aria-labelledby="team-hero-title">
          <div className="team-hero__media" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="team-hero__photo"
              src={TEAM_HERO_BANNER}
              // Phones get a 640/1080px crop instead of the 1920px banner.
              srcSet={[640, 1080, 1920].map((w) => `${TEAM_HERO_BANNER.replace("w=1920", `w=${w}`)} ${w}w`).join(", ")}
              sizes="100vw"
              alt=""
              decoding="async"
              fetchPriority="high"
            />
            <div className="team-hero__overlay" />
          </div>

          <div className="shell team-hero__content">
            <TeamHeading />
          </div>
        </section>

        <TeamSection initialMembers={members} />
      </main>
      <SiteFooter />
    </div>
  );
}
