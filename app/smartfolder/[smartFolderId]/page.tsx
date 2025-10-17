import { notFound } from "next/navigation";
import CollectionPage from "@/components/CollectionPage";
import type { Subfolder } from "@/components/SubfolderList";
import { loadListScaleSetting } from "@/data/settings";
import { getStore } from "@/data/store";

export const dynamic = "force-dynamic";

type SmartFolderPageProps = {
  params: {
    smartFolderId: string;
  };
};

export default async function SmartFolderPage(props: SmartFolderPageProps) {
  const { smartFolderId } = await props.params;
  const [store, listScale] = await Promise.all([
    getStore(),
    loadListScaleSetting(),
  ]);
  const folder = store.getSmartFolder(smartFolderId);

  if (!folder) {
    notFound();
  }

  const items = store.getSmartFolderItemPreviews(smartFolderId);
  const subfolders: Subfolder[] = folder.children.map((child) => {
    const coverId =
      child.coverId ?? store.getFirstSmartFolderItem(child.id)?.id;
    return {
      id: child.id,
      name: child.name,
      coverId: coverId ?? undefined,
    };
  });

  return (
    <CollectionPage
      title={folder.name}
      libraryPath={store.libraryPath}
      items={items}
      initialListScale={listScale}
      subfolders={subfolders}
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
