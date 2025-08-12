import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Item } from "~/types/item";
import { fetchItems, folderItemsQueryOptions } from "./items";

// Mock the fetchWithAuth function
vi.mock("./utils", () => ({
  fetchWithAuth: vi.fn(),
}));

const { fetchWithAuth } = await import("./utils");

const createMockItem = (
  id: string,
  name: string,
): Omit<Item, "globalOrder"> => ({
  id,
  name,
  width: 1920,
  height: 1080,
  size: 1024000,
  btime: 1640995200000,
  mtime: 1640995300000,
  ext: "jpg",
  star: 0,
  duration: 0,
  manualOrder: 1640995200000,
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fetchItems", () => {
  test("fetches items with proper parameters", async () => {
    const mockItems = [
      createMockItem("1", "item1.jpg"),
      createMockItem("2", "item2.jpg"),
    ];

    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response);

    const result = await fetchItems(100, "folder123");

    expect(fetchWithAuth).toHaveBeenCalledWith(
      "/item/list?limit=100&folder=folder123",
    );
    expect(result).toEqual([
      { ...mockItems[0], globalOrder: 1 },
      { ...mockItems[1], globalOrder: 2 },
    ]);
  });

  test("handles missing parameters correctly", async () => {
    const mockItems = [createMockItem("1", "item1.jpg")];

    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response);

    const result = await fetchItems();

    expect(fetchWithAuth).toHaveBeenCalledWith("/item/list");
    expect(result).toEqual([{ ...mockItems[0], globalOrder: 1 }]);
  });

  test("throws error on failed response", async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    } as Response);

    await expect(fetchItems()).rejects.toThrow(
      "Failed to fetch items: 500 Internal Server Error",
    );
  });
});

describe("folderItemsQueryOptions", () => {
  test("calls fetchItems with correct parameters", async () => {
    const mockItems = [
      createMockItem("1", "first.jpg"),
      createMockItem("2", "second.jpg"),
      createMockItem("3", "third.jpg"),
    ];

    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response);

    const queryOptions = folderItemsQueryOptions("folder123");
    const result = await queryOptions.queryFn();

    expect(fetchWithAuth).toHaveBeenCalledWith(
      "/item/list?limit=1000&folder=folder123",
    );
    expect(result).toEqual([
      { ...mockItems[0], globalOrder: 1 },
      { ...mockItems[1], globalOrder: 2 },
      { ...mockItems[2], globalOrder: 3 },
    ]);
  });

  test("handles single item correctly", async () => {
    const mockItems = [createMockItem("1", "single.jpg")];

    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response);

    const queryOptions = folderItemsQueryOptions("folder123");
    const result = await queryOptions.queryFn();

    expect(result).toEqual([{ ...mockItems[0], globalOrder: 1 }]);
  });

  test("handles empty items array", async () => {
    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const queryOptions = folderItemsQueryOptions("folder123");
    const result = await queryOptions.queryFn();

    expect(result).toEqual([]);
  });

  test("preserves Eagle API response order with globalOrder", async () => {
    // Simulate Eagle API returning items in GLOBAL ASC order
    const mockItems = [
      createMockItem("oldest", "oldest.jpg"), // Oldest -> globalOrder 1
      createMockItem("older", "older.jpg"), // -> globalOrder 2
      createMockItem("middle", "middle.jpg"), // -> globalOrder 3
      createMockItem("recent", "recent.jpg"), // -> globalOrder 4
      createMockItem("newest", "newest.jpg"), // Most recent -> globalOrder 5
    ];

    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response);

    const queryOptions = folderItemsQueryOptions("folder123");
    const result = await queryOptions.queryFn();

    // Verify globalOrder matches API response order (ASC)
    expect(result[0].globalOrder).toBe(1); // First in response gets globalOrder 1
    expect(result[1].globalOrder).toBe(2);
    expect(result[2].globalOrder).toBe(3);
    expect(result[3].globalOrder).toBe(4);
    expect(result[4].globalOrder).toBe(5); // Last in response gets globalOrder 5

    // When sorted by globalOrder ASC, should match Eagle API response order
    const sortedByGlobal = [...result].sort(
      (a, b) => a.globalOrder - b.globalOrder,
    );
    expect(sortedByGlobal.map((item) => item.id)).toEqual([
      "oldest",
      "older",
      "middle",
      "recent",
      "newest",
    ]);

    // When sorted by globalOrder DESC, should reverse the Eagle API response order
    const sortedByGlobalDesc = [...result].sort(
      (a, b) => b.globalOrder - a.globalOrder,
    );
    expect(sortedByGlobalDesc.map((item) => item.id)).toEqual([
      "newest",
      "recent",
      "middle",
      "older",
      "oldest",
    ]);
  });

  test("correctly calculates globalOrder for large arrays", async () => {
    // Create 100 items to test with larger arrays
    const mockItems = Array.from({ length: 100 }, (_, i) =>
      createMockItem(`${i}`, `item${i}.jpg`),
    );

    vi.mocked(fetchWithAuth).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockItems),
    } as Response);

    const queryOptions = folderItemsQueryOptions("folder123");
    const result = await queryOptions.queryFn();

    // First item should have globalOrder = 1
    expect(result[0].globalOrder).toBe(1);
    // Last item should have globalOrder = 100
    expect(result[99].globalOrder).toBe(100);
    // Middle item should have globalOrder = 50
    expect(result[49].globalOrder).toBe(50);
  });

  test("uses correct query parameters", () => {
    const queryOptions = folderItemsQueryOptions("test-folder-id");

    expect(queryOptions.queryKey).toEqual([
      "items",
      "folder",
      "test-folder-id",
    ]);
    expect(queryOptions.staleTime).toBe(5 * 60 * 1000); // 5 minutes
  });

  test("has correct retry configuration", () => {
    const queryOptions = folderItemsQueryOptions("folder123");

    // Test retry function with different error types
    const retryFn = queryOptions.retry;
    expect(retryFn).toBeDefined();

    if (retryFn) {
      // Should not retry on fetch failures
      expect(retryFn(1, new Error("Failed to fetch"))).toBe(false);

      // Should retry on other errors (up to 3 times)
      expect(retryFn(1, new Error("Other error"))).toBe(true);
      expect(retryFn(2, new Error("Other error"))).toBe(true);
      expect(retryFn(3, new Error("Other error"))).toBe(false); // No more retries after 3
    }
  });
});
