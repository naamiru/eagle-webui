"use client";

import { AppShell, Box, Burger, CloseButton, ScrollArea } from "@mantine/core";
import {
  IconFolderQuestion,
  IconInbox,
  IconLayoutSidebarLeftCollapse,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback } from "react";
import { useSwipeable } from "react-swipeable";
import type { SmartFolder } from "@/data/smart-folders";
import type { Folder, ItemCounts } from "@/data/types";
import { useTranslations } from "@/i18n/client";
import classes from "./AppNavbar.module.css";
import { FolderSection } from "./FolderSection";
import { MainLink } from "./MainLink";
import { ReloadButton } from "./ReloadButton";
import { SmartFolderSection } from "./SmartFolderSection";

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

        <SmartFolderSection
          smartFolders={smartFolders}
          onLinkClick={handleMainLinkClick}
        />

        <FolderSection folders={folders} onLinkClick={handleMainLinkClick} />

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
