import {
  type LibraryImportErrorCode,
  toLibraryImportErrorCode,
} from "./errors";
import { discoverLibraryPath } from "./library/discover-library-path";
import { importLibraryMetadata } from "./library/import-metadata";
import { loadGlobalSortSettings } from "./settings";
import type { SmartFolder, SmartFolderItemMap } from "./smart-folders";
import { type SortContext, sortItems } from "./sort-items";
import type { FolderSortMethod, GlobalSortOptions } from "./sort-options";
import type { Folder, Item, ItemCounts, ItemPreview } from "./types";

export class Store {
  constructor(
    public readonly libraryPath: string,
    public readonly applicationVersion: string,
    public readonly folders: Map<string, Folder>,
    public readonly items: Map<string, Item>,
    public readonly smartFolders: SmartFolder[],
    public readonly smartFolderItemIds: SmartFolderItemMap,
    public readonly globalSortSettings: GlobalSortOptions,
    public readonly itemCounts: ItemCounts,
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

  getSmartFolders(): SmartFolder[] {
    return this.smartFolders;
  }

  getSmartFolder(id: string): SmartFolder | undefined {
    return this.findSmartFolder(this.smartFolders, id);
  }

  getSmartFolderItemIds(id: string): string[] {
    const itemIds = this.smartFolderItemIds.get(id);
    return itemIds ? [...itemIds] : [];
  }

  getSmartFolderItemCount(id: string): number {
    const folder = this.getSmartFolder(id);
    return folder?.itemCount ?? 0;
  }

  getSmartFolderCoverId(id: string): string | undefined {
    const folder = this.getSmartFolder(id);
    return folder?.coverId;
  }

  updateSmartFolderSortOptions(
    smartFolderId: string,
    orderBy: FolderSortMethod,
    sortIncrease: boolean,
  ): boolean {
    const folder = this.getSmartFolder(smartFolderId);
    if (!folder) {
      return false;
    }

    folder.orderBy = orderBy;
    folder.sortIncrease = sortIncrease;

    const existingIds = this.smartFolderItemIds.get(smartFolderId) ?? [];
    const resolvedItems: Item[] = [];

    for (const itemId of existingIds) {
      const item = this.items.get(itemId);
      if (item && !item.isDeleted) {
        resolvedItems.push(item);
      }
    }

    const resolvedOrderBy =
      orderBy === "GLOBAL" ? this.globalSortSettings.orderBy : orderBy;
    const resolvedSortIncrease =
      orderBy === "GLOBAL"
        ? this.globalSortSettings.sortIncrease
        : sortIncrease;

    let sortedItems: Item[];
    try {
      sortedItems = sortItems(resolvedItems, {
        orderBy: resolvedOrderBy,
        sortIncrease: resolvedSortIncrease,
        folderId: smartFolderId,
      });
    } catch {
      sortedItems = resolvedItems;
    }

    const sortedIds = sortedItems.map((item) => item.id);
    this.smartFolderItemIds.set(smartFolderId, sortedIds);
    folder.itemCount = sortedIds.length;

    if (sortedIds.length === 0) {
      folder.coverId = undefined;
      return true;
    }

    if (folder.coverId && sortedIds.includes(folder.coverId)) {
      return true;
    }

    folder.coverId = sortedIds[0];
    return true;
  }

  getSmartFolderItemPreviews(id: string): ItemPreview[] {
    const folder = this.getSmartFolder(id);
    if (!folder) {
      return [];
    }

    const itemIds = this.smartFolderItemIds.get(id) ?? [];
    const items = this.collectItemsByIds(itemIds);
    return this.toItemPreviews(items);
  }

  getFirstSmartFolderItem(id: string): Item | undefined {
    const itemIds = this.smartFolderItemIds.get(id);
    if (!itemIds) {
      return undefined;
    }

    for (const itemId of itemIds) {
      const item = this.items.get(itemId);
      if (item && !item.isDeleted) {
        return item;
      }
    }

    return undefined;
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

  getFirstFolderItem(folderId: string): Item | undefined {
    for (const item of this.items.values()) {
      if (item.isDeleted) {
        continue;
      }

      if (item.folders.includes(folderId)) {
        return item;
      }
    }

    return undefined;
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

  private findSmartFolder(
    nodes: SmartFolder[],
    id: string,
  ): SmartFolder | undefined {
    for (const node of nodes) {
      if (node.id === id) {
        return node;
      }

      const child = this.findSmartFolder(node.children, id);
      if (child) {
        return child;
      }
    }

    return undefined;
  }

  private collectItemsByIds(itemIds: string[]): Item[] {
    const collected: Item[] = [];

    for (const itemId of itemIds) {
      const item = this.items.get(itemId);
      if (item && !item.isDeleted) {
        collected.push(item);
      }
    }

    return collected;
  }

  private toItemPreviews(items: Item[]): ItemPreview[] {
    return items.map(({ id, duration, width, height, ext }) => ({
      id,
      duration,
      width,
      height,
      ext,
    }));
  }
}

export function computeItemCounts(
  items: Map<string, Item>,
  folders: Map<string, Folder>,
): ItemCounts {
  let all = 0;
  let uncategorized = 0;
  let trash = 0;

  const folderCounts = new Map<string, number>();

  for (const folderId of folders.keys()) {
    folderCounts.set(folderId, 0);
  }

  for (const item of items.values()) {
    if (item.isDeleted) {
      trash += 1;
      continue;
    }

    all += 1;

    if (item.folders.length === 0) {
      uncategorized += 1;
      continue;
    }

    if (item.folders.length === 1) {
      const folderId = item.folders[0];
      const existing = folderCounts.get(folderId);
      if (existing !== undefined) {
        folderCounts.set(folderId, existing + 1);
      }
      continue;
    }

    const uniqueFolderIds = new Set(item.folders);

    for (const folderId of uniqueFolderIds) {
      const existing = folderCounts.get(folderId);
      if (existing !== undefined) {
        folderCounts.set(folderId, existing + 1);
      }
    }
  }

  for (const [folderId, count] of folderCounts) {
    const folder = folders.get(folderId);
    if (folder) {
      folder.itemCount = count;
    }
  }

  return {
    all,
    uncategorized,
    trash,
  };
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
  const globalSortSettings = await loadGlobalSortSettings();
  const data = await importLibraryMetadata(libraryPath, globalSortSettings);
  const itemCounts = computeItemCounts(data.items, data.folders);

  return new Store(
    data.libraryPath,
    data.applicationVersion,
    data.folders,
    data.items,
    data.smartFolders,
    data.smartFolderItemIds,
    globalSortSettings,
    itemCounts,
  );
}

export function resetStore(): void {
  storePromise = null;
  storeState = { status: "idle" };
}

export const __resetStoreForTests = resetStore;
