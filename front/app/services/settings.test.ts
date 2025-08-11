import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_PROXY_URL,
  getProxyConfig,
  getProxyToken,
  getProxyUrl,
  hasStoredProxyConfig,
  hasStoredProxyToken,
  type ProxyConfig,
  resetToDefault,
  STORAGE_KEY,
  setProxyConfig,
  setProxyToken,
  setProxyUrl,
  validateProxyConnection,
} from "./settings";

// Mock fetch for browser environment
window.fetch = vi.fn();

describe("Settings Service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("ProxyConfig Storage", () => {
    it("should return default config when nothing is stored", () => {
      const config = getProxyConfig();
      expect(config).toEqual({ url: DEFAULT_PROXY_URL });
    });

    it("should store and retrieve proxy config", () => {
      const testConfig: ProxyConfig = {
        url: "http://192.168.1.100:57821",
        token: "test-token-123",
      };

      setProxyConfig(testConfig);
      const retrieved = getProxyConfig();

      expect(retrieved).toEqual(testConfig);
    });

    it("should handle invalid JSON in localStorage gracefully", () => {
      localStorage.setItem(STORAGE_KEY, "invalid json {");

      const config = getProxyConfig();
      expect(config).toEqual({ url: DEFAULT_PROXY_URL });
    });
  });

  describe("Proxy URL Functions", () => {
    it("should get default URL when nothing is stored", () => {
      expect(getProxyUrl()).toBe(DEFAULT_PROXY_URL);
    });

    it("should set and get proxy URL", () => {
      const testUrl = "http://192.168.1.100:57821";
      setProxyUrl(testUrl);

      expect(getProxyUrl()).toBe(testUrl);
    });

    it("should preserve token when updating URL", () => {
      const config: ProxyConfig = {
        url: "http://localhost:57821",
        token: "existing-token",
      };
      setProxyConfig(config);

      setProxyUrl("http://192.168.1.100:57821");

      const updated = getProxyConfig();
      expect(updated.url).toBe("http://192.168.1.100:57821");
      expect(updated.token).toBe("existing-token");
    });
  });

  describe("Proxy Token Functions", () => {
    it("should return undefined when no token is stored", () => {
      expect(getProxyToken()).toBeUndefined();
    });

    it("should set and get proxy token", () => {
      const testToken = "test-token-123";
      setProxyToken(testToken);

      expect(getProxyToken()).toBe(testToken);
    });

    it("should remove token when set to undefined", () => {
      setProxyToken("test-token");
      expect(getProxyToken()).toBe("test-token");

      setProxyToken(undefined);
      expect(getProxyToken()).toBeUndefined();
    });

    it("should preserve URL when updating token", () => {
      const config: ProxyConfig = {
        url: "http://192.168.1.100:57821",
        token: "old-token",
      };
      setProxyConfig(config);

      setProxyToken("new-token");

      const updated = getProxyConfig();
      expect(updated.url).toBe("http://192.168.1.100:57821");
      expect(updated.token).toBe("new-token");
    });
  });

  describe("Storage Check Functions", () => {
    it("should return false when no config is stored", () => {
      expect(hasStoredProxyConfig()).toBe(false);
    });

    it("should return true when config is stored", () => {
      setProxyConfig({ url: "http://localhost:57821" });
      expect(hasStoredProxyConfig()).toBe(true);
    });

    it("should return false when no token is stored", () => {
      setProxyConfig({ url: "http://localhost:57821" });
      expect(hasStoredProxyToken()).toBe(false);
    });

    it("should return true when token is stored", () => {
      setProxyConfig({ url: "http://localhost:57821", token: "test-token" });
      expect(hasStoredProxyToken()).toBe(true);
    });
  });

  describe("Reset Function", () => {
    it("should remove stored config", () => {
      setProxyConfig({
        url: "http://192.168.1.100:57821",
        token: "test-token",
      });
      expect(hasStoredProxyConfig()).toBe(true);

      resetToDefault();

      expect(hasStoredProxyConfig()).toBe(false);
      expect(getProxyUrl()).toBe(DEFAULT_PROXY_URL);
      expect(getProxyToken()).toBeUndefined();
    });
  });

  describe("validateProxyConnection", () => {
    it("should return unreachable when URL is invalid", async () => {
      const result = await validateProxyConnection("invalid-url", "token");
      expect(result).toBe("unreachable");
    });

    it("should return unreachable when health check fails", async () => {
      const mockFetch = vi.mocked(window.fetch);
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await validateProxyConnection(
        "http://localhost:57821",
        "token",
      );
      expect(result).toBe("unreachable");
    });

    it("should return unreachable when health check returns non-401 error", async () => {
      const mockFetch = vi.mocked(window.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as Response);

      const result = await validateProxyConnection(
        "http://localhost:57821",
        "token",
      );
      expect(result).toBe("unreachable");
    });

    it("should return unauthorized when library endpoint returns 401", async () => {
      const mockFetch = vi.mocked(window.fetch);
      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);
      // Library check returns 401
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);

      const result = await validateProxyConnection(
        "http://localhost:57821",
        "wrong-token",
      );
      expect(result).toBe("unauthorized");
    });

    it("should return connected when all checks pass", async () => {
      const mockFetch = vi.mocked(window.fetch);
      // Health check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);
      // Library check succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

      const result = await validateProxyConnection(
        "http://localhost:57821",
        "valid-token",
      );
      expect(result).toBe("connected");
    });

    it("should include Authorization header when token is provided", async () => {
      const mockFetch = vi.mocked(window.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);

      await validateProxyConnection("http://localhost:57821", "test-token");

      // Second call should have Authorization header
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "http://localhost:57821/library/info",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-token",
          }),
        }),
      );
    });

    it("should not include Authorization header when token is not provided", async () => {
      const mockFetch = vi.mocked(window.fetch);
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
      } as Response);

      await validateProxyConnection("http://localhost:57821");

      // Second call should not have Authorization header
      expect(mockFetch).toHaveBeenNthCalledWith(
        2,
        "http://localhost:57821/library/info",
        expect.objectContaining({
          headers: {},
        }),
      );
    });
  });
});
