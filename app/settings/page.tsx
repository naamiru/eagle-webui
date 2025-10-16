"use client";

import { Container, Loader, Select, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { updateLocale } from "@/actions/updateLocale";
import AppHeader from "@/components/AppHeader";
import { useLocale, useTranslations } from "@/i18n/client";
import {
  type AppLocale,
  DEFAULT_LOCALE,
  isAppLocale,
  SUPPORTED_LOCALES,
} from "@/i18n/config";

const LANGUAGE_LABELS: Record<AppLocale, string> = {
  en: "English",
  ja: "日本語",
  ko: "한국어",
  "zh-cn": "简体中文",
  "zh-tw": "繁體中文",
};

export default function SettingsPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
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
        title: t("settings.language.updateFailedTitle"),
        message:
          result.error === "INVALID_LOCALE"
            ? t("common.errors.invalidLocale")
            : t("settings.language.updateFailedMessage"),
      });
    });
  };

  const languageOptions = SUPPORTED_LOCALES.map((localeCode) => ({
    label: LANGUAGE_LABELS[localeCode],
    value: localeCode,
  }));

  return (
    <>
      <AppHeader>
        <Text>{t("settings.title")}</Text>
      </AppHeader>

      <Container size="xs" mt="lg">
        <Select
          label={t("settings.language.label")}
          description={t("settings.language.note")}
          data={languageOptions}
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
