import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as settingsModule from "~/services/settings";
import { getOriginalUrl, getThumbnailUrl } from "./image";

// Mock the settings module
vi.mock("~/services/settings", () => ({
  getProxyUrl: vi.fn(),
  getProxyToken: vi.fn(),
}));

describe("Image URL utilities", () => {
  const mockGetProxyUrl = vi.mocked(settingsModule.getProxyUrl);
  const mockGetProxyToken = vi.mocked(settingsModule.getProxyToken);

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProxyUrl.mockReturnValue("http://localhost:57821");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getThumbnailUrl", () => {
    it("should build thumbnail URL without token when no token is set", () => {
      mockGetProxyToken.mockReturnValue(undefined);

      const url = getThumbnailUrl("item-123", "/path/to/library");

      expect(url).toBe(
        "http://localhost:57821/item/thumbnail?id=item-123&libraryPath=%2Fpath%2Fto%2Flibrary",
      );
    });

    it("should include token in query parameters when token is set", () => {
      mockGetProxyToken.mockReturnValue("test-token-12345");

      const url = getThumbnailUrl("item-123", "/path/to/library");

      expect(url).toBe(
        "http://localhost:57821/item/thumbnail?id=item-123&libraryPath=%2Fpath%2Fto%2Flibrary&token=test-token-12345",
      );
    });

    it("should properly encode special characters in parameters", () => {
      mockGetProxyToken.mockReturnValue("token-with-special-chars!@#");

      const url = getThumbnailUrl("item with spaces", "/path/with spaces");

      expect(url).toBe(
        "http://localhost:57821/item/thumbnail?id=item+with+spaces&libraryPath=%2Fpath%2Fwith+spaces&token=token-with-special-chars%21%40%23",
      );
    });

    it("should handle empty token string", () => {
      mockGetProxyToken.mockReturnValue("");

      const url = getThumbnailUrl("item-123", "/path/to/library");

      expect(url).toBe(
        "http://localhost:57821/item/thumbnail?id=item-123&libraryPath=%2Fpath%2Fto%2Flibrary",
      );
    });
  });

  describe("getOriginalUrl", () => {
    it("should build original image URL without token when no token is set", () => {
      mockGetProxyToken.mockReturnValue(undefined);

      const url = getOriginalUrl("item-456", "/library/path");

      expect(url).toBe(
        "http://localhost:57821/item/image?id=item-456&libraryPath=%2Flibrary%2Fpath",
      );
    });

    it("should include token in query parameters when token is set", () => {
      mockGetProxyToken.mockReturnValue("auth-token-xyz");

      const url = getOriginalUrl("item-456", "/library/path");

      expect(url).toBe(
        "http://localhost:57821/item/image?id=item-456&libraryPath=%2Flibrary%2Fpath&token=auth-token-xyz",
      );
    });

    it("should use the same proxy URL from settings", () => {
      mockGetProxyUrl.mockReturnValue("http://192.168.1.100:57821");
      mockGetProxyToken.mockReturnValue("token-123");

      const url = getOriginalUrl("item-789", "/lib");

      expect(url).toBe(
        "http://192.168.1.100:57821/item/image?id=item-789&libraryPath=%2Flib&token=token-123",
      );
    });
  });

  describe("Token changes", () => {
    it("should reflect token changes in generated URLs", () => {
      // First call without token
      mockGetProxyToken.mockReturnValue(undefined);
      const url1 = getThumbnailUrl("item-1", "/lib");
      expect(url1).not.toContain("token=");

      // Update token
      mockGetProxyToken.mockReturnValue("new-token");
      const url2 = getThumbnailUrl("item-1", "/lib");
      expect(url2).toContain("token=new-token");

      // Remove token
      mockGetProxyToken.mockReturnValue(undefined);
      const url3 = getThumbnailUrl("item-1", "/lib");
      expect(url3).not.toContain("token=");
    });
  });
});