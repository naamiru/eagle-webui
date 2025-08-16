import "server-only";

export const EAGLE_API_URL =
  process.env.EAGLE_API_URL || "http://localhost:41595";

// Eagle API cache duration (sec)
export const EAGLE_API_CACHE_TTL = 3600;

// Maximum items to fetch from Eagle API at once
export const EAGLE_API_MAX_ITEMS = 10000;
