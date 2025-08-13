import type { Folder } from "@/app/types/models";
import { FolderItem } from "./FolderItem";
import styles from "./FolderList.module.css";

interface FolderListProps {
  folders: Folder[];
  libraryPath: string;
}

export function FolderList({ folders, libraryPath }: FolderListProps) {
  return (
    <div className={styles.list}>
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} libraryPath={libraryPath} />
      ))}
    </div>
  );
}
