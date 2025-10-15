"use client";

import { Text } from "@mantine/core";
import { useCallback, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList";
import type { ItemPreview } from "@/data/types";
import { useIsMobile } from "@/utils/responsive";
import { ItemSlider } from "./ItemSlider";
import { MobileItemSlider } from "./MobileItemSlider";

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  items: ItemPreview[];
}

export default function CollectionPage({
  title,
  libraryPath,
  items,
}: CollectionPageProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const [lastSelectedItemId, setLastSelectedItemId] = useState<string>();

  const updateSelection = useCallback((itemId: string) => {
    setSelectedItemId(itemId);
    setLastSelectedItemId(itemId);
  }, []);
  const dismiss = useCallback(() => setSelectedItemId(undefined), []);

  const isMobile = useIsMobile();
  const listSelectedItemId = selectedItemId ?? lastSelectedItemId;

  if (selectedItemId && !isMobile) {
    return (
      <ItemSlider
        initialItemId={selectedItemId}
        libraryPath={libraryPath}
        items={items}
        dismiss={dismiss}
        onChangeActiveItem={updateSelection}
      />
    );
  }

  return (
    <>
      <AppHeader>
        <Text>{title}</Text>
      </AppHeader>

      <ItemList
        libraryPath={libraryPath}
        items={items}
        initialSelectedItemId={listSelectedItemId}
        onSelectItem={updateSelection}
      />

      {selectedItemId && isMobile && (
        <MobileItemSlider
          initialItemId={selectedItemId}
          libraryPath={libraryPath}
          items={items}
          dismiss={dismiss}
          onChangeActiveItem={updateSelection}
        />
      )}
    </>
  );
}
