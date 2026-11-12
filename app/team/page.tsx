import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeamSection } from "@/components/team-section";
import { TEAM_HERO_BANNER, teamMembers } from "@/lib/team";
import { TeamHeading } from "./team-heading";
import "./team.css";

export const metadata: Metadata = {
  title: "Team — PCON",
  description: "Meet the team of the Programming Club of NIT Jamshedpur across batches 2026, 2027, 2028, and 2029.",
};

export default function TeamPage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main className="team-page">
        <section className="team-hero" aria-labelledby="team-hero-title">
          <div className="team-hero__media" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="team-hero__photo"
              src={TEAM_HERO_BANNER}
              alt=""
              decoding="async"
            />
            <div className="team-hero__overlay" />
          </div>

          <div className="shell team-hero__content">


            <TeamHeading />
          </div>
        </section>

        <TeamSection members={teamMembers} />
      </main>
      <SiteFooter />
    </div>
  );
}
