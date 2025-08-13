import Link from 'next/link';
import type { Folder } from '@/app/types/models';
import styles from './FolderItem.module.css';

interface FolderItemProps {
  folder: Folder;
  libraryPath: string;
}

function getStubThumbnailUrl(itemId: string): string {
  const images = [
    'https://picsum.photos/seed/folder1/400/400',
    'https://picsum.photos/seed/folder2/400/400',
    'https://picsum.photos/seed/folder3/400/400',
    'https://picsum.photos/seed/folder4/400/400',
    'https://picsum.photos/seed/folder5/400/400',
    'https://picsum.photos/seed/folder6/400/400',
    'https://picsum.photos/seed/folder7/400/400',
    'https://picsum.photos/seed/folder8/400/400',
  ];
  const index = parseInt(itemId.split('-')[1]) % images.length;
  return images[index];
}

export function FolderItem({ folder }: FolderItemProps) {
  const item = folder.coverItem;

  return (
    <Link href={`/folders/${folder.id}`} className={styles.link}>
      <div className={styles.item}>
        {item ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getStubThumbnailUrl(item.id)}
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