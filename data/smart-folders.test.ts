import { describe, expect, it, vi } from "vitest";

import { buildSmartFolderTree } from "./smart-folders";
import { DEFAULT_GLOBAL_SORT_OPTIONS } from "./sort-options";
import type { Item } from "./types";

function createItem(overrides: Partial<Item>): Item {
  const name = overrides.name ?? "";

  return {
    id: overrides.id ?? "item-id",
    name,
    nameForSort: overrides.nameForSort ?? name,
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
    order: overrides.order ?? {},
    fontMetas: overrides.fontMetas,
    bpm: overrides.bpm ?? 0,
    medium: overrides.medium ?? "",
  };
}

describe("buildSmartFolderTree", () => {
  it("filters items using type rules and records item ids", () => {
    const items = new Map(
      [
        createItem({
          id: "image-1",
          name: "Screenshot",
          ext: "png",
          modificationTime: 1,
        }),
        createItem({
          id: "video-1",
          name: "Clip",
          ext: "mp4",
          duration: 120,
          modificationTime: 2,
        }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "videos",
        name: "Videos",
        conditions: [
          {
            match: "AND",
            boolean: "TRUE",
            rules: [{ property: "type", method: "equal", value: "video" }],
          },
        ],
      },
    ];

    const { smartFolders, itemIdMap } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(smartFolders).toHaveLength(1);
    expect(itemIdMap.get("videos")).toEqual(["video-1"]);
    expect(smartFolders[0]?.coverId).toBe("video-1");
    expect(smartFolders[0]?.itemCount).toBe(1);
  });

  it("applies name rules case-insensitively", () => {
    const items = new Map(
      [
        createItem({ id: "item-1", name: "Alpha" }),
        createItem({ id: "item-2", name: "beta" }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "contains-a",
        conditions: [
          {
            match: "AND",
            boolean: "TRUE",
            rules: [
              {
                property: "name",
                method: "contain",
                value: "AL",
              },
            ],
          },
        ],
      },
    ];

    const { itemIdMap, smartFolders } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(itemIdMap.get("contains-a")).toEqual(["item-1"]);
    expect(smartFolders[0]?.itemCount).toBe(1);
  });

  it("supports boolean FALSE to negate conditions", () => {
    const items = new Map(
      [
        createItem({ id: "video-1", name: "Clip", duration: 10 }),
        createItem({ id: "image-1", name: "Poster" }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "not-video",
        conditions: [
          {
            match: "AND",
            boolean: "FALSE",
            rules: [{ property: "type", method: "equal", value: "video" }],
          },
        ],
      },
    ];

    const { itemIdMap, smartFolders } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(itemIdMap.get("not-video")).toEqual(["image-1"]);
    expect(smartFolders[0]?.itemCount).toBe(1);
  });

  it("inherits parent item set for child folders", () => {
    const items = new Map(
      [
        createItem({ id: "item-1", name: "Alpha Clip", duration: 5 }),
        createItem({ id: "item-2", name: "Alpha Still" }),
        createItem({ id: "item-3", name: "Beta Clip", duration: 5 }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "alpha",
        conditions: [
          {
            match: "AND",
            boolean: "TRUE",
            rules: [
              {
                property: "name",
                method: "contain",
                value: "alpha",
              },
            ],
          },
        ],
        children: [
          {
            id: "alpha-video",
            conditions: [
              {
                match: "AND",
                boolean: "TRUE",
                rules: [{ property: "type", method: "equal", value: "video" }],
              },
            ],
          },
        ],
      },
    ];

    const { itemIdMap, smartFolders } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(itemIdMap.get("alpha")).toEqual(["item-1", "item-2"]);
    expect(itemIdMap.get("alpha-video")).toEqual(["item-1"]);
    expect(smartFolders[0]?.itemCount).toBe(2);
    expect(smartFolders[0]?.children[0]?.itemCount).toBe(1);
  });

  it("logs and skips invalid rules while keeping the folder", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const items = new Map(
      [createItem({ id: "item-1" })].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "invalid",
        conditions: [
          {
            rules: [{ property: "unknown", method: "equal", value: "x" }],
          },
        ],
      },
    ];

    const { itemIdMap, smartFolders } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(errorSpy).toHaveBeenCalled();
    expect(itemIdMap.get("invalid")).toEqual(["item-1"]);
    expect(smartFolders[0]?.itemCount).toBe(1);

    errorSpy.mockRestore();
  });
});
