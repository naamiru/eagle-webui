"use client";

import {
  AppShell,
  Burger,
  CloseButton,
  Group,
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
  IconTrash,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useMemo } from "react";
import type { Folder } from "@/data/types";
import classes from "./AppLayout.module.css";

type AppLayoutProps = {
  children: ReactNode;
  folders: Folder[];
};

export function AppLayout({ children, folders }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const folderTreeData = useMemo(
    () => buildFolderTreeData(folders),
    [folders],
  );

  const folderCount = folders.length;

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
        style={{ backgroundColor: "var(--mantine-color-gray-0)" }}
      >
        <div className={classes.header}>
          <Burger
            opened={mobileOpened}
            onClick={toggleMobile}
            hiddenFrom="sm"
            size="sm"
          />
          <Text size="sm" fw={600}>
            Library Name
          </Text>
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
                      <IconCaretDownFilled
                        className={classes.folderExpandIcon}
                        size={12}
                        onClick={() => tree.toggleExpanded(node.value)}
                      />
                    ) : (
                      <IconCaretRightFilled
                        className={classes.folderExpandIcon}
                        size={12}
                        onClick={() => tree.toggleExpanded(node.value)}
                      />
                    ))}
                  <UnstyledButton
                    className={classes.mainLink}
                    onDoubleClick={() => tree.toggleExpanded(node.value)}
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
