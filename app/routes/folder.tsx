import { Navigate } from "react-router";
import { fetchFolders } from "~/api/folder-list";
import { fetchFolderItems } from "~/api/item-list";
import { FolderPage } from "~/components/FolderPage/FolderPage";
import { findFolderById, findParentFolder } from "~/utils/folder";
import type { Route } from "./+types/folder";

export async function loader({ params: { folderId } }: Route.LoaderArgs) {
  const folders = await fetchFolders();
  const items = await fetchFolderItems(folderId);
  return { folders, items };
}

export default function Home({
  params: { folderId },
  loaderData: { folders, items },
}: Route.ComponentProps) {
  const folder = findFolderById(folders, folderId);
  if (!folder) {
    return <Navigate to="/" />;
  }

  const parentFolder = findParentFolder(folders, folderId);

  return (
    <FolderPage folder={folder} parentFolder={parentFolder} items={items} />
  );
}
