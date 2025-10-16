"use client";

import { useEffect } from "react";

type ImportLoaderProps = {
  refreshInterval?: number;
};

export function ImportLoader({ refreshInterval = 1000 }: ImportLoaderProps) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      window.location.reload();
    }, refreshInterval);

    return () => clearTimeout(timeout);
  }, [refreshInterval]);

  return null;
}
