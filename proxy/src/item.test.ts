import { afterEach, describe, expect, test, vi } from "vitest";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/item/list", () => {
  test("returns transformed items with default parameters", async () => {
    const mockData = [
      {
        id: "item1",
        name: "Test Image 1",
        size: 1024,
        ext: "jpg",
        tags: ["test"],
        folders: ["folder1"],
        url: "file:///path/to/image1.jpg",
        width: 1920,
        height: 1080,
      },
      {
        id: "item2",
        name: "Test Image 2",
        size: 2048,
        ext: "png",
        tags: ["test", "sample"],
        folders: ["folder2"],
        url: "file:///path/to/image2.png",
        width: 1280,
        height: 720,
      },
    ];

    const mockFn = vi
      .spyOn(eagleApi, "callEagleApi")
      .mockResolvedValue(mockData);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    expect(res.statusCode).toBe(200);
    const items = res.json();

    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(2);

    expect(items[0]).toEqual({
      id: "item1",
      width: 1920,
      height: 1080,
    });

    expect(items[1]).toEqual({
      id: "item2",
      width: 1280,
      height: 720,
    });

    expect(mockFn).toHaveBeenCalledWith("/api/item/list?limit=1000");
  });

  test("accepts and forwards limit parameter", async () => {
    const mockData = [
      {
        id: "item1",
        name: "Test Image",
        size: 1024,
        ext: "jpg",
        tags: [],
        folders: [],
        url: "file:///path/to/image.jpg",
        width: 1920,
        height: 1080,
      },
    ];

    const mockFn = vi
      .spyOn(eagleApi, "callEagleApi")
      .mockResolvedValue(mockData);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/item/list?limit=50",
    });

    expect(res.statusCode).toBe(200);
    expect(mockFn).toHaveBeenCalledWith("/api/item/list?limit=50");
  });

  test("uses default values when parameters not provided", async () => {
    const mockData: unknown[] = [];

    const mockFn = vi
      .spyOn(eagleApi, "callEagleApi")
      .mockResolvedValue(mockData);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    expect(res.statusCode).toBe(200);
    expect(mockFn).toHaveBeenCalledWith("/api/item/list?limit=1000");
  });

  test("transforms Eagle item structure to frontend format", async () => {
    const mockData = [
      {
        id: "item1",
        name: "Test Image",
        size: 1024,
        ext: "jpg",
        tags: ["nature", "landscape"],
        folders: ["folder1", "folder2"],
        url: "file:///path/to/image.jpg",
        width: 3840,
        height: 2160,
        modificationTime: 1234567890,
        lastModified: 1234567890,
        btime: 1234567890,
        palettes: [],
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    expect(res.statusCode).toBe(200);
    const items = res.json();

    expect(items[0]).toEqual({
      id: "item1",
      width: 3840,
      height: 2160,
    });

    // Verify no extra fields are included
    // biome-ignore lint/suspicious/noExplicitAny: Need to verify absence of properties
    const item = items[0] as any;
    expect(item.name).toBeUndefined();
    expect(item.size).toBeUndefined();
    expect(item.ext).toBeUndefined();
    expect(item.tags).toBeUndefined();
    expect(item.folders).toBeUndefined();
    expect(item.url).toBeUndefined();
    expect(item.modificationTime).toBeUndefined();
  });

  test("handles empty item list from Eagle", async () => {
    const mockData: unknown[] = [];

    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    expect(res.statusCode).toBe(200);
    const items = res.json();

    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(0);
  });
});