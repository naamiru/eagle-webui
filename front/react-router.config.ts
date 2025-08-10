import type { Config } from "@react-router/dev/config";

export default {
  // Enable SPA mode to match original app behavior
  ssr: false,
  future: {
    v3_fetcherPersist: true,
    v3_relativeSplatPath: true,
    v3_throwAbortReason: true,
  },
} satisfies Config;
