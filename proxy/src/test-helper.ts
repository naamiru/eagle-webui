import type { TestContext } from "node:test";
import buildApp from "./app";

export function build(t: TestContext) {
  const app = buildApp();
  t.after(() => app.close());
  return app;
}
