"use client";

import "./globals.css";
import "./status-pages.css";

/**
 * Last-resort error page, used only if the root layout itself fails. It replaces
 * the whole document, so it renders its own <html>/<body> and stays minimal.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;
  return (
    <html lang="en">
      <body>
        <title>Something went wrong · PCON</title>
        <main id="main" className="status-page status-page--error" style={{ minHeight: "100dvh" }}>
          <div className="shell status-page__inner">
            <div className="status-code" aria-hidden="true">
              <span className="status-code__bracket status-code__bracket--left" />
              <strong>500</strong>
              <span className="status-code__bracket status-code__bracket--right" />
            </div>
            <h1>Something broke</h1>
            <p className="status-page__lede">The site couldn&apos;t load. Please try again in a moment.{digest ? ` (Reference: ${digest})` : ""}</p>
            <div className="status-actions" style={{ marginTop: 28 }}>
              <button type="button" className="button button--primary" onClick={() => retry()}>Try again</button>
              {/* A full reload on purpose: client navigation may be what failed. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="button button--outline" href="/">Reload home</a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
