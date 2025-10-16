import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
import type { Subfolder } from "@/components/SubfolderList";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

type FolderPageProps = {
  params: {
    folderId: string;
  };
};

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  const [store, listScale] = await Promise.all([
    getStore(),
    loadListScaleSetting(),
  ]);
  const folder = store.folders.get(folderId);

  if (!folder) {
    notFound();
  }

  const items = store.getFolderItemPreviews(folderId);
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
      subfolders={subfolders}
      sortState={{
        kind: "folder",
        folderId,
        value: folder,
      }}
    />
  );
}
