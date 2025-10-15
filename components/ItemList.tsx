"use client";

import { useMemo } from "react";
import { VirtuosoGrid } from "react-virtuoso";
import type { ItemPreview } from "@/data/types";
import { getThumbnailUrl } from "@/utils/item";
import classes from "./ItemList.module.css";

interface ItemListProps {
  libraryPath: string;
  items: ItemPreview[];
  initialSelectedItemId?: string;
  onSelectItem: (itemId: string) => void;
}

export function ItemList({
  libraryPath,
  items,
  initialSelectedItemId,
  onSelectItem,
}: ItemListProps) {
  const initialTopMostItemIndex = useMemo(() => {
    if (!initialSelectedItemId) {
      return undefined;
    }
    const index = items.findIndex(({ id }) => id === initialSelectedItemId);
    return index === -1 ? undefined : index;
  }, [items, initialSelectedItemId]);

  const itemContent = (index: number) => {
    const item = items[index];
    if (!item) {
      return null;
    }
    const { id } = item;
    return (
      // biome-ignore lint/performance/noImgElement: image grid
      // biome-ignore lint/a11y/useKeyWithClickEvents: image grid
      <img
        className={classes.image}
        src={getThumbnailUrl(id, libraryPath)}
        alt={id}
        onClick={() => onSelectItem(id)}
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
      initialTopMostItemIndex={initialTopMostItemIndex}
      increaseViewportBy={200}
    />
  );
}
