import { Text } from "@mantine/core";
import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { ItemList } from "@/components/ItemList";
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
    <>
      <AppHeader>
        <Text fw={600}>{folder.name || folder.id}</Text>
      </AppHeader>

      <ItemList
        items={store.getFolderItems(folderId)}
        libraryPath={store.libraryPath}
      />
    </>
  );
}
