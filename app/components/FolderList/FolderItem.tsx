import { Link } from "react-router";
import type { Folder } from "~/types/models";
import styles from "./FolderItem.module.css";

interface FolderItemProps {
  folder: Folder;
}

export function FolderItem({ folder }: FolderItemProps) {
  return (
    <Link to={`/folders/${folder.id}`} className={styles.link}>
      <div className={styles.item}>
        <div className={styles.empty} />
        <div className={styles.overlay}>
          <div className={styles.name}>{folder.name}</div>
        </div>
      </div>
    </Link>
  );
}
