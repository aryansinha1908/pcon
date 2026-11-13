"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { addTeamMember, removeTeamMember, setTeamMemberActive, updateTeamMember } from "../_actions/team";
import { PCON_FALLBACK_LOGO } from "@/lib/team";
import type { FormState } from "@/lib/validation";
import { ActionButton } from "./action-button";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

export const STANDARD_SPECIALIZATIONS = [
  "Competitive Programmer",
  "Web Developer",
  "Machine Learning Developer",
  "Android Developer",
  "App Developer",
  "Creative & Content Member",
] as const;

export type TeamRowData = {
  id: string;
  name: string;
  studentId?: string | null;
  email?: string | null;
  photo?: string | null;
  designation?: string | null;
  domain?: string | null;
  specializations?: string[];
  batch: number;
  displayOrder: number;
  github?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  isActive: boolean;
  isAdmin?: boolean;
};

const KNOWN_BATCH_LABELS: Record<number, { tabLabel: string; heading: string; description: string }> = {
  2027: {
    tabLabel: "Current Team (2027)",
    heading: "Current Team — Batch 2027",
    description: "Members in Batch 2027 appear under Batch of 2027 on the public /team page when marked Active.",
  },
  2026: {
    tabLabel: "Inductees (2026)",
    heading: "P-CON Inductees — Batch 2026",
    description: "Members in Batch 2026 appear under Batch of 2026 on the public /team page when marked Active.",
  },
  2025: {
    tabLabel: "Inductees (2025)",
    heading: "P-CON Inductees — Batch 2025",
    description: "Members in Batch 2025 appear under Batch of 2025 on the public /team page when marked Active.",
  },
};

function getBatchMeta(batch: number) {
  if (KNOWN_BATCH_LABELS[batch]) {
    return KNOWN_BATCH_LABELS[batch];
  }
  return {
    tabLabel: `Batch (${batch})`,
    heading: `Team Members — Batch ${batch}`,
    description: `Manage members assigned to Batch ${batch}.`,
  };
}

async function uploadImageFile(file: File): Promise<string> {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WebP are allowed.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File exceeds 5MB limit. Please upload a smaller image.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || "Failed to upload image.");
  }

  return data.url;
}

function MemberAvatar({ photoUrl, name, size = 52 }: { photoUrl?: string | null; name: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photoUrl && !failed);

  return (
    <div
      className="adm-tm-avatar"
      style={{ width: `${size}px`, height: `${size}px` }}
      title={showPhoto ? name : `${name} (Default PCON Logo)`}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={photoUrl}
          className="adm-tm-avatar__img"
          src={photoUrl!}
          alt={name}
          onError={() => setFailed(true)}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="adm-tm-avatar__logo"
          src={PCON_FALLBACK_LOGO}
          alt="PCON Logo"
        />
      )}
    </div>
  );
}

