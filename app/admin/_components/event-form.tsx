"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
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

  // Poster upload (Cloudinary via /api/admin/upload, with local fallback)
  const [posterUrl, setPosterUrl] = useState(defaults.posterUrl || "");
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const posterFileInputRef = useRef<HTMLInputElement>(null);

  async function handlePosterFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPoster(true);
    setUploadError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setPosterUrl(json.url);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setIsUploadingPoster(false);
    }
  }

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

      {/* Poster Image Upload & URL */}
      <div className="adm-field">
        <label className="adm-field__label">Poster image</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            name="posterUrl"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="Paste image URL (or upload a file)"
            style={{ flex: 1 }}
          />
          <input
            type="file"
            ref={posterFileInputRef}
            style={{ display: "none" }}
            accept="image/png,image/jpeg,image/webp"
            onChange={handlePosterFileChange}
          />
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => posterFileInputRef.current?.click()}
            disabled={isUploadingPoster}
          >
            {isUploadingPoster ? "Uploading..." : "Upload Image"}
          </button>
          {posterUrl && (
            <button
              type="button"
              className="adm-btn adm-btn--danger adm-btn--sm"
              onClick={() => setPosterUrl("")}
            >
              Remove
            </button>
          )}
        </div>
        {uploadError && <span className="adm-field__error">{uploadError}</span>}
        {state.fieldErrors?.posterUrl && (
          <span className="adm-field__error" role="alert">{state.fieldErrors.posterUrl[0]}</span>
        )}
        <span className="adm-field__hint">Optional. JPG, PNG or WebP, up to 5MB.</span>

        {/* Poster Preview */}
        {posterUrl && (
          <div style={{ marginTop: "10px", width: "100%", maxWidth: "340px", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--adm-line-strong)", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl} alt="Poster preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>

      <Field label="Registration link" name="registrationUrl" hint="Optional https:// link" state={state}>
        <input type="url" name="registrationUrl" defaultValue={defaults.registrationUrl} placeholder="https://" />
      </Field>
      <div className="adm-form__actions">
        <Link className="adm-btn adm-btn--ghost" href="/admin/events">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}