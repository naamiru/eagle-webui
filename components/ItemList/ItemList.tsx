"use client";

import { useEffect, useState } from "react";
import { Gallery } from "react-photoswipe-gallery";
import { useInView } from "react-intersection-observer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Item, Layout } from "@/types/models";
import { ItemItem } from "./ItemItem";
import styles from "./ItemList.module.css";
import "photoswipe/dist/photoswipe.css";

interface ItemListProps {
  items: Item[];
  hasMore: boolean;
  libraryPath: string;
  layout: Layout;
}

export function ItemList({
  items,
  hasMore,
  libraryPath,
  layout,
}: ItemListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Set rootMargin to 100% of viewport height for eager loading
  const rootMargin =
    typeof window !== "undefined"
      ? `${Math.floor(window.innerHeight)}px`
      : "200px";

  const { ref: sentinelRef, inView } = useInView({
    rootMargin,
  });

  const [lastInView, setLastInView] = useState(false);
  useEffect(() => {
    if (!lastInView && inView && hasMore) {
      // Update limit parameter in URL when inView becomes active
      const params = new URLSearchParams(searchParams.toString());
      const newLimit = items.length + 100;
      params.set("limit", newLimit.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    setLastInView(inView);
  }, [
    lastInView,
    inView,
    hasMore,
    items.length,
    pathname,
    router,
    searchParams,
  ]);

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
