import "server-only";

import { EAGLE_API_CACHE_TTL } from "@/env";

export async function getFetchOptions(): Promise<RequestInit> {
  return { next: { revalidate: EAGLE_API_CACHE_TTL } };
}
