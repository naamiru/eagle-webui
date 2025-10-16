"use client";

import { Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { updateFolderSortOptions } from "@/actions/updateFolderSortOptions";
import { updateGlobalSortOptions } from "@/actions/updateGlobalSortOptions";
import { updateListScale } from "@/actions/updateListScale";
import AppHeader from "@/components/AppHeader";
import { ItemList, type ItemSelection } from "@/components/ItemList";
import { ListScaleControl } from "@/components/ListScaleControl";
import type { FolderSortOptions, GlobalSortOptions } from "@/data/sort-options";
import type { ItemPreview } from "@/data/types";
import { useIsMobile } from "@/utils/responsive";
import classes from "./CollectionPage.module.css";
import { ItemSlider } from "./ItemSlider";
import {
  FolderListSortControl,
  GlobalListSortControl,
} from "./ListSortControl";
import { MobileItemSlider } from "./MobileItemSlider";

export type CollectionSortState =
  | {
      kind: "folder";
      folderId: string;
      value: FolderSortOptions;
    }
  | {
      kind: "global";
      value: GlobalSortOptions;
    };

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  items: ItemPreview[];
  initialListScale: number;
  sortState: CollectionSortState;
}

export default function CollectionPage({
  title,
  libraryPath,
  items,
  initialListScale,
  sortState,
}: CollectionPageProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [listStateSnapshot, setListStateSnapshot] =
    useState<ItemSelection["stateSnapshot"]>(null);
  const [listScale, setListScale] = useState<number>(initialListScale);
  const persistListScale = useDebouncedCallback(updateListScale, 300);
  const router = useRouter();

  const handleListScaleChange = useCallback(
    (scale: number) => {
      setListScale(scale);
      persistListScale(scale);
    },
    [persistListScale]
  );

  const handleSelectItem = useCallback((selection: ItemSelection) => {
    setSelectedItemId(selection.itemId);
    setListStateSnapshot(selection.stateSnapshot ?? null);
  }, []);
  const dismiss = useCallback(() => setSelectedItemId(undefined), []);

  const isMobile = useIsMobile();

  const handleFolderSortChange = useCallback(
    (next: FolderSortOptions) => {
      if (sortState.kind !== "folder") {
        return;
      }

      void (async () => {
        const result = await updateFolderSortOptions({
          folderId: sortState.folderId,
          orderBy: next.orderBy,
          sortIncrease: next.sortIncrease,
        });

        if (!result.ok) {
          console.error("[collection] Failed to update folder sort:", result);
          return;
        }

        router.refresh();
      })();
    },
    [router, sortState]
  );

  const handleGlobalSortChange = useCallback(
    (next: GlobalSortOptions) => {
      if (sortState.kind !== "global") {
        return;
      }

      void (async () => {
        const result = await updateGlobalSortOptions({
          orderBy: next.orderBy,
          sortIncrease: next.sortIncrease,
        });

        if (!result.ok) {
          console.error("[collection] Failed to update global sort:", result);
          return;
        }

        router.refresh();
      })();
    },
    [router, sortState]
  );

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
        <Text className={classes.headerTitle}>{title}</Text>
        <div className={classes.headerCenter}>
          <ListScaleControl
            value={listScale}
            onChange={handleListScaleChange}
          />
        </div>
        <div className={classes.headerTrailing}>
          {sortState.kind === "folder" ? (
            <FolderListSortControl
              value={sortState.value}
              onChange={handleFolderSortChange}
            />
          ) : (
            <GlobalListSortControl
              value={sortState.value}
              onChange={handleGlobalSortChange}
            />
          )}
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
