import { afterEach, expect, test, vi } from "vitest";
import { callEagleApi, type EagleApiError } from "./eagle-api";

interface FetchError extends Error {
  code?: string;
}

// Reset mocks after each test
afterEach(() => {
  vi.restoreAllMocks();
});

test("callEagleApi returns data on success", async () => {
  const mockData = [{ id: "folder-1", name: "Test Folder" }];
  const mockResponse = {
    status: "success",
    data: mockData,
  };

  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => mockResponse,
  } as Response);

  const result = await callEagleApi("/api/folder/list");
  expect(result).toEqual(mockData);
});

test("callEagleApi throws EagleApiError on HTTP error", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: false,
    status: 404,
    statusText: "Not Found",
  } as Response);

  await expect(callEagleApi("/api/folder/list")).rejects.toThrow();
  
  try {
    await callEagleApi("/api/folder/list");
  } catch (error) {
    const eagleError = error as EagleApiError;
    expect(eagleError.httpCode).toBe(502);
    expect(eagleError.message).toContain("Eagle API returned status 404");
  }
});

test("callEagleApi throws EagleApiError on Eagle error status", async () => {
  const mockResponse = {
    status: "error",
    message: "Database locked",
  };

  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => mockResponse,
  } as Response);

  await expect(callEagleApi("/api/folder/list")).rejects.toThrow();
  
  try {
    await callEagleApi("/api/folder/list");
  } catch (error) {
    const eagleError = error as EagleApiError;
    expect(eagleError.httpCode).toBe(502);
    expect(eagleError.message).toContain("Eagle API error");
  }
});

test("callEagleApi throws EagleApiError on timeout", async () => {
  const error = new Error("The operation was aborted");
  error.name = "AbortError";

  vi.spyOn(globalThis, "fetch").mockRejectedValue(error);

  await expect(callEagleApi("/api/folder/list")).rejects.toThrow();
  
  try {
    await callEagleApi("/api/folder/list");
  } catch (error) {
    const eagleError = error as EagleApiError;
    expect(eagleError.httpCode).toBe(504);
    expect(eagleError.message).toContain("timed out after 30 seconds");
  }
});

test("callEagleApi throws EagleApiError on ECONNREFUSED", async () => {
  const error = new Error("fetch failed") as FetchError;
  error.code = "ECONNREFUSED";

  vi.spyOn(globalThis, "fetch").mockRejectedValue(error);

  await expect(callEagleApi("/api/folder/list")).rejects.toThrow();
  
  try {
    await callEagleApi("/api/folder/list");
  } catch (error) {
    const eagleError = error as EagleApiError;
    expect(eagleError.httpCode).toBe(503);
    expect(eagleError.message).toContain("Eagle service is not running");
  }
});

test("callEagleApi throws EagleApiError on network error", async () => {
  const error = new Error("Network unreachable") as FetchError;
  error.code = "ENETUNREACH";

  vi.spyOn(globalThis, "fetch").mockRejectedValue(error);

  await expect(callEagleApi("/api/folder/list")).rejects.toThrow();
  
  try {
    await callEagleApi("/api/folder/list");
  } catch (error) {
    const eagleError = error as EagleApiError;
    expect(eagleError.httpCode).toBe(503);
    expect(eagleError.message).toContain("Network error");
  }
});

test("callEagleApi throws EagleApiError on JSON parse error", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError("Unexpected token");
    },
  } as unknown as Response);

  await expect(callEagleApi("/api/folder/list")).rejects.toThrow();
  
  try {
    await callEagleApi("/api/folder/list");
  } catch (error) {
    const eagleError = error as EagleApiError;
    expect(eagleError.httpCode).toBe(502);
    expect(eagleError.message).toContain("Invalid response format");
  }
});
