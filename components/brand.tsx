import Image from "next/image";
import Link from "next/link";
export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link className={"brand" + (compact ? " brand--compact" : "")} href="/" aria-label="PCON home">
      <Image className="brand__logo" src="/pcon-logo.png" alt="" width={70} height={42} priority />
      <span className="brand__wordmark"><strong>PCON</strong>{!compact && <small>NIT Jamshedpur</small>}</span>
    </Link>
  );
}
export function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal ? (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M5 15 15 5M6 5h9v9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
