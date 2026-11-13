"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FAME_KINDS, RANKS } from "@/lib/achievement-options";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

type PlaceValues = { name: string; roll: string; team: string };

export type FameFormValues = {
  event: string;
  date: string; // YYYY-MM-DD
  kind: string;
  summary: string;
  link: string;
  places: Record<1 | 2 | 3, PlaceValues>;
  /** One per line: Name | Roll | Award */
  mentions: string;
};

const NO_PLACE: PlaceValues = { name: "", roll: "", team: "" };
const EMPTY: FameFormValues = {
  event: "",
  date: "",
  kind: "Contest",
  summary: "",
  link: "",
  places: { 1: NO_PLACE, 2: NO_PLACE, 3: NO_PLACE },
  mentions: "",
};

const PLACE_LABEL = { 1: "1st place", 2: "2nd place", 3: "3rd place" } as const;

export function FameForm({
  action,
  defaults = EMPTY,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: FameFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  return (
    <form onSubmit={onSubmit} className="adm-form" noValidate>
      <FormMessage state={state} />
      <Field label="Event" name="event" hint="e.g. HACKSPHERE'26" state={state}>
        <input name="event" defaultValue={defaults.event} required maxLength={140} />
      </Field>
      <div className="adm-form__row">
        <Field label="Held on" name="date" state={state}>
          <input type="date" name="date" defaultValue={defaults.date} required />
        </Field>
        <Field label="Type" name="kind" state={state}>
          <select name="kind" defaultValue={defaults.kind} className="adm-select adm-select--block">
            {FAME_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Summary" name="summary" hint="Optional, a sentence or two about the event" state={state}>
        <textarea name="summary" defaultValue={defaults.summary} rows={3} maxLength={400} />
      </Field>
      <Field label="Results link" name="link" hint="Optional https:// link to the results post or standings" state={state}>
        <input type="url" name="link" defaultValue={defaults.link} placeholder="https://" />
      </Field>

      {RANKS.map((rank) => (
        <fieldset className={`adm-fieldset adm-fieldset--${rank}`} key={rank}>
          <legend>{PLACE_LABEL[rank]}{rank > 1 && <span className="adm-muted"> (optional)</span>}</legend>
          <div className="adm-form__row adm-form__row--3">
            <Field label="Name (or team name)" name={`place${rank}_name`} state={state}>
              <input name={`place${rank}_name`} defaultValue={defaults.places[rank].name} maxLength={80} />
            </Field>
            <Field label="Roll number" name={`place${rank}_roll`} hint="Optional, e.g. 2025UGCS010" state={state}>
              <input name={`place${rank}_roll`} defaultValue={defaults.places[rank].roll} maxLength={16} />
            </Field>
            <Field label="Team members" name={`place${rank}_team`} hint="Optional, comma-separated" state={state}>
              <input name={`place${rank}_team`} defaultValue={defaults.places[rank].team} />
            </Field>
          </div>
        </fieldset>
      ))}

      <Field
        label="Special mentions"
        name="mentions"
        hint="Optional. One per line: Name | Roll number | Award, e.g. Raushan Kumar | 2025UGMM037 | Best UI/UX"
        state={state}
      >
        <textarea name="mentions" defaultValue={defaults.mentions} rows={4} className="adm-mono" />
      </Field>
      <div className="adm-form__actions">
        <Link className="adm-btn adm-btn--ghost" href="/admin/hall-of-fame">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
