import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const store = await getStore();
  const itemIds = store.getTrashItemIds();

  return <CollectionPage title="Trash" itemIds={itemIds} />;
}
