import { fetchFolders } from "@/lib/api/folder";
import { fetchFolderItems } from "@/lib/api/item";
import { fetchLibraryPath } from "@/lib/api/library";
import { FolderPage } from "@/components/FolderPage/FolderPage";
import { findFolderById, findParentFolder, sortItems } from "@/utils/folder";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { settingsService } from "@/lib/settings";
import { getFetchOptions } from "@/utils/fetch";
import { type ItemsPage } from "@/actions/items";
import { stringToOrder } from "@/utils/order";

interface FolderPageProps {
  params: Promise<{ folderId: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function Page({ params, searchParams }: FolderPageProps) {
  const { folderId } = await params;
  const { order: orderParam } = await searchParams;

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

  // Get order from URL parameter or use folder's default
  const orderFromUrl = stringToOrder(orderParam);
  const itemOrder = orderFromUrl || {
    orderBy: folder.orderBy,
    sortIncrease: folder.sortIncrease,
  };

  // Sort items according to the selected order
  const sortedItems = sortItems(items, itemOrder.orderBy, itemOrder.sortIncrease);

  // Prepare initial page
  const initialItemsPerPage = 100;
  const initialItemsPage: ItemsPage = {
    items: sortedItems.slice(0, initialItemsPerPage),
    hasMore: sortedItems.length > initialItemsPerPage,
    totalItems: sortedItems.length,
  };

  return (
    <FolderPage
      folder={folder}
      parentFolder={parentFolder}
      initialItemsPage={initialItemsPage}
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
