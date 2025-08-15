import "server-only";

import { headers } from "next/headers";
import { EAGLE_API_CACHE_TTL } from "@/env";

export async function cacheControlWithHeaders(): Promise<RequestInit> {
  const headerList = await headers();
  const cacheControl = headerList.get("cache-control");
  const shouldRevalidate =
    cacheControl?.includes("max-age=0") ||
    cacheControl?.includes("no-cache") ||
    cacheControl?.includes("no-store");

  return shouldRevalidate
    ? { cache: "no-cache" }
    : { next: { revalidate: EAGLE_API_CACHE_TTL } };
}
