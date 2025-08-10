import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { foldersQueryOptions } from "~/api/folders";
import { folderItemsQueryOptions } from "~/api/items";
import { FolderList } from "~/components/FolderList/FolderList";
import { ItemList } from "~/components/ItemList/ItemList";
import type { Folder } from "~/types/item";
import styles from "../index.module.css";

export const Route = createFileRoute("/folders/$folderId")({
  loader: ({ context, params }) =>
    Promise.all([
      context.queryClient.ensureQueryData(foldersQueryOptions),
      context.queryClient.ensureQueryData(
        folderItemsQueryOptions(params.folderId),
      ),
    ]),
  component: FolderRouteComponent,
  errorComponent: FolderErrorComponent,
  pendingComponent: FolderLoadingComponent,
});

function FolderRouteComponent() {
  const { folderId } = Route.useParams();
  const { data: folders } = useSuspenseQuery(foldersQueryOptions);
  const { data: items } = useSuspenseQuery(folderItemsQueryOptions(folderId));

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

function FolderErrorComponent({ error }: { error: Error }) {
  const isProxyUnavailable = error.message.includes("Failed to fetch");
  const isEagleUnavailable = error.message.includes("503");
  const isFolderNotFound = error.message.includes("not found");

  return (
    <div className={styles.errorContainer}>
      {isFolderNotFound ? (
        <div>
          <h3>Folder not found</h3>
          <p>The requested folder does not exist.</p>
        </div>
      ) : isEagleUnavailable ? (
        <div>
          <h3>Eagle is not running</h3>
          <p>Please start Eagle application and try again.</p>
        </div>
      ) : isProxyUnavailable ? (
        <div>
          <h3>Connection Error</h3>
          <p>
            Cannot connect to proxy service. Please check if the proxy is
            running.
          </p>
        </div>
      ) : (
        <div>
          <h3>Failed to load folder</h3>
          <p>{error.message}</p>
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          if (isFolderNotFound) {
            window.location.href = "/";
          } else {
            window.location.reload();
          }
        }}
      >
        {isFolderNotFound ? "Back to Home" : "Retry"}
      </button>
    </div>
  );
}

function FolderLoadingComponent() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>Loading folder contents...</p>
    </div>
  );
}

// Helper function to find folder by ID in nested structure
function findFolderById(
  folders: Folder[],
  targetId: string,
): Folder | null {
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
  return null;
}
