"use client";

import { useEffect, startTransition, useRef } from "react";
import { usePathname } from "next/navigation";
import { revalidateCurrentPath } from "@/actions/revalidate";

export function ReloadDetector() {
  const pathname = usePathname();
  const hasCheckedReload = useRef(false);

  useEffect(() => {
    // Only check once per app lifecycle
    if (hasCheckedReload.current) return;

    const navigationEntries = window.performance.getEntriesByType(
      "navigation"
    ) as PerformanceNavigationTiming[];

    if (navigationEntries[0]?.type === "reload") {
      hasCheckedReload.current = true;
      startTransition(() => {
        revalidateCurrentPath(pathname).then((result) => {
          if (!result.success) {
            console.error("Failed to revalidate on reload:", result.error);
          }
        });
      });
    }
  }, [pathname]);

  return null;
}
