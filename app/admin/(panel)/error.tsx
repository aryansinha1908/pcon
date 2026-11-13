"use client";

import Link from "next/link";
import { useEffect } from "react";

/** Errors inside the admin panel keep the sidebar and show a reference id. */
export default function AdminError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <section className="adm-card" style={{ maxWidth: 560 }}>
      <p className="adm-notice adm-notice--error" role="alert">Couldn&apos;t load this page.</p>
      <p className="adm-muted">Something went wrong on the server. Try again; if it keeps failing, share the reference below with whoever maintains the site.</p>
      {digest && <p className="adm-small">Reference: <code>{digest}</code></p>}
      <div className="adm-form__actions">
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => retry()}>Try again</button>
        <Link href="/admin" className="adm-btn adm-btn--ghost">Back to dashboard</Link>
      </div>
    </section>
  );
}
