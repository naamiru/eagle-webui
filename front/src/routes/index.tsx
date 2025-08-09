import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { foldersQueryOptions } from "~/api/folders";
import { itemsQueryOptions } from "~/api/items";
import { FolderList } from "~/components/FolderList/FolderList";
import { ItemList } from "~/components/ItemList/ItemList";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(foldersQueryOptions),
      context.queryClient.ensureQueryData(itemsQueryOptions(100)),
    ]),
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
});

function RouteComponent() {
  const { data: folders } = useSuspenseQuery(foldersQueryOptions);
  const { data: items } = useSuspenseQuery(itemsQueryOptions(100));

  return (
    <div className={styles.container}>
      <h4 className={styles.folderListTitle}>フォルダー</h4>
      <FolderList folders={folders} />
      <h4 className={styles.itemListTitle}>すべて</h4>
      <ItemList items={items} />
    </div>
  );
}

function ErrorComponent({ error }: { error: Error }) {
  const isProxyUnavailable = error.message.includes("Failed to fetch");
  const isEagleUnavailable = error.message.includes("503");

  return (
    <div className={styles.errorContainer}>
      {isEagleUnavailable ? (
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
          <h3>Failed to load folders</h3>
          <p>{error.message}</p>
        </div>
      )}
      <button type="button" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}

function LoadingComponent() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>Loading folders...</p>
    </div>
  );
}
