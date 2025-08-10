import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { build } from "./test-helper";

describe("Image serving endpoints", () => {
  let tempDir: string;

  const createTempDir = async () => {
    tempDir = await mkdtemp(join(tmpdir(), "eagle-test-"));
  };

  const cleanupTempDir = async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  };

  describe("Thumbnail Path Resolution", () => {
    beforeEach(async () => {
      await createTempDir();
    });

    afterEach(async () => {
      await cleanupTempDir();
    });

    test("should find thumbnail file using glob pattern", async () => {
      const app = build();
      const itemId = "TEST123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create thumbnail file
      const thumbnailContent = "fake thumbnail content";
      await writeFile(join(itemDir, "test_thumbnail.jpg"), thumbnailContent);

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
      expect(response.payload).toBe(thumbnailContent);
    });

    test("should return 404 when no thumbnail file found", async () => {
      const app = build();
      const itemId = "NOTFOUND";

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Image not found" });
    });

    test("should handle multiple matching files and return first", async () => {
      const app = build();
      const itemId = "MULTI123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create multiple thumbnail files
      await writeFile(join(itemDir, "image1_thumbnail.jpg"), "content1");
      await writeFile(join(itemDir, "image2_thumbnail.png"), "content2");

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toMatch(/image/);
    });

    test("should work with different file extensions", async () => {
      const app = build();
      const itemId = "WEBP123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      const thumbnailContent = "fake webp content";
      await writeFile(join(itemDir, "test_thumbnail.webp"), thumbnailContent);

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/webp");
      expect(response.payload).toBe(thumbnailContent);
    });
  });

  describe("Original Path Resolution", () => {
    beforeEach(async () => {
      await createTempDir();
    });

    afterEach(async () => {
      await cleanupTempDir();
    });

    test("should derive original filename from thumbnail filename", async () => {
      const app = build();
      const itemId = "ORIG123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create both thumbnail and original files
      await writeFile(join(itemDir, "photo_thumbnail.jpg"), "thumbnail");
      const originalContent = "original content";
      await writeFile(join(itemDir, "photo.jpg"), originalContent);

      const response = await app.inject({
        method: "GET",
        url: `/item/image?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
      expect(response.payload).toBe(originalContent);
    });

    test("should handle various filename formats", async () => {
      const app = build();
      const itemId = "SPECIAL123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create files with spaces and special characters
      await writeFile(join(itemDir, "my photo_thumbnail.png"), "thumbnail");
      const originalContent = "original with spaces";
      await writeFile(join(itemDir, "my photo.png"), originalContent);

      const response = await app.inject({
        method: "GET",
        url: `/item/image?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.payload).toBe(originalContent);
    });

    test("should return 404 when original file missing but thumbnail exists", async () => {
      const app = build();
      const itemId = "THUMBONLY";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Only create thumbnail file
      await writeFile(join(itemDir, "photo_thumbnail.jpg"), "thumbnail");

      const response = await app.inject({
        method: "GET",
        url: `/item/image?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Image not found" });
    });

    test("should return 404 when no thumbnail exists", async () => {
      const app = build();
      const itemId = "NOTHING";

      const response = await app.inject({
        method: "GET",
        url: `/item/image?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: "Image not found" });
    });
  });

  describe("Parameter Validation", () => {
    test("should validate required query parameters for thumbnail", async () => {
      const app = build();

      // Test missing id
      let response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?libraryPath=/tmp",
      });
      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        error: "Missing required parameters: id and libraryPath",
      });

      // Test missing libraryPath
      response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=123",
      });
      expect(response.statusCode).toBe(400);

      // Test empty parameters
      response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=&libraryPath=",
      });
      expect(response.statusCode).toBe(400);
    });

    test("should validate required query parameters for image", async () => {
      const app = build();

      const response = await app.inject({
        method: "GET",
        url: "/item/image?id=",
      });
      expect(response.statusCode).toBe(400);
    });
  });

  describe("Integration Tests", () => {
    beforeEach(async () => {
      await createTempDir();
    });

    afterEach(async () => {
      await cleanupTempDir();
    });

    test("should handle concurrent requests", async () => {
      const app = build();

      // Create multiple test files
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const itemId = `CONCURRENT${i}`;
        const itemDir = join(tempDir, "images", `${itemId}.info`);
        await mkdir(itemDir, { recursive: true });
        await writeFile(
          join(itemDir, `image${i}_thumbnail.jpg`),
          `content${i}`,
        );

        // Make concurrent requests
        promises.push(
          app.inject({
            method: "GET",
            url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
          }),
        );
      }

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.statusCode).toBe(200);
        expect(response.payload).toBe(`content${index}`);
      });
    });

    test("should handle large files efficiently", async () => {
      const app = build();
      const itemId = "LARGE123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create a larger test file (100KB for faster tests)
      const largeContent = "x".repeat(100 * 1024);
      await writeFile(join(itemDir, "large_thumbnail.jpg"), largeContent);

      const start = Date.now();
      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });
      const duration = Date.now() - start;

      expect(response.statusCode).toBe(200);
      expect(response.payload.length).toBe(largeContent.length);
      // Should complete reasonably quickly (less than 2 seconds)
      expect(duration).toBeLessThan(2000);
    });

    test("should prevent directory traversal attacks", async () => {
      const app = build();

      // Try to access files outside the library path
      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=../../../etc/passwd&libraryPath=${tempDir}`,
      });

      // Should not be able to access files outside library
      expect(response.statusCode).toBe(404);
    });
  });

  describe("MIME Type Detection", () => {
    beforeEach(async () => {
      await createTempDir();
    });

    afterEach(async () => {
      await cleanupTempDir();
    });

    test("should detect correct MIME types for different image formats", async () => {
      const app = build();
      const formats = [
        { ext: "jpg", mime: "image/jpeg" },
        { ext: "jpeg", mime: "image/jpeg" },
        { ext: "png", mime: "image/png" },
        { ext: "gif", mime: "image/gif" },
        { ext: "webp", mime: "image/webp" },
      ];

      for (const format of formats) {
        const itemId = `MIME_${format.ext.toUpperCase()}`;
        const itemDir = join(tempDir, "images", `${itemId}.info`);
        await mkdir(itemDir, { recursive: true });

        await writeFile(
          join(itemDir, `test_thumbnail.${format.ext}`),
          "content",
        );

        const response = await app.inject({
          method: "GET",
          url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
        });

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toBe(format.mime);
      }
    });

    test("should handle case insensitive file extensions", async () => {
      const app = build();
      const itemId = "CASE123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create file with uppercase extension
      await writeFile(join(itemDir, "test_thumbnail.JPG"), "content");

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("image/jpeg");
    });
  });
});
