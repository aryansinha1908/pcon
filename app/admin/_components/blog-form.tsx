"use client";

import Link from "next/link";
import { useActionState, useState, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { FormState } from "@/lib/validation";
import { Field, FormMessage, SubmitButton, useKeepValuesSubmit } from "./form-bits";

export type BlogFormValues = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  categoryId: number;
  authorId: number;
  status: "draft" | "published";
  isFeatured: boolean;
};

const EMPTY: BlogFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImageUrl: "",
  coverImageAlt: "",
  categoryId: 1,
  authorId: 1,
  status: "draft",
  isFeatured: false,
};

type CategoryOption = { id: number; name: string; slug: string; hue: number };
type AuthorOption = { id: number; name: string; roleTitle: string; bio: string; avatarUrl: string | null };

export function BlogForm({
  action,
  defaults: initialDefaults,
  categories: initialCategories = [],
  authors: initialAuthors = [],
  submitLabel,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  defaults?: Partial<BlogFormValues>;
  categories: CategoryOption[];
  authors: AuthorOption[];
  submitLabel: string;
}) {
  const defaults = { ...EMPTY, ...initialDefaults };
  const [state, formAction, pending] = useActionState(action, {});
  const onSubmit = useKeepValuesSubmit(formAction);

  const [content, setContent] = useState(defaults.content);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [excerpt, setExcerpt] = useState(defaults.excerpt);
  const [coverUrl, setCoverUrl] = useState(defaults.coverImageUrl || "");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Category state & inline creation
  const [categories, setCategories] = useState<CategoryOption[]>(initialCategories);
  const [selectedCatId, setSelectedCatId] = useState<number>(defaults.categoryId || (initialCategories[0]?.id ?? 1));
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatHue, setNewCatHue] = useState(160);
  const [isSavingCat, setIsSavingCat] = useState(false);

  // Author state & inline creation
  const [authors, setAuthors] = useState<AuthorOption[]>(initialAuthors);
  const [selectedAuthorId, setSelectedAuthorId] = useState<number>(defaults.authorId || (initialAuthors[0]?.id ?? 1));
  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId) || authors[0];
  const [authorAvatar, setAuthorAvatar] = useState(selectedAuthor?.avatarUrl || "");
  const [isUploadingDirectAvatar, setIsUploadingDirectAvatar] = useState(false);
  const avatarDirectInputRef = useRef<HTMLInputElement>(null);

  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorRole, setNewAuthorRole] = useState("");
  const [newAuthorBio, setNewAuthorBio] = useState("");
  const [newAuthorAvatar, setNewAuthorAvatar] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSavingAuthor, setIsSavingAuthor] = useState(false);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Direct Author Avatar Upload on the Blog Form
  async function handleDirectAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingDirectAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "pcon/avatars");
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setAuthorAvatar(data.url);
    } catch (err) {
      alert("Avatar upload failed: " + (err as Error).message);
    } finally {
      setIsUploadingDirectAvatar(false);
      if (e.target) e.target.value = "";
    }
  }

  // Handle Cover Upload
  async function handleCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    setUploadError(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setCoverUrl(json.url);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setIsUploadingCover(false);
    }
  }

  // Handle Avatar Upload
  async function handleAvatarFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      setNewAuthorAvatar(json.url);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  // Handle Quick Inline Category Creation
  async function handleSaveNewCategory(e: React.MouseEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSavingCat(true);
    try {
      const res = await fetch("/api/admin/blog-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatName.trim(), hue: newCatHue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      setCategories((prev) => [...prev, data]);
      setSelectedCatId(data.id);
      setShowNewCat(false);
      setNewCatName("");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingCat(false);
    }
  }

  // Handle Quick Inline Author Creation
  async function handleSaveNewAuthor(e: React.MouseEvent) {
    e.preventDefault();
    if (!newAuthorName.trim() || !newAuthorRole.trim()) {
      alert("Please provide author name and role/year.");
      return;
    }
    setIsSavingAuthor(true);
    try {
      const res = await fetch("/api/admin/blog-authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAuthorName.trim(),
          roleTitle: newAuthorRole.trim(),
          bio: newAuthorBio.trim(),
          avatarUrl: newAuthorAvatar || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create author");
      setAuthors((prev) => [...prev, data]);
      setSelectedAuthorId(data.id);
      setAuthorAvatar(data.avatarUrl || "");
      setShowNewAuthor(false);
      setNewAuthorName("");
      setNewAuthorRole("");
      setNewAuthorBio("");
      setNewAuthorAvatar("");
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setIsSavingAuthor(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="adm-form" noValidate>
      <FormMessage state={state} />

      {/* Title */}
      <Field label="Blog Title" name="title" state={state}>
        <input name="title" defaultValue={defaults.title} placeholder="e.g. Dynamic programming without the tears" required maxLength={150} />
      </Field>

      {/* Excerpt with Character Counter */}
      <div className="adm-field" data-invalid={state.fieldErrors?.excerpt ? "" : undefined}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <label className="adm-field__label" htmlFor="excerpt">Excerpt / Subtitle</label>
          <span style={{ fontSize: "11px", color: excerpt.length >= 100 ? "var(--mint)" : "var(--adm-muted)", fontFamily: "var(--mono)" }}>
            {excerpt.length} / ~100-200 chars (min 100)
          </span>
        </div>
        <textarea
          id="excerpt"
          name="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          maxLength={300}
          placeholder="A punchy 1-2 sentence hook shown on cards and directly below the title (min 100 characters)"
          required
        />
        <span className="adm-field__hint">Keep around 100-200 characters for optimal card presentation.</span>
        {state.fieldErrors?.excerpt && (
          <span className="adm-field__error" role="alert">{state.fieldErrors.excerpt[0]}</span>
        )}
      </div>

      {/* Category Select & Add New */}
      <div className="adm-field">
        <label className="adm-field__label">Category</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            name="categoryId"
            value={selectedCatId}
            onChange={(e) => setSelectedCatId(Number(e.target.value))}
            className="adm-select"
            style={{ flex: 1 }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (Hue {c.hue})
              </option>
            ))}
          </select>
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => setShowNewCat(!showNewCat)}
          >
            {showNewCat ? "Cancel" : "+ New Category"}
          </button>
        </div>

        {/* Inline Category Creator */}
        {showNewCat && (
          <div style={{ marginTop: "10px", padding: "14px", background: "var(--adm-surface-2)", borderRadius: "4px", border: "1px dashed var(--adm-line-strong)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <strong style={{ fontSize: "12px", color: "var(--mint)" }}>Add New Category</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: "8px" }}>
              <input
                placeholder="Category Name (e.g. Distributed Systems)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Hue (0-360)"
                value={newCatHue}
                onChange={(e) => setNewCatHue(Number(e.target.value))}
                min={0}
                max={360}
              />
              <button
                type="button"
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={handleSaveNewCategory}
                disabled={isSavingCat || !newCatName.trim()}
              >
                {isSavingCat ? "Saving..." : "Add"}
              </button>
            </div>
          </div>
        )}
        {state.fieldErrors?.categoryId && (
          <span className="adm-field__error" role="alert">{state.fieldErrors.categoryId[0]}</span>
        )}
      </div>

      {/* Author Select & Add New */}
      <div className="adm-field">
        <label className="adm-field__label">Written By (Author)</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            name="authorId"
            value={selectedAuthorId}
            onChange={(e) => {
              const newId = Number(e.target.value);
              setSelectedAuthorId(newId);
              const found = authors.find((a) => a.id === newId);
              setAuthorAvatar(found?.avatarUrl || "");
            }}
            className="adm-select"
            style={{ flex: 1 }}
          >
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {a.roleTitle}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="adm-btn adm-btn--ghost adm-btn--sm"
            onClick={() => setShowNewAuthor(!showNewAuthor)}
          >
            {showNewAuthor ? "Cancel" : "+ New Author"}
          </button>
        </div>

        {/* Optional Author Avatar Preview & Upload */}
        <div
          style={{
            marginTop: "10px",
            padding: "12px 14px",
            background: "var(--adm-surface-2)",
            borderRadius: "6px",
            border: "1px solid var(--adm-line)",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              overflow: "hidden",
              background: "linear-gradient(135deg, var(--mint), #2fbf9f)",
              display: "grid",
              placeItems: "center",
              color: "#03100d",
              fontWeight: 700,
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            {authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={authorAvatar}
                alt="Author avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              (selectedAuthor?.name?.[0] || "A").toUpperCase()
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--ink)" }}>
                Author Avatar <span style={{ fontWeight: 400, color: "var(--adm-muted)" }}>(Optional)</span>
              </span>
              {authorAvatar && (
                <button
                  type="button"
                  onClick={() => setAuthorAvatar("")}
                  style={{ background: "none", border: "none", color: "var(--adm-warn)", fontSize: "11px", cursor: "pointer", padding: 0 }}
                >
                  Remove avatar
                </button>
              )}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input type="hidden" name="authorAvatarUrl" value={authorAvatar} />
              <input
                type="text"
                placeholder="Author avatar image URL (or upload below)"
                value={authorAvatar}
                onChange={(e) => setAuthorAvatar(e.target.value)}
                style={{ flex: 1, fontSize: "12px", height: "32px" }}
              />
              <input
                type="file"
                ref={avatarDirectInputRef}
                style={{ display: "none" }}
                accept="image/png,image/jpeg,image/webp"
                onChange={handleDirectAvatarUpload}
              />
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => avatarDirectInputRef.current?.click()}
                disabled={isUploadingDirectAvatar}
                style={{ height: "32px", fontSize: "12px", whiteSpace: "nowrap" }}
              >
                {isUploadingDirectAvatar ? "Uploading..." : "Upload Avatar"}
              </button>
            </div>
          </div>
        </div>

        {/* Inline Author Creator */}
        {showNewAuthor && (
          <div style={{ marginTop: "10px", padding: "16px", background: "var(--adm-surface-2)", borderRadius: "4px", border: "1px dashed var(--adm-line-strong)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <strong style={{ fontSize: "12px", color: "var(--mint)" }}>Add New Author Profile</strong>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <input
                placeholder="Full Name (e.g. Aarav Sinha)"
                value={newAuthorName}
                onChange={(e) => setNewAuthorName(e.target.value)}
              />
              <input
                placeholder="Role / Year / Branch (e.g. Pre-final year, CSE)"
                value={newAuthorRole}
                onChange={(e) => setNewAuthorRole(e.target.value)}
              />
            </div>
            <textarea
              rows={2}
              placeholder="Short bio (e.g. Codeforces specialist who runs Tuesday CP sessions)"
              value={newAuthorBio}
              onChange={(e) => setNewAuthorBio(e.target.value)}
            />
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                placeholder="Avatar URL (or upload below)"
                value={newAuthorAvatar}
                onChange={(e) => setNewAuthorAvatar(e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="file"
                ref={avatarFileInputRef}
                style={{ display: "none" }}
                accept="image/png,image/jpeg,image/webp"
                onChange={handleAvatarFileChange}
              />
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => avatarFileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                {isUploadingAvatar ? "Uploading..." : "Upload Avatar"}
              </button>
              <button
                type="button"
                className="adm-btn adm-btn--primary adm-btn--sm"
                onClick={handleSaveNewAuthor}
                disabled={isSavingAuthor || !newAuthorName.trim() || !newAuthorRole.trim()}
              >
                {isSavingAuthor ? "Saving..." : "Add Author"}
              </button>
            </div>
          </div>
        )}
        {state.fieldErrors?.authorId && (
          <span className="adm-field__error" role="alert">{state.fieldErrors.authorId[0]}</span>
        )}
      </div>

      {/* Cover Image Upload & URL */}
      <div className="adm-field">
        <label className="adm-field__label">Cover Image</label>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            name="coverImageUrl"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="Paste image URL (or upload a file)"
            style={{ flex: 1 }}
          />
          <input
            type="file"
            ref={coverFileInputRef}
            style={{ display: "none" }}
            accept="image/png,image/jpeg,image/webp"
            onChange={handleCoverFileChange}
          />
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => coverFileInputRef.current?.click()}
            disabled={isUploadingCover}
          >
            {isUploadingCover ? "Uploading..." : "Upload Image"}
          </button>
          {coverUrl && (
            <button
              type="button"
              className="adm-btn adm-btn--danger adm-btn--sm"
              onClick={() => setCoverUrl("")}
            >
              Remove
            </button>
          )}
        </div>
        {uploadError && <span className="adm-field__error">{uploadError}</span>}
        <span className="adm-field__hint">Optional: If left blank, an artistic category cover will be automatically generated with glowing gradients and category glyphs!</span>

        {/* Cover Preview */}
        {coverUrl && (
          <div style={{ marginTop: "10px", width: "100%", maxWidth: "340px", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--adm-line-strong)", position: "relative" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverUrl} alt="Cover preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
      </div>

      {/* Cover Image Alt Text */}
      <Field label="Cover Image Alt Text" name="coverImageAlt" hint="Description for accessibility and screen readers" state={state}>
        <input name="coverImageAlt" defaultValue={defaults.coverImageAlt || ""} placeholder="e.g. Dynamic programming state transition diagram" />
      </Field>

      {/* Markdown Content Editor with Live Preview */}
      <div className="adm-field" data-invalid={state.fieldErrors?.content ? "" : undefined}>
        <div className="adm-editor__head">
          <label className="adm-field__label" htmlFor="content-editor">Content (Markdown)</label>
          <div className="adm-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "write"} onClick={() => setTab("write")}>
              Write
            </button>
            <button type="button" role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}>
              Preview
            </button>
          </div>
        </div>

        <textarea
          id="content-editor"
          name="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className="adm-editor__input"
          hidden={tab === "preview"}
          aria-label="Content"
          placeholder="Write your article in Markdown. Supports headings (#, ##), bold, italics, code blocks with syntax highlighting, lists, blockquotes, and links."
        />

        {tab === "preview" && (
          <div className="adm-markdown">
            {content.trim() ? (
              <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
            ) : (
              <p className="adm-muted">Nothing to preview yet. Start typing your article in the Write tab.</p>
            )}
          </div>
        )}

        {state.fieldErrors?.content && (
          <span className="adm-field__error" role="alert">
            {state.fieldErrors.content[0]}
          </span>
        )}
      </div>

      {/* Status & Featured Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "16px", background: "var(--adm-surface)", border: "1px solid var(--adm-line)", borderRadius: "4px" }}>
        <strong style={{ fontSize: "13px", color: "var(--adm-text)" }}>Publishing & Visibility</strong>
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <label className="adm-check">
            <input
              type="checkbox"
              name="status"
              value="published"
              defaultChecked={defaults.status === "published"}
            />
            <span><strong>Published:</strong> Make visible on the public /blogs site immediately. Uncheck to save as Draft.</span>
          </label>

          <label className="adm-check">
            <input
              type="checkbox"
              name="isFeatured"
              value="true"
              defaultChecked={defaults.isFeatured}
            />
            <span><strong>★ Featured Post:</strong> Display prominently as the primary hero card on the blog home. (Only one post can be featured at a time).</span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="adm-form__actions">
        <Link className="adm-btn adm-btn--ghost" href="/admin/blogs">
          Cancel
        </Link>
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
