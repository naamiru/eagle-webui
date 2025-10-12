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
import classes from "./AppLayout.module.css";

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const folderTreeData: TreeNodeData[] = [
    {
      value: "folderId1",
      label: "Folder Name 1",
      children: [
        { value: "subfolderId1", label: "Subfolder Name 1" },
        { value: "subfolderId2", label: "Subfolder Name 2" },
      ],
    },
    { value: "folderId2", label: "Folder Name 2" },
  ];

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
            Folders(3)
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
