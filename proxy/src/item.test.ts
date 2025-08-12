import { afterEach, describe, expect, test, vi } from "vitest";
import * as eagleApi from "./eagle-api";
import { transformEagleItem } from "./item";
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
      name: "Test Image 1",
      width: 1920,
      height: 1080,
      size: 1024,
      btime: 0,
      mtime: 0,
      ext: "jpg",
      star: 0,
      duration: 0,
      manualOrder: 0,
    });

    expect(items[1]).toEqual({
      id: "item2",
      name: "Test Image 2",
      width: 1280,
      height: 720,
      size: 2048,
      btime: 0,
      mtime: 0,
      ext: "png",
      star: 0,
      duration: 0,
      manualOrder: 0,
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
      name: "Test Image",
      width: 3840,
      height: 2160,
      size: 1024,
      btime: 1234567890,
      mtime: 0,
      ext: "jpg",
      star: 0,
      duration: 0,
      manualOrder: 1234567890,
    });

    // Verify extra fields from Eagle API are not included
    // biome-ignore lint/suspicious/noExplicitAny: Need to verify absence of properties
    const item = items[0] as any;
    expect(item.tags).toBeUndefined();
    expect(item.folders).toBeUndefined();
    expect(item.url).toBeUndefined();
    expect(item.modificationTime).toBeUndefined();
    expect(item.palettes).toBeUndefined();
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

  describe("folder parameter handling", () => {
    test("accepts folder parameter and passes to Eagle API", async () => {
      const mockData = [
        {
          id: "item1",
          name: "Test Image",
          size: 1024,
          ext: "jpg",
          tags: ["test"],
          folders: ["folder123"],
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
        url: "/item/list?folder=folder123",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith(
        "/api/item/list?limit=1000&folders=folder123",
      );
    });

    test("works without folder parameter (backward compatibility)", async () => {
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
        url: "/item/list",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith("/api/item/list?limit=1000");
    });

    test("ignores empty folder parameter", async () => {
      const mockData: unknown[] = [];

      const mockFn = vi
        .spyOn(eagleApi, "callEagleApi")
        .mockResolvedValue(mockData);

      const app = build();
      const res = await app.inject({
        method: "GET",
        url: "/item/list?folder=",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith("/api/item/list?limit=1000");
    });

    test("ignores whitespace-only folder parameter", async () => {
      const mockData: unknown[] = [];

      const mockFn = vi
        .spyOn(eagleApi, "callEagleApi")
        .mockResolvedValue(mockData);

      const app = build();
      const res = await app.inject({
        method: "GET",
        url: "/item/list?folder=%20%20%20",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith("/api/item/list?limit=1000");
    });

    test("handles both folder and limit parameters", async () => {
      const mockData = [
        {
          id: "item1",
          name: "Test Image",
          size: 1024,
          ext: "jpg",
          tags: [],
          folders: ["folder456"],
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
        url: "/item/list?folder=folder456&limit=100",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith(
        "/api/item/list?limit=100&folders=folder456",
      );
    });

    test("uses default limit when only folder provided", async () => {
      const mockData: unknown[] = [];

      const mockFn = vi
        .spyOn(eagleApi, "callEagleApi")
        .mockResolvedValue(mockData);

      const app = build();
      const res = await app.inject({
        method: "GET",
        url: "/item/list?folder=folder789",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith(
        "/api/item/list?limit=1000&folders=folder789",
      );
    });

    test("handles special characters in folder ID", async () => {
      const mockData: unknown[] = [];

      const mockFn = vi
        .spyOn(eagleApi, "callEagleApi")
        .mockResolvedValue(mockData);

      const app = build();
      const res = await app.inject({
        method: "GET",
        url: "/item/list?folder=folder%20with%20spaces%26special%40chars",
      });

      expect(res.statusCode).toBe(200);
      expect(mockFn).toHaveBeenCalledWith(
        "/api/item/list?limit=1000&folders=folder+with+spaces%26special%40chars",
      );
    });

    test("returns empty array for non-existent folder", async () => {
      const mockData: unknown[] = [];

      vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

      const app = build();
      const res = await app.inject({
        method: "GET",
        url: "/item/list?folder=nonexistent",
      });

      expect(res.statusCode).toBe(200);
      const items = res.json();

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    test("transforms folder-specific items correctly", async () => {
      const mockData = [
        {
          id: "item1",
          name: "Folder Image 1",
          size: 1024,
          ext: "jpg",
          tags: ["folder-specific"],
          folders: ["target-folder"],
          url: "file:///path/to/image1.jpg",
          width: 1920,
          height: 1080,
        },
        {
          id: "item2",
          name: "Folder Image 2",
          size: 2048,
          ext: "png",
          tags: ["folder-specific"],
          folders: ["target-folder"],
          url: "file:///path/to/image2.png",
          width: 1280,
          height: 720,
        },
      ];

      vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

      const app = build();
      const res = await app.inject({
        method: "GET",
        url: "/item/list?folder=target-folder",
      });

      expect(res.statusCode).toBe(200);
      const items = res.json();

      expect(items.length).toBe(2);
      expect(items[0]).toEqual({
        id: "item1",
        name: "Folder Image 1",
        width: 1920,
        height: 1080,
        size: 1024,
        btime: 0,
        mtime: 0,
        ext: "jpg",
        star: 0,
        duration: 0,
        manualOrder: 0,
      });
      expect(items[1]).toEqual({
        id: "item2",
        name: "Folder Image 2",
        width: 1280,
        height: 720,
        size: 2048,
        btime: 0,
        mtime: 0,
        ext: "png",
        star: 0,
        duration: 0,
        manualOrder: 0,
      });
    });
  });
});

describe("transformEagleItem", () => {
  test("transforms basic Eagle item with all required fields", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 1024000,
      ext: "jpg",
      tags: ["test"],
      folders: ["folder1"],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      btime: 1640995200000,
      mtime: 1640995300000,
      star: 3,
      duration: 120,
    };

    const result = transformEagleItem(eagleItem);

    expect(result).toEqual({
      id: "item1",
      name: "Test Image",
      width: 1920,
      height: 1080,
      size: 1024000,
      btime: 1640995200000,
      mtime: 1640995300000,
      ext: "jpg",
      star: 3,
      duration: 120,
      manualOrder: 1640995200000, // fallback to btime
    });
  });

  test("uses default values for missing optional fields", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      // Missing: btime, mtime, star, duration
    };

    const result = transformEagleItem(eagleItem);

    expect(result).toEqual({
      id: "item1",
      name: "Test Image",
      width: 1920,
      height: 1080,
      size: 1024,
      btime: 0,
      mtime: 0,
      ext: "jpg",
      star: 0,
      duration: 0,
      manualOrder: 0, // fallback to btime (0)
    });
  });

  test("calculates manualOrder from folder-specific order when available", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: ["folder1"],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      btime: 1640995200000,
      order: {
        folder1: "123.456",
        folder2: "789.012",
      },
    };

    const result = transformEagleItem(eagleItem, "folder1");

    expect(result.manualOrder).toBe(123.456);
  });

  test("falls back to btime when folder order not available", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: ["folder1"],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      btime: 1640995200000,
      order: {
        folder2: "123.456", // different folder
      },
    };

    const result = transformEagleItem(eagleItem, "folder1");

    expect(result.manualOrder).toBe(1640995200000); // btime
  });

  test("falls back to btime when order object is missing", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: ["folder1"],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      btime: 1640995200000,
      // No order object
    };

    const result = transformEagleItem(eagleItem, "folder1");

    expect(result.manualOrder).toBe(1640995200000); // btime
  });

  test("handles zero values correctly", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 0,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      btime: 0,
      mtime: 0,
      star: 0,
      duration: 0,
    };

    const result = transformEagleItem(eagleItem);

    expect(result).toEqual({
      id: "item1",
      name: "Test Image",
      width: 1920,
      height: 1080,
      size: 0,
      btime: 0,
      mtime: 0,
      ext: "jpg",
      star: 0,
      duration: 0,
      manualOrder: 0,
    });
  });

  test("handles string order values correctly", () => {
    const eagleItem = {
      id: "item1",
      name: "Test Image",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: ["folder1"],
      url: "file:///path/to/image.jpg",
      width: 1920,
      height: 1080,
      btime: 1640995200000,
      order: {
        folder1: "999.999",
      },
    };

    const result = transformEagleItem(eagleItem, "folder1");

    expect(result.manualOrder).toBe(999.999);
  });
});
