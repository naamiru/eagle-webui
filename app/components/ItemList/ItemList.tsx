import { Gallery } from "react-photoswipe-gallery";
import type { Item } from "~/types/models";
import { ItemItem } from "./ItemItem";
import styles from "./ItemList.module.css";
import "photoswipe/dist/photoswipe.css";

interface ItemListProps {
  items: Item[];
}

export function ItemList({ items }: ItemListProps) {
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
      onOpen={(pswp) => {
        // for touch device, hide controls on open
        if (pswp.element?.classList.contains("pswp--touch")) {
          pswp.on("openingAnimationStart", () => {
            pswp.element?.classList.add("pswp--opening");
          });
          pswp.on("openingAnimationEnd", () => {
            pswp.element?.classList.remove("pswp--opening");
            pswp.element?.classList.remove("pswp--ui-visible");
          });
        }
      }}
    >
      <div className={styles.list}>
        {items.map((item) => (
          <ItemItem key={item.id} image={item} />
        ))}
      </div>
    </Gallery>
  );
}
