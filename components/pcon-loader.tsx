import "@/app/status-pages.css";

/**
 * PCON loading animation — "brackets assemble". Pure CSS, no JS.
 *
 * The official logo (/pcon-logo.png, 647×386) is stacked three times and each
 * copy is clipped to one part: left bracket, the teal P, right bracket. The
 * clip shapes come from measuring the image: the left bracket ends at x=206
 * and the P starts at x=222; on the right the P and bracket share columns
 * 442–466 but never the same rows, so the cut follows the bracket's inner
 * curve. The brackets slide in like code brackets closing, the P rises, then
 * the brackets breathe while the power ring pulses and a spark orbits it.
 */
export function PconLoader({ variant = "page", label = "Loading" }: { variant?: "page" | "inline" | "splash"; label?: string }) {
  // The splash plays over content that is already in the page, so it is decorative for assistive tech.
  const splash = variant === "splash";
  return (
    <div className={`pcon-loader pcon-loader--${variant}`} role={splash ? undefined : "status"} aria-hidden={splash || undefined}>
      {!splash && <span className="sr-only">{label}…</span>}
      <div className="pcon-loader__stage" aria-hidden="true">
        <span className="pcon-loader__layer pcon-loader__layer--left" />
        <span className="pcon-loader__layer pcon-loader__layer--p" />
        <span className="pcon-loader__layer pcon-loader__layer--right" />
        <span className="pcon-loader__ring" />
        <span className="pcon-loader__orbit"><span className="pcon-loader__spark" /></span>
      </div>
      <p className="pcon-loader__caption" aria-hidden="true">
        {label}<span>.</span><span>.</span><span>.</span>
      </p>
    </div>
  );
}
