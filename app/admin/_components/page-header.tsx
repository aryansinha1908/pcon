export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="adm-page-head">
      <div>
        <div className="adm-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
      </div>
      {children && <div className="adm-page-head__actions">{children}</div>}
    </header>
  );
}
