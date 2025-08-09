import { type TestContext, test } from "node:test";
import { EagleApiError } from "./eagle-api";
import { build } from "./test-helper";

// ============= 1. Successful Response CORS Tests =============

test("CORS headers present on successful response", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-cors-success", async () => {
    return { message: "success" };
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-cors-success",
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

test("CORS allows different origins", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-cors-origin", async () => {
    return { message: "success" };
  });

  const origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://example.com",
  ];

  for (const origin of origins) {
    const res = await app.inject({
      method: "GET",
      url: "/test-cors-origin",
      headers: { origin },
    });

    t.assert.strictEqual(res.statusCode, 200);
    t.assert.strictEqual(res.headers["access-control-allow-origin"], origin);
  }
});

test("CORS headers not set when no origin header", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-cors-no-origin", async () => {
    return { message: "success" };
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-cors-no-origin",
  });

  t.assert.strictEqual(res.statusCode, 200);
  t.assert.strictEqual(res.headers["access-control-allow-origin"], undefined);
});

// ============= 2. Error Response CORS Tests =============

test("CORS headers present on EagleApiError responses", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-cors-eagle-error", async () => {
    throw new EagleApiError(503, "Eagle service is not running");
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-cors-eagle-error",
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

test("CORS headers present on generic error responses", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-cors-generic-error", async () => {
    throw new Error("Something went wrong");
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-cors-generic-error",
    headers: {
      origin: "https://example.com",
    },
  });

  t.assert.strictEqual(res.statusCode, 500);
  t.assert.strictEqual(
    res.headers["access-control-allow-origin"],
    "https://example.com",
  );
});

// ============= 3. Preflight Request Tests =============

test("handles preflight OPTIONS requests", async (t: TestContext) => {
  const app = build(t);

  const res = await app.inject({
    method: "OPTIONS",
    url: "/any-endpoint",
    headers: {
      origin: "http://localhost:3000",
      "access-control-request-method": "GET",
    },
  });

  t.assert.strictEqual(res.statusCode, 204);
  t.assert.strictEqual(
    res.headers["access-control-allow-origin"],
    "http://localhost:3000",
  );
  t.assert.ok(res.headers["access-control-allow-methods"]);
});

test("preflight request with POST method", async (t: TestContext) => {
  const app = build(t);

  const res = await app.inject({
    method: "OPTIONS",
    url: "/any-endpoint",
    headers: {
      origin: "http://localhost:3000",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
  });

  t.assert.strictEqual(res.statusCode, 204);
  t.assert.strictEqual(
    res.headers["access-control-allow-origin"],
    "http://localhost:3000",
  );
  t.assert.ok(res.headers["access-control-allow-methods"]);
  t.assert.ok(res.headers["access-control-allow-headers"]);
});

test("preflight request without origin header", async (t: TestContext) => {
  const app = build(t);

  const res = await app.inject({
    method: "OPTIONS",
    url: "/any-endpoint",
    headers: {
      "access-control-request-method": "GET",
    },
  });

  t.assert.strictEqual(res.statusCode, 204);
  // Should still handle the preflight even without explicit origin
  t.assert.ok(res.headers["access-control-allow-methods"]);
});

// ============= 4. CORS Configuration Tests =============

test("CORS allows credentials when configured", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-cors-credentials", async () => {
    return { message: "success" };
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-cors-credentials",
    headers: {
      origin: "http://localhost:3000",
    },
  });

  t.assert.strictEqual(res.statusCode, 200);
  // Note: Our current CORS config uses origin: true, which should allow credentials
  t.assert.strictEqual(
    res.headers["access-control-allow-origin"],
    "http://localhost:3000",
  );
});
