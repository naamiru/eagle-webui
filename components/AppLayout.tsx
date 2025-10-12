"use client";

import {
  AppShell,
  Box,
  Burger,
  CloseButton,
  Group,
  Loader,
  Text,
  Tree,
  type TreeNodeData,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconFolder,
  IconFolderOpen,
  IconFolderQuestion,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useTransition } from "react";
import { useSwipeable } from "react-swipeable";
import { reloadLibrary } from "@/actions/reloadLibrary";
import type { Folder } from "@/data/types";
import classes from "./AppLayout.module.css";

type AppLayoutProps = {
  children: ReactNode;
  folders: Folder[];
};

export function AppLayout({ children, folders }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const router = useRouter();
  const pathname = usePathname();
  const [isReloading, startReload] = useTransition();
  const reloadLabel = isReloading ? "Reloading library..." : "Reload library";

  const folderTreeData = useMemo(() => buildFolderTreeData(folders), [folders]);
  const activeFolderId = useMemo(() => {
    if (!pathname) {
      return null;
    }

    const match = pathname.match(/^\/folders\/([^/]+)/);
    if (!match) {
      return null;
    }

    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }, [pathname]);

  const folderCount = folders.length;

  const closeSwipeHandlers = useSwipeable({
    onSwipedLeft: toggleMobile,
  });

  const handleReload = () => {
    startReload(async () => {
      await reloadLibrary();
      router.refresh();
    });
  };

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />

          {desktopOpened ? (
            <CloseButton
              icon={<IconLayoutSidebarLeftCollapse stroke={1} />}
              visibleFrom="sm"
              onClick={toggleDesktop}
            />
          ) : (
            <CloseButton
              icon={<IconLayoutSidebarRightCollapse stroke={1} />}
              visibleFrom="sm"
              onClick={toggleDesktop}
            />
          )}

          <Text fw={600}>Eagle WebUI</Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="md"
        className={classes.navbar}
        {...(mobileOpened && closeSwipeHandlers)}
      >
        <div className={classes.header}>
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <UnstyledButton
            className={classes.libraryName}
            aria-label={reloadLabel}
            onClick={handleReload}
            disabled={isReloading}
          >
            <Text size="sm" fw={600}>
              Library Name
            </Text>
            {isReloading ? (
              <Loader size={16} color="gray" />
            ) : (
              <IconRefresh size={16} stroke={1.5} />
            )}
          </UnstyledButton>
        </div>

        <section>
          <UnstyledButton className={classes.mainLink}>
            <IconInbox className={classes.mainLinkIcon} size={20} stroke={1} />
            <Text size="sm">All</Text>
          </UnstyledButton>

          <UnstyledButton className={classes.mainLink}>
            <IconFolderQuestion
              className={classes.mainLinkIcon}
              size={20}
              stroke={1}
            />
            <Text size="sm">Uncategorized</Text>
          </UnstyledButton>

          <UnstyledButton className={classes.mainLink}>
            <IconTrash className={classes.mainLinkIcon} size={20} stroke={1} />
            <Text size="sm">Trash</Text>
          </UnstyledButton>
        </section>

        <section>
          <Text size="xs" fw={500} c="dimmed" className={classes.sectionTitle}>
            Folders ({folderCount})
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
            }) => (
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
                  <UnstyledButton
                    className={classes.mainLink}
                    aria-current={
                      activeFolderId === node.value ? "page" : undefined
                    }
                    onClick={() => {
                      router.push(`/folders/${encodeURIComponent(node.value)}`);
                      if (mobileOpened) {
                        toggleMobile();
                      }
                    }}
                    onMouseDown={(event) => {
                      if (event.detail === 2) {
                        event.preventDefault();
                      }
                    }}
                    onDoubleClick={(event) => {
                      event.preventDefault();
                      tree.toggleExpanded(node.value);
                    }}
                  >
                    {hasChildren && expanded ? (
                      <IconFolderOpen
                        className={classes.mainLinkIcon}
                        size={20}
                        stroke={1}
                      />
                    ) : (
                      <IconFolder
                        className={classes.mainLinkIcon}
                        size={20}
                        stroke={1}
                      />
                    )}
                    <Text size="sm">{node.label}</Text>
                  </UnstyledButton>
                </div>
              </div>
            )}
          />
        </section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
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
