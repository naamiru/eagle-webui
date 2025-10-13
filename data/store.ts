import { discoverLibraryPath } from "./library/discover-library-path";
import { importLibraryMetadata } from "./library/import-metadata";
import type { Folder, Item } from "./types";

export class Store {
  constructor(
    public readonly libraryPath: string,
    public readonly applicationVersion: string,
    public readonly folders: Map<string, Folder>,
    public readonly items: Map<string, Item>,
  ) {}

  getFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  getItems(): Item[] {
    return Array.from(this.items.values());
  }

  getFolderItems(folderId: string): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.folders.includes(folderId)) {
        items.push(item);
      }
    }

    return items;
  }
}

export type StoreInitializationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; message: string };

let storePromise: Promise<Store> | null = null;
let storeState: StoreInitializationState = { status: "idle" };

export function getStoreImportState(): StoreInitializationState {
  return storeState;
}

export async function getStore(): Promise<Store> {
  if (!storePromise) {
    storeState = { status: "loading" };

    storePromise = (async () => {
      try {
        const store = await initializeStore();
        storeState = { status: "ready" };
        return store;
      } catch (error) {
        storePromise = null;
        const message =
          error instanceof Error ? error.message : "Unknown import error";
        storeState = { status: "error", message };
        throw error;
      }
    })();
  }

  return storePromise;
}

export async function waitForStoreInitialization(): Promise<void> {
  const pending = storePromise;

  if (!pending) {
    return;
  }

  try {
    await pending;
  } catch {
    // Swallow errors; state is already updated in getStore
  }
}

async function initializeStore(): Promise<Store> {
  const libraryPath = await discoverLibraryPath();
  const data = await importLibraryMetadata(libraryPath);
  return new Store(
    data.libraryPath,
    data.applicationVersion,
    data.folders,
    data.items,
  );
}

export function resetStore(): void {
  storePromise = null;
  storeState = { status: "idle" };
}

export const __resetStoreForTests = resetStore;
