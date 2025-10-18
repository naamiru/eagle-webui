"use client";

import { Text, type TreeNodeData } from "@mantine/core";
import { useDebouncedCallback } from "@mantine/hooks";
import { IconFolderCog } from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import { updateNavbarExpandedState } from "@/actions/updateNavbarExpandedState";
import type { SmartFolder } from "@/data/smart-folders";
import { useTranslations } from "@/i18n/client";
import classes from "./FolderSection.module.css";
import { NavigationTree, type NavigationTreeMeta } from "./NavigationTree";

type SmartFolderSectionProps = {
  smartFolders: SmartFolder[];
  onLinkClick: () => void;
  initialExpandedIds: string[];
};

export function SmartFolderSection({
  smartFolders,
  onLinkClick,
  initialExpandedIds,
}: SmartFolderSectionProps) {
  const t = useTranslations();
  const smartFolderTreeData = useMemo(
    () => buildSmartFolderTreeData(smartFolders),
    [smartFolders],
  );
  const smartFolderCounts = useMemo(() => {
    const flattenedSmartFolders = flattenSmartFolderTree(smartFolders);
    return new Map(
      flattenedSmartFolders.map((folder) => [folder.id, folder.itemCount]),
    );
  }, [smartFolders]);
  const smartFolderCount = useMemo(
    () => countSmartFolderNodes(smartFolders),
    [smartFolders],
  );
  const persistExpandedState = useDebouncedCallback(
    async (expandedIds: string[]) => {
      const result = await updateNavbarExpandedState({
        area: "smart-folders",
        expandedIds,
      });

      if (!result.ok) {
        console.error(
          "[navbar] Failed to persist smart folder expansion:",
          result,
        );
        return;
      }
    },
    300,
  );

  const getLinkProps = useCallback(
    ({ node }: NavigationTreeMeta) => {
      const folderId = String(node.value);
      const to = `/smartfolder/${encodeURIComponent(folderId)}`;
      const count = smartFolderCounts.get(folderId) ?? 0;

      return {
        to,
        icon: IconFolderCog,
        count,
      };
    },
    [smartFolderCounts],
  );

  const handleExpandedChange = useCallback(
    (expandedIds: string[]) => {
      persistExpandedState(expandedIds);
    },
    [persistExpandedState],
  );

  return (
    <section>
      <Text size="xs" fw={500} c="dimmed" className={classes.title}>
        {t("navbar.smartFolders")}
        {smartFolderCount > 0 && `(${smartFolderCount})`}
      </Text>

      <NavigationTree
        data={smartFolderTreeData}
        getLinkProps={getLinkProps}
        onLinkClick={onLinkClick}
        linkWrapperClassName={classes.link}
        expandIconClassName={classes.expandIcon}
        initialExpandedIds={initialExpandedIds}
        onExpandedChange={handleExpandedChange}
      />
    </section>
  );
}

function buildSmartFolderTreeData(smartFolders: SmartFolder[]): TreeNodeData[] {
  const buildNode = (folder: SmartFolder): TreeNodeData => ({
    value: folder.id,
    label: folder.name || folder.id,
    children: folder.children.map((child) => buildNode(child)),
  });

  return smartFolders.map((folder) => buildNode(folder));
}

function flattenSmartFolderTree(smartFolders: SmartFolder[]): SmartFolder[] {
  const result: SmartFolder[] = [];

  const traverse = (folder: SmartFolder) => {
    result.push(folder);
    folder.children.forEach(traverse);
  };

  smartFolders.forEach(traverse);
  return result;
}

function countSmartFolderNodes(smartFolders: SmartFolder[]): number {
  let total = 0;

  const traverse = (folder: SmartFolder) => {
    total += 1;
    folder.children.forEach(traverse);
  };

  smartFolders.forEach(traverse);
  return total;
}
