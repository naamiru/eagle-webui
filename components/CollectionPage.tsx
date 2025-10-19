"use client";

import { Text } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import Link from "next/link";
import { useCallback, useState } from "react";
import { updateListScale } from "@/actions/updateListScale";
import AppHeader from "@/components/AppHeader";
import { ScaleControl } from "@/components/CollectionControls/ScaleControl";
import { ItemList, type ItemSelection } from "@/components/ItemList";
import type { ItemPreview } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import { useIsMobile } from "@/utils/responsive";
import {
  CollectionSortControls,
  type CollectionSortState,
} from "./CollectionControls/CollectionSortControls";
import { SearchControl } from "./CollectionControls/SearchControl";
import classes from "./CollectionPage.module.css";
import { ItemSlider } from "./ItemSlider";
import { MobileItemSlider } from "./MobileItemSlider";
import { type Subfolder, SubfolderList } from "./SubfolderList";

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  items: ItemPreview[];
  initialListScale: number;
  search: string;
  sortState: CollectionSortState;
  subfolders: Subfolder[];
  subfolderBasePath?: string;
}

export default function CollectionPage({
  title,
  libraryPath,
  items,
  initialListScale,
  search,
  sortState,
  subfolders,
  subfolderBasePath = "/folders",
}: CollectionPageProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [listStateSnapshot, setListStateSnapshot] =
    useState<ItemSelection["stateSnapshot"]>(null);
  const [listScale, setListScale] = useState<number>(initialListScale);
  const persistListScale = useDebouncedCallback(updateListScale, 300);
  const t = useTranslations("collection.sections");

  const handleListScaleChange = useCallback(
    (scale: number) => {
      setListScale(scale);
      persistListScale(scale);
    },
    [persistListScale],
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
        <div className={classes.headerTitle}>
          <Link href="/">{title}</Link>
          {search && (
            <>
              <Text c="dimmed">/</Text>
              <Text c="dimmed">Search results ({items.length})</Text>
            </>
          )}
        </div>
        <div className={classes.headerTrailing}>
          <ScaleControl value={listScale} onChange={handleListScaleChange} />
          <CollectionSortControls sortState={sortState} />
          <SearchControl search={search} />
        </div>
      </AppHeader>

      {subfolders.length > 0 && (
        <div className={classes.section}>
          <div className={classes.sectionTitle}>
            {t("subfolders")} ({subfolders.length})
          </div>
          <SubfolderList
            libraryPath={libraryPath}
            subfolders={subfolders}
            listScale={listScale}
            basePath={subfolderBasePath}
          />
        </div>
      )}

      {(items.length > 0 || subfolders.length === 0) && (
        <div className={classes.section}>
          {subfolders.length > 0 && (
            <div className={classes.sectionTitle}>
              {t("contents")} ({items.length})
            </div>
          )}
          <ItemList
            libraryPath={libraryPath}
            items={items}
            initialState={listStateSnapshot}
            onSelectItem={handleSelectItem}
            listScale={listScale}
          />
        </div>
      )}

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
