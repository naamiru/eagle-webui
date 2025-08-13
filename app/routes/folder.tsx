import { Navigate, useRouteLoaderData } from "react-router";
import { fetchFolderItems } from "~/api/item-list";
import { FolderPage } from "~/components/FolderPage/FolderPage";
import { findFolderById, findParentFolder } from "~/utils/folder";
import type { Route } from "./+types/folder";
import type { loader as appLoader } from "./app";

export async function loader({ params: { folderId } }: Route.LoaderArgs) {
  const items = await fetchFolderItems(folderId);
  return { items };
}

export default function Folder({
  params: { folderId },
  loaderData: { items },
}: Route.ComponentProps) {
  const appData = useRouteLoaderData<typeof appLoader>("routes/app");

  if (!appData) {
    throw new Error("App layout data not available");
  }

  const folder = findFolderById(appData.folders, folderId);
  if (!folder) {
    return <Navigate to="/" />;
  }

  const parentFolder = findParentFolder(appData.folders, folderId);

  return (
    <FolderPage folder={folder} parentFolder={parentFolder} items={items} />
  );
}
