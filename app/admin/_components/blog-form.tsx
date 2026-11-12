"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import Markdown from "react-markdown";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

export type BlogFormValues = { title: string; summary: string; content: string; tags: string; published: boolean };

const EMPTY: BlogFormValues = { title: "", summary: "", content: "", tags: "", published: false };

export function BlogForm({
  action,
  defaults = EMPTY,
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: BlogFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);
  const [content, setContent] = useState(defaults.content);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <form onSubmit={onSubmit} className="adm-form" noValidate>
      <FormMessage state={state} />
      <Field label="Title" name="title" state={state}>
        <input name="title" defaultValue={defaults.title} required maxLength={150} />
      </Field>
      <Field label="Summary" name="summary" hint="Optional, one or two lines shown in blog lists" state={state}>
        <input name="summary" defaultValue={defaults.summary} maxLength={300} />
      </Field>

      <div className="adm-field" data-invalid={state.fieldErrors?.content ? "" : undefined}>
        <div className="adm-editor__head">
          <span className="adm-field__label">Content (Markdown)</span>
          <div className="adm-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")}>
              Write
            </button>
            <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>
              Preview
            </button>
          </div>
        </div>
        {/* The textarea stays mounted (hidden in preview) so its value is always submitted. */}
        <textarea
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="adm-editor__input"
          hidden={tab === "preview"}
          aria-label="Content"
        />
        {tab === "preview" && (
          <div className="adm-markdown">{content.trim() ? <Markdown>{content}</Markdown> : <p className="adm-muted">Nothing to preview yet.</p>}</div>
        )}
        {state.fieldErrors?.content && (
          <span className="adm-field__error" role="alert">
            {state.fieldErrors.content[0]}
          </span>
        )}
      </div>

      <Field label="Tags" name="tags" hint="Comma-separated, e.g. dsa, contest, webdev" state={state}>
        <input name="tags" defaultValue={defaults.tags} />
      </Field>
      <label className="adm-check">
        <input type="checkbox" name="published" defaultChecked={defaults.published} />
        <span>Published (visible on the site). Leave unchecked to save as a draft.</span>
      </label>
      <div className="adm-form__actions">
        <Link className="adm-btn adm-btn--ghost" href="/admin/blogs">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
