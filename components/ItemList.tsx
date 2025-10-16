"use client";

import { Center, Text } from "@mantine/core";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { type GridStateSnapshot, VirtuosoGrid } from "react-virtuoso";
import type { ItemPreview } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import { getThumbnailUrl } from "@/utils/item";
import classes from "./ItemList.module.css";
import { clampListScale, LIST_SCALE_MAX } from "./ListScaleControl";

export interface ItemSelection {
  itemId: string;
  stateSnapshot: GridStateSnapshot | null;
}

interface ItemListProps {
  libraryPath: string;
  items: ItemPreview[];
  initialState?: GridStateSnapshot | null;
  onSelectItem: (selection: ItemSelection) => void;
  listScale: number;
}

export function ItemList({
  libraryPath,
  items,
  initialState,
  onSelectItem,
  listScale,
}: ItemListProps) {
  const t = useTranslations();
  const latestStateRef = useRef<GridStateSnapshot | null>(initialState ?? null);
  const listStyle = useMemo(() => computeGridStyle(listScale), [listScale]);

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
    const { id, ext, duration } = item;
    const extensionLabel = ext.toUpperCase();
    const isVideo =
      duration > 0 || extensionLabel === "GIF" || extensionLabel === "WEBP";
    return (
      <>
        {/** biome-ignore lint/a11y/useKeyWithClickEvents: image grid */}
        {/** biome-ignore lint/performance/noImgElement: image grid */}
        <img
          className={classes.image}
          src={getThumbnailUrl(id, libraryPath)}
          alt={id}
          onClick={() => handleSelect(id)}
          loading="lazy"
          decoding="async"
        />
        {isVideo ? (
          <div className={classes.typeBadge}>{extensionLabel}</div>
        ) : null}
      </>
    );
  };

  if (items.length === 0) {
    return (
      <Center mih={240}>
        <Text c="dimmed">{t("common.status.noItems")}</Text>
      </Center>
    );
  }

  return (
    <VirtuosoGrid
      useWindowScroll
      style={listStyle}
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

type GridStyle = CSSProperties & {
  "--item-min-width": string;
  "--item-min-width-mobile": string;
};

function computeGridStyle(scale: number): GridStyle {
  const normalized = clampListScale(scale);
  if (normalized >= LIST_SCALE_MAX) {
    return {
      "--item-min-width": "100%",
      "--item-min-width-mobile": "100%",
    } as GridStyle;
  }

  const progress = normalized / LIST_SCALE_MAX;
  const eased = progress ** 1.6;

  const desktopWidth = Math.round(
    DESKTOP_MIN_WIDTH + (DESKTOP_MAX_WIDTH - DESKTOP_MIN_WIDTH) * eased
  );
  const mobileWidth = Math.round(
    MOBILE_MIN_WIDTH + (MOBILE_MAX_WIDTH - MOBILE_MIN_WIDTH) * eased
  );

  return {
    "--item-min-width": `${desktopWidth}px`,
    "--item-min-width-mobile": `${mobileWidth}px`,
  } as GridStyle;
}

const DESKTOP_MIN_WIDTH = 64;
const DESKTOP_MAX_WIDTH = 600;
const MOBILE_MIN_WIDTH = 48;
const MOBILE_MAX_WIDTH = 200;
