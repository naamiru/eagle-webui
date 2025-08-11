import { libraryQueryOptions } from "~/api/library";
import { getQueryClient } from "~/integrations/tanstack-query";

// Constants
export const STORAGE_KEY = "eagle-proxy-url";
export const DEFAULT_PROXY_URL = "http://localhost:57821";

// Functions
export function getProxyUrl(): string {
  if (typeof window === "undefined") {
    return DEFAULT_PROXY_URL;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || DEFAULT_PROXY_URL;
  } catch {
    // localStorage unavailable (private browsing, etc.)
    return DEFAULT_PROXY_URL;
  }
}

export function setProxyUrl(url: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, url);
  } catch {
    // localStorage unavailable - could show warning to user
    console.warn("Unable to save proxy URL setting");
  }
}

export function hasStoredProxyUrl(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored !== null;
  } catch {
    return false;
  }
}

export async function validateProxyUrl(url: string): Promise<boolean> {
  try {
    // Basic URL format validation
    new URL(url);

    const queryClient = getQueryClient();

    // If this is the current proxy URL and we have fresh cached data, it's valid
    if (url === getProxyUrl()) {
      const cachedData = queryClient.getQueryData(libraryQueryOptions.queryKey);
      const queryState = queryClient.getQueryState(
        libraryQueryOptions.queryKey,
      );
      if (cachedData && queryState && !queryState.isStale) {
        return true; // Cache hit - URL is definitely valid
      }
    }

    // Create validation query based on existing library query
    const validationQuery = {
      ...libraryQueryOptions,
      queryKey: ["library", "validation", url],
      queryFn: async () => {
        const response = await fetch(`${url}/library/info`);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch library info: ${response.status} ${response.statusText}`,
          );
        }
        return response.json();
      },
      retry: false, // Don't retry for validation
      staleTime: 0, // Always fresh for validation
    };

    // Use fetchQuery to test the connection
    await queryClient.fetchQuery(validationQuery);

    return true;
  } catch (_error) {
    return false;
  }
}

export function resetToDefault(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.warn("Unable to reset proxy URL setting");
  }
}
