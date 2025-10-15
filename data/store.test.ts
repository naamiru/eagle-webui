/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LibraryImportError } from "./errors";
import { computeNameForSort } from "./name-for-sort";
import {
  DEFAULT_GLOBAL_SORT_OPTIONS,
  type GlobalSortOptions,
} from "./sort-options";
import { computeItemCounts, getStoreImportState, Store } from "./store";
import type { Folder, Item } from "./types";

vi.mock("./library/discover-library-path", () => ({
  discoverLibraryPath: vi.fn(),
}));
vi.mock("./library/import-metadata", () => ({
  importLibraryMetadata: vi.fn(),
}));

import { discoverLibraryPath } from "./library/discover-library-path";
import { importLibraryMetadata } from "./library/import-metadata";
import { __resetStoreForTests, getStore } from "./store";

const discoverLibraryPathMock = vi.mocked(discoverLibraryPath);
const importLibraryMetadataMock = vi.mocked(importLibraryMetadata);
const mockFolder: Folder = {
  id: "root",
  name: "Root",
  nameForSort: "Root",
  description: "",
  children: [],
  manualOrder: 0,
  itemCount: 0,
  modificationTime: 0,
  tags: [],
  password: "",
  passwordTips: "",
  orderBy: "GLOBAL",
  sortIncrease: true,
};
const mockItem: Item = {
  id: "item-1",
  name: "",
  nameForSort: "",
  size: 0,
  btime: 0,
  mtime: 0,
  ext: "",
  tags: [],
  folders: [],
  isDeleted: false,
  url: "",
  annotation: "",
  modificationTime: 0,
  height: 0,
  width: 0,
  noThumbnail: false,
  lastModified: 0,
  palettes: [],
  duration: 0,
  star: 0,
  order: {},
};
describe("getStore", () => {
  beforeEach(() => {
    __resetStoreForTests();
    discoverLibraryPathMock.mockReset();
    importLibraryMetadataMock.mockReset();
  });
  it("initializes the store once and reuses the cached instance", async () => {
    discoverLibraryPathMock.mockResolvedValue("C:/library");
    importLibraryMetadataMock.mockResolvedValue(mockLibraryData());
    const stateBefore = getStoreImportState();
    expect(stateBefore.status).toBe("idle");
    const first = await getStore();
    const second = await getStore();
    const folders = first.getFolders();
    expect(first).toBe(second);
    expect(first.libraryPath).toBe("C:/library");
    expect(folders).toHaveLength(1);
    expect(folders[0]?.id).toBe("root");
    expect(importLibraryMetadataMock).toHaveBeenCalledTimes(1);
    expect(discoverLibraryPathMock).toHaveBeenCalledTimes(1);
  });
  it("propagates LibraryImportError from discovery", async () => {
    discoverLibraryPathMock.mockRejectedValue(
      new LibraryImportError("LIBRARY_PATH_NOT_FOUND"),
    );
    await expect(getStore()).rejects.toBeInstanceOf(LibraryImportError);
    expect(discoverLibraryPathMock).toHaveBeenCalledTimes(1);
    expect(importLibraryMetadataMock).not.toHaveBeenCalled();
  });
  it("does not reinitialize automatically after a failure", async () => {
    discoverLibraryPathMock.mockResolvedValue("C:/library");
    importLibraryMetadataMock
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue(mockLibraryData());
    await expect(getStore()).rejects.toThrow("boom");
    await expect(getStore()).rejects.toThrow("boom");
    expect(importLibraryMetadataMock).toHaveBeenCalledTimes(1);

    __resetStoreForTests();
    const recovered = await getStore();
    expect(recovered.applicationVersion).toBe("4.0.0");
    expect(importLibraryMetadataMock).toHaveBeenCalledTimes(2);
  });
});
function mockLibraryData(): Store {
  const folders = new Map([["root", { ...mockFolder }]]);
  const items = new Map([["item-1", { ...mockItem }]]);
  const itemCounts = computeItemCounts(items, folders);

  return new Store(
    "C:/library",
    "4.0.0",
    folders,
    items,
    { ...DEFAULT_GLOBAL_SORT_OPTIONS },
    itemCounts,
  );
}

