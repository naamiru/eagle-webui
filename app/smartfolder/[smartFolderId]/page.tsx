import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery, resolveTagFilter } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type SmartFolderPageProps = {
  params: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SmartFolderPage({
  params,
  searchParams,
}: SmartFolderPageProps) {
  const { smartFolderId } = await params;
  const [store, listScale] = await Promise.all([
    getStore(),
    loadListScaleSetting(),
  ]);
  const folder = store.getSmartFolder(smartFolderId);

  if (!folder) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const search = resolveSearchQuery(resolvedSearchParams?.search);
  const tag = resolveTagFilter(resolvedSearchParams?.tag);
  const items = store.getSmartFolderItemPreviews(smartFolderId, search, tag);

  return (
    <CollectionPage
      title={folder.name}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
      search={search}
      tag={tag}
      subfolders={[]}
      subfolderBasePath="/smartfolder"
      sortState={{
        kind: "smart-folder",
        smartFolderId,
        value: {
          orderBy: folder.orderBy,
          sortIncrease: folder.sortIncrease,
        },
      }}
    />
  );
}
