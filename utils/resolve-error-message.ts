const DEFAULT_FALLBACK = "Something went wrong";

export function resolveErrorMessage(
  error: unknown,
  fallbackMessage: string = DEFAULT_FALLBACK,
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  return fallbackMessage;
}
