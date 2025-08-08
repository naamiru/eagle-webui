import { Item } from "react-photoswipe-gallery";
import type { ItemData } from "~/types/item";
import styles from "./ImageItem.module.css";

interface ImageItemProps {
  image: ItemData;
}

export function ImageItem({ image }: ImageItemProps) {
  return (
    <Item
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
    </Item>
  );
}
