import { beforeEach, describe, expect, it, vi } from "vitest";
import * as settingsModule from "~/services/settings";
import { fetchWithAuth } from "./utils";

// Mock the settings module
vi.mock("~/services/settings", () => ({
  getProxyUrl: vi.fn(),
  getProxyToken: vi.fn(),
}));

describe("fetchWithAuth", () => {
  const mockGetProxyUrl = vi.mocked(settingsModule.getProxyUrl);
  const mockGetProxyToken = vi.mocked(settingsModule.getProxyToken);
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    window.fetch = mockFetch;
    mockGetProxyUrl.mockReturnValue("http://localhost:57821");
    mockGetProxyToken.mockReturnValue(undefined);
  });

  it("should construct full URL with proxy URL and endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    await fetchWithAuth("/test/endpoint");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:57821/test/endpoint",
      expect.any(Object),
    );
  });

  it("should add Authorization header when token is available", async () => {
    mockGetProxyToken.mockReturnValue("test-token-123");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    await fetchWithAuth("/test/endpoint");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:57821/test/endpoint",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token-123");
  });

  it("should not add Authorization header when token is not available", async () => {
    mockGetProxyToken.mockReturnValue(undefined);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    await fetchWithAuth("/test/endpoint");

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get("Authorization")).toBeNull();
  });

  it("should preserve existing headers", async () => {
    mockGetProxyToken.mockReturnValue("test-token");
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    await fetchWithAuth("/test/endpoint", {
      headers: {
        "Content-Type": "application/json",
        "X-Custom-Header": "custom-value",
      },
    });

    const callArgs = mockFetch.mock.calls[0];
    const headers = callArgs[1].headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("X-Custom-Header")).toBe("custom-value");
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("should pass through other request options", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    } as Response);

    await fetchWithAuth("/test/endpoint", {
      method: "POST",
      body: JSON.stringify({ data: "test" }),
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:57821/test/endpoint",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ data: "test" }),
      }),
    );
  });

  it("should return 401 response without redirecting", async () => {
    const mock401Response = {
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response;

    mockFetch.mockResolvedValueOnce(mock401Response);

    const response = await fetchWithAuth("/test/endpoint");

    expect(response).toBe(mock401Response);
    expect(response.status).toBe(401);
    // No redirect happens - the response is returned as-is
  });

  it("should return other error responses as-is", async () => {
    const mock500Response = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response;

    mockFetch.mockResolvedValueOnce(mock500Response);

    const response = await fetchWithAuth("/test/endpoint");

    expect(response).toBe(mock500Response);
    expect(response.status).toBe(500);
  });

  it("should return successful response", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: "test" }),
    } as Response;
    mockFetch.mockResolvedValueOnce(mockResponse);

    const response = await fetchWithAuth("/test/endpoint");

    expect(response).toBe(mockResponse);
    expect(response.ok).toBe(true);
  });
});
