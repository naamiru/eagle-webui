import { Link } from "react-router";
import type { Folder } from "~/types/models";
import { getThumbnailUrl } from "~/utils/image";
import styles from "./FolderItem.module.css";

interface FolderItemProps {
  folder: Folder;
  libraryPath: string;
}

export function FolderItem({ folder, libraryPath }: FolderItemProps) {
  const item = folder.coverItem;

  return (
    <Link to={`/folders/${folder.id}`} className={styles.link}>
      <div className={styles.item}>
        {item ? (
          <img
            src={getThumbnailUrl(item.id, libraryPath)}
            alt={folder.name}
            className={styles.thumbnail}
            width={item.width}
            height={item.height}
            loading="lazy"
          />
        ) : (
          <div className={styles.empty} />
        )}
        <div className={styles.overlay}>
          <div className={styles.name}>{folder.name}</div>
        </div>
      </div>
    </Link>
  );
}
