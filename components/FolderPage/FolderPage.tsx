"use client";

import { useMemo, useState, useTransition } from "react";
import {
  ITEM_ORDER_BY,
  ItemOrderBy,
  Order,
  type Folder,
  type Item,
  type Layout,
} from "@/types/models";
import { sortItems } from "@/utils/folder";
import { useTranslations } from "next-intl";
import { FolderList } from "../FolderList/FolderList";
import { ItemList } from "../ItemList/ItemList";
import { updateLayout } from "@/actions/settings";
import styles from "./FolderPage.module.css";
import PageHeader from "../PageHeader/PageHeader";

interface FolderPageProps {
  folder: Folder;
  parentFolder?: Folder;
  items: Item[];
  libraryPath: string;
  initialLayout: Layout;
}

export function FolderPage({
  folder,
  parentFolder,
  items,
  libraryPath,
  initialLayout,
}: FolderPageProps) {
  const [order, setOrder] = useState<Order<ItemOrderBy>>({
    orderBy: folder.orderBy,
    sortIncrease: folder.sortIncrease,
  });
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [, startTransition] = useTransition();

  const sortedItems = useMemo(
    () => sortItems(items, order.orderBy, order.sortIncrease),
    [items, order]
  );

  const t = useTranslations();

  const handleLayoutChange = (newLayout: Layout) => {
    setLayout(newLayout);
    startTransition(() => {
      updateLayout(newLayout);
    });
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title={folder.name}
        backLink={parentFolder ? `/folders/${parentFolder.id}` : "/"}
        order={order}
        onChangeOrder={setOrder}
        availableOrderBys={ITEM_ORDER_BY}
        layout={layout}
        onChangeLayout={handleLayoutChange}
      />
      {folder.children.length > 0 && (
        <>
          <h6>{t("navigation.subfolders")}</h6>
          <FolderList
            folders={folder.children}
            libraryPath={libraryPath}
            layout={layout}
          />
          <h6>{t("navigation.contents")}</h6>
        </>
      )}
      <ItemList items={sortedItems} libraryPath={libraryPath} layout={layout} />
    </div>
  );
}
