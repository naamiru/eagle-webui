import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
import type { Subfolder } from "@/components/SubfolderList";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";
import { resolveSearchQuery, resolveTagFilter } from "@/utils/search-query";

export const dynamic = "force-dynamic";

type FolderPageProps = {
  params: Promise<Record<string, string>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function FolderPage({
  params,
  searchParams,
}: FolderPageProps) {
  const { folderId } = await params;
  const resolvedSearchParams = await searchParams;
  const [store, listScale] = await Promise.all([
    getStore(),
    loadListScaleSetting(),
  ]);
  const folder = store.folders.get(folderId);

  if (!folder) {
    notFound();
  }

  const search = resolveSearchQuery(resolvedSearchParams?.search);
  const tag = resolveTagFilter(resolvedSearchParams?.tag);
  const items = store.getFolderItemPreviews(folderId, search, tag);
  const subfolders: Subfolder[] = [];

  for (const childId of folder.children) {
    const child = store.folders.get(childId);
    if (!child) {
      continue;
    }

    let coverId = child.coverId;
    if (!coverId) {
      const fallbackItem = store.getFirstFolderItem(child.id);
      coverId = fallbackItem?.id;
    }

    subfolders.push({
      id: child.id,
      name: child.name,
      coverId: coverId ?? undefined,
    });
  }

  return (
    <CollectionPage
      title={folder.name}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
      search={search}
      tag={tag}
      subfolders={subfolders}
      sortState={{
        kind: "folder",
        folderId,
        value: folder,
      }}
    />
  );
}
