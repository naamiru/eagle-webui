"use client";

import { AppShell, Burger, CloseButton, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconLayoutSidebarRightCollapse } from "@tabler/icons-react";
import type { ReactNode } from "react";
import { useSwipeable } from "react-swipeable";
import type { Folder } from "@/data/types";
import { HeaderSlotProvider, useHeaderSlot } from "./AppHeader";
import classes from "./AppLayout.module.css";
import { AppNavbar } from "./AppNavbar";

type AppLayoutProps = {
  children: ReactNode;
  folders: Folder[];
};

function HeaderOutlet() {
  const { header } = useHeaderSlot();
  return <>{header}</>;
}

export function AppLayout({ children, folders }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (!mobileOpened) {
        toggleMobile();
      }
    },
  });

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
      <HeaderSlotProvider>
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="sm"
              size="sm"
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
        />

        <AppShell.Main className={classes.main} {...swipeHandlers}>
          {children}
        </AppShell.Main>
      </HeaderSlotProvider>
    </AppShell>
  );
}
