"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { updateFolderSortOptions } from "@/actions/updateFolderSortOptions";
import { updateGlobalSortOptions } from "@/actions/updateGlobalSortOptions";
import { updateSmartFolderSortOptions } from "@/actions/updateSmartFolderSortOptions";
import type { FolderSortOptions, GlobalSortOptions } from "@/data/sort-options";
import { FolderSortControl, GlobalSortControl } from "./SortControl";

export type CollectionSortState =
  | {
      kind: "folder";
      folderId: string;
      value: FolderSortOptions;
    }
  | {
      kind: "global";
      value: GlobalSortOptions;
    }
  | {
      kind: "smart-folder";
      smartFolderId: string;
      value: FolderSortOptions;
    };

type CollectionSortControlsProps = {
  sortState: CollectionSortState;
};

export function CollectionSortControls({
  sortState,
}: CollectionSortControlsProps) {
  const router = useRouter();

  const handleFolderSortChange = useCallback(
    (next: FolderSortOptions) => {
      if (sortState.kind !== "folder") {
        return;
      }

      void (async () => {
        const result = await updateFolderSortOptions({
          folderId: sortState.folderId,
          orderBy: next.orderBy,
          sortIncrease: next.sortIncrease,
        });

        if (!result.ok) {
          console.error("[collection] Failed to update folder sort:", result);
          return;
        }

        router.refresh();
      })();
    },
    [router, sortState],
  );

  const handleSmartFolderSortChange = useCallback(
    (next: FolderSortOptions) => {
      if (sortState.kind !== "smart-folder") {
        return;
      }

      void (async () => {
        const result = await updateSmartFolderSortOptions({
          smartFolderId: sortState.smartFolderId,
          orderBy: next.orderBy,
          sortIncrease: next.sortIncrease,
        });

        if (!result.ok) {
          console.error(
            "[collection] Failed to update smart folder sort:",
            result,
          );
          return;
        }

        router.refresh();
      })();
    },
    [router, sortState],
  );

  const handleGlobalSortChange = useCallback(
    (next: GlobalSortOptions) => {
      if (sortState.kind !== "global") {
        return;
      }

      void (async () => {
        const result = await updateGlobalSortOptions({
          orderBy: next.orderBy,
          sortIncrease: next.sortIncrease,
        });

        if (!result.ok) {
          console.error("[collection] Failed to update global sort:", result);
          return;
        }

        router.refresh();
      })();
    },
    [router, sortState],
  );

  switch (sortState.kind) {
    case "folder":
      return (
        <FolderSortControl
          value={sortState.value}
          onChange={handleFolderSortChange}
        />
      );
    case "smart-folder":
      return (
        <FolderSortControl
          value={sortState.value}
          onChange={handleSmartFolderSortChange}
        />
      );
    case "global":
      return (
        <GlobalSortControl
          value={sortState.value}
          onChange={handleGlobalSortChange}
        />
      );
    default:
      return null;
  }
}
