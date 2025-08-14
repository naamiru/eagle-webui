import { fetchFolders } from "@/app/lib/api/folder";
import { fetchFolderItems } from "@/app/lib/api/item";
import { fetchLibraryPath } from "@/app/lib/api/library";
import { FolderPage } from "@/app/components/FolderPage/FolderPage";
import { findFolderById, findParentFolder } from "@/app/utils/folder";
import { notFound } from "next/navigation";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function Page({ params }: FolderPageProps) {
  const { folderId } = await params;

  const [folders, items, libraryPath] = await Promise.all([
    fetchFolders(),
    fetchFolderItems(folderId),
    fetchLibraryPath(),
  ]);

  const folder = findFolderById(folders, folderId);
  if (!folder) {
    notFound();
  }

  const parentFolder = findParentFolder(folders, folderId);

  return (
    <FolderPage
      folder={folder}
      parentFolder={parentFolder}
      items={items}
      libraryPath={libraryPath}
    />
  );
}
