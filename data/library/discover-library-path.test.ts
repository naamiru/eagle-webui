/**
 * @vitest-environment node
 */
import path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { LibraryImportError } from "../errors";
import { __testUtils, discoverLibraryPath } from "./discover-library-path";

const originalEnv = {
  EAGLE_LIBRARY_PATH: process.env.EAGLE_LIBRARY_PATH,
  EAGLE_API_URL: process.env.EAGLE_API_URL,
};

function restoreEnv() {
  if (originalEnv.EAGLE_LIBRARY_PATH === undefined) {
    delete process.env.EAGLE_LIBRARY_PATH;
  } else {
    process.env.EAGLE_LIBRARY_PATH = originalEnv.EAGLE_LIBRARY_PATH;
  }

  if (originalEnv.EAGLE_API_URL === undefined) {
    delete process.env.EAGLE_API_URL;
  } else {
    process.env.EAGLE_API_URL = originalEnv.EAGLE_API_URL;
  }
}

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnv();
});

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  });
}

describe("discoverLibraryPath", () => {
  it("returns environment override without calling the API", async () => {
    process.env.EAGLE_LIBRARY_PATH = "/Users/test/Pictures/demo.library";
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await discoverLibraryPath();

    expect(result).toBe("/Users/test/Pictures/demo.library");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to Eagle API and extracts the library path", async () => {
    delete process.env.EAGLE_LIBRARY_PATH;
    process.env.EAGLE_API_URL = "http://localhost:9999";

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          status: "success",
          data: [{ id: "ITEM123" }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: "success",
          data: "/Users/demo/Pictures/sample.library/images/foo.jpg",
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await discoverLibraryPath();

    expect(result).toBe("/Users/demo/Pictures/sample.library");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    const firstCallInput = fetchMock.mock.calls[0]?.[0];
    const firstUrl =
      firstCallInput instanceof URL
        ? firstCallInput.toString()
        : firstCallInput instanceof Request
          ? firstCallInput.url
          : String(firstCallInput);
    expect(firstUrl).toMatch(
      /http:\/\/localhost:9999\/api\/item\/list\?limit=1$/,
    );
  });

  it("extracts library path using the current platform separator", async () => {
    delete process.env.EAGLE_LIBRARY_PATH;

    const libraryRoot = path.join(
      "C:",
      "Users",
      "demo",
      "Pictures",
      "sample.library",
    );
    const assetPath = path.join(libraryRoot, "images", "foo.jpg");

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          status: "success",
          data: [{ id: "ITEM123" }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: "success",
          data: assetPath,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await discoverLibraryPath();

    expect(result).toBe(libraryRoot);
  });

  it("throws LibraryImportError when list response has no items", async () => {
    delete process.env.EAGLE_LIBRARY_PATH;

    const fetchMock = vi.fn().mockResolvedValueOnce(
      jsonResponse({
        status: "success",
        data: [],
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    await expect(discoverLibraryPath()).rejects.toMatchObject({
      code: "LIBRARY_PATH_NOT_FOUND",
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("throws LibraryImportError when thumbnail response is malformed", async () => {
    delete process.env.EAGLE_LIBRARY_PATH;

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({
          status: "success",
          data: [{ id: "ITEM123" }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          status: "error",
          data: null,
        }),
      );

    vi.stubGlobal("fetch", fetchMock);

    await expect(discoverLibraryPath()).rejects.toBeInstanceOf(
      LibraryImportError,
    );
  });
});

describe("extractLibraryPath (test utils)", () => {
  it("throws when path does not contain .library segment", () => {
    expect(() =>
      __testUtils.extractLibraryPath("/Users/demo/Pictures/invalid"),
    ).toThrow(LibraryImportError);
  });

  it("extracts path when path uses Windows separators", () => {
    const windowsPath =
      "C:\\Users\\demo\\Pictures\\sample.library\\images\\foo.jpg";

    expect(__testUtils.extractLibraryPath(windowsPath)).toBe(
      "C:\\Users\\demo\\Pictures\\sample.library",
    );
  });

  it("extracts path that ends directly with .library", () => {
    const input = "/Users/demo/Pictures/sample.library";
    expect(__testUtils.extractLibraryPath(input)).toBe(
      "/Users/demo/Pictures/sample.library",
    );
  });
});

describe("decodeEaglePath (test utils)", () => {
  it("decodes percent-encoded spaces", () => {
    const input =
      "/Users/demo/Pictures/My%20Sample.library/images/item-1/thumbnail.jpg";
    expect(__testUtils.decodeEaglePath(input)).toBe(
      "/Users/demo/Pictures/My Sample.library/images/item-1/thumbnail.jpg",
    );
  });

  it("returns original path when decoding fails", () => {
    const input = "%E0%A4%A"; // truncated sequence
    expect(__testUtils.decodeEaglePath(input)).toBe(input);
  });
});
