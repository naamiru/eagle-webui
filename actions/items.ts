"use server";

import { fetchFolderItems } from "@/lib/api/item";
import { sortItems } from "@/utils/folder";
import { getFetchOptions } from "@/utils/fetch";
import type { Item, ItemOrderBy, Order } from "@/types/models";


export interface ItemsPage {
  items: Item[];
  hasMore: boolean;
  totalItems: number;
}

interface LoadMoreItemsParams {
  folderId: string;
  offset: number;
  limit: number;
  orderBy: ItemOrderBy;
  sortIncrease: boolean;
}


export async function loadMoreItems({
  folderId,
  offset,
  limit,
  orderBy,
  sortIncrease,
}: LoadMoreItemsParams): Promise<ItemsPage> {
  const fetchOptions = await getFetchOptions();
  const items = await fetchFolderItems(folderId, { fetchOptions });
  const sortedItems = sortItems(items, orderBy, sortIncrease);

  const endIndex = offset + limit;
  const pageItems = sortedItems.slice(offset, endIndex);

  return {
    items: pageItems,
    hasMore: endIndex < sortedItems.length,
    totalItems: sortedItems.length,
  };
}

export async function updateItemOrder(
  folderId: string,
  newOrder: Order<ItemOrderBy>
): Promise<ItemsPage> {
  const fetchOptions = await getFetchOptions();
  const items = await fetchFolderItems(folderId, { fetchOptions });
  const sortedItems = sortItems(items, newOrder.orderBy, newOrder.sortIncrease);

  // Return initial page with new order
  const initialItemsPerPage = 100;
  const initialItems = sortedItems.slice(0, initialItemsPerPage);

  return {
    items: initialItems,
    hasMore: sortedItems.length > initialItemsPerPage,
    totalItems: sortedItems.length,
  };
}
