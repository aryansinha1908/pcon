"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowIcon } from "@/components/brand";
import { SiteHeader } from "@/components/site-header";
import "./status-pages.css";

/** Error boundary for every public route. Shows a reference id, never the raw error message. */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <div className="site-shell" id="top">
      <SiteHeader />
      <main id="main" className="status-page status-page--error">
        <div className="shell status-page__inner">
          <div className="eyebrow"><span className="status-dot" /> Runtime error</div>
          <div className="status-code" aria-hidden="true">
            <span className="status-code__bracket status-code__bracket--left" />
            <strong>500</strong>
            <span className="status-code__bracket status-code__bracket--right" />
          </div>
          <h1>Something broke on our side</h1>
          <p className="status-page__lede">It&apos;s not you. Try again, and if it keeps happening, let us know at pcon@nitjsr.ac.in.</p>

          <div className="terminal" aria-hidden="true">
            <div className="terminal__bar"><i /><i /><i /> bash — pcon</div>
            <pre className="terminal__body">
              <span className="terminal__error">Uncaught exception while rendering this page.</span>{"\n"}
              {digest ? <><span className="terminal__dim">reference:</span> {digest}{"\n"}</> : null}
              <span className="terminal__prompt">$</span> retry <span className="terminal__caret" />
            </pre>
          </div>
          {digest && <p className="sr-only">Error reference: {digest}</p>}

          <div className="status-actions">
            <button type="button" className="button button--primary" onClick={() => retry()}>Try again <ArrowIcon /></button>
            <Link className="button button--outline" href="/">Go home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
