import { queryOptions } from "@tanstack/react-query";
import type { Item } from "~/types/item";
import { fetchWithAuth } from "./utils";

export const fetchItems = async (
  limit?: number,
  folderId?: string,
): Promise<Item[]> => {
  const params = new URLSearchParams();
  if (limit !== undefined) {
    params.set("limit", limit.toString());
  }
  if (folderId !== undefined && folderId.trim() !== "") {
    params.set("folder", folderId.trim());
  }

  const endpoint = params.toString() ? `/item/list?${params}` : "/item/list";
  const response = await fetchWithAuth(endpoint);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch items: ${response.status} ${response.statusText}`,
    );
  }

  const items = await response.json();

  // Add globalOrder to preserve Eagle API response order
  // Response order is GLOBAL DESC, so reverse index
  return items.map((item: Omit<Item, "globalOrder">, index: number) => ({
    ...item,
    globalOrder: items.length - index,
  }));
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
