import { afterEach } from "vitest";
import buildApp from "./app";

export function build() {
  const app = buildApp();
  afterEach(() => app.close());
  return app;
}
