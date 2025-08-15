"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Retrieve data again when a cached page is displayed,
// such as when using the browser's back button.
export default function useRefreshBFCache() {
  const router = useRouter();

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        router.refresh();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, [router]);
}
