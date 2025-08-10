import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    setupFiles: ["./src/test/setup.ts"],
    browser: {
      enabled: true,
      headless: true,
      provider: "playwright",
      // https://vitest.dev/guide/browser/playwright
      instances: [{ browser: "chromium" }],
    },
  },
  optimizeDeps: {
    include: [
      "@tanstack/react-router",
      "@tanstack/react-query",
      "@tanstack/react-query-devtools",
      "@tanstack/react-router-devtools",
      "react-dom/client",
    ],
  },
});
