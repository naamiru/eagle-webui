import { Link } from "react-router";
import { useLibrary } from "~/contexts/LibraryContext";
import type { Folder } from "~/types/item";
import { getThumbnailUrl } from "~/utils/image";
import styles from "./FolderItem.module.css";

interface FolderItemProps {
  folder: Folder;
}

export function FolderItem({ folder }: FolderItemProps) {
  const library = useLibrary();
  const firstImage = folder.coverImage;

  const thumbnailUrl = firstImage
    ? getThumbnailUrl(firstImage.id, library.path)
    : undefined;

  return (
    <Link
      to={`/folders/${folder.id}`}
      className={styles.link}
      prefetch="intent"
    >
      <div className={styles.item}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Folder: ${folder.name}`}
            className={styles.thumbnail}
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
