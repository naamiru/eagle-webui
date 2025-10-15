import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  Center,
  ColorSchemeScript,
  Loader,
  mantineHtmlProps,
  Stack,
  Text,
} from "@mantine/core";
import type { Metadata } from "next";
import { AppLayout } from "@/components/AppLayout";
import { AppMantineProvider } from "@/components/AppMantineProvider";
import { ImportErrorScreen } from "@/components/ImportErrorScreen";
import { ImportLoader } from "@/components/ImportLoader";
import {
  getStore,
  getStoreImportState,
  type StoreInitializationState,
} from "@/data/store";
import { getLibraryName } from "@/utils/get-library-name";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eagle WebUI",
  description: "A web interface for the Eagle image viewer application",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  void getStore().catch(() => undefined);
  const importState = getStoreImportState();

  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <AppMantineProvider>
          <ImportStateContent state={importState}>
            {children}
          </ImportStateContent>
        </AppMantineProvider>
      </body>
    </html>
  );
}

function ImportStateContent({
  state,
  children,
}: {
  state: StoreInitializationState;
  children: React.ReactNode;
}) {
  switch (state.status) {
    case "idle":
    case "loading":
      return <ImportLoadingScreen />;
    case "error":
      return <ImportErrorScreen code={state.code} />;
    case "ready":
      return <ImportReadyLayout>{children}</ImportReadyLayout>;
    default:
      return null;
  }
}

function ImportLoadingScreen() {
  return (
    <>
      <ImportLoader />
      <Center h="100vh">
        <Stack gap="sm" align="center">
          <Loader size="lg" color="gray" />
          <Text>Importing Eagle library…</Text>
        </Stack>
      </Center>
    </>
  );
}

async function ImportReadyLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();
  const libraryName = getLibraryName(store.libraryPath);

  return (
    <AppLayout
      folders={store.getFolders()}
      itemCounts={store.itemCounts}
      libraryName={libraryName}
    >
      {children}
    </AppLayout>
  );
}
