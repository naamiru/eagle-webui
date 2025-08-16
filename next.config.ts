import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  output: "standalone",
  // avoid 2MB fetch cache limit
  // https://github.com/vercel/next.js/discussions/48324#discussioncomment-10748690
  cacheHandler: require.resolve(
    "next/dist/server/lib/incremental-cache/file-system-cache.js"
  ),
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
});
export default withNextIntl(nextConfig);