export function TeamAddForm({
  defaultBatch,
  onSuccess,
}: {
  defaultBatch: number;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(addTeamMember, {});
  const keepValuesOnSubmit = useKeepValuesSubmit(formAction);
  const formRef = useRef<HTMLFormElement>(null);
  const [batchValue, setBatchValue] = useState<number>(defaultBatch);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>([]);
  const [customSpec, setCustomSpec] = useState("");

  // Follow the batch tab the admin is on (adjusted during render, not in an effect).
  const [prevDefaultBatch, setPrevDefaultBatch] = useState(defaultBatch);
  if (defaultBatch !== prevDefaultBatch) {
    setPrevDefaultBatch(defaultBatch);
    setBatchValue(defaultBatch);
  }

  // After a successful add, clear the form's own state once per result...
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.ok) {
      setBatchValue(defaultBatch);
      setPhotoUrl("");
      setSelectedSpecs([]);
      setCustomSpec("");
      setUploadError(null);
    }
  }

  // ...and reset the DOM inputs / notify the parent, which are real side effects.
  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onSuccess?.();
    }
  }, [state, onSuccess]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadImageFile(file);
      setPhotoUrl(url);
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Error uploading image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const addCustomSpec = () => {
    const trimmed = customSpec.trim();
    if (trimmed && !selectedSpecs.includes(trimmed)) {
      setSelectedSpecs((prev) => [...prev, trimmed]);
      setCustomSpec("");
    }
  };

  const removeSpec = (spec: string) => {
    setSelectedSpecs((prev) => prev.filter((s) => s !== spec));
  };

  return (
    <form ref={formRef} onSubmit={keepValuesOnSubmit} className="adm-form adm-form--compact" noValidate>
      <FormMessage state={state} />
      {uploadError && <p className="adm-notice adm-notice--error">{uploadError}</p>}

      <div className="adm-tm-section">
        <h3 className="adm-tm-section__title">1. Identity &amp; Batch Assignment</h3>
        <div className="adm-tm-grid-4">
          <Field label="Full Name" name="name" state={state}>
            <input name="name" required placeholder="e.g. Harsh Agrawal" maxLength={80} />
          </Field>
          <Field label="Student ID / Roll No." name="studentId" hint="Unique roll number" state={state}>
            <input name="studentId" placeholder="e.g. 2023UGCS097" maxLength={40} />
          </Field>
          <Field label="Batch Year" name="batch" hint="2018 or later" state={state}>
            <input
              type="number"
              name="batch"
              min={2018}
              max={2100}
              required
              value={batchValue}
              onChange={(e) => setBatchValue(Number(e.target.value) || defaultBatch)}
            />
          </Field>
          <Field label="Display Order" name="displayOrder" hint="Lower shows first" state={state}>
            <input type="number" name="displayOrder" defaultValue={0} min={0} />
          </Field>
        </div>
      </div>

      <div className="adm-tm-section">
        <h3 className="adm-tm-section__title">2. Specializations &amp; Domain</h3>
        <div className="adm-tm-spec-picker">
          {STANDARD_SPECIALIZATIONS.map((spec) => {
            const isSelected = selectedSpecs.includes(spec);
            return (
              <button
                key={spec}
                type="button"
                className="adm-tm-spec-toggle"
                aria-pressed={isSelected}
                onClick={() => toggleSpec(spec)}
              >
                <span>{isSelected ? "✓" : "+"}</span>
                <span>{spec}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          <input
            type="text"
            value={customSpec}
            onChange={(e) => setCustomSpec(e.target.value)}
            placeholder="Add custom specialization..."
            style={{ maxWidth: "260px", padding: "7px 10px", fontSize: "12.5px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomSpec();
              }
            }}
          />
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={addCustomSpec}
          >
            Add Specialization
          </button>
        </div>

        {selectedSpecs.length > 0 && (
          <div className="adm-tm-item__specs">
            <span className="adm-muted" style={{ fontSize: "11.5px", marginRight: "4px" }}>Selected:</span>
            {selectedSpecs.map((spec) => (
              <span key={spec} className="adm-tm-spec-badge">
                {spec}
                <button
                  type="button"
                  onClick={() => removeSpec(spec)}
                  style={{
                    border: "none",
                    background: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: "0 2px",
                    fontWeight: 700,
                  }}
                  title={`Remove ${spec}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <input type="hidden" name="specializations" value={selectedSpecs.join(", ")} />

        <div className="adm-form__row">
          <Field label="Custom Role Label / Designation (Optional)" name="designation" hint="Defaults to specializations if left blank" state={state}>
            <input name="designation" placeholder="e.g. Competitive Programmer" maxLength={80} />
          </Field>
          <Field label="Department / Domain (Optional)" name="domain" state={state}>
            <input name="domain" placeholder="e.g. Web Development" maxLength={80} />
          </Field>
        </div>
      </div>

      <div className="adm-tm-section">
        <h3 className="adm-tm-section__title">3. Profile Photo &amp; Social Links</h3>
        <div className="adm-tm-photo-box">
          <MemberAvatar photoUrl={photoUrl} name="New Member" size={56} />
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 220px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={handleFileUpload}
                style={{ width: "auto", padding: "6px 8px", fontSize: "12px" }}
              />
              {photoUrl && (
                <button
                  type="button"
                  className="adm-btn adm-btn--danger adm-btn--sm"
                  onClick={() => setPhotoUrl("")}
                >
                  Remove Photo
                </button>
              )}
              {uploading && <span style={{ fontSize: "12px", color: "var(--mint)" }}>Uploading image…</span>}
            </div>
            <span className="adm-muted" style={{ fontSize: "11.5px" }}>
              {photoUrl ? "Custom photo active." : "Using official PCON logo as default avatar until a photo is uploaded."}
            </span>
          </div>
          <div style={{ flex: "1 1 240px" }}>
            <input
              name="photo"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="Or paste external image URL (https://...)"
              style={{ fontSize: "12.5px", padding: "8px 10px" }}
            />
          </div>
        </div>

        <div className="adm-tm-grid-4">
          <Field label="Email (Optional)" name="email" state={state}>
            <input type="email" name="email" placeholder="name@nitjsr.ac.in" />
          </Field>
          <Field label="GitHub URL" name="github" state={state}>
            <input type="url" name="github" placeholder="https://github.com/..." />
          </Field>
          <Field label="LinkedIn URL" name="linkedin" state={state}>
            <input type="url" name="linkedin" placeholder="https://linkedin.com/in/..." />
          </Field>
          <Field label="Portfolio URL" name="portfolio" state={state}>
            <input type="url" name="portfolio" placeholder="https://..." />
          </Field>
        </div>
      </div>

      <div className="adm-form__actions">
        <SubmitButton pending={pending} pendingText="Adding Member…">
          Add Member to Batch {batchValue}
        </SubmitButton>
      </div>
    </form>
  );
}

export function TeamRow({ member }: { member: TeamRowData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>(member.photo ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedSpecs, setSelectedSpecs] = useState<string[]>(
    member.specializations && member.specializations.length > 0
      ? member.specializations
      : member.domain
      ? [member.domain]
      : []
  );
  const [customSpec, setCustomSpec] = useState("");

  const update = updateTeamMember.bind(null, member.id);
  const [state, formAction, pending] = useActionState<FormState, FormData>(update, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  // Show the saved photo when the member changes (adjusted during render, not in an effect).
  const [prevPhoto, setPrevPhoto] = useState(member.photo);
  if (member.photo !== prevPhoto) {
    setPrevPhoto(member.photo);
    setPhotoUrl(member.photo ?? "");
  }

  // Close the editor once per successful save.
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.ok) {
      setIsEditing(false);
      setUploadError(null);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const url = await uploadImageFile(file);
      setPhotoUrl(url);
    } catch (err: unknown) {
      console.error(err);
      setUploadError(err instanceof Error ? err.message : "Error uploading image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const toggleSpec = (spec: string) => {
    setSelectedSpecs((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const addCustomSpec = () => {
    const trimmed = customSpec.trim();
    if (trimmed && !selectedSpecs.includes(trimmed)) {
      setSelectedSpecs((prev) => [...prev, trimmed]);
      setCustomSpec("");
    }
  };

  const removeSpec = (spec: string) => {
    setSelectedSpecs((prev) => prev.filter((s) => s !== spec));
  };

  const displaySpecs =
    member.specializations && member.specializations.length > 0
      ? member.specializations
      : member.domain
      ? [member.domain]
      : [];

  return (
    <li className={`adm-tm-item ${isEditing ? "adm-tm-item--editing" : ""}`}>
      <div className="adm-tm-item__summary">
        <div className="adm-tm-item__identity">
          <MemberAvatar photoUrl={photoUrl || member.photo} name={member.name} size={52} />

          <div className="adm-tm-item__info">
            <div className="adm-tm-item__title-row">
              <strong className="adm-tm-item__name">{member.name}</strong>
              {member.studentId && <span className="adm-tm-item__roll">{member.studentId}</span>}
              <span className="adm-tm-item__meta">
                Batch {member.batch} · #{member.displayOrder}
              </span>
            </div>

            <div className="adm-tm-item__specs">
              {displaySpecs.length > 0 ? (
                displaySpecs.map((spec) => (
                  <span key={spec} className="adm-tm-spec-badge">
                    {spec}
                  </span>
                ))
              ) : member.designation ? (
                <span className="adm-muted" style={{ fontSize: "12px" }}>{member.designation}</span>
              ) : (
                <span className="adm-muted" style={{ fontSize: "12px" }}>No specialization assigned</span>
              )}

              {(member.github || member.linkedin || member.portfolio) && (
                <span className="adm-muted" style={{ fontSize: "11px", marginLeft: "4px" }}>
                  {[
                    member.github ? "GitHub" : null,
                    member.linkedin ? "LinkedIn" : null,
                    member.portfolio ? "Portfolio" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="adm-tm-item__controls">
          <span
            className={`adm-badge ${member.isActive ? "adm-badge--upcoming" : "adm-badge--past"}`}
            style={{ margin: 0 }}
          >
            {member.isActive ? "Active" : "Inactive"}
          </span>
          {member.isAdmin && (
            <span className="adm-badge" style={{ margin: 0 }}>
              Admin
            </span>
          )}

          <button
            type="button"
            className={`adm-btn adm-btn--sm ${isEditing ? "adm-btn--primary" : "adm-btn--ghost"}`}
            onClick={() => setIsEditing((v) => !v)}
          >
            {isEditing ? "Close Editor" : "Edit"}
          </button>

          {member.isActive ? (
            <ActionButton action={setTeamMemberActive.bind(null, member.id, false)}>Deactivate</ActionButton>
          ) : (
            <ActionButton action={setTeamMemberActive.bind(null, member.id, true)}>Activate</ActionButton>
          )}

          <ActionButton
            variant="danger"
            confirmText={`Delete ${member.name}${member.studentId ? ` (${member.studentId})` : ""} from Batch ${member.batch}?`}
            action={removeTeamMember.bind(null, member.id)}
          >
            Delete
          </ActionButton>
        </div>
      </div>

      {!isEditing && (state.error || state.fieldErrors || state.ok) && (
        <div style={{ padding: "0 20px 14px" }}>
          <FormMessage state={state} />
        </div>
      )}

      {isEditing && (
        <form onSubmit={onSubmit} className="adm-tm-drawer" noValidate>
          <FormMessage state={state} />
          {uploadError && <p className="adm-notice adm-notice--error">{uploadError}</p>}

          <div className="adm-tm-section">
            <h4 className="adm-tm-section__title">Identity &amp; Batch</h4>
            <div className="adm-tm-grid-4">
              <div className="adm-field">
                <span className="adm-field__label">Full Name</span>
                <input name="name" defaultValue={member.name} required />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Student ID / Roll No.</span>
                <input name="studentId" defaultValue={member.studentId ?? ""} placeholder="e.g. 2023UGCS097" />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Batch Year (Min 2018)</span>
                <input name="batch" type="number" min={2018} max={2100} defaultValue={member.batch} required />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Display Order</span>
                <input name="displayOrder" type="number" defaultValue={member.displayOrder} />
              </div>
            </div>
          </div>

          <div className="adm-tm-section">
            <h4 className="adm-tm-section__title">Specializations</h4>
            <div className="adm-tm-spec-picker">
              {STANDARD_SPECIALIZATIONS.map((spec) => {
                const isSelected = selectedSpecs.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    className="adm-tm-spec-toggle"
                    aria-pressed={isSelected}
                    onClick={() => toggleSpec(spec)}
                  >
                    <span>{isSelected ? "✓" : "+"}</span>
                    <span>{spec}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                value={customSpec}
                onChange={(e) => setCustomSpec(e.target.value)}
                placeholder="Add custom specialization..."
                style={{ maxWidth: "240px", padding: "7px 10px", fontSize: "12.5px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomSpec();
                  }
                }}
              />
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={addCustomSpec}
              >
                Add
              </button>
            </div>

            {selectedSpecs.length > 0 && (
              <div className="adm-tm-item__specs">
                {selectedSpecs.map((spec) => (
                  <span key={spec} className="adm-tm-spec-badge">
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpec(spec)}
                      style={{
                        border: "none",
                        background: "none",
                        color: "inherit",
                        cursor: "pointer",
                        padding: "0 2px",
                        fontWeight: 700,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            <input type="hidden" name="specializations" value={selectedSpecs.join(", ")} />
          </div>

          <div className="adm-tm-section">
            <h4 className="adm-tm-section__title">Profile Photo</h4>
            <div className="adm-tm-photo-box">
              <MemberAvatar photoUrl={photoUrl} name={member.name} size={48} />
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", flex: "1 1 200px" }}>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploading}
                  onChange={handleFileUpload}
                  style={{ width: "auto", padding: "6px 8px", fontSize: "12px" }}
                />
                {photoUrl ? (
                  <button
                    type="button"
                    className="adm-btn adm-btn--danger adm-btn--sm"
                    onClick={() => setPhotoUrl("")}
                  >
                    Remove Photo
                  </button>
                ) : (
                  <span className="adm-muted" style={{ fontSize: "11.5px" }}>
                    Default PCON logo active
                  </span>
                )}
                {uploading && <span style={{ fontSize: "12px", color: "var(--mint)" }}>Uploading…</span>}
              </div>
              <div style={{ flex: "1 1 220px" }}>
                <input
                  name="photo"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Or paste photo URL"
                  style={{ fontSize: "12.5px", padding: "7px 10px" }}
                />
              </div>
            </div>
          </div>

          <div className="adm-tm-section">
            <h4 className="adm-tm-section__title">Role Overrides &amp; Social Links</h4>
            <div className="adm-tm-grid-3">
              <div className="adm-field">
                <span className="adm-field__label">Designation</span>
                <input name="designation" defaultValue={member.designation ?? ""} />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Domain</span>
                <input name="domain" defaultValue={member.domain ?? ""} />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Email</span>
                <input name="email" defaultValue={member.email ?? ""} placeholder="name@nitjsr.ac.in" />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">GitHub</span>
                <input name="github" defaultValue={member.github ?? ""} placeholder="https://github.com/..." />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">LinkedIn</span>
                <input name="linkedin" defaultValue={member.linkedin ?? ""} placeholder="https://linkedin.com/in/..." />
              </div>
              <div className="adm-field">
                <span className="adm-field__label">Portfolio</span>
                <input name="portfolio" defaultValue={member.portfolio ?? ""} placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className="adm-form__actions">
            <button
              type="button"
              className="adm-btn adm-btn--ghost adm-btn--sm"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
            <SubmitButton pending={pending} pendingText="Saving…">
              Save Member Details
            </SubmitButton>
          </div>
        </form>
      )}
    </li>
  );
}

export function TeamManagementPanel({ members }: { members: TeamRowData[] }) {
  // Always surface the three primary batches (2027, 2026, 2025) in order, plus any additional batches in DB
  const availableBatches = useMemo(() => {
    const core = [2027, 2026, 2025];
    const extra = Array.from(new Set(members.map((m) => m.batch)))
      .filter((b) => !core.includes(b))
      .sort((a, b) => b - a);
    return [...core, ...extra];
  }, [members]);

  const [selectedBatch, setSelectedBatch] = useState<number>(2027);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [specFilter, setSpecFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const batchMembers = useMemo(
    () => members.filter((m) => m.batch === selectedBatch),
    [members, selectedBatch]
  );

  // Collect all unique specializations available in the selected batch
  const batchSpecializations = useMemo(() => {
    const specs = new Set<string>();
    for (const m of batchMembers) {
      if (m.specializations && m.specializations.length > 0) {
        m.specializations.forEach((s) => specs.add(s));
      } else if (m.domain) {
        specs.add(m.domain);
      }
    }
    return Array.from(specs);
  }, [batchMembers]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return batchMembers.filter((m) => {
      if (statusFilter === "ACTIVE" && !m.isActive) return false;
      if (statusFilter === "INACTIVE" && m.isActive) return false;

      if (specFilter !== "ALL") {
        const memberSpecs =
          m.specializations && m.specializations.length > 0
            ? m.specializations
            : m.domain
            ? [m.domain]
            : [];
        if (!memberSpecs.includes(specFilter)) return false;
      }

      if (q) {
        const matchName = m.name.toLowerCase().includes(q);
        const matchRoll = (m.studentId ?? "").toLowerCase().includes(q);
        const matchEmail = (m.email ?? "").toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchEmail) return false;
      }

      return true;
    });
  }, [batchMembers, searchQuery, specFilter, statusFilter]);

  const activeMeta = getBatchMeta(selectedBatch);
  const activeCountInBatch = batchMembers.filter((m) => m.isActive).length;

  const handleSelectBatch = (batch: number) => {
    setSelectedBatch(batch);
    setSpecFilter("ALL");
    setSearchQuery("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      {/* Batch Selector Bar */}
      <div className="adm-tm-bar">
        <div className="adm-tm-tabs" role="tablist" aria-label="Select team batch">
          {availableBatches.map((batch) => {
            const count = members.filter((m) => m.batch === batch).length;
            const meta = getBatchMeta(batch);
            const isSelected = batch === selectedBatch;
            return (
              <button
                key={batch}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className="adm-tm-tab"
                onClick={() => handleSelectBatch(batch)}
              >
                <span>{meta.tabLabel}</span>
                <span className="adm-tm-tab__count">{count}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`adm-btn ${showAddForm ? "adm-btn--ghost" : "adm-btn--primary"}`}
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          {showAddForm ? "Close Add Form" : `+ Add Member to Batch ${selectedBatch}`}
        </button>
      </div>

      {/* Collapsible Add Member Form */}
      {showAddForm && (
        <section className="adm-card" style={{ borderColor: "rgb(112 227 199 / 40%)" }}>
          <div className="adm-card__head">
            <div>
              <h2>Add Member — {activeMeta.heading}</h2>
              <p className="adm-muted" style={{ margin: "4px 0 0", fontSize: "12.5px" }}>
                Add a new member to Batch {selectedBatch} (or change the batch year below).
              </p>
            </div>
            <button
              type="button"
              className="adm-btn adm-btn--ghost adm-btn--sm"
              onClick={() => setShowAddForm(false)}
            >
              Close
            </button>
          </div>
          <TeamAddForm defaultBatch={selectedBatch} onSuccess={() => setShowAddForm(false)} />
        </section>
      )}

      {/* Search & Filter Toolbar */}
      <div className="adm-tm-toolbar">
        <div className="adm-tm-search">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeMeta.tabLabel} by name or student ID...`}
            aria-label="Search members by name or student ID"
          />
          {searchQuery && (
            <button
              type="button"
              className="adm-tm-search__clear"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <select
          className="adm-select"
          style={{ width: "100%", minHeight: "40px" }}
          value={specFilter}
          onChange={(e) => setSpecFilter(e.target.value)}
          aria-label="Filter by specialization"
        >
          <option value="ALL">All Specializations ({batchMembers.length})</option>
          {batchSpecializations.map((spec) => {
            const count = batchMembers.filter((m) =>
              m.specializations && m.specializations.length > 0
                ? m.specializations.includes(spec)
                : m.domain === spec
            ).length;
            return (
              <option key={spec} value={spec}>
                {spec} ({count})
              </option>
            );
          })}
        </select>

        <div className="adm-tm-status-pills" role="group" aria-label="Filter by active status">
          <button
            type="button"
            className="adm-tm-status-pill"
            aria-pressed={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          >
            All ({batchMembers.length})
          </button>
          <button
            type="button"
            className="adm-tm-status-pill"
            aria-pressed={statusFilter === "ACTIVE"}
            onClick={() => setStatusFilter("ACTIVE")}
          >
            Active ({activeCountInBatch})
          </button>
          <button
            type="button"
            className="adm-tm-status-pill"
            aria-pressed={statusFilter === "INACTIVE"}
            onClick={() => setStatusFilter("INACTIVE")}
          >
            Inactive ({batchMembers.length - activeCountInBatch})
          </button>
        </div>
      </div>

      {/* Selected Batch Roster Card */}
      <section className="adm-card" style={{ gap: "16px" }}>
        <div className="adm-card__head" style={{ flexWrap: "wrap" }}>
          <div>
            <h2>{activeMeta.heading}</h2>
            <p className="adm-muted" style={{ margin: "4px 0 0", fontSize: "12.5px" }}>
              {activeMeta.description}
            </p>
          </div>
          <span className="adm-muted" style={{ fontFamily: "var(--mono)", fontSize: "12px" }}>
            Showing {filteredMembers.length} of {batchMembers.length} members
          </span>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="adm-empty">
            <p>
              {batchMembers.length === 0
                ? `No members in Batch ${selectedBatch} yet.`
                : "No members match the current search or filter criteria."}
            </p>
            {(searchQuery || specFilter !== "ALL" || statusFilter !== "ALL") && (
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => {
                  setSearchQuery("");
                  setSpecFilter("ALL");
                  setStatusFilter("ALL");
                }}
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <ul className="adm-tm-list">
            {filteredMembers.map((member) => (
              <TeamRow key={member.id} member={member} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
