import { queryOptions } from "@tanstack/react-query";
import type { Folder } from "~/types/item";

export const fetchFolders = async (): Promise<Folder[]> => {
  const response = await fetch("http://localhost:57821/folder/list");

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
