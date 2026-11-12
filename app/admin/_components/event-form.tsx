"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

export type EventFormValues = {
  title: string;
  description: string;
  location: string;
  posterUrl: string;
  registrationUrl: string;
  startDate: string; // datetime-local value, IST
  endDate: string;
};

const EMPTY: EventFormValues = {
  title: "",
  description: "",
  location: "",
  posterUrl: "",
  registrationUrl: "",
  startDate: "",
  endDate: "",
};

export function EventForm({
  action,
  defaults = EMPTY,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: EventFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  return (
    <form onSubmit={onSubmit} className="adm-form" noValidate>
      <FormMessage state={state} />
      <Field label="Title" name="title" state={state}>
        <input name="title" defaultValue={defaults.title} required maxLength={120} />
      </Field>
      <Field label="Description" name="description" state={state}>
        <textarea name="description" defaultValue={defaults.description} rows={6} required />
      </Field>
      <div className="adm-form__row">
        <Field label="Starts (IST)" name="startDate" state={state}>
          <input type="datetime-local" name="startDate" defaultValue={defaults.startDate} required />
        </Field>
        <Field label="Ends (IST)" name="endDate" state={state}>
          <input type="datetime-local" name="endDate" defaultValue={defaults.endDate} required />
        </Field>
      </div>
      <Field label="Location" name="location" hint="Optional, e.g. CSE Lab 3 or Online" state={state}>
        <input name="location" defaultValue={defaults.location} maxLength={120} />
      </Field>
      <div className="adm-form__row">
        <Field label="Poster image link" name="posterUrl" hint="Optional https:// link" state={state}>
          <input type="url" name="posterUrl" defaultValue={defaults.posterUrl} placeholder="https://" />
        </Field>
        <Field label="Registration link" name="registrationUrl" hint="Optional https:// link" state={state}>
          <input type="url" name="registrationUrl" defaultValue={defaults.registrationUrl} placeholder="https://" />
        </Field>
      </div>
      <div className="adm-form__actions">
        <Link className="adm-btn adm-btn--ghost" href="/admin/events">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
