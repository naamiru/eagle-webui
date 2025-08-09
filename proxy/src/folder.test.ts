import { type TestContext, test } from "node:test";
import * as eagleApi from "./eagle-api";
import { EagleApiError } from "./eagle-api";
import { build } from "./test-helper";

// ============= 1. Successful Response Tests =============
test("returns transformed folder list", async (t: TestContext) => {
  const mockData = [
    { id: "folder-1", name: "Family Photos" },
    { id: "folder-2", name: "Work Documents" },
  ];

  t.mock.method(eagleApi, "callEagleApi", async () => mockData);

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 200);
  t.assert.deepStrictEqual(res.json(), [
    { id: "folder-1", name: "Family Photos", children: [], items: [] },
    { id: "folder-2", name: "Work Documents", children: [], items: [] },
  ]);
});

test("handles nested folder structure", async (t: TestContext) => {
  const mockData = [
    {
      id: "parent-1",
      name: "Parent Folder",
      children: [
        {
          id: "child-1",
          name: "Child Folder",
          children: [
            {
              id: "grandchild-1",
              name: "Grandchild Folder",
            },
          ],
        },
      ],
    },
  ];

  t.mock.method(eagleApi, "callEagleApi", async () => mockData);

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 200);
  const result = res.json();
  t.assert.strictEqual(result[0].id, "parent-1");
  t.assert.strictEqual(result[0].name, "Parent Folder");
  t.assert.strictEqual(result[0].children[0].id, "child-1");
  t.assert.strictEqual(result[0].children[0].children[0].id, "grandchild-1");
  t.assert.deepStrictEqual(result[0].items, []);
});

test("handles empty folder list", async (t: TestContext) => {
  t.mock.method(eagleApi, "callEagleApi", async () => []);

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 200);
  t.assert.deepStrictEqual(res.json(), []);
});

test("handles folders without children field", async (t: TestContext) => {
  const mockData = [
    { id: "folder-1", name: "No Children Folder" },
    { id: "folder-2", name: "Another Folder", children: [] },
  ];

  t.mock.method(eagleApi, "callEagleApi", async () => mockData);

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 200);
  const result = res.json();
  t.assert.deepStrictEqual(result[0].children, []);
  t.assert.deepStrictEqual(result[1].children, []);
});

// ============= 2. Error Handling Tests =============

test("handles EagleApiError with 503 status", async (t: TestContext) => {
  const error = new EagleApiError(503, "Eagle service is not running");
  t.mock.method(eagleApi, "callEagleApi", async () => {
    throw error;
  });

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 503);
  const result = res.json();
  t.assert.ok(result.error.includes("Eagle service is not running"));
});

test("handles EagleApiError with 504 timeout", async (t: TestContext) => {
  const error = new EagleApiError(
    504,
    "Request to Eagle API timed out after 30 seconds",
  );
  t.mock.method(eagleApi, "callEagleApi", async () => {
    throw error;
  });

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 504);
  const result = res.json();
  t.assert.ok(result.error.includes("timed out after 30 seconds"));
});

test("handles EagleApiError with 502 bad gateway", async (t: TestContext) => {
  const error = new EagleApiError(502, "Eagle API error: error");
  t.mock.method(eagleApi, "callEagleApi", async () => {
    throw error;
  });

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 502);
  const result = res.json();
  t.assert.ok(result.error.includes("Eagle API error"));
});

test("handles unexpected errors", async (t: TestContext) => {
  const error = new Error("Unexpected error");
  t.mock.method(eagleApi, "callEagleApi", async () => {
    throw error;
  });

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });

  t.assert.strictEqual(res.statusCode, 500);
  const result = res.json();
  t.assert.ok(result.error.includes("unexpected error occurred"));
});

// ============= 3. CORS Tests =============

test("CORS headers present in response", async (t: TestContext) => {
  t.mock.method(eagleApi, "callEagleApi", async () => []);

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
    headers: {
      origin: "http://localhost:3000",
    },
  });

  t.assert.strictEqual(res.statusCode, 200);
  t.assert.strictEqual(
    res.headers["access-control-allow-origin"],
    "http://localhost:3000",
  );
});

test("preflight request handling", async (t: TestContext) => {
  const app = build(t);
  const res = await app.inject({
    method: "OPTIONS",
    url: "/folder/list",
    headers: {
      origin: "http://localhost:3000",
      "access-control-request-method": "GET",
    },
  });

  t.assert.strictEqual(res.statusCode, 204);
  t.assert.ok(res.headers["access-control-allow-origin"]);
  t.assert.ok(res.headers["access-control-allow-methods"]);
});

test("CORS headers on error response", async (t: TestContext) => {
  const error = new EagleApiError(503, "Eagle service is not running");
  t.mock.method(eagleApi, "callEagleApi", async () => {
    throw error;
  });

  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
    headers: {
      origin: "http://localhost:3000",
    },
  });

  t.assert.strictEqual(res.statusCode, 503);
  t.assert.strictEqual(
    res.headers["access-control-allow-origin"],
    "http://localhost:3000",
  );
});
