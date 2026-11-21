import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

import { isApiError } from "@/lib/api/errors";

/**
 * The server's 400 VALIDATION_ERROR lists problems by field (`details: [{ path:
 * "body.pincode", message }]`). Put each message under its form field. Returns true if
 * at least one field got a message (then no toast is needed).
 */
export function applyServerFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly string[],
): boolean {
  if (!isApiError(error) || error.code !== "VALIDATION_ERROR" || !Array.isArray(error.details)) {
    return false;
  }
  let placed = false;
  for (const item of error.details as { path?: unknown; message?: unknown }[]) {
    const field = typeof item.path === "string" ? item.path.replace(/^body\./, "") : "";
    if (fields.includes(field) && typeof item.message === "string") {
      setError(field as Path<T>, { message: item.message });
      placed = true;
    }
  }
  return placed;
}

/** The message to show in a toast for any other failure. */
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  return isApiError(error) ? error.message : fallback;
}
