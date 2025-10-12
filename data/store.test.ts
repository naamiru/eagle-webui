/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LibraryPathNotFoundError } from "./errors";
import type { Folder, Item, Store } from "./types";

vi.mock("./library/discover-library-path", () => ({
  discoverLibraryPath: vi.fn(),
}));

vi.mock("./library/import-metadata", () => ({
  importLibraryMetadata: vi.fn(),
}));

import { discoverLibraryPath } from "./library/discover-library-path";
import { importLibraryMetadata } from "./library/import-metadata";
import { __resetStoreForTests, getFolders, getStore } from "./store";

const discoverLibraryPathMock = vi.mocked(discoverLibraryPath);
const importLibraryMetadataMock = vi.mocked(importLibraryMetadata);

const mockFolder: Folder = {
  id: "root",
  name: "Root",
  description: "",
  children: [],
  manualOrder: 0,
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

    expect(getFolders()).toHaveLength(0);
    const first = await getStore();
    const second = await getStore();
    const folders = getFolders();

    expect(first).toBe(second);
    expect(first.libraryPath).toBe("C:/library");
    expect(folders).toHaveLength(1);
    expect(folders[0]?.id).toBe("root");
    expect(importLibraryMetadataMock).toHaveBeenCalledTimes(1);
    expect(discoverLibraryPathMock).toHaveBeenCalledTimes(1);
  });

  it("propagates LibraryPathNotFoundError from discovery", async () => {
    discoverLibraryPathMock.mockRejectedValue(new LibraryPathNotFoundError());

    await expect(getStore()).rejects.toBeInstanceOf(LibraryPathNotFoundError);
    expect(discoverLibraryPathMock).toHaveBeenCalledTimes(1);
    expect(importLibraryMetadataMock).not.toHaveBeenCalled();
  });

  it("resets the initialization promise after an import failure", async () => {
    discoverLibraryPathMock.mockResolvedValue("C:/library");
    importLibraryMetadataMock
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(mockLibraryData());

    await expect(getStore()).rejects.toThrow("boom");
    const second = await getStore();

    expect(second.applicationVersion).toBe("4.0.0");
    expect(importLibraryMetadataMock).toHaveBeenCalledTimes(2);
  });
});

function mockLibraryData(): Store {
  return {
    libraryPath: "C:/library",
    applicationVersion: "4.0.0",
    folders: new Map([["root", mockFolder]]),
    items: new Map([["item-1", mockItem]]),
  };
}
