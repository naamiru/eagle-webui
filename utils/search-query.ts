export function resolveSearchQuery(input: unknown): string {
  return resolveSingleValue(input) ?? "";
}

export function resolveTagFilter(input: unknown): string {
  return resolveSingleValue(input) ?? "";
}

function resolveSingleValue(input: unknown): string | undefined {
  if (typeof input === "string") {
    return input.trim();
  }

  if (Array.isArray(input) && input.length > 0) {
    const head = input[0];
    if (typeof head === "string") {
      return head.trim();
    }
  }

  return undefined;
}
