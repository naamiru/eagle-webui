import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function TrashPage() {
  const t = await getTranslations();
  const store = await getStore();
  const items = store.getTrashItemPreviews();

  return (
    <CollectionPage
      title={t("collection.trash")}
      libraryPath={store.libraryPath}
      items={items}
    />
  );
}
