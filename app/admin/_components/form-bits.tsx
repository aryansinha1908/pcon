"use client";

import { startTransition } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/validation";

export function Field({
  label,
  name,
  hint,
  state,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  state?: FormState;
  children: React.ReactNode;
}) {
  const errors = state?.fieldErrors?.[name];
  return (
    <label className="adm-field" data-invalid={errors ? "" : undefined}>
      <span className="adm-field__label">{label}</span>
      {children}
      {errors ? (
        <span className="adm-field__error" role="alert">
          {errors[0]}
        </span>
      ) : hint ? (
        <span className="adm-field__hint">{hint}</span>
      ) : null}
    </label>
  );
}

/**
 * React 19 resets uncontrolled fields after a <form action={...}> runs, which
 * would wipe what the admin typed whenever validation fails. Submitting through
 * onSubmit keeps the values.
 */
export function useKeepValuesSubmit(formAction: (formData: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  };
}

export function SubmitButton({
  children,
  pending: pendingProp,
  pendingText = "Saving…",
}: {
  children: React.ReactNode;
  pending?: boolean;
  pendingText?: string;
}) {
  const { pending: formPending } = useFormStatus();
  const pending = pendingProp ?? formPending;
  return (
    <button className="adm-btn adm-btn--primary" type="submit" disabled={pending}>
      {pending ? pendingText : children}
    </button>
  );
}

export function FormMessage({ state }: { state?: FormState }) {
  if (state?.error) return <p className="adm-notice adm-notice--error" role="alert">{state.error}</p>;
  if (state?.ok) return <p className="adm-notice adm-notice--ok" role="status">{state.ok}</p>;
  if (state?.fieldErrors) return <p className="adm-notice adm-notice--error" role="alert">Fix the highlighted fields.</p>;
  return null;
}
