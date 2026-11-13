"use client";

import { useState } from "react";
import type { FormState } from "@/lib/validation";
import { Field } from "./form-bits";

/**
 * An image link input with an "Upload" button (via /api/admin/upload, which
 * stores on Cloudinary when configured, otherwise in public/uploads) and a
 * small preview. Submits as a plain text field named `name`.
 */
export function ImageField({ name, label, defaultValue = "", hint, state }: { name: string; label: string; defaultValue?: string; hint?: string; state?: FormState }) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed.");
      setUrl(json.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="adm-image-field">
      <Field label={label} name={name} hint={error ? undefined : hint} state={state}>
        <input name={name} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://… or /achievements/photo.jpg" />
      </Field>
      <div className="adm-image-field__side">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary admin-entered URL
          <img className="adm-image-field__preview" src={url} alt="" />
        ) : (
          <span className="adm-image-field__preview adm-image-field__preview--empty">No image</span>
        )}
        <label className="adm-btn adm-btn--ghost adm-btn--sm">
          {uploading ? "Uploading…" : "Upload"}
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading} hidden />
        </label>
        {url && (
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setUrl("")}>
            Remove
          </button>
        )}
      </div>
      {error && <span className="adm-field__error" role="alert">{error}</span>}
    </div>
  );
}
