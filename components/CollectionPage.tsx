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
  const dismiss = useCallback(() => setSelectedItem(undefined), []);

  return selectedItem ? (
    <>
      <AppHeader>
        <CloseButton icon={<IconArrowLeft stroke={1.2} />} onClick={dismiss} />
        <Text>{title}</Text>
      </AppHeader>

      <ItemSlider
        initialItem={selectedItem}
        items={items}
        libraryPath={libraryPath}
        dismiss={dismiss}
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
