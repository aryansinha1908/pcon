/**
 * Canvas `ctx.font` can't read CSS variables, so canvas code resolves a token
 * like "--mono" to its real family list at draw time.
 */
export function resolveFontToken(token: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value || fallback;
}
