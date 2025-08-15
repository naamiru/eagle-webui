"use client";

import { FolderList } from "@/components/FolderList/FolderList";
import { Folder, Layout, Order, FolderOrderBy, FOLDER_ORDER_BY } from "@/types/models";
import styles from "./HomePage.module.css";
import { useState, useTransition, useMemo } from "react";
import { updateLayout, updateFolderOrder } from "@/actions/settings";
import PageHeader from "../PageHeader/PageHeader";
import { sortFolders } from "@/utils/folder";

interface HomePageProps {
  folders: Folder[];
  libraryPath: string;
  initialLayout: Layout;
  initialFolderOrder: Order<FolderOrderBy>;
}

export function HomePage({
  folders,
  libraryPath,
  initialLayout,
  initialFolderOrder,
}: HomePageProps) {
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [folderOrder, setFolderOrder] = useState<Order<FolderOrderBy>>(initialFolderOrder);
  const [, startTransition] = useTransition();

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

  const sortedFolders = useMemo(() => {
    return sortFolders(folders, folderOrder.orderBy, folderOrder.sortIncrease);
  }, [folders, folderOrder]);

  return (
    <div className={styles.container}>
      <PageHeader
        order={folderOrder}
        onChangeOrder={handleFolderOrderChange}
        availableOrderBys={FOLDER_ORDER_BY}
        layout={layout}
        onChangeLayout={handleLayoutChange}
      />
      <FolderList folders={sortedFolders} libraryPath={libraryPath} layout={layout} />
    </div>
  );
}
