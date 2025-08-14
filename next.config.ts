import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
};

const withNextIntl = createNextIntlPlugin({
  requestConfig: "./i18n/request.ts",
});
export default withNextIntl(nextConfig);
