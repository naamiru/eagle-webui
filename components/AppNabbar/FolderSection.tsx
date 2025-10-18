"use client";

import { Text, type TreeNodeData } from "@mantine/core";
import { IconFolder, IconFolderOpen } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import type { Folder } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import classes from "./FolderSection.module.css";
import { NavigationTree, type NavigationTreeMeta } from "./NavigationTree";

type FolderSectionProps = {
  folders: Folder[];
  onLinkClick: () => void;
};

export function FolderSection({ folders, onLinkClick }: FolderSectionProps) {
  const t = useTranslations();
  const folderTreeData = useMemo(() => buildFolderTreeData(folders), [folders]);
  const folderCounts = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder.itemCount])),
    [folders],
  );
  const aggregateFolderCounts = useMemo(
    () => buildAggregateFolderCounts(folders),
    [folders],
  );
  const folderCount = folders.length;

  const getLinkProps = useCallback(
    ({ node, expanded, hasChildren }: NavigationTreeMeta) => {
      const folderId = String(node.value);
      const to = `/folders/${encodeURIComponent(folderId)}`;
      const icon = hasChildren && expanded ? IconFolderOpen : IconFolder;

      const count =
        hasChildren && !expanded
          ? (aggregateFolderCounts.get(folderId) ??
            folderCounts.get(folderId) ??
            0)
          : (folderCounts.get(folderId) ?? 0);

      return {
        to,
        icon,
        count,
      };
    },
    [aggregateFolderCounts, folderCounts],
  );

  return (
    <section>
      <Text size="xs" fw={500} c="dimmed" className={classes.title}>
        {t("navbar.folders")}
        {folderCount > 0 && `(${folderCount})`}
      </Text>

      <NavigationTree
        data={folderTreeData}
        getLinkProps={getLinkProps}
        onLinkClick={onLinkClick}
        linkWrapperClassName={classes.link}
        expandIconClassName={classes.expandIcon}
      />
    </section>
  );
}

export function buildAggregateFolderCounts(
  folders: Folder[],
): Map<string, number> {
  const totals = new Map<string, number>();

  if (folders.length === 0) {
    return totals;
  }

  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const processing = new Set<string>();

  const accumulate = (folder: Folder): number => {
    const cached = totals.get(folder.id);
    if (cached !== undefined) {
      return cached;
    }

    if (processing.has(folder.id)) {
      totals.set(folder.id, folder.itemCount);
      return folder.itemCount;
    }

    processing.add(folder.id);

    let total = folder.itemCount;
    for (const childId of folder.children) {
      const child = foldersById.get(childId);
      if (child) {
        total += accumulate(child);
      }
    }

    processing.delete(folder.id);
    totals.set(folder.id, total);
    return total;
  };

  folders.forEach((folder) => {
    accumulate(folder);
  });

  return totals;
}

function buildFolderTreeData(folders: Folder[]): TreeNodeData[] {
  if (folders.length === 0) {
    return [];
  }

  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const sortByManualOrder = (a: Folder, b: Folder) =>
    a.manualOrder - b.manualOrder;

  const buildNode = (folder: Folder): TreeNodeData => {
    const children: TreeNodeData[] = folder.children
      .map((childId) => foldersById.get(childId))
      .filter((child): child is Folder => child !== undefined)
      .sort(sortByManualOrder)
      .map((child) => buildNode(child));

    return {
      value: folder.id,
      label: folder.name || folder.id,
      children,
    };
  };

  return folders
    .filter((folder) => folder.parentId === undefined)
    .sort(sortByManualOrder)
    .map((folder) => buildNode(folder));
}
