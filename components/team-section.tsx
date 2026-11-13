"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TeamMemberCard } from "@/components/team-member-card";
import { CURRENT_TEAM_BATCH, TEAM_BATCHES, type TeamMember } from "@/lib/team";

export type TeamSectionProps = {
  initialMembers?: TeamMember[];
  defaultBatch?: number;
};

export function TeamSection({
  initialMembers,
  defaultBatch = CURRENT_TEAM_BATCH,
}: TeamSectionProps) {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers ?? []);
  const [loading, setLoading] = useState<boolean>(!initialMembers);
  const [error, setError] = useState<string | null>(null);
  const [selectedBatchOverride, setSelectedBatchOverride] = useState<number | null>(null);

  // Dynamic batches extracted from active members (including 2027, 2026, 2025), sorted newest first
  const availableBatches = useMemo(() => {
    const batchSet = new Set<number>([...TEAM_BATCHES, ...members.map((m) => m.batch)]);
    return Array.from(batchSet).sort((a, b) => b - a);
  }, [members]);

  // Derived selected batch: override if still available, else defaultBatch (2027) or first available
  const selectedBatch = useMemo(() => {
    if (selectedBatchOverride !== null && availableBatches.includes(selectedBatchOverride)) {
      return selectedBatchOverride;
    }
    if (availableBatches.includes(defaultBatch)) {
      return defaultBatch;
    }
    return availableBatches[0] ?? defaultBatch;
  }, [availableBatches, defaultBatch, selectedBatchOverride]);

  const [offset, setOffset] = useState(0);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const buttonRefs = useRef<Record<number, HTMLButtonElement | null>>({});

  // Fetch all active team members across batches (2027, 2026, 2025) from API on mount
  useEffect(() => {
    if (initialMembers) return;

    let isMounted = true;
    async function fetchTeam() {
      try {
        const res = await fetch("/api/team/members", { cache: "no-store" });
        if (!res.ok) {
          throw new Error(`Failed to load team members (${res.status})`);
        }
        const data = await res.json();
        if (!isMounted) return;
        const memberList = data.members || data.data;
        if (!data.success || !Array.isArray(memberList)) {
          throw new Error(data.error || "Invalid response format from server");
        }
        setMembers(memberList);
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error("Error fetching team members:", err);
        const msg = err instanceof Error ? err.message : "Unable to load team members right now.";
        setError(msg);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTeam();

    return () => {
      isMounted = false;
    };
  }, [initialMembers]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    fetch("/api/team/members", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load team members (${res.status})`);
        return res.json();
      })
      .then((data) => {
        const memberList = data.members || data.data;
        if (!data.success || !Array.isArray(memberList)) {
          throw new Error(data.error || "Invalid response format from server");
        }
        setMembers(memberList);
      })
      .catch((err: unknown) => {
        console.error("Error fetching team members:", err);
        setError(err instanceof Error ? err.message : "Unable to load team members right now.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const activeIndex = availableBatches.indexOf(selectedBatch);
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

  const selectBatch = (batch: number) => {
    setSelectedBatchOverride(batch);
  };

  const go = (step: number) => {
    const nextIndex = activeIndex + step;
    if (nextIndex >= 0 && nextIndex < availableBatches.length) {
      selectBatch(availableBatches[nextIndex]);
    }
  };

  // Tablist keyboard pattern: arrows/Home/End move selection and focus.
  const onTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const last = availableBatches.length - 1;
    const target =
      event.key === "ArrowRight" ? Math.min(activeIndex + 1, last)
      : event.key === "ArrowLeft" ? Math.max(activeIndex - 1, 0)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : -1;
    if (target < 0) return;
    event.preventDefault();
    const batch = availableBatches[target];
    selectBatch(batch);
    buttonRefs.current[batch]?.focus();
  };

  return (
    <section className="team-directory" aria-label="Team members by batch">
      <div className="shell">
        <div className="batch-selector">
          <span className="batch-selector__label">Batch of</span>

          <div className="batch-selector__viewport">
            <div
              className="batch-selector__track"
              role="tablist"
              aria-label="Select batch year"
              style={{ transform: `translateX(${-offset}px)` }}
            >
              {availableBatches.map((batch) => {
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
                    tabIndex={isActive ? 0 : -1}
                    onKeyDown={onTabKeyDown}
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
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5" /></svg>
            </button>
            <button
              type="button"
              className="batch-selector__arrow"
              aria-label="Next batch"
              disabled={activeIndex >= availableBatches.length - 1}
              onClick={() => go(1)}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5" /></svg>
            </button>
          </div>
        </div>

        {/* Loading skeleton grid */}
        {loading && (
          <div className="members-grid" aria-busy="true" aria-label="Loading team members">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="member-card member-card--skeleton">
                <div className="member-card__photo" />
                <div className="member-card__body">
                  <div className="skeleton-line skeleton-line--title" />
                  <div className="skeleton-line skeleton-line--subtitle" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="team-state-box" role="alert">
            <p className="team-state-box__text">{error}</p>
            <button
              type="button"
              className="team-state-box__btn"
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state for batch */}
        {!loading && !error && filteredMembers.length === 0 && (
          <div className="team-state-box">
            <p className="team-state-box__text">
              No members found for Batch {selectedBatch}.
            </p>
          </div>
        )}

        {/* Members grid */}
        {!loading && !error && filteredMembers.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
