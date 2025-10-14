"use server";

import {
  type LibraryImportErrorCode,
  toLibraryImportErrorCode,
} from "@/data/errors";
import { getStore, resetStore, waitForStoreInitialization } from "@/data/store";

export type ReloadLibraryResult =
  | { ok: true }
  | { ok: false; code: LibraryImportErrorCode };

export async function reloadLibrary(): Promise<ReloadLibraryResult> {
  await waitForStoreInitialization();
  resetStore();

  try {
    await getStore();
    return { ok: true };
  } catch (error) {
    const code = toLibraryImportErrorCode(error);
    return { ok: false, code };
  }
}
