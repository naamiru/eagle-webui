import type { FolderData } from "~/types/item";
import styles from "./FolderItem.module.css";
import { getFolderThumbnail } from "./utils";

interface FolderItemProps {
  folder: FolderData;
}

export function FolderItem({ folder }: FolderItemProps) {
  const thumbnailUrl = getFolderThumbnail(folder);

  return (
    <div className={styles.item}>
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt={`Folder: ${folder.name}`}
          className={styles.thumbnail}
        />
      ) : (
        <div className={styles.empty} />
      )}
      <div className={styles.overlay}>
        <div className={styles.name}>{folder.name}</div>
      </div>
    </div>
  );
}
