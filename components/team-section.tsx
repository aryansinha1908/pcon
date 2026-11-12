"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TeamMemberCard } from "@/components/team-member-card";
import { TEAM_BATCHES, type TeamBatch, type TeamMember } from "@/lib/team";

export type TeamSectionProps = {
  members: TeamMember[];
  defaultBatch?: TeamBatch;
};

export function TeamSection({
  members,
  defaultBatch = TEAM_BATCHES[0],
}: TeamSectionProps) {
  const [selectedBatch, setSelectedBatch] = useState<TeamBatch>(defaultBatch);
  const [offset, setOffset] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  const activeIndex = TEAM_BATCHES.indexOf(selectedBatch);
  const filteredMembers = members.filter((member) => member.batch === selectedBatch);

  // Slide the strip so the selected year sits at the start of the viewport,
  // and park the underline beneath it. Positions are in track coordinates.
  const measure = useCallback(() => {
    const el = buttonRefs.current[selectedBatch];
    if (!el) return;
    setOffset(el.offsetLeft);
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [selectedBatch]);

  useEffect(() => {
    measure();
    const el = buttonRefs.current[selectedBatch];
    const parent = el?.parentElement;
    if (!parent) return;
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    if (el) observer.observe(el);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [measure, selectedBatch]);

  const selectBatch = (batch: TeamBatch) => {
    setSelectedBatch(batch);
  };

  const go = (step: number) => {
    const next = TEAM_BATCHES[activeIndex + step];
    if (next !== undefined) {
      selectBatch(next);
    }
  };

  return (
    <section className="team-directory" aria-label="Team members by batch">
      <div className="shell">
        <div className="batch-selector">
          <span className="batch-selector__label">BATCH OF</span>

          <div className="batch-selector__viewport">
            <div
              className="batch-selector__track"
              role="tablist"
              aria-label="Select batch year"
              style={{ transform: `translateX(${-offset}px)` }}
            >
              {TEAM_BATCHES.map((batch) => {
                const isActive = batch === selectedBatch;
                return (
                  <button
                    key={batch}
                    ref={(node) => {
                      buttonRefs.current[batch] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`batch-tab-${batch}`}
                    aria-selected={isActive}
                    aria-controls={`batch-panel-${batch}`}
                    className={
                      "batch-selector__btn" +
                      (isActive ? " batch-selector__btn--active" : "")
                    }
                    onClick={() => selectBatch(batch)}
                  >
                    {batch}
                  </button>
                );
              })}
              <span
                className="batch-selector__underline"
                aria-hidden="true"
                style={{ left: indicator.left, width: indicator.width }}
              />
            </div>
          </div>

          <div className="batch-selector__nav">
            <button
              type="button"
              className="batch-selector__arrow"
              aria-label="Previous batch"
              disabled={activeIndex <= 0}
              onClick={() => go(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              className="batch-selector__arrow"
              aria-label="Next batch"
              disabled={activeIndex >= TEAM_BATCHES.length - 1}
              onClick={() => go(1)}
            >
              ›
            </button>
          </div>
        </div>

        <div
          key={selectedBatch}
          id={`batch-panel-${selectedBatch}`}
          role="tabpanel"
          aria-labelledby={`batch-tab-${selectedBatch}`}
          className="members-grid"
        >
          {filteredMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
