"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addTeamMember, removeTeamMember, setTeamMemberActive, updateTeamMember } from "../_actions/team";
import type { FormState } from "@/lib/validation";
import { ActionButton } from "./action-button";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

export function TeamAddForm({ defaultBatch }: { defaultBatch: number }) {
  const [state, formAction, pending] = useActionState(addTeamMember, {});
  const keepValuesOnSubmit = useKeepValuesSubmit(formAction);
  const formRef = useRef<HTMLFormElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setUploadError(null);
    keepValuesOnSubmit(event);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (photoInputRef.current) photoInputRef.current.value = data.url;
      } else {
        setUploadError(data.error || "Upload failed.");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Network error while uploading image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} className="adm-form adm-form--compact" noValidate>
      <FormMessage state={state} />
      {uploadError && <p className="adm-error">{uploadError}</p>}

      <div className="adm-form__row adm-form__row--4">
        <Field label="Full Name" name="name" state={state}>
          <input name="name" required placeholder="Aarav Sharma" maxLength={80} />
        </Field>
        <Field label="Batch Year" name="batch" state={state}>
          <input type="number" name="batch" required defaultValue={defaultBatch} />
        </Field>
        <Field label="Designation / Role" name="designation" state={state}>
          <input name="designation" placeholder="App Development Lead" maxLength={80} />
        </Field>
        <Field label="Domain / Department" name="domain" state={state}>
          <input name="domain" placeholder="App Development" maxLength={80} />
        </Field>
      </div>

      <div className="adm-form__row adm-form__row--3">
        <Field label="Photo URL" name="photo" hint="Paste URL or choose a file below" state={state}>
          <input
            name="photo"
            ref={photoInputRef}
            placeholder="https://..."
          />
        </Field>
        <div className="adm-field">
          <label className="adm-label">Upload Photograph</label>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={handleFileUpload}
            style={{ fontSize: "12px", padding: "6px" }}
          />
          {uploading && <span className="adm-muted" style={{ fontSize: "11px" }}>Uploading…</span>}
        </div>
        <Field label="Display Order" name="displayOrder" hint="Lower appears first" state={state}>
          <input type="number" name="displayOrder" defaultValue={0} min={0} />
        </Field>
      </div>

      <div className="adm-form__row adm-form__row--4">
        <Field label="GitHub URL" name="github" state={state}>
          <input type="url" name="github" placeholder="https://github.com/..." />
        </Field>
        <Field label="LinkedIn URL" name="linkedin" state={state}>
          <input type="url" name="linkedin" placeholder="https://linkedin.com/in/..." />
        </Field>
        <Field label="Portfolio URL" name="portfolio" state={state}>
          <input type="url" name="portfolio" placeholder="https://..." />
        </Field>
        <Field label="Email (Optional)" name="email" state={state}>
          <input type="email" name="email" placeholder="name@nitjsr.ac.in" />
        </Field>
      </div>

      <div className="adm-form__actions">
        <SubmitButton pending={pending} pendingText="Adding…">
          Add Member
        </SubmitButton>
      </div>
    </form>
  );
}

export type TeamRowData = {
  id: string;
  name: string;
  email?: string | null;
  photo?: string | null;
  designation?: string | null;
  domain?: string | null;
  batch: number;
  displayOrder: number;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  isActive: boolean;
  isAdmin?: boolean;
};

export function TeamRow({ member }: { member: TeamRowData }) {
  const update = updateTeamMember.bind(null, member.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(update, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  return (
    <li className="adm-team-row" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px", borderBottom: "1px solid var(--adm-line)" }}>
      <div className="adm-team-row__who" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {member.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo}
              alt=""
              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }}
            />
          )}
          <div>
            <strong>{member.name}</strong>
            <span className="adm-muted" style={{ marginLeft: "8px", fontSize: "12px" }}>
              {member.designation || member.domain || `Batch ${member.batch}`}
            </span>
            {member.email && <span className="adm-muted" style={{ marginLeft: "8px", fontSize: "11px" }}>({member.email})</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className={`adm-badge ${member.isActive ? "" : "adm-badge--dim"}`} style={{ fontSize: "10px", padding: "2px 6px" }}>
            {member.isActive ? "Active" : "Inactive"}
          </span>
          {member.isAdmin && <span className="adm-badge" style={{ fontSize: "10px" }}>Admin</span>}
        </div>
      </div>

      <form onSubmit={onSubmit} className="adm-team-row__edit" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }} noValidate>
        <input name="name" defaultValue={member.name} aria-label="Name" placeholder="Name" style={{ width: "130px" }} />
        <input name="designation" defaultValue={member.designation ?? ""} aria-label="Designation" placeholder="Designation" style={{ width: "140px" }} />
        <input name="domain" defaultValue={member.domain ?? ""} aria-label="Domain" placeholder="Domain" style={{ width: "120px" }} />
        <input name="batch" type="number" defaultValue={member.batch} aria-label="Batch" className="adm-input--narrow" title="Batch year" />
        <input name="displayOrder" type="number" defaultValue={member.displayOrder} aria-label="Order" placeholder="Order" title="Display order" className="adm-input--narrow" />
        <input name="photo" defaultValue={member.photo ?? ""} aria-label="Photo URL" placeholder="Photo URL" style={{ width: "140px" }} />
        <input name="github" defaultValue={member.github ?? ""} aria-label="GitHub URL" placeholder="GitHub" style={{ width: "110px" }} />
        <input name="linkedin" defaultValue={member.linkedin ?? ""} aria-label="LinkedIn URL" placeholder="LinkedIn" style={{ width: "110px" }} />
        <input name="portfolio" defaultValue={member.portfolio ?? ""} aria-label="Portfolio URL" placeholder="Portfolio" style={{ width: "110px" }} />
        <SubmitButton pending={pending}>Save</SubmitButton>
      </form>

      <div className="adm-team-row__actions" style={{ display: "flex", gap: "8px", alignSelf: "flex-end" }}>
        {member.isActive ? (
          <ActionButton action={setTeamMemberActive.bind(null, member.id, false)}>Deactivate</ActionButton>
        ) : (
          <ActionButton action={setTeamMemberActive.bind(null, member.id, true)}>Activate</ActionButton>
        )}
        <ActionButton
          variant="danger"
          confirmText={`Delete ${member.name} from the team?`}
          action={removeTeamMember.bind(null, member.id)}
        >
          Delete
        </ActionButton>
      </div>

      {(state.error || state.fieldErrors || state.ok) && (
        <div className="adm-team-row__msg">
          <FormMessage state={state} />
        </div>
      )}
    </li>
  );
}
