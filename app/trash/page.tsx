import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const store = await getStore();
  const items = store.getTrashItemPreviews();

  return (
    <CollectionPage
      title="Trash"
      libraryPath={store.libraryPath}
      items={items}
    />
  );
}
