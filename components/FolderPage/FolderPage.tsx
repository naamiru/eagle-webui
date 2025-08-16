"use client";

import {
  useMemo,
  useState,
  useTransition,
  useEffect,
  useCallback,
} from "react";
import {
  ITEM_ORDER_BY,
  FOLDER_ORDER_BY,
  ItemOrderBy,
  FolderOrderBy,
  Order,
  type Folder,
  type Item,
  type Layout,
} from "@/types/models";
import { sortFolders } from "@/utils/folder";
import { useTranslations } from "next-intl";
import { FolderList } from "../FolderList/FolderList";
import { ItemList } from "../ItemList/ItemList";
import { updateLayout, updateFolderOrder } from "@/actions/settings";
import {
  loadMoreItems,
  updateItemOrder,
  type ItemsPage,
} from "@/actions/items";
import styles from "./FolderPage.module.css";
import PageHeader from "../PageHeader/PageHeader";

interface FolderPageProps {
  folder: Folder;
  parentFolder?: Folder;
  initialItemsPage: ItemsPage;
  initialItemOrder: Order<ItemOrderBy>;
  libraryPath: string;
  initialLayout: Layout;
  initialFolderOrder: Order<FolderOrderBy>;
}

export function FolderPage({
  folder,
  parentFolder,
  initialItemsPage,
  initialItemOrder,
  libraryPath,
  initialLayout,
  initialFolderOrder,
}: FolderPageProps) {
  const [items, setItems] = useState<Item[]>(initialItemsPage.items);
  const [hasMore, setHasMore] = useState(initialItemsPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);
  const [itemOrder, setItemOrder] =
    useState<Order<ItemOrderBy>>(initialItemOrder);
  const [folderOrder, setFolderOrder] =
    useState<Order<FolderOrderBy>>(initialFolderOrder);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [, startTransition] = useTransition();

  // Reset items when folder changes
  useEffect(() => {
    setItems(initialItemsPage.items);
    setHasMore(initialItemsPage.hasMore);
    setItemOrder(initialItemOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder.id]);

  // Determine if we should use folder ordering (no items but has children)
  const useFolderOrdering =
    initialItemsPage.totalItems === 0 && folder.children.length > 0;

  // Load more items callback
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const itemsPage = await loadMoreItems({
        folderId: folder.id,
        offset: items.length,
        limit: 100,
        orderBy: itemOrder.orderBy,
        sortIncrease: itemOrder.sortIncrease,
      });

      setItems((prev) => [...prev, ...itemsPage.items]);
      setHasMore(itemsPage.hasMore);
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [folder.id, items.length, hasMore, isLoading, itemOrder]);

  const sortedFolders = useMemo(
    () =>
      sortFolders(
        folder.children,
        folderOrder.orderBy,
        folderOrder.sortIncrease
      ),
    [folder.children, folderOrder]
  );

  const t = useTranslations();

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    startTransition(() => {
      updateLayout(newLayout);
    });
  };

  const handleItemOrderChange = useCallback(
    async (newOrder: Order<ItemOrderBy>) => {
      setIsLoading(true);
      try {
        const result = await updateItemOrder(folder.id, newOrder);
        setItemOrder(newOrder);
        setItems(result.items);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Failed to update item order:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [folder.id]
  );

  const handleFolderOrderChange = (newOrder: Order<FolderOrderBy>) => {
    setFolderOrder(newOrder);
    startTransition(() => {
      updateFolderOrder(newOrder);
    });
  };

  const showSubtitle = items.length > 0 && folder.children.length > 0;

  return (
    <div className={styles.container}>
      {useFolderOrdering ? (
        <PageHeader
          title={folder.name}
          backLink={parentFolder ? `/folders/${parentFolder.id}` : "/"}
          order={folderOrder}
          onChangeOrder={handleFolderOrderChange}
          availableOrderBys={FOLDER_ORDER_BY}
          layout={layout}
          onChangeLayout={handleLayoutChange}
        />
      ) : (
        <PageHeader
          title={folder.name}
          backLink={parentFolder ? `/folders/${parentFolder.id}` : "/"}
          order={itemOrder}
          onChangeOrder={handleItemOrderChange}
          availableOrderBys={ITEM_ORDER_BY}
          layout={layout}
          onChangeLayout={handleLayoutChange}
        />
      )}
      {showSubtitle && <h6>{t("navigation.subfolders")}</h6>}
      {folder.children.length > 0 && (
        <FolderList
          folders={useFolderOrdering ? sortedFolders : folder.children}
          libraryPath={libraryPath}
          layout={layout}
        />
      )}
      {showSubtitle && <h6>{t("navigation.contents")}</h6>}
      {items.length > 0 && (
        <ItemList
          items={items}
          libraryPath={libraryPath}
          layout={layout}
          hasMore={hasMore}
          isLoading={isLoading}
          onLoadMore={handleLoadMore}
        />
      )}
    </div>
  );
}
