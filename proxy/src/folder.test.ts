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
        imageCount: 0,
        descendantImageCount: 0,
      },
      {
        id: "folder-2",
        name: "Work Documents",
        imageCount: 0,
        descendantImageCount: 0,
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

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
        imageCount: 0,
        descendantImageCount: 0,
        children: [
          {
            id: "child-1",
            name: "Child Folder",
            imageCount: 0,
            descendantImageCount: 0,
            children: [
              {
                id: "grandchild-1",
                name: "Grandchild Folder",
                imageCount: 0,
                descendantImageCount: 0,
              },
            ],
          },
        ],
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

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
    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue([]);

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
        imageCount: 0,
        descendantImageCount: 0,
      },
      {
        id: "folder-2",
        name: "Another Folder",
        imageCount: 0,
        descendantImageCount: 0,
        children: [],
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

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
        imageCount: 5,
        descendantImageCount: 5,
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

    vi.spyOn(eagleApi, "callEagleApi")
      .mockResolvedValueOnce(mockFolders) // First call for folders
      .mockResolvedValueOnce(mockItems); // Second call for items

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
    expect(eagleApi.callEagleApi).toHaveBeenCalledWith(
      "/api/item/list?limit=1&folders=folder-1",
    );
  });

  test("adds cover image for folder with descendant images only", async () => {
    const mockFolders = [
      {
        id: "parent-1",
        name: "Parent",
        imageCount: 0,
        descendantImageCount: 3,
        children: [
          {
            id: "child-1",
            name: "Child",
            imageCount: 3,
            descendantImageCount: 3,
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

    vi.spyOn(eagleApi, "callEagleApi")
      .mockResolvedValueOnce(mockFolders)
      .mockResolvedValueOnce([]) // Parent folder has no direct images
      .mockResolvedValueOnce(mockItems); // Child folder has images

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    const result = res.json();
    expect(result[0].coverImage).toBeUndefined(); // Parent has no cover image (descendant search returns empty)
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
        imageCount: 5,
        descendantImageCount: 5,
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi")
      .mockResolvedValueOnce(mockFolders) // First call for folders
      .mockRejectedValueOnce(new Error("API Error")); // Second call for items fails

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
        imageCount: 5,
        descendantImageCount: 5,
      },
    ];

    vi.spyOn(eagleApi, "callEagleApi")
      .mockResolvedValueOnce(mockFolders) // First call for folders
      .mockResolvedValueOnce([]); // Second call returns empty array

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
        imageCount: 2,
        descendantImageCount: 2,
      },
      {
        id: "folder-2",
        name: "Videos",
        imageCount: 1,
        descendantImageCount: 1,
      },
      { id: "folder-3", name: "Empty", imageCount: 0, descendantImageCount: 0 },
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

    vi.spyOn(eagleApi, "callEagleApi")
      .mockResolvedValueOnce(mockFolders) // First call for folders
      .mockResolvedValueOnce(mockItems1) // folder-1 items
      .mockResolvedValueOnce(mockItems2); // folder-2 items

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

    // Should make 3 calls: folders + 2 item calls (folder-3 skipped due to no images)
    expect(eagleApi.callEagleApi).toHaveBeenCalledTimes(3);
  });
});
