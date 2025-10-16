import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function UncategorizedPage() {
  const t = await getTranslations();
  const store = await getStore();
  const items = store.getUncategorizedItemPreviews();

  return (
    <CollectionPage
      title={t("collection.uncategorized")}
      libraryPath={store.libraryPath}
      items={items}
    />
  );
}
