import type { FastifyError } from "fastify";
import { expect, test } from "vitest";
import { EagleApiError } from "./eagle-api";
import { build } from "./test-helper";

test("handles EagleApiError with correct status code and message", async () => {
  const app = build();

  // Register a route that throws EagleApiError
  app.get("/test-eagle-error", async () => {
    throw new EagleApiError(503, "Eagle service is not running");
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-eagle-error",
  });

  expect(res.statusCode).toBe(503);
  const result = res.json();
  expect(result.error).toBe("Eagle service is not running");
});

test("handles EagleApiError with cause", async () => {
  const app = build();
  const cause = new Error("Connection refused");

  app.get("/test-eagle-error-with-cause", async () => {
    throw new EagleApiError(502, "Eagle API error", cause);
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-eagle-error-with-cause",
  });

  expect(res.statusCode).toBe(502);
  const result = res.json();
  expect(result.error).toBe("Eagle API error");
});

test("handles unknown error with 500 status", async () => {
  const app = build();

  app.get("/test-unknown-error", async () => {
    throw new Error("Something went wrong");
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-unknown-error",
  });

  expect(res.statusCode).toBe(500);
  const result = res.json();
  expect(result.error).toBe("An unexpected error occurred");
});

test("handles error with custom status code", async () => {
  const app = build();

  app.get("/test-custom-status", async () => {
    const error = new Error("Bad request") as FastifyError;
    error.statusCode = 400;
    throw error;
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-custom-status",
  });

  expect(res.statusCode).toBe(400);
  const result = res.json();
  expect(result.error).toBe("An unexpected error occurred");
});

test("handles non-Error objects", async () => {
  const app = build();

  app.get("/test-non-error", async () => {
    throw "String error";
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-non-error",
  });

  expect(res.statusCode).toBe(500);
  const result = res.json();
  expect(result.error).toBe("An unexpected error occurred");
});

test("handles error without message", async () => {
  const app = build();

  app.get("/test-no-message", async () => {
    const error = new Error() as FastifyError;
    error.message = "";
    throw error;
  });

  const res = await app.inject({
    method: "GET",
    url: "/test-no-message",
  });

  expect(res.statusCode).toBe(500);
  const result = res.json();
  expect(result.error).toBe("An unexpected error occurred");
});
