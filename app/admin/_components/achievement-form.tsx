"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ACHIEVEMENT_KINDS, ACHIEVEMENT_TIERS } from "@/lib/achievement-options";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";
import { ImageField } from "./image-field";

export type AchievementFormValues = {
  title: string;
  organiser: string;
  year: string;
  dates: string;
  kind: string;
  result: string;
  tier: string;
  highlight: string;
  imageUrl: string;
  imageAlt: string;
  featured: boolean;
};

const EMPTY: AchievementFormValues = {
  title: "",
  organiser: "",
  year: String(new Date().getFullYear()),
  dates: "",
  kind: "Hackathon",
  result: "",
  tier: "winner",
  highlight: "",
  imageUrl: "",
  imageAlt: "",
  featured: false,
};

export function AchievementForm({
  action,
  defaults = EMPTY,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: AchievementFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  return (
    <form onSubmit={onSubmit} className="adm-form" noValidate>
      <FormMessage state={state} />
      <Field label="Competition" name="title" hint="e.g. ICPC Asia Kanpur Regional 2025" state={state}>
        <input name="title" defaultValue={defaults.title} required maxLength={140} />
      </Field>
      <div className="adm-form__row">
        <Field label="Organised by" name="organiser" hint="e.g. JPMorgan Chase, ISRO" state={state}>
          <input name="organiser" defaultValue={defaults.organiser} required maxLength={120} />
        </Field>
        <Field label="Type" name="kind" state={state}>
          <select name="kind" defaultValue={defaults.kind} className="adm-select adm-select--block">
            {ACHIEVEMENT_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Field>
      </div>
      <div className="adm-form__row">
        <Field label="Year" name="year" state={state}>
          <input type="number" name="year" defaultValue={defaults.year} min={2017} required />
        </Field>
        <Field label="Dates" name="dates" hint="Optional, e.g. 22–23 Dec 2025" state={state}>
          <input name="dates" defaultValue={defaults.dates} maxLength={60} />
        </Field>
      </div>
      <div className="adm-form__row">
        <Field label="Result" name="result" hint="Short badge text, e.g. Winner, Runner-up, Rank 54" state={state}>
          <input name="result" defaultValue={defaults.result} required maxLength={40} />
        </Field>
        <Field label="Badge colour" name="tier" state={state}>
          <select name="tier" defaultValue={defaults.tier} className="adm-select adm-select--block">
            {ACHIEVEMENT_TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Highlight" name="highlight" hint="Optional one-liner, e.g. 1st among all NITs" state={state}>
        <input name="highlight" defaultValue={defaults.highlight} maxLength={120} />
      </Field>
      <ImageField name="imageUrl" label="Photo" defaultValue={defaults.imageUrl} hint="Optional. Upload or paste a link." state={state} />
      <Field label="Photo description" name="imageAlt" hint="For screen readers, e.g. The team holding the trophy on stage" state={state}>
        <input name="imageAlt" defaultValue={defaults.imageAlt} maxLength={200} />
      </Field>
      <label className="adm-check">
        <input type="checkbox" name="featured" defaultChecked={defaults.featured} />
        Spotlight this one at the top of the page (replaces the current spotlight)
      </label>
      <div className="adm-form__actions">
        <Link className="adm-btn adm-btn--ghost" href="/admin/achievements">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
