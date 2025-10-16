import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations();
  const store = await getStore();
  const items = store.getItemPreviews();
  return (
    <CollectionPage
      title={t("collection.all")}
      libraryPath={store.libraryPath}
      items={items}
    />
  );
}
