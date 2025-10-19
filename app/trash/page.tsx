import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type TrashPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function TrashPage({ searchParams }: TrashPageProps) {
  const [t, store, listScale] = await Promise.all([
    getTranslations(),
    getStore(),
    loadListScaleSetting(),
  ]);
  const search = resolveSearchQuery(searchParams?.search);
  const items = store.getTrashItemPreviews(search);

  return (
    <CollectionPage
      title={t("collection.trash")}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
      search={search}
      subfolders={[]}
      sortState={{
        kind: "global",
        value: store.globalSortSettings,
      }}
    />
  );
}
