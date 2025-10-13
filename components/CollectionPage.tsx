"use client";

import { CloseButton, Text } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList";
import type { Item } from "@/data/types";
import { ItemSlider } from "./ItemSlider";

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
  const [activeIndex, setActiveIndex] = useState(0);

  const dismiss = useCallback(() => setSelectedItem(undefined), []);

  return selectedItem ? (
    <>
      <AppHeader>
        <CloseButton icon={<IconArrowLeft stroke={1.2} />} onClick={dismiss} />
        <Text size="sm">
          {activeIndex + 1} / {items.length}
        </Text>
      </AppHeader>

      <ItemSlider
        initialItem={selectedItem}
        items={items}
        libraryPath={libraryPath}
        dismiss={dismiss}
        onActiveIndexChange={setActiveIndex}
      />
    </>
  ) : (
    <>
      <AppHeader>
        <Text>{title}</Text>
      </AppHeader>

      <ItemList
        items={items}
        libraryPath={libraryPath}
        onSelectItem={setSelectedItem}
      />
    </>
  );
}
