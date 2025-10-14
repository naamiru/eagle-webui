import "@mantine/core/styles.css";

import {
  Alert,
  Button,
  Center,
  ColorSchemeScript,
  Loader,
  mantineHtmlProps,
  Stack,
  Text,
} from "@mantine/core";
import type { Metadata } from "next";
import { reloadLibrary } from "@/actions/reloadLibrary";
import { AppLayout } from "@/components/AppLayout";
import { AppMantineProvider } from "@/components/AppMantineProvider";
import { ImportLoader } from "@/components/ImportLoader";
import {
  getStore,
  getStoreImportState,
  type StoreInitializationState,
} from "@/data/store";

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
      return <ImportErrorScreen message={state.message} />;
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

function ImportErrorScreen({ message }: { message: string }) {
  return (
    <Center h="100vh">
      <Stack gap="md" align="center">
        <Alert
          color="red"
          title="Library import failed"
          radius="md"
          variant="filled"
        >
          {message}
        </Alert>
        <form action={reloadLibrary}>
          <Button type="submit" size="md">
            Retry import
          </Button>
        </form>
      </Stack>
    </Center>
  );
}

async function ImportReadyLayout({ children }: { children: React.ReactNode }) {
  const store = await getStore();
  return <AppLayout folders={store.getFolders()}>{children}</AppLayout>;
}
