"use client";

import { VirtuosoGrid } from "react-virtuoso";
import type { Item } from "@/data/types";
import { getThumbnailUrl } from "@/utils/item";
import classes from "./ItemList.module.css";

interface ItemListProps {
  items: Item[];
  libraryPath: string;
  onSelectItem: (item: Item) => void;
}

export function ItemList({ items, libraryPath, onSelectItem }: ItemListProps) {
  const itemContent = (index: number) => {
    const item = items[index];
    return (
      // biome-ignore lint/performance/noImgElement: image grid
      // biome-ignore lint/a11y/useKeyWithClickEvents: image grid
      <img
        className={classes.image}
        src={getThumbnailUrl(item.id, libraryPath)}
        alt={item.name}
        onClick={() => onSelectItem(item)}
        loading="lazy"
        decoding="async"
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
