import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
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

  return (
    <CollectionPage
      title={folder.name}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
    />
  );
}
