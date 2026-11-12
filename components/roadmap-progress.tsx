"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Per-browser roadmap progress: a list of completed step ids in localStorage.
 *
 * Uses useSyncExternalStore so the server render (and hydration) always sees
 * "nothing done" and the saved state appears right after, with no hydration
 * mismatch. Storage can be unavailable (private mode, blocked site data), so
 * every access is guarded and an in-memory copy keeps the page working.
 */

const STORAGE_KEY = "pcon:roadmap-progress:v1";
const EMPTY = "[]";
const listeners = new Set<() => void>();
let snapshot: string | null = null;

function readStorage(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot() {
  if (snapshot === null) snapshot = readStorage();
  return snapshot;
}

function getServerSnapshot() {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = null; // another tab changed progress
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function writeIds(ids: Set<string>) {
  snapshot = JSON.stringify([...ids]);
  try {
    window.localStorage.setItem(STORAGE_KEY, snapshot);
  } catch {
    // Keep the in-memory copy so the page still works for this visit.
  }
  listeners.forEach((listener) => listener());
}

function parse(raw: string): Set<string> {
  try {
    const value: unknown = JSON.parse(raw);
    return new Set(Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set();
  }
}

function useProgress() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const done = useMemo(() => parse(raw), [raw]);

  const toggle = useCallback((id: string, value: boolean) => {
    const next = parse(getSnapshot());
    if (value) next.add(id);
    else next.delete(id);
    writeIds(next);
  }, []);

  const reset = useCallback((ids: string[]) => {
    const next = parse(getSnapshot());
    ids.forEach((id) => next.delete(id));
    writeIds(next);
  }, []);

  return { done, toggle, reset };
}

export function StepCheck({ id, title }: { id: string; title: string }) {
  const { done, toggle } = useProgress();
  const checked = done.has(id);
  return (
    <label className="step-check">
      <input type="checkbox" checked={checked} onChange={(event) => toggle(id, event.target.checked)} />
      <span className="step-check__box" aria-hidden="true">
        <svg viewBox="0 0 16 16" fill="none"><path d="m3.5 8.5 3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
      <span className="step-check__text">{checked ? "Done" : "Mark done"}</span>
      <span className="sr-only"> — {title}</span>
    </label>
  );
}

export function TrackProgress({ ids, label, resettable = false }: { ids: string[]; label: string; resettable?: boolean }) {
  const { done, reset } = useProgress();
  const count = ids.filter((id) => done.has(id)).length;
  const percent = ids.length ? Math.round((count / ids.length) * 100) : 0;

  return (
    <div className="track-progress" data-complete={count === ids.length && ids.length > 0}>
      <div className="track-progress__meta">
        <span>{count} / {ids.length} done</span>
        {resettable && count > 0 && (
          <button type="button" className="track-progress__reset" onClick={() => reset(ids)}>Reset</button>
        )}
      </div>
      <div
        className="track-progress__bar"
        role="progressbar"
        aria-label={`${label} progress`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
