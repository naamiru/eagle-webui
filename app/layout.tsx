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
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { AppLayout } from "@/components/AppLayout";
import { AppMantineProvider } from "@/components/AppMantineProvider";
import { ImportErrorScreen } from "@/components/ImportErrorScreen";
import { ImportLoader } from "@/components/ImportLoader";
import { loadNavbarExpandedState } from "@/data/settings";
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
  const locale = await getLocale();
  const t = await getTranslations();
  const loadingLabel = t("import.loading");

  return (
    <html lang={locale} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body>
        <NextIntlClientProvider>
          <AppMantineProvider>
            <ImportStateContent state={importState} loadingLabel={loadingLabel}>
              {children}
            </ImportStateContent>
          </AppMantineProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

function ImportStateContent({
  state,
  loadingLabel,
  children,
}: {
  state: StoreInitializationState;
  loadingLabel: string;
  children: React.ReactNode;
}) {
  switch (state.status) {
    case "idle":
    case "loading":
      return <ImportLoadingScreen label={loadingLabel} />;
    case "error":
      return <ImportErrorScreen code={state.code} />;
    case "ready":
      return <ImportReadyLayout>{children}</ImportReadyLayout>;
    default:
      return null;
  }
}

function ImportLoadingScreen({ label }: { label: string }) {
  return (
    <>
      <ImportLoader />
      <Center h="100vh">
        <Stack gap="sm" align="center">
          <Loader size="lg" color="gray" />
          <Text>{label}</Text>
        </Stack>
      </Center>
    </>
  );
}

async function ImportReadyLayout({ children }: { children: React.ReactNode }) {
  const [store, navbarExpandedState] = await Promise.all([
    getStore(),
    loadNavbarExpandedState(),
  ]);
  const libraryName = getLibraryName(store.libraryPath);

  return (
    <AppLayout
      folders={store.getFolders()}
      itemCounts={store.itemCounts}
      libraryName={libraryName}
      smartFolders={store.getSmartFolders()}
      initialNavbarExpandedState={navbarExpandedState}
    >
      {children}
    </AppLayout>
  );
}
