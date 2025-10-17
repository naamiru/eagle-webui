"use server";

import {
  type FolderSortOptions,
  isFolderSortMethod,
} from "@/data/sort-options";
import { getStore } from "@/data/store";

export type UpdateSmartFolderSortOptionsArgs = FolderSortOptions & {
  smartFolderId: string;
};

export type UpdateSmartFolderSortOptionsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateSmartFolderSortOptions(
  options: UpdateSmartFolderSortOptionsArgs,
): Promise<UpdateSmartFolderSortOptionsResult> {
  const { smartFolderId, orderBy, sortIncrease } = options;

  if (typeof smartFolderId !== "string" || smartFolderId.length === 0) {
    return { ok: false, error: "INVALID_SMART_FOLDER_ID" };
  }

  if (!isFolderSortMethod(orderBy)) {
    return { ok: false, error: "INVALID_ORDER_BY" };
  }

  if (typeof sortIncrease !== "boolean") {
    return { ok: false, error: "INVALID_DIRECTION" };
  }

  try {
    const store = await getStore();
    const updated = store.updateSmartFolderSortOptions(
      smartFolderId,
      orderBy,
      sortIncrease,
    );

    if (!updated) {
      return { ok: false, error: "SMART_FOLDER_NOT_FOUND" };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update smart folder sort options.";
    return { ok: false, error: message };
  }
}
