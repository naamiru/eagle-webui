import type { Item } from '@/app/types/models';
import { getThumbnailUrl } from '@/app/utils/image';
import styles from './ItemItem.module.css';

interface ImageItemProps {
  image: Item;
  libraryPath: string;
}

export function ItemItem({ image, libraryPath }: ImageItemProps) {
  const thumbnailUrl = getThumbnailUrl(image.id, libraryPath);

  return (
    <img
      src={thumbnailUrl}
      alt={image.name}
      className={styles.thumbnail}
      width={image.width}
      height={image.height}
      loading="lazy"
    />
  );
}