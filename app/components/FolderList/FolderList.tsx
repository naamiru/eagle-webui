import type { Folder } from "~/types/models";
import { FolderItem } from "./FolderItem";
import styles from "./FolderList.module.css";

interface FolderListProps {
  folders: Folder[];
}

export function FolderList({ folders }: FolderListProps) {
  return (
    <div className={styles.list}>
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
