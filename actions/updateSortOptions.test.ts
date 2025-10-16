/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/data/settings", () => ({
  saveGlobalSortSettings: vi.fn(),
}));

vi.mock("@/data/store", () => ({
  getStore: vi.fn(),
}));

import { saveGlobalSortSettings } from "@/data/settings";
import { getStore } from "@/data/store";
import { updateFolderSortOptions } from "./updateFolderSortOptions";
import { updateGlobalSortOptions } from "./updateGlobalSortOptions";

const saveGlobalSortSettingsMock = vi.mocked(saveGlobalSortSettings);
const getStoreMock = vi.mocked(getStore);

beforeEach(() => {
  vi.clearAllMocks();
  getStoreMock.mockReset();
  saveGlobalSortSettingsMock.mockReset();
});

function createMockStore() {
  return {
    globalSortSettings: {
      orderBy: "IMPORT" as const,
      sortIncrease: true,
    },
    folders: new Map<string, { orderBy: string; sortIncrease: boolean }>(),
  };
}

describe("updateGlobalSortOptions", () => {
  it("persists the new sort options and updates the store snapshot", async () => {
    const store = createMockStore();
    getStoreMock.mockResolvedValue(store as never);

    const result = await updateGlobalSortOptions({
      orderBy: "NAME",
      sortIncrease: false,
    });

    expect(result).toEqual({ ok: true });
    expect(saveGlobalSortSettingsMock).toHaveBeenCalledWith({
      orderBy: "NAME",
      sortIncrease: false,
    });
    expect(getStoreMock).toHaveBeenCalledTimes(1);
    expect(store.globalSortSettings.orderBy).toBe("NAME");
    expect(store.globalSortSettings.sortIncrease).toBe(false);
  });

  it("rejects invalid sort methods", async () => {
    const result = await updateGlobalSortOptions({
      orderBy: "GLOBAL" as never,
      sortIncrease: true,
    });

    expect(result).toEqual({ ok: false, error: "INVALID_ORDER_BY" });
    expect(saveGlobalSortSettingsMock).not.toHaveBeenCalled();
    expect(getStoreMock).not.toHaveBeenCalled();
  });

  it("returns an error when persistence fails", async () => {
    const store = createMockStore();
    getStoreMock.mockResolvedValue(store as never);
    saveGlobalSortSettingsMock.mockRejectedValueOnce(new Error("disk full"));

    const result = await updateGlobalSortOptions({
      orderBy: "NAME",
      sortIncrease: true,
    });

    expect(result.ok).toBe(false);
    expect(saveGlobalSortSettingsMock).toHaveBeenCalledTimes(1);
    expect(getStoreMock).not.toHaveBeenCalled();
  });
});

describe("updateFolderSortOptions", () => {
  it("updates the folder sort configuration", async () => {
    const store = createMockStore();
    const folder = { orderBy: "GLOBAL", sortIncrease: true };
    store.folders.set("folder-1", folder);
    getStoreMock.mockResolvedValue(store as never);

    const result = await updateFolderSortOptions({
      folderId: "folder-1",
      orderBy: "NAME",
      sortIncrease: false,
    });

    expect(result).toEqual({ ok: true });
    expect(getStoreMock).toHaveBeenCalledTimes(1);
    expect(folder.orderBy).toBe("NAME");
    expect(folder.sortIncrease).toBe(false);
  });

  it("rejects unknown folders", async () => {
    const store = createMockStore();
    getStoreMock.mockResolvedValue(store as never);

    const result = await updateFolderSortOptions({
      folderId: "missing",
      orderBy: "NAME",
      sortIncrease: true,
    });

    expect(result).toEqual({ ok: false, error: "FOLDER_NOT_FOUND" });
    expect(getStoreMock).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid sort methods", async () => {
    const result = await updateFolderSortOptions({
      folderId: "folder-1",
      orderBy: "INVALID" as never,
      sortIncrease: true,
    });

    expect(result).toEqual({ ok: false, error: "INVALID_ORDER_BY" });
    expect(getStoreMock).not.toHaveBeenCalled();
  });
});