describe("Store sorting", () => {
  it("sorts items using global sort settings", () => {
    const store = createStore({
      items: [
        createItem({
          id: "item-b",
          name: "Bravo",
          modificationTime: 2,
        }),
        createItem({
          id: "item-a",
          name: "Alpha",
          modificationTime: 1,
        }),
      ],
      globalSortSettings: {
        orderBy: "NAME",
        sortIncrease: true,
      },
    });

    const result = store.getItems();
    expect(result.map((item) => item.id)).toEqual(["item-a", "item-b"]);
  });

  it("sorts digit sequences in names using natural order", () => {
    const store = createStore({
      items: [
        createItem({
          id: "item-10",
          name: "Screenshot 10",
        }),
        createItem({
          id: "item-2",
          name: "Screenshot 2",
        }),
      ],
      globalSortSettings: {
        orderBy: "NAME",
        sortIncrease: true,
      },
    });

    const result = store.getItems();
    expect(result.map((item) => item.id)).toEqual(["item-2", "item-10"]);
  });

  it("uses manual ordering for folder items when available", () => {
    const folderId = "manual-folder";
    const store = createStore({
      folders: [
        createFolder({
          id: folderId,
          orderBy: "MANUAL",
          sortIncrease: true,
        }),
      ],
      items: [
        createItem({
          id: "item-low",
          folders: [folderId],
          order: { [folderId]: 5 },
          modificationTime: 10,
        }),
        createItem({
          id: "item-high",
          folders: [folderId],
          order: { [folderId]: 15 },
          modificationTime: 0,
        }),
      ],
    });

    const result = store.getFolderItems(folderId);
    expect(result.map((item) => item.id)).toEqual(["item-high", "item-low"]);
  });

  it("falls back to global settings when folder uses GLOBAL orderBy", () => {
    const folderId = "global-folder";
    const store = createStore({
      folders: [
        createFolder({
          id: folderId,
          orderBy: "GLOBAL",
          sortIncrease: false,
        }),
      ],
      items: [
        createItem({
          id: "older",
          folders: [folderId],
          mtime: 10,
        }),
        createItem({
          id: "newer",
          folders: [folderId],
          mtime: 20,
        }),
      ],
      globalSortSettings: {
        orderBy: "MTIME",
        sortIncrease: false,
      },
    });

    const result = store.getFolderItems(folderId);
    expect(result.map((item) => item.id)).toEqual(["older", "newer"]);
  });

  it("uses modification time when manual order is missing", () => {
    const folderId = "manual-folder";
    const store = createStore({
      folders: [
        createFolder({
          id: folderId,
          orderBy: "MANUAL",
          sortIncrease: true,
        }),
      ],
      items: [
        createItem({
          id: "with-order",
          folders: [folderId],
          order: { [folderId]: 5 },
          modificationTime: 5,
        }),
        createItem({
          id: "fallback",
          folders: [folderId],
          modificationTime: 50,
        }),
      ],
    });

    const result = store.getFolderItems(folderId);
    expect(result.map((item) => item.id)).toEqual(["fallback", "with-order"]);
  });
});

describe("Store item counts", () => {
  it("computes collection and folder counts from items", () => {
    const folderA = createFolder({ id: "folder-a" });
    const folderB = createFolder({ id: "folder-b" });
    const folderC = createFolder({ id: "folder-c" });

    const store = createStore({
      folders: [folderA, folderB, folderC],
      items: [
        createItem({
          id: "a-only",
          folders: ["folder-a"],
        }),
        createItem({
          id: "ab",
          folders: ["folder-a", "folder-b"],
        }),
        createItem({
          id: "duplicate",
          folders: ["folder-a", "folder-a"],
        }),
        createItem({
          id: "uncategorized",
        }),
        createItem({
          id: "trashed",
          isDeleted: true,
          folders: ["folder-a"],
        }),
      ],
    });

    expect(store.itemCounts).toEqual({
      all: 4,
      uncategorized: 1,
      trash: 1,
    });
    expect(store.folders.get("folder-a")?.itemCount).toBe(3);
    expect(store.folders.get("folder-b")?.itemCount).toBe(1);
    expect(store.folders.get("folder-c")?.itemCount).toBe(0);
  });
});

function createStore(options: {
  libraryPath?: string;
  applicationVersion?: string;
  folders?: Folder[];
  items?: Item[];
  globalSortSettings?: GlobalSortOptions;
}): Store {
  const {
    libraryPath = "",
    applicationVersion = "",
    folders = [],
    items = [],
    globalSortSettings = DEFAULT_GLOBAL_SORT_OPTIONS,
  } = options;

  const folderMap = new Map(folders.map((folder) => [folder.id, folder]));
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return new Store(
    libraryPath,
    applicationVersion,
    folderMap,
    itemMap,
    { ...globalSortSettings },
    computeItemCounts(itemMap, folderMap),
  );
}

function createFolder(overrides: Partial<Folder>): Folder {
  const name = overrides.name ?? "Folder";
  return {
    id: overrides.id ?? "folder-id",
    name,
    nameForSort: overrides.nameForSort ?? computeNameForSort(name),
    description: overrides.description ?? "",
    children: overrides.children ?? [],
    parentId: overrides.parentId,
    manualOrder: overrides.manualOrder ?? 0,
    itemCount: overrides.itemCount ?? 0,
    modificationTime: overrides.modificationTime ?? 0,
    tags: overrides.tags ?? [],
    password: overrides.password ?? "",
    passwordTips: overrides.passwordTips ?? "",
    coverId: overrides.coverId,
    orderBy: overrides.orderBy ?? "GLOBAL",
    sortIncrease: overrides.sortIncrease ?? true,
  };
}

function createItem(overrides: Partial<Item>): Item {
  const name = overrides.name ?? "";
  return {
    id: overrides.id ?? "item-id",
    name,
    nameForSort: overrides.nameForSort ?? computeNameForSort(name),
    size: overrides.size ?? 0,
    btime: overrides.btime ?? 0,
    mtime: overrides.mtime ?? 0,
    ext: overrides.ext ?? "",
    tags: overrides.tags ?? [],
    folders: overrides.folders ?? [],
    isDeleted: overrides.isDeleted ?? false,
    url: overrides.url ?? "",
    annotation: overrides.annotation ?? "",
    modificationTime: overrides.modificationTime ?? 0,
    height: overrides.height ?? 0,
    width: overrides.width ?? 0,
    noThumbnail: overrides.noThumbnail ?? false,
    lastModified: overrides.lastModified ?? 0,
    palettes: overrides.palettes ?? [],
    duration: overrides.duration ?? 0,
    star: overrides.star ?? 0,
    order: { ...(overrides.order ?? {}) },
  };
}
