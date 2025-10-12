"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Gallery } from "react-photoswipe-gallery";
import type { Item } from "@/data/types";
import { ItemItem } from "./ItemItem";
import classes from "./ItemList.module.css";
import "photoswipe/dist/photoswipe.css";

export const LAYOUTS = ["grid-3", "grid-4", "grid-6", "grid-8"] as const;
export type Layout = (typeof LAYOUTS)[number];

interface ItemListProps {
  items: Item[];
  hasMore: boolean;
  libraryPath: string;
  layout?: Layout;
}

export function ItemList({
  items,
  hasMore,
  libraryPath,
  layout = "grid-3",
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
      <div className={`${classes.list} ${classes[layout]}`}>
        {items.map((item) => (
          <ItemItem key={item.id} image={item} libraryPath={libraryPath} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className={classes.sentinel} />}
    </Gallery>
  );
}
