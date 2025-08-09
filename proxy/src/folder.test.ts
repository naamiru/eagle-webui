import { suite, type TestContext, test } from "node:test";
import * as eagleApi from "./eagle-api";
import { build } from "./test-helper";

suite("/folder/list", () => {
  test("returns transformed folder list", async (t: TestContext) => {
    const mockData = [
      { id: "folder-1", name: "Family Photos" },
      { id: "folder-2", name: "Work Documents" },
    ];

    t.mock.method(eagleApi, "callEagleApi", async () => mockData);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    t.assert.deepStrictEqual(res.json(), [
      { id: "folder-1", name: "Family Photos", children: [], items: [] },
      { id: "folder-2", name: "Work Documents", children: [], items: [] },
    ]);
  });

  test("handles nested folder structure", async (t: TestContext) => {
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

    t.mock.method(eagleApi, "callEagleApi", async () => mockData);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const result = res.json();
    t.assert.strictEqual(result[0].id, "parent-1");
    t.assert.strictEqual(result[0].name, "Parent Folder");
    t.assert.strictEqual(result[0].children[0].id, "child-1");
    t.assert.strictEqual(result[0].children[0].children[0].id, "grandchild-1");
    t.assert.deepStrictEqual(result[0].items, []);
  });

  test("handles empty folder list", async (t: TestContext) => {
    t.mock.method(eagleApi, "callEagleApi", async () => []);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    t.assert.deepStrictEqual(res.json(), []);
  });

  test("handles folders without children field", async (t: TestContext) => {
    const mockData = [
      { id: "folder-1", name: "No Children Folder" },
      { id: "folder-2", name: "Another Folder", children: [] },
    ];

    t.mock.method(eagleApi, "callEagleApi", async () => mockData);

    const app = build(t);
    const res = await app.inject({
      method: "GET",
      url: "/folder/list",
    });

    t.assert.strictEqual(res.statusCode, 200);
    const result = res.json();
    t.assert.deepStrictEqual(result[0].children, []);
    t.assert.deepStrictEqual(result[1].children, []);
  });
});
