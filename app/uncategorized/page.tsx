import { getTranslations } from "next-intl/server";
import CollectionPage from "@/components/CollectionPage";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery, resolveTagFilter } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type UncategorizedPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UncategorizedPage({
  searchParams,
}: UncategorizedPageProps) {
  const [t, store, listScale] = await Promise.all([
    getTranslations(),
    getStore(),
    loadListScaleSetting(),
  ]);
  const resolvedSearchParams = await searchParams;
  const search = resolveSearchQuery(resolvedSearchParams?.search);
  const tag = resolveTagFilter(resolvedSearchParams?.tag);
  const items = store.getUncategorizedItemPreviews(search, tag);

  return (
    <CollectionPage
      title={t("collection.uncategorized")}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
      search={search}
      tag={tag}
      subfolders={[]}
      sortState={{
        kind: "global",
        value: store.globalSortSettings,
      }}
    />
  );
}
