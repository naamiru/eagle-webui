import { fetchFolders } from "@/lib/api/folder";
import { fetchFolderItems } from "@/lib/api/item";
import { fetchLibraryPath } from "@/lib/api/library";
import { FolderPage } from "@/components/FolderPage/FolderPage";
import { findFolderById, findParentFolder } from "@/utils/folder";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { settingsService } from "@/lib/settings";
import { getFetchOptions } from "@/utils/fetch";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
}

export default async function Page({ params }: FolderPageProps) {
  const { folderId } = await params;

  const fetchOptions = await getFetchOptions();

  const [folders, items, libraryPath, layout, folderOrder] = await Promise.all([
    fetchFolders({ fetchOptions }),
    fetchFolderItems(folderId, { fetchOptions }),
    fetchLibraryPath({ fetchOptions }),
    settingsService.getLayout(),
    settingsService.getFolderOrder(),
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
      initialFolderOrder={folderOrder}
    />
  );
}

export async function generateMetadata({
  params,
}: FolderPageProps): Promise<Metadata> {
  const { folderId } = await params;
  const fetchOptions = await getFetchOptions();
  const folders = await fetchFolders({ fetchOptions });
  const folder = findFolderById(folders, folderId);
  if (!folder) {
    notFound();
  }

  return {
    title: `${folder.name} | Eagle WebUI`,
  };
}
