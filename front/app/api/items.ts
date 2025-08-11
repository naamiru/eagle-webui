import { queryOptions } from "@tanstack/react-query";
import { getProxyUrl } from "~/services/settings";
import type { Item } from "~/types/item";

export const fetchItems = async (
  limit?: number,
  folderId?: string,
): Promise<Item[]> => {
  const proxyUrl = getProxyUrl();
  const url = new URL(`${proxyUrl}/item/list`);
  if (limit !== undefined) {
    url.searchParams.set("limit", limit.toString());
  }
  if (folderId !== undefined && folderId.trim() !== "") {
    url.searchParams.set("folder", folderId.trim());
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(
      `Failed to fetch items: ${response.status} ${response.statusText}`,
    );
  }

  return response.json();
};

export const itemsQueryOptions = (limit?: number) =>
  queryOptions({
    queryKey: ["items", limit],
    queryFn: () => fetchItems(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if proxy service is unavailable
      if (error.message.includes("Failed to fetch")) return false;
      return failureCount < 3;
    },
  });

export const folderItemsQueryOptions = (folderId: string) =>
  queryOptions({
    queryKey: ["items", "folder", folderId],
    queryFn: () => fetchItems(1000, folderId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if proxy service is unavailable
      if (error.message.includes("Failed to fetch")) return false;
      return failureCount < 3;
    },
  });
