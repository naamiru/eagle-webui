"use client";

import {
  AppShell,
  Box,
  Burger,
  CloseButton,
  ScrollArea,
  Text,
  Tree,
  type TreeNodeData,
} from "@mantine/core";
import {
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconFolder,
  IconFolderCog,
  IconFolderOpen,
  IconFolderQuestion,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useMemo } from "react";
import { useSwipeable } from "react-swipeable";
import type { SmartFolder } from "@/data/smart-folders";
import type { Folder, ItemCounts } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import classes from "./AppNavbar.module.css";
import { MainLink } from "./MainLink";
import { ReloadButton } from "./ReloadButton";

type AppNavbarProps = {
  mobileOpened: boolean;
  toggleMobile: () => void;
  desktopOpened: boolean;
  toggleDesktop: () => void;
  folders: Folder[];
  itemCounts: ItemCounts;
  libraryName: string;
  smartFolders: SmartFolder[];
};

export function AppNavbar({
  mobileOpened,
  toggleMobile,
  desktopOpened,
  toggleDesktop,
  folders,
  itemCounts,
  libraryName,
  smartFolders,
}: AppNavbarProps) {
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
  const flattenedSmartFolders = useMemo(
    () => flattenSmartFolderTree(smartFolders),
    [smartFolders],
  );
  const smartFolderTreeData = useMemo(
    () => buildSmartFolderTreeData(smartFolders),
    [smartFolders],
  );
  const smartFolderCounts = useMemo(
    () =>
      new Map(
        flattenedSmartFolders.map((folder) => [folder.id, folder.itemCount]),
      ),
    [flattenedSmartFolders],
  );
  const smartFolderCount = useMemo(
    () => countSmartFolderNodes(smartFolders),
    [smartFolders],
  );

  const handleMainLinkClick = useCallback(() => {
    if (mobileOpened) {
      toggleMobile();
    }
  }, [mobileOpened, toggleMobile]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: toggleMobile,
  });

  return (
    <AppShell.Navbar
      p="md"
      className={classes.navbar}
      {...(mobileOpened ? swipeHandlers : {})}
    >
      <div className={classes.header}>
        <Burger
          opened={mobileOpened}
          onClick={toggleMobile}
          hiddenFrom="sm"
          lineSize={1}
        />

        <div className={classes.headerMain}>
          <ReloadButton libraryName={libraryName} />
        </div>

        {desktopOpened && (
          <Box visibleFrom="sm" className={classes.headerTrailing}>
            <CloseButton
              icon={<IconLayoutSidebarLeftCollapse stroke={1} />}
              onClick={toggleDesktop}
            />
          </Box>
        )}
      </div>

      <AppShell.Section
        grow
        component={ScrollArea}
        className={classes.scrollable}
      >
        <section>
          <MainLink
            to="/"
            icon={IconInbox}
            label={t("collection.all")}
            count={itemCounts.all}
            onClick={handleMainLinkClick}
          />

          <MainLink
            to="/uncategorized"
            icon={IconFolderQuestion}
            label={t("collection.uncategorized")}
            count={itemCounts.uncategorized}
            onClick={handleMainLinkClick}
          />

          <MainLink
            to="/trash"
            icon={IconTrash}
            label={t("collection.trash")}
            count={itemCounts.trash}
            onClick={handleMainLinkClick}
          />
        </section>

        <section>
          <Text size="xs" fw={500} c="dimmed" className={classes.sectionTitle}>
            {t("navbar.smartFolders")}
            {smartFolderCount > 0 && `(${smartFolderCount})`}
          </Text>

          <Tree
            data={smartFolderTreeData}
            expandOnClick={false}
            renderNode={({
              node,
              expanded,
              hasChildren,
              elementProps,
              tree,
            }) => {
              const folderId = String(node.value);
              const folderPath = `/smartfolder/${encodeURIComponent(folderId)}`;
              const folderIcon = IconFolderCog;

              const directCount = smartFolderCounts.get(folderId) ?? 0;

              return (
                <div {...elementProps}>
                  <div
                    className={classes.folderLink}
                    {...(hasChildren && { "data-has-children": "" })}
                  >
                    {hasChildren &&
                      (expanded ? (
                        <>
                          <Box visibleFrom="sm">
                            <IconCaretDownFilled
                              className={classes.folderExpandIcon}
                              size={12}
                              onClick={() => tree.toggleExpanded(node.value)}
                            />
                          </Box>
                          <CloseButton
                            size="lg"
                            icon={<IconCaretDownFilled size={16} />}
                            hiddenFrom="sm"
                            onClick={() => tree.toggleExpanded(node.value)}
                          />
                        </>
                      ) : (
                        <>
                          <Box visibleFrom="sm">
                            <IconCaretRightFilled
                              className={classes.folderExpandIcon}
                              size={12}
                              onClick={() => tree.toggleExpanded(node.value)}
                            />
                          </Box>
                          <CloseButton
                            size="lg"
                            icon={<IconCaretRightFilled size={16} />}
                            hiddenFrom="sm"
                            onClick={() => tree.toggleExpanded(node.value)}
                          />
                        </>
                      ))}
                    <MainLink
                      to={folderPath}
                      icon={folderIcon}
                      label={node.label}
                      count={directCount}
                      onClick={handleMainLinkClick}
                      withLeftMargin={!hasChildren}
                      onMouseDown={(event) => {
                        if (event.detail === 2) {
                          event.preventDefault();
                        }
                      }}
                      onDoubleClick={(event) => {
                        event.preventDefault();
                        tree.toggleExpanded(node.value);
                      }}
                    />
                  </div>
                </div>
              );
            }}
          />
        </section>

        <section>
          <Text size="xs" fw={500} c="dimmed" className={classes.sectionTitle}>
            {t("navbar.folders")}
            {folders.length > 0 && `(${folderCount})`}
          </Text>

          <Tree
            data={folderTreeData}
            expandOnClick={false}
            renderNode={({
              node,
              expanded,
              hasChildren,
              elementProps,
              tree,
            }) => {
              const folderId = String(node.value);
              const folderPath = `/folders/${encodeURIComponent(folderId)}`;
              const folderIcon =
                hasChildren && expanded ? IconFolderOpen : IconFolder;

              return (
                <div {...elementProps}>
                  <div
                    className={classes.folderLink}
                    {...(hasChildren && { "data-has-children": "" })}
                  >
                    {hasChildren &&
                      (expanded ? (
                        <>
                          <Box visibleFrom="sm">
                            <IconCaretDownFilled
                              className={classes.folderExpandIcon}
                              size={12}
                              onClick={() => tree.toggleExpanded(node.value)}
                            />
                          </Box>
                          <CloseButton
                            size="lg"
                            icon={<IconCaretDownFilled size={16} />}
                            hiddenFrom="sm"
                            onClick={() => tree.toggleExpanded(node.value)}
                          />
                        </>
                      ) : (
                        <>
                          <Box visibleFrom="sm">
                            <IconCaretRightFilled
                              className={classes.folderExpandIcon}
                              size={12}
                              onClick={() => tree.toggleExpanded(node.value)}
                            />
                          </Box>
                          <CloseButton
                            size="lg"
                            icon={<IconCaretRightFilled size={16} />}
                            hiddenFrom="sm"
                            onClick={() => tree.toggleExpanded(node.value)}
                          />
                        </>
                      ))}
                    <MainLink
                      to={folderPath}
                      icon={folderIcon}
                      label={node.label}
                      count={
                        hasChildren && !expanded
                          ? (aggregateFolderCounts.get(folderId) ??
                            folderCounts.get(folderId) ??
                            0)
                          : (folderCounts.get(folderId) ?? 0)
                      }
                      onClick={handleMainLinkClick}
                      withLeftMargin={!hasChildren}
                      onMouseDown={(event) => {
                        if (event.detail === 2) {
                          event.preventDefault();
                        }
                      }}
                      onDoubleClick={(event) => {
                        event.preventDefault();
                        tree.toggleExpanded(node.value);
                      }}
                    />
                  </div>
                </div>
              );
            }}
          />
        </section>

        <section className={classes.settingsSection}>
          <MainLink
            to="/settings"
            icon={IconSettings}
            label={t("navbar.settings")}
            onClick={handleMainLinkClick}
          />
        </section>
      </AppShell.Section>
    </AppShell.Navbar>
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
    const children = folder.children
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
