"use client";

import { useState } from "react";

export function MatrixControl() {
  const [variant, setVariant] = useState<"pcon" | "delta">("pcon");

  const toggle = () => {
    const next = variant === "pcon" ? "delta" : "pcon";
    setVariant(next);
    window.dispatchEvent(new CustomEvent("pcon:toggle-matrix", { detail: next }));
  };

  return (
    <button
      type="button"
      className="hero__interaction"
      onClick={toggle}
      title="Click to toggle between PCON emblem and Delta Force triangle"
    >
      <i aria-hidden="true" />
      <span>MOVE OR TAP TO WAKE • SHAPE: <strong>{variant.toUpperCase()}</strong></span>
    </button>
  );
}
