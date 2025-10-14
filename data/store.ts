import { loadGlobalSortSettings } from "./global-sort-settings";
import { discoverLibraryPath } from "./library/discover-library-path";
import { importLibraryMetadata } from "./library/import-metadata";
import { type SortContext, sortItems } from "./sort-items";
import type { GlobalSortOptions } from "./sort-options";
import type { Folder, Item } from "./types";

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
    const activeItems = Array.from(this.items.values()).filter(
      (item) => !item.isDeleted,
    );

    return sortItems(activeItems, {
      orderBy: this.globalSortSettings.orderBy,
      sortIncrease: this.globalSortSettings.sortIncrease,
    });
  }

  getItemIds(): string[] {
    return this.getItems().map((item) => item.id);
  }

  getUncategorizedItems(): Item[] {
    return this.getItems().filter((item) => item.folders.length === 0);
  }

  getUncategorizedItemIds(): string[] {
    return this.getUncategorizedItems().map((item) => item.id);
  }

  getTrashItems(): Item[] {
    const deletedItems = Array.from(this.items.values()).filter(
      (item) => item.isDeleted,
    );

    return sortItems(deletedItems, {
      orderBy: this.globalSortSettings.orderBy,
      sortIncrease: this.globalSortSettings.sortIncrease,
    });
  }

  getTrashItemIds(): string[] {
    return this.getTrashItems().map((item) => item.id);
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

  getFolderItemIds(folderId: string): string[] {
    return this.getFolderItems(folderId).map((item) => item.id);
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
