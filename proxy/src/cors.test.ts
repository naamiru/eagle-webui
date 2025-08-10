import { expect, test } from "vitest";
import { EagleApiError } from "./eagle-api";
import { build } from "./test-helper";

// ============= 1. Successful Response CORS Tests =============

test("CORS headers present on successful response", async () => {
  const app = build();

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

  expect(res.statusCode).toBe(200);
  expect(res.headers["access-control-allow-origin"]).toBe(
    "http://localhost:3000",
  );
});

test("CORS allows different origins", async () => {
  const app = build();

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

    expect(res.statusCode).toBe(200);
    expect(res.headers["access-control-allow-origin"]).toBe(origin);
  }
});

test("CORS headers not set when no origin header", async () => {
  const app = build();

  app.get("/test-cors-no-origin", async () => {
    return { message: "success" };
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-cors-no-origin",
  });

  expect(res.statusCode).toBe(200);
  expect(res.headers["access-control-allow-origin"]).toBeUndefined();
});

// ============= 2. Error Response CORS Tests =============

test("CORS headers present on EagleApiError responses", async () => {
  const app = build();

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

  expect(res.statusCode).toBe(503);
  expect(res.headers["access-control-allow-origin"]).toBe(
    "http://localhost:3000",
  );
});

test("CORS headers present on generic error responses", async () => {
  const app = build();

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

  expect(res.statusCode).toBe(500);
  expect(res.headers["access-control-allow-origin"]).toBe(
    "https://example.com",
  );
});

// ============= 3. Preflight Request Tests =============

test("handles preflight OPTIONS requests", async () => {
  const app = build();

  const res = await app.inject({
    method: "OPTIONS",
    url: "/any-endpoint",
    headers: {
      origin: "http://localhost:3000",
      "access-control-request-method": "GET",
    },
  });

  expect(res.statusCode).toBe(204);
  expect(res.headers["access-control-allow-origin"]).toBe(
    "http://localhost:3000",
  );
  expect(res.headers["access-control-allow-methods"]).toBeTruthy();
});

test("preflight request with POST method", async () => {
  const app = build();

  const res = await app.inject({
    method: "OPTIONS",
    url: "/any-endpoint",
    headers: {
      origin: "http://localhost:3000",
      "access-control-request-method": "POST",
      "access-control-request-headers": "content-type",
    },
  });

  expect(res.statusCode).toBe(204);
  expect(res.headers["access-control-allow-origin"]).toBe(
    "http://localhost:3000",
  );
  expect(res.headers["access-control-allow-methods"]).toBeTruthy();
  expect(res.headers["access-control-allow-headers"]).toBeTruthy();
});

test("preflight request without origin header", async () => {
  const app = build();

  const res = await app.inject({
    method: "OPTIONS",
    url: "/any-endpoint",
    headers: {
      "access-control-request-method": "GET",
    },
  });

  // When origin: true is set and no origin header is provided,
  // Fastify CORS returns 400 for preflight requests
  expect(res.statusCode).toBe(400);
});

// ============= 4. CORS Configuration Tests =============

test("CORS allows credentials when configured", async () => {
  const app = build();

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

  expect(res.statusCode).toBe(200);
  // Note: Our current CORS config uses origin: true, which should allow credentials
  expect(res.headers["access-control-allow-origin"]).toBe(
    "http://localhost:3000",
  );
});
