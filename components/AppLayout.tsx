"use client";

import { AppShell, Burger, CloseButton, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { SmartFolder } from "@/data/smart-folders";
import type { Folder, ItemCounts } from "@/data/types";
import { useSliderState } from "@/stores/slider-state";
import { HeaderSlotProvider, useHeaderSlot } from "./AppHeader";
import classes from "./AppLayout.module.css";
import { AppNavbar } from "./AppNabbar/AppNavbar";

type AppLayoutProps = {
  children: ReactNode;
  folders: Folder[];
  libraryName: string;
  itemCounts: ItemCounts;
  smartFolders: SmartFolder[];
};

function HeaderOutlet() {
  const { header } = useHeaderSlot();
  return <>{header}</>;
}

export function AppLayout({
  children,
  folders,
  libraryName,
  itemCounts,
  smartFolders,
}: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const { isPresented: isSliderPresented } = useSliderState();

  return (
    <AppShell
      layout="alt"
      header={{ height: 50 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <HeaderSlotProvider>
        <AppShell.Header>
          <Group h="100%" px="md" wrap="nowrap">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              lineSize={1}
            />

            {!desktopOpened && (
              <CloseButton
                icon={<IconLayoutSidebarRightCollapse stroke={1} />}
                visibleFrom="sm"
                onClick={toggleDesktop}
              />
            )}

            <HeaderOutlet />
          </Group>
        </AppShell.Header>

        <AppNavbar
          mobileOpened={mobileOpened}
          toggleMobile={toggleMobile}
          desktopOpened={desktopOpened}
          toggleDesktop={toggleDesktop}
          folders={folders}
          itemCounts={itemCounts}
          libraryName={libraryName}
          smartFolders={smartFolders}
        />

        <AppShell.Main
          className={classes.main}
          data-with-slider={isSliderPresented}
        >
          {children}
        </AppShell.Main>
      </HeaderSlotProvider>
    </AppShell>
  );
}
