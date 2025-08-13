"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, SortDown } from "react-bootstrap-icons";
import Link from "next/link";
import type { Folder, Item } from "@/app/types/models";
import { sortItems } from "@/app/utils/folder";
import { FolderList } from "../FolderList/FolderList";
import { ItemList } from "../ItemList/ItemList";
import styles from "./FolderPage.module.css";

interface FolderPageProps {
  folder: Folder;
  parentFolder?: Folder;
  items: Item[];
  libraryPath: string;
}

interface Order {
  orderBy: string;
  sortIncrease: boolean;
}

export function FolderPage({
  folder,
  parentFolder,
  items,
  libraryPath,
}: FolderPageProps) {
  const [order, setOrder] = useState<Order>({
    orderBy: folder.orderBy,
    sortIncrease: folder.sortIncrease,
  });

  const sortedItems = useMemo(
    () => sortItems(items, order.orderBy, order.sortIncrease),
    [items, order]
  );

  return (
    <div className={styles.container}>
      <FolderPageHeader
        folder={folder}
        parentFolderId={parentFolder?.id}
        order={order}
        onChangeOrder={setOrder}
      />
      {folder.children.length > 0 && (
        <>
          <h6>サブフォルダー</h6>
          <FolderList folders={folder.children} libraryPath={libraryPath} />
          <h6>内容</h6>
        </>
      )}
      <ItemList items={sortedItems} libraryPath={libraryPath} />
    </div>
  );
}

interface FolderPageHeaderProps {
  folder: Folder;
  parentFolderId?: string;
  order: Order;
  onChangeOrder: (order: Order) => void;
}

const SORTS: [string, string][] = [
  ["GLOBAL", "グローバル"],
  ["MANUAL", "マニュアル"],
  ["IMPORT", "追加日"],
  ["MTIME", "変更日"],
  ["BTIME", "作成日"],
  ["NAME", "タイトル"],
  ["EXT", "拡張子"],
  ["FILESIZE", "ファイルサイズ"],
  ["RESOLUTION", "解像度"],
  ["RATING", "評価"],
  ["DURATION", "再生時間"],
  ["RANDOM", "ランダム"],
];

function FolderPageHeader({
  folder,
  parentFolderId,
  order,
  onChangeOrder,
}: FolderPageHeaderProps) {
  function onClickOrder(orderBy: string) {
    onChangeOrder({
      orderBy,
      sortIncrease:
        orderBy === order.orderBy ? !order.sortIncrease : order.sortIncrease,
    });
  }

  return (
    <header className={styles.header}>
      <nav>
        <ul>
          <li>
            <Link
              href={parentFolderId ? `/folders/${parentFolderId}` : "/"}
              aria-label="戻る"
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
            <details className={`dropdown ${styles.sort}`}>
              <summary>
                <SortDown size={20} />
              </summary>
              <ul
                dir="rtl"
                className={order.sortIncrease ? styles.asc : styles.desc}
              >
                {SORTS.map(([value, label]) => (
                  <li
                    key={value}
                    className={value === order.orderBy ? styles.active : ""}
                    dir="ltr"
                  >
                    <a
                      onClick={() => {
                        onClickOrder(value);
                      }}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>
      </nav>
    </header>
  );
}
