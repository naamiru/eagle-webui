import { Text } from "@mantine/core";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList/ItemList";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getStore();

  return (
    <>
      <AppHeader>
        <Text fw={600}>All</Text>
      </AppHeader>

      <ItemList
        items={store.items.values().toArray()}
        libraryPath={store.libraryPath}
        hasMore={false}
      />
    </>
  );
}
