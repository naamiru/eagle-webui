"use client";

import { Text } from "@mantine/core";
import { useCallback, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList";
import { useIsMobile } from "@/utils/responsive";
import { ItemSlider } from "./ItemSlider";
import { MobileItemSlider } from "./MobileItemSlider";

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  itemIds: string[];
}

export default function CollectionPage({
  title,
  libraryPath,
  itemIds,
}: CollectionPageProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();

  const dismiss = useCallback(() => setSelectedItemId(undefined), []);

  const isMobile = useIsMobile();

  if (selectedItemId && !isMobile) {
    return (
      <ItemSlider
        initialItemId={selectedItemId}
        libraryPath={libraryPath}
        itemIds={itemIds}
        dismiss={dismiss}
        onChangeActiveItem={setSelectedItemId}
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
        itemIds={itemIds}
        onSelectItem={setSelectedItemId}
      />

      {selectedItemId && isMobile && (
        <MobileItemSlider
          initialItemId={selectedItemId}
          libraryPath={libraryPath}
          itemIds={itemIds}
          dismiss={dismiss}
          onChangeActiveItem={setSelectedItemId}
        />
      )}
    </>
  );
}
