import { type TestContext, test } from "node:test";
import { build } from "./test-helper";

test("returns stub folders", async (t: TestContext) => {
  const app = build(t);
  const res = await app.inject({
    method: "GET",
    url: "/folder/list",
  });
  t.assert.strictEqual(res?.statusCode, 200);
  t.assert.deepStrictEqual(res?.json(), [
    { id: 1, name: "Family", children: [], items: [] },
    { id: 2, name: "Friends", children: [], items: [] },
  ]);
});
