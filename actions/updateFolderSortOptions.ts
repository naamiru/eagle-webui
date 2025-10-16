"use server";

import {
  type FolderSortOptions,
  isFolderSortMethod,
} from "@/data/sort-options";
import { getStore } from "@/data/store";

export type UpdateFolderSortOptionsArgs = FolderSortOptions & {
  folderId: string;
};

export type UpdateFolderSortOptionsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateFolderSortOptions(
  options: UpdateFolderSortOptionsArgs,
): Promise<UpdateFolderSortOptionsResult> {
  const { folderId, orderBy, sortIncrease } = options;

  if (typeof folderId !== "string" || folderId.length === 0) {
    return { ok: false, error: "INVALID_FOLDER_ID" };
  }

  if (!isFolderSortMethod(orderBy)) {
    return { ok: false, error: "INVALID_ORDER_BY" };
  }

  if (typeof sortIncrease !== "boolean") {
    return { ok: false, error: "INVALID_DIRECTION" };
  }

  try {
    const store = await getStore();
    const folder = store.folders.get(folderId);

    if (!folder) {
      return { ok: false, error: "FOLDER_NOT_FOUND" };
    }

    folder.orderBy = orderBy;
    folder.sortIncrease = sortIncrease;
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update folder sort options.";
    return { ok: false, error: message };
  }
}
