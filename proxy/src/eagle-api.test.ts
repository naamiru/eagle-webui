import { type TestContext, test } from "node:test";
import { callEagleApi, type EagleApiError } from "./eagle-api";

interface FetchError extends Error {
  code?: string;
}

test("callEagleApi returns data on success", async (t: TestContext) => {
  const mockData = [{ id: "folder-1", name: "Test Folder" }];
  const mockResponse = {
    status: "success",
    data: mockData,
  };

  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      ({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      }) as Response,
  );

  const result = await callEagleApi("/api/folder/list");
  t.assert.deepStrictEqual(result, mockData);
});

test("callEagleApi throws EagleApiError on HTTP error", async (t: TestContext) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      ({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }) as Response,
  );

  await t.assert.rejects(
    callEagleApi("/api/folder/list"),
    (error: EagleApiError) => {
      t.assert.strictEqual(error.httpCode, 502);
      t.assert.ok(error.message.includes("Eagle API returned status 404"));
      return true;
    },
  );
});

test("callEagleApi throws EagleApiError on Eagle error status", async (t: TestContext) => {
  const mockResponse = {
    status: "error",
    message: "Database locked",
  };

  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      ({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      }) as Response,
  );

  await t.assert.rejects(
    callEagleApi("/api/folder/list"),
    (error: EagleApiError) => {
      t.assert.strictEqual(error.httpCode, 502);
      t.assert.ok(error.message.includes("Eagle API error"));
      return true;
    },
  );
});

test("callEagleApi throws EagleApiError on timeout", async (t: TestContext) => {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";

  t.mock.method(globalThis, "fetch", async () => {
    throw error;
  });

  await t.assert.rejects(
    callEagleApi("/api/folder/list"),
    (error: EagleApiError) => {
      t.assert.strictEqual(error.httpCode, 504);
      t.assert.ok(error.message.includes("timed out after 30 seconds"));
      return true;
    },
  );
});

test("callEagleApi throws EagleApiError on ECONNREFUSED", async (t: TestContext) => {
  const error = new Error("fetch failed") as FetchError;
  error.code = "ECONNREFUSED";

  t.mock.method(globalThis, "fetch", async () => {
    throw error;
  });

  await t.assert.rejects(
    callEagleApi("/api/folder/list"),
    (error: EagleApiError) => {
      t.assert.strictEqual(error.httpCode, 503);
      t.assert.ok(error.message.includes("Eagle service is not running"));
      return true;
    },
  );
});

test("callEagleApi throws EagleApiError on network error", async (t: TestContext) => {
  const error = new Error("Network unreachable") as FetchError;
  error.code = "ENETUNREACH";

  t.mock.method(globalThis, "fetch", async () => {
    throw error;
  });

  await t.assert.rejects(
    callEagleApi("/api/folder/list"),
    (error: EagleApiError) => {
      t.assert.strictEqual(error.httpCode, 503);
      t.assert.ok(error.message.includes("Network error"));
      return true;
    },
  );
});

test("callEagleApi throws EagleApiError on JSON parse error", async (t: TestContext) => {
  t.mock.method(
    globalThis,
    "fetch",
    async () =>
      ({
        ok: true,
        status: 200,
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }) as unknown as Response,
  );

  await t.assert.rejects(
    callEagleApi("/api/folder/list"),
    (error: EagleApiError) => {
      t.assert.strictEqual(error.httpCode, 502);
      t.assert.ok(error.message.includes("Invalid response format"));
      return true;
    },
  );
});
