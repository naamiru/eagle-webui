import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getQueryClient } from "~/integrations/tanstack-query";
import { foldersQueryOptions } from "../api/folders";
import { itemsQueryOptions } from "../api/items";
import { FolderList } from "../components/FolderList/FolderList";
import Icon from "../components/Icon/Icon";
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
      <Link
        to="/settings"
        className={`secondary ${styles.settingsLink}`}
        aria-label="Settings"
      >
        <Icon name="gear" size={24} aria-label="Settings" />
      </Link>
      <h6 className={styles.folderListTitle}>フォルダー</h6>
      <FolderList folders={folders} />
      <h6 className={styles.itemListTitle}>すべて</h6>
      <ItemList items={items} />
    </div>
  );
}
