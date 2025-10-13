"use client";

import { VirtuosoGrid } from "react-virtuoso";
import type { Item } from "@/data/types";
import { getThumbnailUrl } from "@/utils/item";
import classes from "./ItemList.module.css";

interface ItemListProps {
  items: Item[];
  libraryPath: string;
}

export function ItemList({ items, libraryPath }: ItemListProps) {
  const itemContent = (index: number) => {
    const item = items[index];
    return (
      // biome-ignore lint/performance/noImgElement: image grid
      <img
        className={classes.image}
        src={getThumbnailUrl(item.id, libraryPath)}
        alt={item.name}
        loading="lazy"
      />
    );
  };
  return (
    <VirtuosoGrid
      useWindowScroll
      listClassName={classes.list}
      itemClassName={classes.item}
      totalCount={items.length}
      itemContent={itemContent}
      increaseViewportBy={200}
    />
  );
}
