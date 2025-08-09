import { type TestContext, test } from "node:test";
import type { FastifyError } from "fastify";
import { EagleApiError } from "./eagle-api";
import { build } from "./test-helper";

test("handles EagleApiError with correct status code and message", async (t: TestContext) => {
  const app = build(t);

  // Register a route that throws EagleApiError
  app.get("/test-eagle-error", async () => {
    throw new EagleApiError(503, "Eagle service is not running");
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-eagle-error",
  });

  t.assert.strictEqual(res.statusCode, 503);
  const result = res.json();
  t.assert.strictEqual(result.error, "Eagle service is not running");
});

test("handles EagleApiError with cause", async (t: TestContext) => {
  const app = build(t);
  const cause = new Error("Connection refused");

  app.get("/test-eagle-error-with-cause", async () => {
    throw new EagleApiError(502, "Eagle API error", cause);
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-eagle-error-with-cause",
  });

  t.assert.strictEqual(res.statusCode, 502);
  const result = res.json();
  t.assert.strictEqual(result.error, "Eagle API error");
});

test("handles unknown error with 500 status", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-unknown-error", async () => {
    throw new Error("Something went wrong");
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-unknown-error",
  });

  t.assert.strictEqual(res.statusCode, 500);
  const result = res.json();
  t.assert.strictEqual(result.error, "An unexpected error occurred");
});

test("handles error with custom status code", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-custom-status", async () => {
    const error = new Error("Bad request") as FastifyError;
    error.statusCode = 400;
    throw error;
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-custom-status",
  });

  t.assert.strictEqual(res.statusCode, 400);
  const result = res.json();
  t.assert.strictEqual(result.error, "An unexpected error occurred");
});

test("handles non-Error objects", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-non-error", async () => {
    throw "String error";
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-non-error",
  });

  t.assert.strictEqual(res.statusCode, 500);
  const result = res.json();
  t.assert.strictEqual(result.error, "An unexpected error occurred");
});

test("handles error without message", async (t: TestContext) => {
  const app = build(t);

  app.get("/test-no-message", async () => {
    const error = new Error() as FastifyError;
    error.message = "";
    throw error;
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-no-message",
  });

  t.assert.strictEqual(res.statusCode, 500);
  const result = res.json();
  t.assert.strictEqual(result.error, "An unexpected error occurred");
});
