/**
 * @vitest-environment node
 */
import type { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { getStore } from "@/data/store";
import type { Folder, Item } from "@/data/types";
import { GET } from "./route";

vi.mock("@/data/store", () => ({
  getStore: vi.fn(),
}));

const mockedGetStore = vi.mocked(getStore);

describe("GET /api/items/[id]", () => {
  it("returns folder summaries with names in item order", async () => {
    const folders = new Map<string, Folder>([
      [
        "folder-a",
        {
          id: "folder-a",
          name: "Folder A",
          nameForSort: "Folder A",
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
        },
      ],
      [
        "folder-b",
        {
          id: "folder-b",
          name: "Folder B",
          nameForSort: "Folder B",
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
        },
      ],
    ]);

    const item: Item = {
      id: "item-1",
      name: "",
      nameForSort: "",
      size: 1000,
      btime: 0,
      mtime: 0,
      ext: "jpg",
      tags: [],
      folders: ["folder-a", "folder-missing", "folder-b"],
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
      fontMetas: undefined,
      bpm: 0,
      medium: "",
      comments: [],
    };

    mockedGetStore.mockResolvedValue({
      items: new Map([["item-1", item]]),
      folders,
    } as unknown as Awaited<ReturnType<typeof getStore>>);

    const response = await GET({} as unknown as NextRequest, {
      params: Promise.resolve({ id: "item-1" }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.folderSummaries).toEqual([
      { id: "folder-a", name: "Folder A" },
      { id: "folder-b", name: "Folder B" },
    ]);
  });
});
