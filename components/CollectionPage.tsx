"use client";

import { Text, TextInput } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconCircleXFilled, IconSearch } from "@tabler/icons-react";
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
import classes from "./CollectionPage.module.css";
import { ItemSlider } from "./ItemSlider";
import { MobileItemSlider } from "./MobileItemSlider";
import { type Subfolder, SubfolderList } from "./SubfolderList";

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  items: ItemPreview[];
  initialListScale: number;
  sortState: CollectionSortState;
  subfolders: Subfolder[];
  subfolderBasePath?: string;
}

export default function CollectionPage({
  title,
  libraryPath,
  items,
  initialListScale,
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
        <Text className={classes.headerTitle}>{title}</Text>
        <div className={classes.headerTrailing}>
          <ScaleControl value={listScale} onChange={handleListScaleChange} />
          <CollectionSortControls sortState={sortState} />
          <TextInput
            size="sm"
            leftSectionPointerEvents="none"
            leftSection={<IconSearch size={16} />}
            rightSection={<IconCircleXFilled size={16} />}
            placeholder="Search"
          />
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
