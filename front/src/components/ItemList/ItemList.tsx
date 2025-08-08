import { Gallery } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import styles from "~/styles/List.module.css";
import type { ItemData } from "~/types/item";
import { ImageItem } from "./ImageItem";

interface ItemListProps {
  items: ItemData[];
}

export function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Gallery>
      <div className={styles.grid}>
        {items.map((item) => (
          <ImageItem key={item.id} image={item} />
        ))}
      </div>
    </Gallery>
  );
}
