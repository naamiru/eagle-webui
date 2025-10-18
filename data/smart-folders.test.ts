/**
 * @vitest-environment node
 */

import { describe, expect, it, vi } from "vitest";

import { buildSmartFolderTree } from "./smart-folders";
import { DEFAULT_GLOBAL_SORT_OPTIONS } from "./sort-options";
import type { Folder, Item } from "./types";

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
    comments: overrides.comments,
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

  it("evaluates tags and folders collection rules", () => {
    const items = new Map(
      [
        createItem({
          id: "item-1",
          name: "One",
          tags: ["foo"],
          folders: ["FOLDER_A"],
        }),
        createItem({
          id: "item-2",
          name: "Two",
          tags: ["foo", "bar"],
          folders: ["FOLDER_A", "FOLDER_B"],
        }),
        createItem({ id: "item-3", name: "Three", tags: [], folders: [] }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "tags-union",
        conditions: [
          {
            rules: [{ property: "tags", method: "union", value: ["bar"] }],
          },
        ],
      },
      {
        id: "tags-intersection",
        conditions: [
          {
            rules: [
              {
                property: "tags",
                method: "intersection",
                value: ["foo", "bar"],
              },
            ],
          },
        ],
      },
      {
        id: "tags-equal",
        conditions: [
          {
            rules: [{ property: "tags", method: "equal", value: ["foo"] }],
          },
        ],
      },
      {
        id: "tags-identity",
        conditions: [
          {
            rules: [{ property: "tags", method: "identity", value: ["bar"] }],
          },
        ],
      },
      {
        id: "tags-empty",
        conditions: [
          {
            rules: [{ property: "tags", method: "empty" }],
          },
        ],
      },
      {
        id: "folders-union",
        conditions: [
          {
            rules: [
              { property: "folders", method: "union", value: ["FOLDER_A"] },
            ],
          },
        ],
      },
      {
        id: "folders-empty",
        conditions: [
          {
            rules: [{ property: "folders", method: "empty" }],
          },
        ],
      },
    ];

    const { itemIdMap } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(itemIdMap.get("tags-union")).toEqual(["item-2"]);
    expect(itemIdMap.get("tags-intersection")).toEqual(["item-2"]);
    expect(itemIdMap.get("tags-equal")).toEqual(["item-1"]);
    expect(itemIdMap.get("tags-identity")).toEqual(["item-1", "item-3"]);
    expect(itemIdMap.get("tags-empty")).toEqual(["item-3"]);
    expect(itemIdMap.get("folders-union")).toEqual(["item-1", "item-2"]);
    expect(itemIdMap.get("folders-empty")).toEqual(["item-3"]);
  });

  it("matches folderName, url, annotation, and comments rules", () => {
    const folders = new Map([
      [
        "FOLDER_ALPHA",
        {
          id: "FOLDER_ALPHA",
          name: "Projects",
          nameForSort: "projects",
          description: "",
          children: [],
          parentId: undefined,
          manualOrder: 0,
          itemCount: 0,
          modificationTime: 0,
          tags: [],
          password: "",
          passwordTips: "",
          coverId: undefined,
          orderBy: "GLOBAL",
          sortIncrease: true,
        } as Folder,
      ],
    ]);

    const items = new Map(
      [
        createItem({
          id: "item-1",
          name: "Doc",
          folders: ["FOLDER_ALPHA"],
          url: "https://example.com",
          annotation: "Needs Review",
          comments: [{ id: "c1", annotation: "Looks good" }],
        }),
        createItem({
          id: "item-2",
          name: "Other",
          folders: ["UNKNOWN_FOLDER"],
          url: "",
          annotation: "",
          comments: [],
        }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "folder-name",
        conditions: [
          {
            rules: [
              {
                property: "folderName",
                method: "contain",
                value: "pro",
              },
            ],
          },
        ],
      },
      {
        id: "folder-empty",
        conditions: [
          {
            rules: [{ property: "folderName", method: "empty" }],
          },
        ],
      },
      {
        id: "url-rule",
        conditions: [
          {
            rules: [
              {
                property: "url",
                method: "startWith",
                value: "https://example",
              },
            ],
          },
        ],
      },
      {
        id: "annotation-rule",
        conditions: [
          {
            rules: [
              {
                property: "annotation",
                method: "contain",
                value: "needs",
              },
            ],
          },
        ],
      },
      {
        id: "comments-rule",
        conditions: [
          {
            rules: [
              {
                property: "comments",
                method: "contain",
                value: "looks",
              },
            ],
          },
        ],
      },
      {
        id: "comments-empty",
        conditions: [
          {
            rules: [{ property: "comments", method: "empty" }],
          },
        ],
      },
    ];

    const { itemIdMap } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
      { folders },
    );

    expect(itemIdMap.get("folder-name")).toEqual(["item-1"]);
    expect(itemIdMap.get("folder-empty")).toEqual(["item-2"]);
    expect(itemIdMap.get("url-rule")).toEqual(["item-1"]);
    expect(itemIdMap.get("annotation-rule")).toEqual(["item-1"]);
    expect(itemIdMap.get("comments-rule")).toEqual(["item-1"]);
    expect(itemIdMap.get("comments-empty")).toEqual(["item-2"]);
  });

  it("evaluates color similarity and grayscale rules", () => {
    const items = new Map(
      [
        createItem({
          id: "item-red",
          name: "Red",
          palettes: [{ color: [255, 0, 0], ratio: 100 }],
        }),
        createItem({
          id: "item-blue",
          name: "Blue",
          palettes: [{ color: [0, 0, 255], ratio: 100 }],
        }),
        createItem({
          id: "item-gray",
          name: "Gray",
          palettes: [{ color: [12, 12, 15], ratio: 100 }],
        }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "color-similar",
        conditions: [
          {
            rules: [
              {
                property: "color",
                method: "similar",
                value: "#ff0000",
              },
            ],
          },
        ],
      },
      {
        id: "color-accuracy",
        conditions: [
          {
            rules: [
              {
                property: "color",
                method: "accuracy",
                value: "#ff0101",
              },
            ],
          },
        ],
      },
      {
        id: "color-grayscale",
        conditions: [
          {
            rules: [{ property: "color", method: "grayscale" }],
          },
        ],
      },
    ];

    const { itemIdMap } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(itemIdMap.get("color-similar")).toEqual(["item-red"]);
    expect(itemIdMap.get("color-accuracy")).toEqual(["item-red"]);
    expect(itemIdMap.get("color-grayscale")).toEqual(["item-gray"]);
  });

  it("supports date and numeric comparison rules", () => {
    const DAY_MS = 86_400_000;
    const now = DAY_MS * 10;
    const items = new Map(
      [
        createItem({
          id: "item-metrics",
          name: "Metrics",
          modificationTime: now - DAY_MS,
          mtime: now - 2 * DAY_MS,
          btime: now - 3 * DAY_MS,
          width: 1920,
          height: 1080,
          size: 5 * 1024 * 1024,
          duration: 180,
          bpm: 128,
        }),
        createItem({
          id: "item-other",
          name: "Other",
          modificationTime: now - 6 * DAY_MS,
          mtime: now - 7 * DAY_MS,
          btime: now - 8 * DAY_MS,
          width: 640,
          height: 640,
          size: 200 * 1024,
          duration: 0,
          bpm: 0,
        }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "create-within",
        conditions: [
          {
            rules: [{ property: "createTime", method: "within", value: [3] }],
          },
        ],
      },
      {
        id: "mtime-after",
        conditions: [
          {
            rules: [
              {
                property: "mtime",
                method: "after",
                value: [now - 4 * DAY_MS],
              },
            ],
          },
        ],
      },
      {
        id: "btime-on",
        conditions: [
          {
            rules: [
              {
                property: "btime",
                method: "on",
                value: [now - 3 * DAY_MS],
              },
            ],
          },
        ],
      },
      {
        id: "width-between",
        conditions: [
          {
            rules: [
              {
                property: "width",
                method: "between",
                value: [1280, 2000],
              },
            ],
          },
        ],
      },
      {
        id: "file-size",
        conditions: [
          {
            rules: [
              {
                property: "fileSize",
                method: ">=",
                value: [5],
                unit: "mb",
              },
            ],
          },
        ],
      },
      {
        id: "duration-minutes",
        conditions: [
          {
            rules: [
              {
                property: "duration",
                method: ">",
                value: [2],
                unit: "m",
              },
            ],
          },
        ],
      },
      {
        id: "bpm-range",
        conditions: [
          {
            rules: [
              {
                property: "bpm",
                method: "between",
                value: [120, 140],
              },
            ],
          },
        ],
      },
    ];

    const { itemIdMap } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
      { now },
    );

    expect(itemIdMap.get("create-within")).toEqual(["item-metrics"]);
    expect(itemIdMap.get("mtime-after")).toEqual(["item-metrics"]);
    expect(itemIdMap.get("btime-on")).toEqual(["item-metrics"]);
    expect(itemIdMap.get("width-between")).toEqual(["item-metrics"]);
    expect(itemIdMap.get("file-size")).toEqual(["item-metrics"]);
    expect(itemIdMap.get("duration-minutes")).toEqual(["item-metrics"]);
    expect(itemIdMap.get("bpm-range")).toEqual(["item-metrics"]);
  });

  it("handles shape, rating, and font activation rules", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const items = new Map(
      [
        createItem({
          id: "item-landscape",
          name: "Landscape",
          width: 2000,
          height: 1000,
          star: 5,
          fontMetas: undefined,
        }),
        createItem({
          id: "item-font",
          name: "Font",
          width: 800,
          height: 800,
          star: 3,
          fontMetas: { numGlyphs: 100 },
        }),
      ].map((item) => [item.id, item]),
    );

    const rawSmartFolders = [
      {
        id: "shape-landscape",
        conditions: [
          {
            rules: [{ property: "shape", method: "equal", value: "landscape" }],
          },
        ],
      },
      {
        id: "rating-five",
        conditions: [
          {
            rules: [{ property: "rating", method: "equal", value: 5 }],
          },
        ],
      },
      {
        id: "font-activated",
        conditions: [
          {
            rules: [{ property: "fontActivated", method: "activate" }],
          },
        ],
      },
    ];

    const { itemIdMap } = buildSmartFolderTree(
      rawSmartFolders,
      items,
      DEFAULT_GLOBAL_SORT_OPTIONS,
    );

    expect(itemIdMap.get("shape-landscape")).toEqual(["item-landscape"]);
    expect(itemIdMap.get("rating-five")).toEqual(["item-landscape"]);
    expect(itemIdMap.get("font-activated")).toEqual(["item-font"]);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("fontActivated"),
    );

    errorSpy.mockRestore();
  });
});
