import type { Folder, Layout } from "@/types/models";
import { FolderItem } from "./FolderItem";
import styles from "./FolderList.module.css";

interface FolderListProps {
  folders: Folder[];
  libraryPath: string;
  layout: Layout;
}

export function FolderList({ folders, libraryPath, layout }: FolderListProps) {
  return (
    <div className={`${styles.list} ${styles[layout]}`}>
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} libraryPath={libraryPath} />
      ))}
    </div>
  );
}
