import { foldersQueryOptions } from "~/api/folders";
import { folderItemsQueryOptions } from "~/api/items";
import { FolderList } from "~/components/FolderList/FolderList";
import { ItemList } from "~/components/ItemList/ItemList";
import { getQueryClient } from "~/integrations/tanstack-query";
import styles from "~/styles/_index.module.css";
import type { Folder } from "~/types/item";
import type { Route } from "./+types/folders.$folderId";

export async function clientLoader({ params: { folderId } }: Route.LoaderArgs) {
  const queryClient = getQueryClient();
  return Promise.all([
    queryClient.ensureQueryData(foldersQueryOptions),
    queryClient.ensureQueryData(folderItemsQueryOptions(folderId)),
  ]);
}

export default function FolderRoute({
  loaderData: [folders, items],
  params: { folderId },
}: Route.ComponentProps) {
  // Find current folder and get its children
  const currentFolder = findFolderById(folders, folderId);

  if (!currentFolder) {
    throw new Error(`Folder with ID ${folderId} not found`);
  }

  const subfolders = currentFolder.children || [];

  return (
    <div className={styles.container}>
      <h4 className={styles.folderListTitle}>サブフォルダー</h4>
      <FolderList folders={subfolders} />
      <h4 className={styles.itemListTitle}>内容</h4>
      <ItemList items={items} />
    </div>
  );
}

// Helper function to find folder by ID in nested structure
function findFolderById(
  folders: Folder[],
  targetId: string,
): Folder | undefined {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return folder;
    }
    if (folder.children && folder.children.length > 0) {
      const found = findFolderById(folder.children, targetId);
      if (found) {
        return found;
      }
    }
  }
}
