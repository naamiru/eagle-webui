import { Item as GalleryItem } from "react-photoswipe-gallery";
import { useLibrary } from "~/contexts/LibraryContext";
import type { Item } from "~/types/item";
import { getOriginalUrl, getThumbnailUrl } from "~/utils/image";
import styles from "./ImageItem.module.css";

interface ImageItemProps {
  image: Item;
}

export function ImageItem({ image }: ImageItemProps) {
  const library = useLibrary();

  const thumbnailUrl = getThumbnailUrl(image.id, library.path);
  const originalUrl = getOriginalUrl(image.id, library.path);

  return (
    <GalleryItem
      original={originalUrl}
      thumbnail={thumbnailUrl}
      width={image.width}
      height={image.height}
      caption="画像タイトル"
      cropped
    >
      {({ ref, open }) => (
        <img
          ref={ref}
          onClick={open}
          src={thumbnailUrl}
          alt={`${image.id}`}
          className={styles.thumbnail}
          loading="lazy"
        />
      )}
    </GalleryItem>
  );
}
