import { Item as GalleryItem } from "react-photoswipe-gallery";
import type { Item } from "~/types/item";
import styles from "./ImageItem.module.css";

interface ImageItemProps {
  image: Item;
}

export function ImageItem({ image }: ImageItemProps) {
  return (
    <GalleryItem
      original={image.original}
      thumbnail={image.thumbnail}
      width={image.width}
      height={image.height}
      cropped
    >
      {({ ref, open }) => (
        <img
          ref={ref}
          onClick={open}
          src={image.thumbnail}
          alt={`${image.id}`}
          className={styles.thumbnail}
        />
      )}
    </GalleryItem>
  );
}
