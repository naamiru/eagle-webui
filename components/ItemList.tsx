"use client";

import { VirtuosoGrid } from "react-virtuoso";
import { getThumbnailUrl } from "@/utils/item";
import classes from "./ItemList.module.css";

interface ItemListProps {
  itemIds: string[];
  onSelectItem: (itemId: string) => void;
}

export function ItemList({ itemIds, onSelectItem }: ItemListProps) {
  const itemContent = (index: number) => {
    const itemId = itemIds[index];
    return (
      // biome-ignore lint/performance/noImgElement: image grid
      // biome-ignore lint/a11y/useKeyWithClickEvents: image grid
      <img
        className={classes.image}
        src={getThumbnailUrl(itemId)}
        alt={itemId}
        onClick={() => onSelectItem(itemId)}
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
      totalCount={itemIds.length}
      itemContent={itemContent}
      increaseViewportBy={200}
    />
  );
}
