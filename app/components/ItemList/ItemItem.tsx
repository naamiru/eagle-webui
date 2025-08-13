import { Item as GalleryItem } from "react-photoswipe-gallery";
import type { Item } from "~/types/models";
import { getImageUrl, getThumbnailUrl } from "~/utils/image";
import styles from "./ItemItem.module.css";

interface ImageItemProps {
  image: Item;
  libraryPath: string;
}

export function ItemItem({ image, libraryPath }: ImageItemProps) {
  const thumbnailUrl = getThumbnailUrl(image.id, libraryPath);
  const originalUrl = getImageUrl(image.id, libraryPath);

  return (
    <GalleryItem
      original={originalUrl}
      thumbnail={thumbnailUrl}
      width={image.width}
      height={image.height}
      caption={image.name}
      cropped
    >
      {({ ref, open }) => (
        <img
          ref={ref}
          onClick={open}
          src={thumbnailUrl}
          alt={image.name}
          className={styles.thumbnail}
          width={image.width}
          height={image.height}
          loading="lazy"
        />
      )}
    </GalleryItem>
  );
}
