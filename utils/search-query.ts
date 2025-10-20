export function resolveSearchQuery(input: unknown): string {
  if (typeof input === "string") {
    return input.trim();
  }

  if (Array.isArray(input) && input.length > 0) {
    const head = input[0];
    if (typeof head === "string") {
      return head.trim();
    }
  }

  return "";
}
