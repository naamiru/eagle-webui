import { afterEach, describe, expect, test, vi } from "vitest";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("/folder/list", () => {
  test("returns transformed folder list", async () => {
    const mockData = [
      { id: "folder-1", name: "Family Photos" },
      { id: "folder-2", name: "Work Documents" },
    ];

    vi.spyOn(eagleApi, "callEagleApi").mockResolvedValue(mockData);

    const app = build();
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([
      { id: "folder-1", name: "Family Photos", children: [], items: [] },
      { id: "folder-2", name: "Work Documents", children: [], items: [] },
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
      { id: "folder-1", name: "No Children Folder" },
      { id: "folder-2", name: "Another Folder", children: [] },
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
  });
});
