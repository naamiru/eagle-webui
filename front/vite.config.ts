import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
    VitePWA({
      injectRegister: null,
      strategies: "injectManifest",
      srcDir: "app",
      filename: "service-worker.ts",
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        name: "Eagle WebUI",
        short_name: "EagleWebUI",
        description: "A web interface for the Eagle image viewer application.",
      },
    }),
  ],
});
