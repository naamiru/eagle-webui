import { useSuspenseQuery } from "@tanstack/react-query";
import { getQueryClient } from "~/integrations/tanstack-query";
import { foldersQueryOptions } from "../api/folders";
import { itemsQueryOptions } from "../api/items";
import { FolderList } from "../components/FolderList/FolderList";
import { ItemList } from "../components/ItemList/ItemList";
import styles from "../styles/_index.module.css";

export async function clientLoader() {
  const queryClient = getQueryClient();
  return Promise.all([
    queryClient.ensureQueryData(foldersQueryOptions),
    queryClient.ensureQueryData(itemsQueryOptions(100)),
  ]);
}

export default function Index() {
  const { data: folders } = useSuspenseQuery(foldersQueryOptions);
  const { data: items } = useSuspenseQuery(itemsQueryOptions(100));

  return (
    <div className={styles.container}>
      <h6 className={styles.folderListTitle}>フォルダー</h6>
      <FolderList folders={folders} />
      <h6 className={styles.itemListTitle}>すべて</h6>
      <ItemList items={items} />
    </div>
  );
}
