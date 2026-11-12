import { TeamMemberCard } from "@/components/team-member-card";
import type { TeamDepartment } from "@/lib/team";

export type TeamSectionProps = {
  department: TeamDepartment;
};

export function TeamSection({ department }: TeamSectionProps) {
  const headingId = `${department.slug}-heading`;

  return (
    <section
      className={`team-section team-section--${department.tint}`}
      id={department.slug}
      aria-labelledby={headingId}
    >
      <div className="shell">
        <header className="team-section__header">
          <div className="team-section__kicker">
            <span className="team-section__line" aria-hidden="true" />
            <span className="team-section__index">{department.index} / DEPARTMENT</span>
            <span className="team-section__line" aria-hidden="true" />
          </div>
          <h2 id={headingId} className="team-section__title">
            {department.name}
          </h2>
        </header>

        <div className="team-grid">
          {department.members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              tint={department.tint}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

