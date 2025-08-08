import styles from "~/styles/List.module.css";
import type { FolderData } from "~/types/item";
import { FolderItem } from "./FolderItem";

interface FolderListProps {
  folders: FolderData[];
}

export function FolderList({ folders }: FolderListProps) {
  if (folders.length === 0) {
    return null;
  }

  return (
    <div className={styles.folderGrid}>
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
