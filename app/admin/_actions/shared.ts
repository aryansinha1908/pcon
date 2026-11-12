import { PermissionError } from "@/lib/auth-guards";
import type { FormState } from "@/lib/validation";

/** Turn a guard failure into a form error; let anything else surface as a real error. */
export function toFormError(e: unknown): FormState {
  if (e instanceof PermissionError) return { error: e.message };
  throw e;
}

export function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}
