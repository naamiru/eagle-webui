"use client";

import type { UnstyledButtonProps } from "@mantine/core";
import {
  AppShell,
  Box,
  Burger,
  CloseButton,
  Loader,
  ScrollArea,
  Text,
  Tree,
  type TreeNodeData,
  UnstyledButton,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCaretDownFilled,
  IconCaretRightFilled,
  IconFolder,
  IconFolderOpen,
  IconFolderQuestion,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { usePathname, useRouter } from "next/navigation";
import type { ComponentPropsWithoutRef, ComponentType, ReactNode } from "react";
import { useMemo, useTransition } from "react";
import { useSwipeable } from "react-swipeable";
import { reloadLibrary } from "@/actions/reloadLibrary";
import { getLibraryImportErrorMessage } from "@/data/errors";
import type { Folder } from "@/data/types";
import { resolveErrorMessage } from "@/utils/resolve-error-message";
import classes from "./AppNavbar.module.css";

type AppNavbarProps = {
  mobileOpened: boolean;
  toggleMobile: () => void;
  desktopOpened: boolean;
  toggleDesktop: () => void;
  folders: Folder[];
  libraryName: string;
};

type MainLinkButtonProps = Omit<
  UnstyledButtonProps,
  "aria-current" | "className" | "children" | "onClick"
> &
  Omit<
    ComponentPropsWithoutRef<"button">,
    "aria-current" | "className" | "children" | "onClick"
  > & {
    to: string;
    icon: ComponentType<{
      className?: string;
      size?: number;
      stroke?: number;
    }>;
    label: ReactNode;
  };

export function AppNavbar({
  mobileOpened,
  toggleMobile,
  desktopOpened,
  toggleDesktop,
  folders,
  libraryName,
}: AppNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReloading, startReload] = useTransition();
  const reloadLabel = isReloading ? "Reloading library..." : "Reload library";
  const folderTreeData = useMemo(() => buildFolderTreeData(folders), [folders]);
  const folderCount = folders.length;

  const handleReload = () => {
    startReload(async () => {
      try {
        const result = await reloadLibrary();

        if (result.ok) {
          router.refresh();
          return;
        }

        notifications.show({
          color: "red",
          title: "Library sync failed",
          message: getLibraryImportErrorMessage(result.code),
        });
      } catch (error) {
        notifications.show({
          color: "red",
          title: "Library sync failed",
          message: resolveErrorMessage(
            error,
            "Could not sync library. Please try again."
          ),
        });
      }
    });
  };

  const MainLinkButton = ({
    to,
    icon: IconComponent,
    label,
    ...props
  }: MainLinkButtonProps) => {
    const isActive =
      pathname === to || (to !== "/" && pathname.startsWith(`${to}/`));

    const handleClick = () => {
      if (pathname !== to) {
        router.push(to);
      }

      if (mobileOpened) {
        toggleMobile();
      }
    };

    return (
      <UnstyledButton
        className={classes.mainLink}
        aria-current={isActive ? "page" : undefined}
        onClick={handleClick}
        {...props}
      >
        <IconComponent className={classes.mainLinkIcon} size={20} stroke={1} />
        <Text size="sm">{label}</Text>
        <div className={classes.mainLinkTrailing}>
          <Text size="xs" c="dimmed" ff="var(--mantine-font-family-monospace)">
            10
          </Text>
        </div>
      </UnstyledButton>
    );
  };
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
          size="sm"
        />

        <div className={classes.headerMain}>
          <UnstyledButton
            className={classes.libraryName}
            aria-label={reloadLabel}
            onClick={handleReload}
            disabled={isReloading}
          >
            <Text size="sm" fw={600}>
              {libraryName}
            </Text>
            {isReloading ? (
              <Loader size={16} color="gray" />
            ) : (
              <IconRefresh size={16} stroke={1.5} />
            )}
          </UnstyledButton>
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
          <MainLinkButton to="/" icon={IconInbox} label="All" />

          <MainLinkButton
            to="/uncategorized"
            icon={IconFolderQuestion}
            label="Uncategorized"
          />

          <MainLinkButton to="/trash" icon={IconTrash} label="Trash" />
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
                    <MainLinkButton
                      to={folderPath}
                      icon={folderIcon}
                      label={node.label}
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
      </AppShell.Section>
    </AppShell.Navbar>
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
