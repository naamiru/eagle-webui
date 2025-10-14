import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function UncategorizedPage() {
  const store = await getStore();
  const itemIds = store.getUncategorizedItemIds();

  return <CollectionPage title="Uncategorized" itemIds={itemIds} />;
}
