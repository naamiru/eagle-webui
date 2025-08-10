import { afterEach, describe, expect, test, vi } from "vitest";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/folder/list", () => {
  test("returns transformed folder list", async () => {
    const mockData = [
      {
        id: "folder-1",
        name: "Family Photos",
      },
      {
        id: "folder-2",
        name: "Work Documents",
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockData;
      // All item list calls return empty
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      {
        id: "folder-1",
        name: "Family Photos",
        children: [],
        items: [],
        coverImage: undefined,
      },
      {
        id: "folder-2",
        name: "Work Documents",
        children: [],
        items: [],
        coverImage: undefined,
      },
    ]);
  });

  test("handles nested folder structure", async () => {
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

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockData;
      // All item list calls return empty
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].id).toBe("parent-1");
    expect(result[0].name).toBe("Parent Folder");
    expect(result[0].children[0].id).toBe("child-1");
    expect(result[0].children[0].children[0].id).toBe("grandchild-1");
    expect(result[0].items).toEqual([]);
    expect(result[0].coverImage).toBeUndefined();
    expect(result[0].children[0].coverImage).toBeUndefined();
    expect(result[0].children[0].children[0].coverImage).toBeUndefined();
  });

  test("handles empty folder list", async () => {
    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async () => {
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  test("handles folders without children field", async () => {
    const mockData = [
      {
        id: "folder-1",
        name: "No Children Folder",
      },
      {
        id: "folder-2",
        name: "Another Folder",
        children: [],
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockData;
      // All item list calls return empty
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].children).toEqual([]);
    expect(result[1].children).toEqual([]);
    expect(result[0].coverImage).toBeUndefined();
    expect(result[1].coverImage).toBeUndefined();
  });

  test("adds cover image for folder with direct images", async () => {
    const mockFolders = [
      {
        id: "folder-1",
        name: "Photos",
      },
    ];

    const mockItems = [
      {
        id: "item-1",
        name: "photo1.jpg",
        width: 800,
        height: 600,
        size: 1024,
        ext: "jpg",
        tags: [],
        folders: ["folder-1"],
        url: "photo1.jpg",
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockFolders;
      if (url.includes("folders=folder-1") && url.includes("limit=1")) {
        return mockItems;
      }
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].coverImage).toEqual({
      id: "item-1",
      width: 800,
      height: 600,
    });

    expect(eagleApi.callEagleApi).toHaveBeenCalledWith("/api/folder/list");
    // Verify item list was called for folder-1
    const calls = vi.mocked(eagleApi.callEagleApi).mock.calls;
    const itemCall = calls.find(call => 
      call[0].includes("/api/item/list") && 
      call[0].includes("folders=folder-1")
    );
    expect(itemCall).toBeDefined();
  });

  test("adds cover image for folder with descendant images only", async () => {
    const mockFolders = [
      {
        id: "parent-1",
        name: "Parent",
        children: [
          {
            id: "child-1",
            name: "Child",
          },
        ],
      },
    ];

    const mockItems = [
      {
        id: "item-1",
        name: "photo1.jpg",
        width: 800,
        height: 600,
        size: 1024,
        ext: "jpg",
        tags: [],
        folders: ["child-1"],
        url: "photo1.jpg",
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockFolders;
      // Parent folder direct search returns empty
      if (url.includes("folders=parent-1") && url.includes("limit=1")) {
        return [];
      }
      // Parent's descendant search (child-1) returns items
      if (url.includes("folders=child-1") && url.includes("limit=1")) {
        return mockItems;
      }
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].coverImage).toEqual({
      id: "item-1",
      width: 800,
      height: 600,
    }); // Parent gets cover image from descendant search
    expect(result[0].children[0].coverImage).toEqual({
      id: "item-1",
      width: 800,
      height: 600,
    });
  });

  test("handles API error gracefully when fetching cover images", async () => {
    const mockFolders = [
      {
        id: "folder-1",
        name: "Photos",
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockFolders;
      // All item fetches fail
      throw new Error("API Error");
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].coverImage).toBeUndefined(); // Should handle error gracefully
  });

  test("handles empty item response when fetching cover images", async () => {
    const mockFolders = [
      {
        id: "folder-1",
        name: "Photos",
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockFolders;
      // All item fetches return empty
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].coverImage).toBeUndefined();
  });

  test("processes multiple folders with cover images in parallel", async () => {
    const mockFolders = [
      {
        id: "folder-1",
        name: "Photos",
      },
      {
        id: "folder-2",
        name: "Videos",
      },
      { id: "folder-3", name: "Empty" },
    ];

    const mockItems1 = [
      {
        id: "item-1",
        name: "photo1.jpg",
        width: 800,
        height: 600,
        size: 1024,
        ext: "jpg",
        tags: [],
        folders: ["folder-1"],
        url: "photo1.jpg",
      },
    ];

    const mockItems2 = [
      {
        id: "item-2",
        name: "video1.mp4",
        width: 1920,
        height: 1080,
        size: 2048,
        ext: "mp4",
        tags: [],
        folders: ["folder-2"],
        url: "video1.mp4",
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockImplementation(async (url) => {
      if (url === "/api/folder/list") return mockFolders;
      if (url.includes("folders=folder-1") && url.includes("limit=1")) {
        return mockItems1;
      }
      if (url.includes("folders=folder-2") && url.includes("limit=1")) {
        return mockItems2;
      }
      // folder-3 returns empty
      return [];
    });

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].coverImage).toEqual({
      id: "item-1",
      width: 800,
      height: 600,
    });
    expect(result[1].coverImage).toEqual({
      id: "item-2",
      width: 1920,
      height: 1080,
    });
    expect(result[2].coverImage).toBeUndefined();

    // Verify correct API calls were made
    expect(eagleApi.callEagleApi).toHaveBeenCalledWith("/api/folder/list");
    // Each folder should have cover image fetch attempts
    const calls = vi.mocked(eagleApi.callEagleApi).mock.calls;
    const itemCalls = calls.filter(call => call[0].includes("/api/item/list"));
    expect(itemCalls.length).toBeGreaterThan(0);
  });
});
