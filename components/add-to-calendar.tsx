"use client";

import { useEffect, useId, useRef, useState } from "react";

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  registrationUrl: string | null;
  start: string; // ISO
  end: string; // ISO
};

/** 2026-12-06T04:30:00.000Z → 20261206T043000Z */
const utcStamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const details = (event: CalendarEvent) =>
  [event.description, event.registrationUrl && `Register: ${event.registrationUrl}`].filter(Boolean).join("\n\n");

function googleUrl(event: CalendarEvent) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${utcStamp(event.start)}/${utcStamp(event.end)}`,
    details: details(event),
  });
  if (event.location) params.set("location", event.location);
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeIcs = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 characters continue on the next line after a space (RFC 5545). */
const fold = (line: string) => line.match(/.{1,73}/gu)?.join("\r\n ") ?? line;

function icsFile(event: CalendarEvent) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PCON NIT Jamshedpur//Events//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@pcon`,
    `DTSTAMP:${utcStamp(new Date().toISOString())}`,
    `DTSTART:${utcStamp(event.start)}`,
    `DTEND:${utcStamp(event.end)}`,
    `SUMMARY:${escapeIcs(event.title)}`,
    `DESCRIPTION:${escapeIcs(details(event))}`,
    event.location && `LOCATION:${escapeIcs(event.location)}`,
    event.registrationUrl && `URL:${event.registrationUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean) as string[];
  return lines.map(fold).join("\r\n") + "\r\n";
}

const slugify = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "event";

/** "Add to calendar" button with a small menu: Google Calendar, or an .ics file for Apple/Outlook. */
export function AddToCalendar({ event, compact = false }: { event: CalendarEvent; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([icsFile(event)], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${slugify(event.title)}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setOpen(false);
  };

  return (
    <div className={"cal" + (compact ? " cal--compact" : "")} ref={rootRef} data-open={open}>
      <button type="button" className="cal__toggle" aria-expanded={open} aria-controls={menuId} onClick={() => setOpen((v) => !v)}>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="4.5" width="14" height="12.5" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3 8.5h14M7 2.8v3.4M13 2.8v3.4M10 11v4M8 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Add to calendar
      </button>
      <div className="cal__menu" id={menuId} hidden={!open}>
        <a href={googleUrl(event)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          Google Calendar <span aria-hidden="true">↗</span>
        </a>
        <button type="button" onClick={download}>
          Apple / Outlook <small>.ics</small>
        </button>
      </div>
    </div>
  );
}
