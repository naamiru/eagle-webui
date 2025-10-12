"use client";

import { AppShell, Burger, CloseButton, Group, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarRightCollapse,
} from "@tabler/icons-react";
import type { ReactNode } from "react";
import type { Folder } from "@/data/types";
import { AppNavbar } from "./AppNavbar";

type AppLayoutProps = {
  children: ReactNode;
  folders: Folder[];
};

export function AppLayout({ children, folders }: AppLayoutProps) {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

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

      <AppNavbar
        mobileOpened={mobileOpened}
        onToggleMobile={toggleMobile}
        folders={folders}
      />

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
