import { Gallery } from "react-photoswipe-gallery";
import "photoswipe/dist/photoswipe.css";
import styles from "~/styles/List.module.css";
import type { Item } from "~/types/item";
import { ImageItem } from "./ImageItem";

interface ItemListProps {
  items: Item[];
}

export function ItemList({ items }: ItemListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <Gallery
      withCaption
      options={{
        showAnimationDuration: 150,
        hideAnimationDuration: 150,
        bgOpacity: 1,
        easing: "ease-out",
        counter: false,
        zoom: false,
      }}
    >
      <div className={styles.grid}>
        {items.map((item) => (
          <ImageItem key={item.id} image={item} />
        ))}
      </div>
    </Gallery>
  );
}
