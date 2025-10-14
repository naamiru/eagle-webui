import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await getStore();
  const itemIds = store.getItemIds();
  return (
    <CollectionPage
      title="All"
      libraryPath={store.libraryPath}
      itemIds={itemIds}
    />
  );
}
