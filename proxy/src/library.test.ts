import path from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/library/info", () => {
  test("extracts library path from valid thumbnail path", async () => {
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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(
      async (apiPath: string) => {
        if (apiPath === "/api/item/list?limit=1") {
          return [validItem];
        }
        if (apiPath === "/api/item/thumbnail?id=TEST123") {
          return thumbnailPath;
        }
        throw new Error(`Unexpected API path: ${apiPath}`);
      },
    );

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    const expectedPath = path.join(path.sep, "Users", "test", "Eagle.library");
    expect(body.path).toBe(expectedPath);
  });

  test("handles Windows paths correctly", async () => {
    // Mock path.sep to simulate Windows environment
    vi.spyOn(path, "sep", "get").mockReturnValue("\\");

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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(
      async (apiPath: string) => {
        if (apiPath === "/api/item/list?limit=1") {
          return [validItem];
        }
        if (apiPath === "/api/item/thumbnail?id=WIN123") {
          return windowsThumbnailPath;
        }
        throw new Error(`Unexpected API path: ${apiPath}`);
      },
    );

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.path).toBe("C:\\Users\\test\\Eagle.library");
  });

  test("handles Unix/macOS paths correctly", async () => {
    // Mock path.sep to simulate Unix/macOS environment
    vi.spyOn(path, "sep", "get").mockReturnValue("/");

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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(
      async (apiPath: string) => {
        if (apiPath === "/api/item/list?limit=1") {
          return [validItem];
        }
        if (apiPath === "/api/item/thumbnail?id=UNIX123") {
          return unixThumbnailPath;
        }
        throw new Error(`Unexpected API path: ${apiPath}`);
      },
    );

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.path).toBe("/Users/test/Eagle.library");
  });

  test("returns 404 when no items found in library", async () => {
    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue([]);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(404);
    const body = res.json();
    expect(body.error).toBe("No items found in Eagle library");
  });

  test("returns 500 when thumbnail path has no .library directory", async () => {
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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(
      async (apiPath: string) => {
        if (apiPath === "/api/item/list?limit=1") {
          return [validItem];
        }
        if (apiPath === "/api/item/thumbnail?id=INVALID123") {
          return invalidThumbnailPath;
        }
        throw new Error(`Unexpected API path: ${apiPath}`);
      },
    );

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body.error).toBe(
      "Unable to determine library path from thumbnail URL",
    );
  });

  test("does not match paths with .libraryextra or similar", async () => {
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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(
      async (apiPath: string) => {
        if (apiPath === "/api/item/list?limit=1") {
          return [validItem];
        }
        if (apiPath === "/api/item/thumbnail?id=FALSE123") {
          return falsePositivePath;
        }
        throw new Error(`Unexpected API path: ${apiPath}`);
      },
    );

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(500);
    const body = res.json();
    expect(body.error).toBe(
      "Unable to determine library path from thumbnail URL",
    );
  });

  test("handles Eagle service offline error", async () => {
    const error = new eagleApi.EagleApiError(
      503,
      "Eagle service is not running. Please ensure Eagle is running on port 41595",
    );

    vi.spyOn(eagleApi, "callEagleApi").mockRejectedValue(error);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(503);
    const body = res.json();
    expect(body.error).toMatch(/Eagle service is not running/);
  });

  test("handles paths with special characters", async () => {
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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(
      async (apiPath: string) => {
        if (apiPath === "/api/item/list?limit=1") {
          return [validItem];
        }
        if (apiPath === "/api/item/thumbnail?id=SPECIAL123") {
          return specialPath;
        }
        throw new Error(`Unexpected API path: ${apiPath}`);
      },
    );

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/library/info",
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    const expectedPath = path.join(
      path.sep,
      "Users",
      "test user",
      "My Documents",
      "Eagle.library",
    );
    expect(body.path).toBe(expectedPath);
  });
});