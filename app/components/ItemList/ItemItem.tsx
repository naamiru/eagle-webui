import { Item as GalleryItem } from "react-photoswipe-gallery";
import type { Item } from "~/types/models";
import styles from "./ItemItem.module.css";

interface ImageItemProps {
  image: Item;
}

export function ItemItem({ image }: ImageItemProps) {
  const thumbnailUrl =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300";
  const originalUrl =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200";

  return (
    <GalleryItem
      original={originalUrl}
      thumbnail={thumbnailUrl}
      width={1200}
      height={800}
      caption={image.name}
      cropped
    >
      {({ ref, open }) => (
        <img
          ref={ref}
          onClick={open}
          src={thumbnailUrl}
          alt={`${image.id}`}
          className={styles.thumbnail}
          width="300"
          height="200"
          loading="lazy"
        />
      )}
    </GalleryItem>
  );
}
