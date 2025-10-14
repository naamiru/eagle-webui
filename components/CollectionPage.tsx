"use client";

import { Text } from "@mantine/core";
import { useCallback, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList";
import type { Item } from "@/data/types";
import { useIsMobile } from "@/utils/responsive";
import { ItemSlider } from "./ItemSlider";
import { MobileItemSlider } from "./MobileItemSlider";

interface CollectionPageProps {
  title: string;
  libraryPath: string;
  items: Item[];
}

export default function CollectionPage({
  title,
  items,
  libraryPath,
}: CollectionPageProps) {
  const [selectedItem, setSelectedItem] = useState<Item>();

  const dismiss = useCallback(() => setSelectedItem(undefined), []);

  const isMobile = useIsMobile();

  if (selectedItem && !isMobile) {
    return (
      <ItemSlider
        initialItem={selectedItem}
        items={items}
        libraryPath={libraryPath}
        dismiss={dismiss}
        onChangeActiveItem={setSelectedItem}
      />
    );
  }

  return (
    <>
      <AppHeader>
        <Text>{title}</Text>
      </AppHeader>

      <ItemList
        items={items}
        libraryPath={libraryPath}
        onSelectItem={setSelectedItem}
      />

      {selectedItem && isMobile && (
        <MobileItemSlider
          initialItem={selectedItem}
          items={items}
          libraryPath={libraryPath}
          dismiss={dismiss}
          onChangeActiveItem={setSelectedItem}
        />
      )}
    </>
  );
}
