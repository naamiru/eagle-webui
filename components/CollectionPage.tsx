"use client";

import { Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useCallback, useEffect, useState } from "react";
import { updateListScale } from "@/actions/updateListScale";
import AppHeader from "@/components/AppHeader";
import { ItemList, type ItemSelection } from "@/components/ItemList";
import { ListScaleControl } from "@/components/ListScaleControl";
import type { ItemPreview } from "@/data/types";
import { useIsMobile } from "@/utils/responsive";
import classes from "./CollectionPage.module.css";
import { ItemSlider } from "./ItemSlider";
import { MobileItemSlider } from "./MobileItemSlider";

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  items: ItemPreview[];
  initialListScale: number;
}

export default function CollectionPage({
  title,
  libraryPath,
  items,
  initialListScale,
}: CollectionPageProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [listStateSnapshot, setListStateSnapshot] =
    useState<ItemSelection["stateSnapshot"]>(null);
  const [listScale, setListScale] = useState<number>(initialListScale);
  const persistListScale = useDebouncedCallback(
    useCallback(async (value: number) => {
      const result = await updateListScale(value);
      if (!result.ok && process.env.NODE_ENV !== "production") {
        console.error(result.error);
      }
    }, []),
    300
  );

  useEffect(() => {
    setListScale(initialListScale);
  }, [initialListScale]);

  useEffect(() => {
    return () => {
      persistListScale.flush();
    };
  }, [persistListScale]);

  const handleListScaleChange = useCallback(
    (next: number) => {
      setListScale((current) => {
        if (current === next) {
          return current;
        }
        persistListScale(next);
        return next;
      });
    },
    [persistListScale]
  );

  const handleSelectItem = useCallback((selection: ItemSelection) => {
    setSelectedItemId(selection.itemId);
    setListStateSnapshot(selection.stateSnapshot ?? null);
  }, []);
  const dismiss = useCallback(() => setSelectedItemId(undefined), []);

  const isMobile = useIsMobile();

  if (selectedItemId && !isMobile) {
    return (
      <ItemSlider
        initialItemId={selectedItemId}
        libraryPath={libraryPath}
        items={items}
        dismiss={dismiss}
      />
    );
  }

  return (
    <>
      <AppHeader>
        <Text>{title}</Text>
        <div className={classes.headerTrailing}>
          <ListScaleControl
            value={listScale}
            onChange={handleListScaleChange}
          />
        </div>
      </AppHeader>

      <ItemList
        libraryPath={libraryPath}
        items={items}
        initialState={listStateSnapshot}
        onSelectItem={handleSelectItem}
        listScale={listScale}
      />

      {selectedItemId && isMobile && (
        <MobileItemSlider
          initialItemId={selectedItemId}
          libraryPath={libraryPath}
          items={items}
          dismiss={dismiss}
        />
      )}
    </>
  );
}
