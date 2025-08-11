import { queryOptions } from "@tanstack/react-query";
import type { Folder } from "~/types/item";
import { fetchWithAuth } from "./utils";

export const fetchFolders = async (): Promise<Folder[]> => {
  const response = await fetchWithAuth("/folder/list");

  if (!response.ok) {
    throw new Error(
      `Failed to fetch folders: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export const foldersQueryOptions = queryOptions({
  queryKey: ["folders"],
  queryFn: fetchFolders,
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: (failureCount, error) => {
    // Don't retry if proxy service is unavailable
    if (error.message.includes("Failed to fetch")) return false;
    return failureCount < 3;
  },
});
