import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { getQueryClient } from "~/integrations/tanstack-query";
import { foldersQueryOptions } from "../api/folders";
import { itemsQueryOptions } from "../api/items";
import { FolderList } from "../components/FolderList/FolderList";
import Icon from "../components/Icon/Icon";
import { ItemList } from "../components/ItemList/ItemList";
import styles from "../styles/_index.module.css";
import type { Route } from "./+types/_index";

export async function clientLoader(): Route.LoaderArgs {
  const queryClient = getQueryClient();
  queryClient.prefetchQuery(itemsQueryOptions(100));
  return await queryClient.ensureQueryData(foldersQueryOptions);
}

export default function Index({ loaderData: folders }): Route.ComponentProps {
  const { data: items, error } = useQuery(itemsQueryOptions(100));

  if (error) throw error;

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

      {items && (
        <>
          <h6 className={styles.itemListTitle}>すべて</h6>
          <ItemList items={items} />
        </>
      )}
    </div>
  );
}
