"use client";

import { useMemo, useState, useTransition } from "react";
import { ChevronLeft } from "react-bootstrap-icons";
import { Link } from "@/i18n/navigation";
import type { Folder, Item, Layout } from "@/types/models";
import { sortItems } from "@/utils/folder";
import { useTranslations } from "next-intl";
import { FolderList } from "../FolderList/FolderList";
import { ItemList } from "../ItemList/ItemList";
import { OrderDropdown, type Order } from "./OrderDropdown/OrderDropdown";
import { LayoutDropdown } from "./LayoutDropdown/LayoutDropdown";
import { updateLayout } from "@/actions/settings";
import styles from "./FolderPage.module.css";

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
  const [order, setOrder] = useState<Order>({
    orderBy: folder.orderBy,
    sortIncrease: folder.sortIncrease,
  });
  const [layout, setLayout] = useState<Layout>(initialLayout);
  const [isPending, startTransition] = useTransition();

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
      <FolderPageHeader
        folder={folder}
        parentFolderId={parentFolder?.id}
        order={order}
        onChangeOrder={setOrder}
        layout={layout}
        onChangeLayout={handleLayoutChange}
      />
      {folder.children.length > 0 && (
        <>
          <h6>{t("navigation.subfolders")}</h6>
          <FolderList folders={folder.children} libraryPath={libraryPath} />
          <h6>{t("navigation.contents")}</h6>
        </>
      )}
      <ItemList items={sortedItems} libraryPath={libraryPath} layout={layout} />
    </div>
  );
}

interface FolderPageHeaderProps {
  folder: Folder;
  parentFolderId?: string;
  order: Order;
  onChangeOrder: (order: Order) => void;
  layout: Layout;
  onChangeLayout: (layout: Layout) => void;
}

function FolderPageHeader({
  folder,
  parentFolderId,
  order,
  onChangeOrder,
  layout,
  onChangeLayout,
}: FolderPageHeaderProps) {
  const t = useTranslations();

  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li>
            <Link
              href={parentFolderId ? `/folders/${parentFolderId}` : "/"}
              aria-label={t("navigation.back")}
            >
              <ChevronLeft size={20} />
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <strong>{folder.name}</strong>
          </li>
        </ul>
        <ul>
          <li>
            <LayoutDropdown value={layout} onChange={onChangeLayout} />
          </li>
          <li>
            <OrderDropdown value={order} onChange={onChangeOrder} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
