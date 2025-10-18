"use server";

import {
  type NavbarExpandedState,
  saveNavbarExpandedState,
} from "@/data/settings";

export type UpdateNavbarExpandedStateArgs = {
  area: "folders" | "smart-folders";
  expandedIds: unknown;
};

export type UpdateNavbarExpandedStateResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateNavbarExpandedState(
  args: UpdateNavbarExpandedStateArgs,
): Promise<UpdateNavbarExpandedStateResult> {
  const { area, expandedIds } = args;

  if (area !== "folders" && area !== "smart-folders") {
    return { ok: false, error: "INVALID_AREA" };
  }

  const normalized = normalizeExpandedIds(expandedIds);
  if (normalized === null) {
    return { ok: false, error: "INVALID_EXPANDED_IDS" };
  }

  try {
    const partial: Partial<NavbarExpandedState> =
      area === "folders"
        ? { folders: normalized }
        : { smartFolders: normalized };

    await saveNavbarExpandedState(partial);
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update navbar expanded state.";
    return { ok: false, error: message };
  }
}

function normalizeExpandedIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of value) {
    if (typeof entry !== "string") {
      return null;
    }
    const trimmed = entry.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }

  return result;
}
