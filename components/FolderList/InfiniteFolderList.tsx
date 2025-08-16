"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { Folder, Layout } from "@/types/models";
import { FolderList } from "./FolderList";
import styles from "./FolderList.module.css";

interface InfiniteFolderListProps {
  folders: Folder[];
  hasMore: boolean;
  libraryPath: string;
  layout: Layout;
}

export function InfiniteFolderList({
  folders,
  hasMore,
  libraryPath,
  layout,
}: InfiniteFolderListProps) {
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
      const newLimit = folders.length + 100;
      params.set("limit", newLimit.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    setLastInView(inView);
  }, [
    lastInView,
    inView,
    hasMore,
    folders.length,
    pathname,
    router,
    searchParams,
  ]);

  return (
    <>
      <FolderList folders={folders} libraryPath={libraryPath} layout={layout} />
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
    </>
  );
}
