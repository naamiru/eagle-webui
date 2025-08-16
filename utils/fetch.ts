import "server-only";

import { EAGLE_API_CACHE_TTL } from "@/env";

export function getFetchOptions(): RequestInit {
  return { next: { revalidate: EAGLE_API_CACHE_TTL } };
}
