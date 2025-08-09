import { queryOptions } from "@tanstack/react-query";
import type { Item } from "~/types/item";

export const fetchItems = async (limit?: number): Promise<Item[]> => {
  const url = new URL("http://localhost:57821/item/list");
  if (limit !== undefined) {
    url.searchParams.set("limit", limit.toString());
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
