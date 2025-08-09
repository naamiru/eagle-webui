import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { suite, type TestContext, test } from "node:test";
import { build } from "./test-helper";

suite("Image serving endpoints", () => {
  let tempDir: string;

  const createTempDir = async () => {
    tempDir = await mkdtemp(join(tmpdir(), "eagle-test-"));
  };

  const cleanupTempDir = async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  };

  suite("Thumbnail Path Resolution", () => {
    test("should find thumbnail file using glob pattern", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
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

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.strictEqual(response.headers["content-type"], "image/jpeg");
      t.assert.strictEqual(response.payload, thumbnailContent);
    });

    test("should return 404 when no thumbnail file found", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
      const itemId = "NOTFOUND";

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      t.assert.strictEqual(response.statusCode, 404);
      t.assert.deepStrictEqual(response.json(), { error: "Image not found" });
    });

    test("should handle multiple matching files and return first", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
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

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.ok(response.headers["content-type"]?.includes("image"));
    });

    test("should work with different file extensions", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
      const itemId = "WEBP123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      const thumbnailContent = "fake webp content";
      await writeFile(join(itemDir, "test_thumbnail.webp"), thumbnailContent);

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.strictEqual(response.headers["content-type"], "image/webp");
      t.assert.strictEqual(response.payload, thumbnailContent);
    });
  });

  suite("Original Path Resolution", () => {
    test("should derive original filename from thumbnail filename", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
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

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.strictEqual(response.headers["content-type"], "image/jpeg");
      t.assert.strictEqual(response.payload, originalContent);
    });

    test("should handle various filename formats", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
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

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.strictEqual(response.payload, originalContent);
    });

    test("should return 404 when original file missing but thumbnail exists", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
      const itemId = "THUMBONLY";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Only create thumbnail file
      await writeFile(join(itemDir, "photo_thumbnail.jpg"), "thumbnail");

      const response = await app.inject({
        method: "GET",
        url: `/item/image?id=${itemId}&libraryPath=${tempDir}`,
      });

      t.assert.strictEqual(response.statusCode, 404);
      t.assert.deepStrictEqual(response.json(), { error: "Image not found" });
    });

    test("should return 404 when no thumbnail exists", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
      const itemId = "NOTHING";

      const response = await app.inject({
        method: "GET",
        url: `/item/image?id=${itemId}&libraryPath=${tempDir}`,
      });

      t.assert.strictEqual(response.statusCode, 404);
      t.assert.deepStrictEqual(response.json(), { error: "Image not found" });
    });
  });

  suite("Parameter Validation", () => {
    test("should validate required query parameters for thumbnail", async (t: TestContext) => {
      const app = build(t);

      // Test missing id
      let response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?libraryPath=/tmp",
      });
      t.assert.strictEqual(response.statusCode, 400);
      t.assert.deepStrictEqual(response.json(), {
        error: "Missing required parameters: id and libraryPath",
      });

      // Test missing libraryPath
      response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=123",
      });
      t.assert.strictEqual(response.statusCode, 400);

      // Test empty parameters
      response = await app.inject({
        method: "GET",
        url: "/item/thumbnail?id=&libraryPath=",
      });
      t.assert.strictEqual(response.statusCode, 400);
    });

    test("should validate required query parameters for image", async (t: TestContext) => {
      const app = build(t);

      const response = await app.inject({
        method: "GET",
        url: "/item/image?id=",
      });
      t.assert.strictEqual(response.statusCode, 400);
    });
  });

  suite("Integration Tests", () => {
    test("should handle concurrent requests", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);

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
        t.assert.strictEqual(response.statusCode, 200);
        t.assert.strictEqual(response.payload, `content${index}`);
      });
    });

    test("should handle large files efficiently", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
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

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.strictEqual(response.payload.length, largeContent.length);
      // Should complete reasonably quickly (less than 2 seconds)
      t.assert.ok(duration < 2000);
    });

    test("should prevent directory traversal attacks", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);

      // Try to access files outside the library path
      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=../../../etc/passwd&libraryPath=${tempDir}`,
      });

      // Should not be able to access files outside library
      t.assert.strictEqual(response.statusCode, 404);
    });
  });

  suite("MIME Type Detection", () => {
    test("should detect correct MIME types for different image formats", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
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

        t.assert.strictEqual(response.statusCode, 200);
        t.assert.strictEqual(response.headers["content-type"], format.mime);
      }
    });

    test("should handle case insensitive file extensions", async (t: TestContext) => {
      await createTempDir();
      t.after(cleanupTempDir);

      const app = build(t);
      const itemId = "CASE123";
      const itemDir = join(tempDir, "images", `${itemId}.info`);
      await mkdir(itemDir, { recursive: true });

      // Create file with uppercase extension
      await writeFile(join(itemDir, "test_thumbnail.JPG"), "content");

      const response = await app.inject({
        method: "GET",
        url: `/item/thumbnail?id=${itemId}&libraryPath=${tempDir}`,
      });

      t.assert.strictEqual(response.statusCode, 200);
      t.assert.strictEqual(response.headers["content-type"], "image/jpeg");
    });
  });
});
