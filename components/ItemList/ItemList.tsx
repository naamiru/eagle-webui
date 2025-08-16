"use client";

import { useEffect, useState, useCallback } from "react";
import { Gallery } from "react-photoswipe-gallery";
import { useInView } from "react-intersection-observer";
import type { Item, Layout } from "@/types/models";
import { ItemItem } from "./ItemItem";
import { loadMoreItems, type ItemsPage } from "@/actions/items";
import styles from "./ItemList.module.css";
import "photoswipe/dist/photoswipe.css";

interface ItemListProps {
  folderId: string;
  initialItemsPage: ItemsPage;
  libraryPath: string;
  layout: Layout;
}

export function ItemList({
  folderId,
  initialItemsPage,
  libraryPath,
  layout,
}: ItemListProps) {
  const [items, setItems] = useState<Item[]>(initialItemsPage.items);
  const [hasMore, setHasMore] = useState(initialItemsPage.hasMore);
  const [isLoading, setIsLoading] = useState(false);

  // Reset items when initial data changes
  useEffect(() => {
    setItems(initialItemsPage.items);
    setHasMore(initialItemsPage.hasMore);
  }, [initialItemsPage.items, initialItemsPage.hasMore]);

  // Load more items callback
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const itemsPage = await loadMoreItems({
        folderId,
        offset: items.length,
        limit: 100,
      });

      setItems((prev) => [...prev, ...itemsPage.items]);
      setHasMore(itemsPage.hasMore);
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      setIsLoading(false);
    }
  }, [folderId, items.length, hasMore, isLoading]);

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
    if (!lastInView && inView && hasMore && !isLoading) {
      handleLoadMore();
    }
    setLastInView(inView);
  }, [lastInView, inView, hasMore, isLoading, handleLoadMore]);

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
