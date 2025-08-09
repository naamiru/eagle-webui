import { suite, type TestContext, test } from "node:test";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

suite("/item/list", () => {
  test("returns transformed items with default parameters", async (t: TestContext) => {
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

    const mockFn = t.mock.method(
      eagleApi,
      "callEagleApi",
      async () => mockData,
    );

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const items = res.json();

    t.assert.strictEqual(Array.isArray(items), true);
    t.assert.strictEqual(items.length, 2);

    t.assert.deepStrictEqual(items[0], {
      id: "item1",
      original:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
      width: 1920,
      height: 1080,
    });

    t.assert.deepStrictEqual(items[1], {
      id: "item2",
      original:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
      width: 1280,
      height: 720,
    });

    t.assert.strictEqual(
      mockFn.mock.calls[0].arguments[0],
      "/api/item/list?limit=1000",
    );
  });

  test("accepts and forwards limit parameter", async (t: TestContext) => {
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

    const mockFn = t.mock.method(
      eagleApi,
      "callEagleApi",
      async () => mockData,
    );

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/item/list?limit=50",
    });

    t.assert.strictEqual(res.statusCode, 200);
    t.assert.strictEqual(
      mockFn.mock.calls[0].arguments[0],
      "/api/item/list?limit=50",
    );
  });

  test("uses default values when parameters not provided", async (t: TestContext) => {
    const mockData: unknown[] = [];

    const mockFn = t.mock.method(
      eagleApi,
      "callEagleApi",
      async () => mockData,
    );

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    t.assert.strictEqual(
      mockFn.mock.calls[0].arguments[0],
      "/api/item/list?limit=1000",
    );
  });

  test("transforms Eagle item structure to frontend format", async (t: TestContext) => {
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

    t.mock.method(eagleApi, "callEagleApi", async () => mockData);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const items = res.json();

    t.assert.deepStrictEqual(items[0], {
      id: "item1",
      original:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
      thumbnail:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
      width: 3840,
      height: 2160,
    });

    // Verify no extra fields are included
    // biome-ignore lint/suspicious/noExplicitAny: Need to verify absence of properties
    const item = items[0] as any;
    t.assert.strictEqual(item.name, undefined);
    t.assert.strictEqual(item.size, undefined);
    t.assert.strictEqual(item.ext, undefined);
    t.assert.strictEqual(item.tags, undefined);
    t.assert.strictEqual(item.folders, undefined);
    t.assert.strictEqual(item.url, undefined);
    t.assert.strictEqual(item.modificationTime, undefined);
  });

  test("handles empty item list from Eagle", async (t: TestContext) => {
    const mockData: unknown[] = [];

    t.mock.method(eagleApi, "callEagleApi", async () => mockData);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/item/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const items = res.json();

    t.assert.strictEqual(Array.isArray(items), true);
    t.assert.strictEqual(items.length, 0);
  });
});
