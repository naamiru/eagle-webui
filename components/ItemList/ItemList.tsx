"use client";

import { useEffect, useState } from "react";
import { Gallery } from "react-photoswipe-gallery";
import { useInView } from "react-intersection-observer";
import type { Item, Layout } from "@/types/models";
import { ItemItem } from "./ItemItem";
import styles from "./ItemList.module.css";
import "photoswipe/dist/photoswipe.css";

interface ItemListProps {
  items: Item[];
  libraryPath: string;
  layout: Layout;
  hasMore?: boolean;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function ItemList({
  items,
  libraryPath,
  layout,
  hasMore = false,
  isLoading = false,
  onLoadMore,
}: ItemListProps) {
  // Set rootMargin to 50% of viewport height for eager loading
  const rootMargin =
    typeof window !== "undefined"
      ? `${Math.floor(window.innerHeight * 0.5)}px`
      : "200px";

  const { ref: sentinelRef, inView } = useInView({
    rootMargin,
  });

  const [lastInView, setLastInView] = useState(false);
  useEffect(() => {
    if (!lastInView && inView && hasMore && !isLoading && onLoadMore) {
      onLoadMore();
    }
    setLastInView(inView);
  }, [lastInView, inView, hasMore, isLoading, onLoadMore]);
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
        loop: false,
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
      <div className={`${styles.list} ${styles[layout]}`}>
        {items.map((item) => (
          <ItemItem key={item.id} image={item} libraryPath={libraryPath} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </Gallery>
  );
}
