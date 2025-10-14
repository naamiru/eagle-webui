import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
import { getStore } from "@/data/store";

type FolderPageProps = {
  params: {
    folderId: string;
  };
};

export default async function FolderPage({ params }: FolderPageProps) {
  const { folderId } = await params;
  const store = await getStore();
  const folder = store.folders.get(folderId);

  if (!folder) {
    notFound();
  }

  const itemIds = store.getFolderItemIds(folderId);

  return <CollectionPage title={folder.name} itemIds={itemIds} />;
}
