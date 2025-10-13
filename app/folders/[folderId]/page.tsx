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

  return (
    <CollectionPage
      title={folder.name}
      items={store.getFolderItems(folderId)}
      libraryPath={store.libraryPath}
    />
  );
}
