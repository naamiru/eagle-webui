/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LibraryPathNotFoundError } from "./errors";

vi.mock("./library/discover-library-path", () => ({
  discoverLibraryPath: vi.fn(),
}));

import { discoverLibraryPath } from "./library/discover-library-path";
import { __resetStoreForTests, getStore } from "./store";

const discoverLibraryPathMock = vi.mocked(discoverLibraryPath);

describe("getStore", () => {
  beforeEach(() => {
    __resetStoreForTests();
    discoverLibraryPathMock.mockReset();
  });

  it("initializes the store once and reuses the cached instance", async () => {
    discoverLibraryPathMock.mockResolvedValue("C:/library");

    const first = await getStore();
    const second = await getStore();

    expect(first).toBe(second);
    expect(first.libraryPath).toBe("C:/library");
    expect(discoverLibraryPathMock).toHaveBeenCalledTimes(1);
  });

  it("propagates LibraryPathNotFoundError from discovery", async () => {
    discoverLibraryPathMock.mockRejectedValue(new LibraryPathNotFoundError());

    await expect(getStore()).rejects.toBeInstanceOf(LibraryPathNotFoundError);
    expect(discoverLibraryPathMock).toHaveBeenCalledTimes(1);
  });
});
