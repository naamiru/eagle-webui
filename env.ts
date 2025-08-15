import "server-only";

export const EAGLE_API_URL =
  process.env.EAGLE_API_URL || "http://localhost:41595";

// Eagle API cache duration (sec)
export const EAGLE_API_CACHE_TTL = 3600;
