"use client";

import { Text } from "@mantine/core";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList";
import type { Item } from "@/data/types";

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
  return (
    <>
      <AppHeader>
        <Text fw={600}>{title}</Text>
      </AppHeader>

      <ItemList items={items} libraryPath={libraryPath} />
    </>
  );
}
