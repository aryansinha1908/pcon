import Link from "next/link";

export default function AdminNotFound() {
  return (
    <section className="adm-card" style={{ maxWidth: 560 }}>
      <p className="adm-notice adm-notice--warn" role="alert">That item doesn&apos;t exist or was deleted.</p>
      <p className="adm-muted">It may have been removed by another admin, or the link is out of date.</p>
      <div className="adm-form__actions">
        <Link href="/admin" className="adm-btn adm-btn--primary">Back to dashboard</Link>
      </div>
    </section>
  );
}
