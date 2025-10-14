import {
  type LibraryImportErrorCode,
  toLibraryImportErrorCode,
} from "./errors";
import { loadGlobalSortSettings } from "./global-sort-settings";
import { discoverLibraryPath } from "./library/discover-library-path";
import { importLibraryMetadata } from "./library/import-metadata";
import { type SortContext, sortItems } from "./sort-items";
import type { GlobalSortOptions } from "./sort-options";
import type { Folder, Item, ItemPreview } from "./types";

export class Store {
  constructor(
    public readonly libraryPath: string,
    public readonly applicationVersion: string,
    public readonly folders: Map<string, Folder>,
    public readonly items: Map<string, Item>,
    public readonly globalSortSettings: GlobalSortOptions,
  ) {}

  getFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  getItems(): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (!item.isDeleted) {
        items.push(item);
      }
    }

    return sortItems(items, this.getGlobalSortContext());
  }

  getItemPreviews(): ItemPreview[] {
    return this.toItemPreviews(this.getItems());
  }

  getUncategorizedItems(): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.folders.length === 0) {
        items.push(item);
      }
    }

    return sortItems(items, this.getGlobalSortContext());
  }

  getUncategorizedItemPreviews(): ItemPreview[] {
    return this.toItemPreviews(this.getUncategorizedItems());
  }

  getTrashItems(): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.isDeleted) {
        items.push(item);
      }
    }

    return sortItems(items, this.getGlobalSortContext());
  }

  getTrashItemPreviews(): ItemPreview[] {
    return this.toItemPreviews(this.getTrashItems());
  }

  getFolderItems(folderId: string): Item[] {
    const items: Item[] = [];

    for (const item of this.items.values()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.folders.includes(folderId)) {
        items.push(item);
      }
    }

    const folder = this.folders.get(folderId);
    const sortContext = this.resolveFolderSortContext(folder);

    return sortItems(items, { ...sortContext, folderId });
  }

  getFolderItemPreviews(folderId: string): ItemPreview[] {
    return this.toItemPreviews(this.getFolderItems(folderId));
  }

  private resolveFolderSortContext(folder: Folder | undefined): SortContext {
    if (!folder || folder.orderBy === "GLOBAL") {
      return {
        orderBy: this.globalSortSettings.orderBy,
        sortIncrease: this.globalSortSettings.sortIncrease,
      };
    }

    return {
      orderBy: folder.orderBy,
      sortIncrease: folder.sortIncrease,
    };
  }

  private getGlobalSortContext(): SortContext {
    return {
      orderBy: this.globalSortSettings.orderBy,
      sortIncrease: this.globalSortSettings.sortIncrease,
    };
  }

  private toItemPreviews(items: Item[]): ItemPreview[] {
    return items.map(({ id, duration }) => ({ id, duration }));
  }
}

export type StoreInitializationState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; code: LibraryImportErrorCode };

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
        const code = toLibraryImportErrorCode(error);
        storeState = { status: "error", code };
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
  const globalSortSettings = await loadGlobalSortSettings();

  return new Store(
    data.libraryPath,
    data.applicationVersion,
    data.folders,
    data.items,
    globalSortSettings,
  );
}

export function resetStore(): void {
  storePromise = null;
  storeState = { status: "idle" };
}

export const __resetStoreForTests = resetStore;
