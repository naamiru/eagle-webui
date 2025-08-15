"use client";

import { useMemo, useState, useTransition } from "react";
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
import { sortItems, sortFolders } from "@/utils/folder";
import { useTranslations } from "next-intl";
import { FolderList } from "../FolderList/FolderList";
import { ItemList } from "../ItemList/ItemList";
import { updateLayout, updateFolderOrder } from "@/actions/settings";
import styles from "./FolderPage.module.css";
import PageHeader from "../PageHeader/PageHeader";

interface FolderPageProps {
  folder: Folder;
  parentFolder?: Folder;
  items: Item[];
  libraryPath: string;
  initialLayout: Layout;
  initialFolderOrder: Order<FolderOrderBy>;
}

export function FolderPage({
  folder,
  parentFolder,
  items,
  libraryPath,
  initialLayout,
  initialFolderOrder,
}: FolderPageProps) {
  const [itemOrder, setItemOrder] = useState<Order<ItemOrderBy>>({
    orderBy: folder.orderBy,
    sortIncrease: folder.sortIncrease,
  });
  const [folderOrder, setFolderOrder] = useState<Order<FolderOrderBy>>(initialFolderOrder);
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [, startTransition] = useTransition();

  // Determine if we should use folder ordering (no items but has children)
  const useFolderOrdering = items.length === 0 && folder.children.length > 0;

  const sortedItems = useMemo(
    () => sortItems(items, itemOrder.orderBy, itemOrder.sortIncrease),
    [items, itemOrder]
  );

  const sortedFolders = useMemo(
    () => sortFolders(folder.children, folderOrder.orderBy, folderOrder.sortIncrease),
    [folder.children, folderOrder]
  );

  const t = useTranslations();

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    startTransition(() => {
      updateLayout(newLayout);
    });
  };

  const handleFolderOrderChange = (newOrder: Order<FolderOrderBy>) => {
    setFolderOrder(newOrder);
    startTransition(() => {
      updateFolderOrder(newOrder);
    });
  };

  const showSubtitle = sortedItems.length > 0 && folder.children.length > 0;

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
          onChangeOrder={setItemOrder}
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
      {sortedItems.length > 0 && (
        <ItemList
          items={sortedItems}
          libraryPath={libraryPath}
          layout={layout}
        />
      )}
    </div>
  );
}
