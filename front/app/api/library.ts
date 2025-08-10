import { queryOptions } from "@tanstack/react-query";
import type { Library } from "~/types/item";

export const fetchLibrary = async (): Promise<Library> => {
  const response = await fetch("http://localhost:57821/library/info");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch library info: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export const libraryQueryOptions = queryOptions({
  queryKey: ["library"],
  queryFn: fetchLibrary,
  staleTime: 24 * 60 * 60 * 1000, // 24 hours (library path rarely changes)
  retry: (failureCount, error) => {
    // Don't retry if proxy service is unavailable
    if (error.message.includes("Failed to fetch")) return false;
    return failureCount < 2; // Fewer retries since library is critical
  },
});
