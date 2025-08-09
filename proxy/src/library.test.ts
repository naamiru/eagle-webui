import path from "node:path";
import { suite, type TestContext, test } from "node:test";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

suite("/library/info", () => {
  test("extracts library path from valid thumbnail path", async (t: TestContext) => {
    const validItem = {
      id: "TEST123",
      name: "test.jpg",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "https://example.com/test.jpg",
      height: 100,
      width: 100,
    };

    const thumbnailPath = path.join(
      path.sep,
      "Users",
      "test",
      "Eagle.library",
      "images",
      "TEST123.info",
      "thumbnail.png",
    );

    t.mock.method(eagleApi, "callEagleApi", async (apiPath: string) => {
      if (apiPath === "/api/item/list?limit=1") {
        return [validItem];
      }
      if (apiPath === "/api/item/thumbnail?id=TEST123") {
        return thumbnailPath;
      }
      throw new Error(`Unexpected API path: ${apiPath}`);
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    const expectedPath = path.join(path.sep, "Users", "test", "Eagle.library");
    t.assert.strictEqual(body.path, expectedPath);
  });

  test("handles Windows paths correctly", async (t: TestContext) => {
    // Mock path.sep to simulate Windows environment
    t.mock.getter(path, "sep", () => "\\");

    const validItem = {
      id: "WIN123",
      name: "test.jpg",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "https://example.com/test.jpg",
      height: 100,
      width: 100,
    };

    const windowsThumbnailPath =
      "C:\\Users\\test\\Eagle.library\\images\\WIN123.info\\thumbnail.png";

    t.mock.method(eagleApi, "callEagleApi", async (apiPath: string) => {
      if (apiPath === "/api/item/list?limit=1") {
        return [validItem];
      }
      if (apiPath === "/api/item/thumbnail?id=WIN123") {
        return windowsThumbnailPath;
      }
      throw new Error(`Unexpected API path: ${apiPath}`);
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    t.assert.strictEqual(body.path, "C:\\Users\\test\\Eagle.library");
  });

  test("handles Unix/macOS paths correctly", async (t: TestContext) => {
    // Mock path.sep to simulate Unix/macOS environment
    t.mock.getter(path, "sep", () => "/");

    const validItem = {
      id: "UNIX123",
      name: "test.jpg",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "https://example.com/test.jpg",
      height: 100,
      width: 100,
    };

    const unixThumbnailPath =
      "/Users/test/Eagle.library/images/UNIX123.info/thumbnail.png";

    t.mock.method(eagleApi, "callEagleApi", async (apiPath: string) => {
      if (apiPath === "/api/item/list?limit=1") {
        return [validItem];
      }
      if (apiPath === "/api/item/thumbnail?id=UNIX123") {
        return unixThumbnailPath;
      }
      throw new Error(`Unexpected API path: ${apiPath}`);
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    t.assert.strictEqual(body.path, "/Users/test/Eagle.library");
  });

  test("returns 404 when no items found in library", async (t: TestContext) => {
    t.mock.method(eagleApi, "callEagleApi", async () => []);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 404);
    const body = res.json();
    t.assert.strictEqual(body.error, "No items found in Eagle library");
  });

  test("returns 500 when thumbnail path has no .library directory", async (t: TestContext) => {
    const validItem = {
      id: "INVALID123",
      name: "test.jpg",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "https://example.com/test.jpg",
      height: 100,
      width: 100,
    };

    const invalidThumbnailPath =
      "/Users/test/invalid/path/without/library/thumbnail.png";

    t.mock.method(eagleApi, "callEagleApi", async (apiPath: string) => {
      if (apiPath === "/api/item/list?limit=1") {
        return [validItem];
      }
      if (apiPath === "/api/item/thumbnail?id=INVALID123") {
        return invalidThumbnailPath;
      }
      throw new Error(`Unexpected API path: ${apiPath}`);
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 500);
    const body = res.json();
    t.assert.strictEqual(
      body.error,
      "Unable to determine library path from thumbnail URL",
    );
  });

  test("does not match paths with .libraryextra or similar", async (t: TestContext) => {
    const validItem = {
      id: "FALSE123",
      name: "test.jpg",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "https://example.com/test.jpg",
      height: 100,
      width: 100,
    };

    const falsePositivePath = path.join(
      path.sep,
      "Users",
      "test",
      "file.libraryextra",
      "images",
      "thumbnail.png",
    );

    t.mock.method(eagleApi, "callEagleApi", async (apiPath: string) => {
      if (apiPath === "/api/item/list?limit=1") {
        return [validItem];
      }
      if (apiPath === "/api/item/thumbnail?id=FALSE123") {
        return falsePositivePath;
      }
      throw new Error(`Unexpected API path: ${apiPath}`);
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 500);
    const body = res.json();
    t.assert.strictEqual(
      body.error,
      "Unable to determine library path from thumbnail URL",
    );
  });

  test("handles Eagle service offline error", async (t: TestContext) => {
    const error = new eagleApi.EagleApiError(
      503,
      "Eagle service is not running. Please ensure Eagle is running on port 41595",
    );

    t.mock.method(eagleApi, "callEagleApi", async () => {
      throw error;
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 503);
    const body = res.json();
    t.assert.match(body.error, /Eagle service is not running/);
  });

  test("handles paths with special characters", async (t: TestContext) => {
    const validItem = {
      id: "SPECIAL123",
      name: "test.jpg",
      size: 1024,
      ext: "jpg",
      tags: [],
      folders: [],
      url: "https://example.com/test.jpg",
      height: 100,
      width: 100,
    };

    const specialPath = path.join(
      path.sep,
      "Users",
      "test user",
      "My Documents",
      "Eagle.library",
      "images",
      "SPECIAL123.info",
      "thumbnail.png",
    );

    t.mock.method(eagleApi, "callEagleApi", async (apiPath: string) => {
      if (apiPath === "/api/item/list?limit=1") {
        return [validItem];
      }
      if (apiPath === "/api/item/thumbnail?id=SPECIAL123") {
        return specialPath;
      }
      throw new Error(`Unexpected API path: ${apiPath}`);
    });

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const body = res.json();
    const expectedPath = path.join(
      path.sep,
      "Users",
      "test user",
      "My Documents",
      "Eagle.library",
    );
    t.assert.strictEqual(body.path, expectedPath);
  });
});
