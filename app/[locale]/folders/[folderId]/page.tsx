import { fetchFolders } from "@/lib/api/folder";
import { fetchFolderItems } from "@/lib/api/item";
import { fetchLibraryPath } from "@/lib/api/library";
import { FolderPage } from "@/components/FolderPage/FolderPage";
import { findFolderById, findParentFolder } from "@/utils/folder";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { settingsService } from "@/lib/settings";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function Page({ params }: FolderPageProps) {
  const { folderId } = await params;

  const [folders, items, libraryPath, layout] = await Promise.all([
    fetchFolders(),
    fetchFolderItems(folderId),
    fetchLibraryPath(),
    settingsService.getLayout(),
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
      initialLayout={layout}
    />
  );
}

export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const { folderId } = await params;
  const folders = await fetchFolders();
  const folder = findFolderById(folders, folderId);
  if (!folder) {
    notFound();
  }

  return {
    title: `${folder.name} | Eagle WebUI`,
  };
}
