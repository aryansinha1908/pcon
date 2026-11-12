"use client";

import { useState, useTransition } from "react";
import type { FormState } from "@/lib/validation";

/**
 * A button that runs a (pre-bound) server action, optionally after a confirm
 * prompt, and shows the result next to it.
 */
export function ActionButton({
  action,
  confirmText,
  variant = "ghost",
  children,
}: {
  action: () => Promise<FormState>;
  confirmText?: string;
  variant?: "ghost" | "danger" | "primary";
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<FormState>();

  return (
    <span className="adm-action">
      <button
        type="button"
        className={`adm-btn adm-btn--${variant} adm-btn--sm`}
        disabled={pending}
        onClick={() => {
          if (confirmText && !window.confirm(confirmText)) return;
          startTransition(async () => setResult(await action()));
        }}
      >
        {pending ? "…" : children}
      </button>
      {result?.error && <span className="adm-action__error" role="alert">{result.error}</span>}
    </span>
  );
}
