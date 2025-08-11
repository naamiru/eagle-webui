import type { FastifyInstance } from "fastify";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import build from "./app";

describe("Authentication", () => {
  let app: FastifyInstance;

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.EAGLE_WEBUI_PROXY_TOKEN;
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("Token Generation", () => {
    it("should generate a random token when no env var is set", async () => {
      app = build({ logger: false });
      await app.ready();

      expect(app.authToken).toBeDefined();
      expect(app.authToken).toHaveLength(64); // 32 bytes hex = 64 chars
    });

    it("should use env var token when set", async () => {
      const testToken = "test-token-1234567890123456";
      process.env.EAGLE_WEBUI_PROXY_TOKEN = testToken;

      app = build({ logger: false });
      await app.ready();

      expect(app.authToken).toBe(testToken);
    });

    it("should reject env var token shorter than 16 characters", async () => {
      process.env.EAGLE_WEBUI_PROXY_TOKEN = "short";

      app = build({ logger: false });
      await expect(app.ready()).rejects.toThrow(
        "EAGLE_WEBUI_PROXY_TOKEN must be at least 16 characters long",
      );
    });
  });

  describe("Authentication Middleware", () => {
    beforeEach(async () => {
      process.env.EAGLE_WEBUI_PROXY_TOKEN = "test-token-1234567890123456";
      app = build({ logger: false });
      await app.ready();
    });

    it("should allow access with valid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/library/info",
        headers: {
          Authorization: "Bearer test-token-1234567890123456",
        },
      });

      expect(response.statusCode).not.toBe(401);
    });

    it("should reject request without Authorization header", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/library/info",
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        error: "Missing authorization",
      });
    });

    it("should reject request with invalid token", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/library/info",
        headers: {
          Authorization: "Bearer wrong-token",
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "Invalid token" });
    });

    it("should reject request with invalid Authorization format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/library/info",
        headers: {
          Authorization: "Basic dGVzdDp0ZXN0", // Basic auth instead of Bearer
        },
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({
        error: "Invalid authorization format",
      });
    });

    it("should allow OPTIONS requests without authentication", async () => {
      const response = await app.inject({
        method: "OPTIONS",
        url: "/library/info",
      });

      expect(response.statusCode).not.toBe(401);
    });

    it("should allow /health endpoint without authentication", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/health",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ status: "ok" });
    });
  });

  describe("Constant-time comparison", () => {
    it("should reject tokens of different lengths", async () => {
      process.env.EAGLE_WEBUI_PROXY_TOKEN = "test-token-1234567890123456";
      app = build({ logger: false });
      await app.ready();

      const response = await app.inject({
        method: "GET",
        url: "/library/info",
        headers: {
          Authorization: "Bearer short",
        },
      });

      expect(response.statusCode).toBe(401);
    });

    it("should reject tokens with single character difference", async () => {
      process.env.EAGLE_WEBUI_PROXY_TOKEN = "test-token-1234567890123456";
      app = build({ logger: false });
      await app.ready();

      const response = await app.inject({
        method: "GET",
        url: "/library/info",
        headers: {
          Authorization: "Bearer test-token-1234567890123457", // Last char different
        },
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe("Image endpoints", () => {
    beforeEach(async () => {
      process.env.EAGLE_WEBUI_PROXY_TOKEN = "test-token-1234567890123456";
      app = build({ logger: false });
      await app.ready();
    });

    it("should require authentication for /item/thumbnail", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=test&libraryPath=/test",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should require authentication for /item/image", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/item/image?id=test&libraryPath=/test",
      });

      expect(response.statusCode).toBe(401);
    });

    it("should allow image requests with valid token in header", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=test&libraryPath=/test",
        headers: {
          Authorization: "Bearer test-token-1234567890123456",
        },
      });

      // Will fail due to invalid path, but not due to auth
      expect(response.statusCode).not.toBe(401);
    });

    it("should allow /item/thumbnail with token in query parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=test&libraryPath=/test&token=test-token-1234567890123456",
      });

      // Will fail due to invalid path, but not due to auth
      expect(response.statusCode).not.toBe(401);
    });

    it("should allow /item/image with token in query parameter", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/item/image?id=test&libraryPath=/test&token=test-token-1234567890123456",
      });

      // Will fail due to invalid path, but not due to auth
      expect(response.statusCode).not.toBe(401);
    });

    it("should reject image requests with invalid token in query", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=test&libraryPath=/test&token=wrong-token",
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "Invalid token" });
    });

    it("should NOT accept query token for non-image endpoints", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/library/info?token=test-token-1234567890123456",
      });

      expect(response.statusCode).toBe(401);
      expect(response.json()).toEqual({ error: "Missing authorization" });
    });
  });
});
