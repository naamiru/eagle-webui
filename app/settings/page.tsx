"use client";

import { Container, Loader, Select, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateLocale } from "@/actions/updateLocale";
import AppHeader from "@/components/AppHeader";
import { useLocale } from "@/i18n/client";
import { type AppLocale, DEFAULT_LOCALE, isAppLocale } from "@/i18n/config";

const LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "日本語", value: "ja" },
];

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const normalizedLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;
  const [selectedLocale, setSelectedLocale] =
    useState<AppLocale>(normalizedLocale);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isAppLocale(locale)) {
      setSelectedLocale(locale);
    }
  }, [locale]);

  const handleChange = (value: string | null) => {
    if (!value) {
      return;
    }

    const nextLocale = value as AppLocale;
    if (nextLocale === normalizedLocale || isPending) {
      return;
    }

    const previousLocale = normalizedLocale;
    setSelectedLocale(nextLocale);

    startTransition(async () => {
      const result = await updateLocale(nextLocale);

      if (result.ok) {
        router.refresh();
        return;
      }

      setSelectedLocale(previousLocale);
      notifications.show({
        color: "red",
        title: "Language update failed",
        message: result.error,
      });
    });
  };

  return (
    <>
      <AppHeader>
        <Text>Settings</Text>
      </AppHeader>

      <Container size="xs" mt="lg">
        <Select
          label="Display language"
          data={LANGUAGE_OPTIONS}
          value={selectedLocale}
          allowDeselect={false}
          onChange={handleChange}
          disabled={isPending}
          rightSection={isPending ? <Loader size="xs" /> : undefined}
        />
      </Container>
    </>
  );
}
