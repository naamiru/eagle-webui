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

  const dismiss = useCallback(() => setSelectedItemId(undefined), []);

  const isMobile = useIsMobile();

  if (selectedItemId && !isMobile) {
    return (
      <ItemSlider
        initialItemId={selectedItemId}
        libraryPath={libraryPath}
        items={items}
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
        items={items}
        onSelectItem={setSelectedItemId}
      />

      {selectedItemId && isMobile && (
        <MobileItemSlider
          initialItemId={selectedItemId}
          libraryPath={libraryPath}
          items={items}
          dismiss={dismiss}
          onChangeActiveItem={setSelectedItemId}
        />
      )}
    </>
  );
}
