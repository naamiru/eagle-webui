import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Folder } from "~/types/item";
import { fetchFolders, foldersQueryOptions } from "./folders";

// Mock fetch globally
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("fetchFolders", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("returns parsed JSON on successful response", async () => {
    const mockFolders: Folder[] = [
      {
        id: "folder-1",
        name: "Test Folder",
        children: [],
        items: [],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFolders,
    });

    const result = await fetchFolders();

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:57821/folder/list",
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    expect(result).toEqual(mockFolders);
  });

  it("throws error on HTTP error responses", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    await expect(fetchFolders()).rejects.toThrow(
      "Failed to fetch folders: 404 Not Found",
    );
  });

  it("throws error on 503 service unavailable", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    });

    await expect(fetchFolders()).rejects.toThrow(
      "Failed to fetch folders: 503 Service Unavailable",
    );
  });

  it("throws error on network failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(fetchFolders()).rejects.toThrow("Network error");
  });

  it("handles empty folder list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    const result = await fetchFolders();
    expect(result).toEqual([]);
  });

  it("handles complex nested folder structure", async () => {
    const mockComplexFolders: Folder[] = [
      {
        id: "parent-1",
        name: "Parent Folder",
        children: [
          {
            id: "child-1",
            name: "Child Folder",
            children: [],
            items: [
              {
                id: "item-1",
                width: 800,
                height: 600,
              },
            ],
          },
        ],
        items: [],
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockComplexFolders,
    });

    const result = await fetchFolders();
    expect(result).toEqual(mockComplexFolders);
    expect(result[0].children[0].items).toHaveLength(1);
  });
});

describe("foldersQueryOptions", () => {
  it("has correct configuration", () => {
    expect(foldersQueryOptions.queryKey).toEqual(["folders"]);
    expect(foldersQueryOptions.queryFn).toBe(fetchFolders);
    expect(foldersQueryOptions.staleTime).toBe(5 * 60 * 1000); // 5 minutes
  });
});
