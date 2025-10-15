"use client";

import { Center, Text } from "@mantine/core";
import { useCallback, useEffect, useRef } from "react";
import { type GridStateSnapshot, VirtuosoGrid } from "react-virtuoso";
import type { ItemPreview } from "@/data/types";
import { getThumbnailUrl } from "@/utils/item";
import classes from "./ItemList.module.css";

export interface ItemSelection {
  itemId: string;
  stateSnapshot: GridStateSnapshot | null;
}

interface ItemListProps {
  libraryPath: string;
  items: ItemPreview[];
  initialState?: GridStateSnapshot | null;
  onSelectItem: (selection: ItemSelection) => void;
}

export function ItemList({
  libraryPath,
  items,
  initialState,
  onSelectItem,
}: ItemListProps) {
  const latestStateRef = useRef<GridStateSnapshot | null>(initialState ?? null);

  useEffect(() => {
    latestStateRef.current = initialState ?? null;
  }, [initialState]);

  const handleStateChanged = useCallback((snapshot: GridStateSnapshot) => {
    latestStateRef.current = snapshot;
  }, []);

  const emitSelection = useCallback(
    (itemId: string, snapshot: GridStateSnapshot | null) => {
      onSelectItem({
        itemId,
        stateSnapshot: snapshot,
      });
    },
    [onSelectItem]
  );

  const handleSelect = useCallback(
    (itemId: string) => {
      emitSelection(itemId, latestStateRef.current);
    },
    [emitSelection]
  );

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
        onClick={() => handleSelect(id)}
        loading="lazy"
        decoding="async"
      />
    );
  };

  if (items.length === 0) {
    return (
      <Center mih={240}>
        <Text c="dimmed">No items</Text>
      </Center>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      listClassName={classes.list}
      itemClassName={classes.item}
      totalCount={items.length}
      itemContent={itemContent}
      restoreStateFrom={initialState ?? undefined}
      stateChanged={handleStateChanged}
      increaseViewportBy={200}
    />
  );
}
