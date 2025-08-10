import styles from "~/styles/List.module.css";
import type { Folder } from "~/types/item";
import { FolderItem } from "./FolderItem";

interface FolderListProps {
  folders: Folder[];
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
