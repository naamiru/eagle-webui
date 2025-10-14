import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function UncategorizedPage() {
  const store = await getStore();
  const items = store.getUncategorizedItemPreviews();

  return (
    <CollectionPage
      title="Uncategorized"
      libraryPath={store.libraryPath}
      items={items}
    />
  );
}
