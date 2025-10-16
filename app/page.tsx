import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [t, store, listScale] = await Promise.all([
    getTranslations(),
    getStore(),
    loadListScaleSetting(),
  ]);
  const items = store.getItemPreviews();
  return (
    <CollectionPage
      title={t("collection.all")}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
      subfolders={[]}
      sortState={{
        kind: "global",
        value: store.globalSortSettings,
      }}
    />
  );
}
