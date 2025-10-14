"use server";

import { getStore, resetStore, waitForStoreInitialization } from "@/data/store";

export async function reloadLibrary(): Promise<void> {
  await waitForStoreInitialization();
  resetStore();
  await getStore();
}
