"use server";

import { saveGlobalSortSettings } from "@/data/settings";
import {
  type GlobalSortOptions,
  isGlobalSortMethod,
} from "@/data/sort-options";
import { getStore } from "@/data/store";

export type UpdateGlobalSortOptionsResult =
  | { ok: true }
  | { ok: false; error: string };

export async function updateGlobalSortOptions(
  options: GlobalSortOptions,
): Promise<UpdateGlobalSortOptionsResult> {
  const { orderBy, sortIncrease } = options;

  if (!isGlobalSortMethod(orderBy)) {
    return { ok: false, error: "INVALID_ORDER_BY" };
  }

  if (typeof sortIncrease !== "boolean") {
    return { ok: false, error: "INVALID_DIRECTION" };
  }

  try {
    await saveGlobalSortSettings({ orderBy, sortIncrease });
    const store = await getStore();
    store.globalSortSettings.orderBy = orderBy;
    store.globalSortSettings.sortIncrease = sortIncrease;
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update global sort settings.";
    return { ok: false, error: message };
  }
}
