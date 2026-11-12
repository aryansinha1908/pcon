"use client";

import { useState } from "react";
import type { DepartmentTint, TeamMember } from "@/lib/team";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1.5a10.5 10.5 0 0 0-3.32 20.46c.52.1.71-.22.71-.5v-1.77c-2.92.63-3.53-1.4-3.53-1.4-.48-1.2-1.16-1.52-1.16-1.52-.95-.65.07-.64.07-.64 1.05.08 1.61 1.08 1.61 1.08.93 1.6 2.45 1.14 3.05.87.1-.68.37-1.14.66-1.4-2.33-.27-4.78-1.16-4.78-5.18 0-1.14.41-2.08 1.08-2.81-.11-.27-.47-1.34.1-2.8 0 0 .88-.28 2.89 1.07a10.06 10.06 0 0 1 5.26 0c2-1.35 2.88-1.07 2.88-1.07.57 1.46.21 2.53.1 2.8.67.73 1.08 1.67 1.08 2.81 0 4.03-2.46 4.91-4.8 5.17.38.33.72.97.72 1.96v2.9c0 .28.19.61.72.5A10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 8.5H3.56V20h3.38V8.5ZM5.25 3.06a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 13.02c0-3.47-1.85-5.08-4.33-5.08-1.99 0-2.89 1.1-3.39 1.87V8.5H9.34c.04.95 0 11.5 0 11.5h3.38v-6.42c0-.34.03-.69.13-.93.27-.69.89-1.4 1.93-1.4 1.37 0 1.91 1.04 1.91 2.57V20h3.38v-6.98h.37Z" />
    </svg>
  );
}

export type TeamMemberCardProps = {
  member: TeamMember;
  tint?: DepartmentTint;
};

export function TeamMemberCard({ member, tint = "mint" }: TeamMemberCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showFallback = !member.image || imageFailed;

  return (
    <article className={`team-card team-card--${tint}`}>
      <div className="team-card__portrait">
        {!showFallback ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="team-card__img"
            src={member.image}
            alt={member.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="team-card__fallback" aria-hidden="true">
            <span className="team-card__initials">{getInitials(member.name)}</span>
          </div>
        )}

        <div className="team-card__vignette" aria-hidden="true" />

        <div className="team-card__overlay">
          <div className="team-card__identity">
            <span className="team-card__role">{member.designation}</span>
            <h3 className="team-card__name">{member.name}</h3>
          </div>

          <div className="team-card__socials" aria-label={`${member.name} social links`}>
            <a
              className="team-card__social-link"
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on GitHub`}
              title="GitHub"
            >
              <GitHubIcon />
              <span>GitHub</span>
            </a>
            <a
              className="team-card__social-link"
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${member.name} on LinkedIn`}
              title="LinkedIn"
            >
              <LinkedInIcon />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

