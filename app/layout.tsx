import "@mantine/core/styles.css";

import {
  Alert,
  Button,
  Center,
  ColorSchemeScript,
  DEFAULT_THEME,
  Loader,
  MantineProvider,
  mantineHtmlProps,
  mergeMantineTheme,
  rem,
  Stack,
  Text,
} from "@mantine/core";
import type { Metadata } from "next";
import { AppLayout } from "@/components/AppLayout";
import { ImportLoader } from "@/components/ImportLoader";
import {
  getFolders,
  getStore,
  getStoreImportState,
  resetStore,
  type StoreInitializationState,
  waitForStoreInitialization,
} from "@/data/store";
import type { Folder } from "@/data/types";

export const metadata: Metadata = {
  title: "Eagle WebUI",
  description: "A web interface for the Eagle image viewer application",
};

const theme = mergeMantineTheme(DEFAULT_THEME, {
  spacing: {
    xxxs: rem(3),
    xxs: rem(5),
  },
});

async function handleRetry() {
  "use server";
  await waitForStoreInitialization();
  resetStore();
  await getStore().catch(() => undefined);
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  void getStore().catch(() => undefined);
  const importState = getStoreImportState();
  const folders = getFolders();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider theme={theme}>
          {renderImportState(importState, children, folders)}
        </MantineProvider>
      </body>
    </html>
  );
}

function renderImportState(
  state: StoreInitializationState,
  children: React.ReactNode,
  folders: Folder[],
) {
  if (state.status === "idle" || state.status === "loading") {
    return (
      <>
        <ImportLoader />
        <Center h="100vh">
          <Stack gap="sm" align="center">
            <Loader size="lg" />
            <Text>Importing Eagle library…</Text>
          </Stack>
        </Center>
      </>
    );
  }

  if (state.status === "error") {
    return (
      <Center h="100vh">
        <Stack gap="md" align="center">
          <Alert
            color="red"
            title="Library import failed"
            radius="md"
            variant="filled"
          >
            {state.message}
          </Alert>
          <form action={handleRetry}>
            <Button type="submit" size="md">
              Retry import
            </Button>
          </form>
        </Stack>
      </Center>
    );
  }

  if (state.status === "ready") {
    return <AppLayout folders={folders}>{children}</AppLayout>;
  }

  return null;
}
