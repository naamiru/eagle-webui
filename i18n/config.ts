export const SUPPORTED_LOCALES = ["en", "zh-cn", "zh-tw", "ja", "ko"] as const;
export const DEFAULT_LOCALE = "en";

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export function isAppLocale(locale: unknown): locale is AppLocale {
  return (
    typeof locale === "string" &&
    SUPPORTED_LOCALES.includes(locale as AppLocale)
  );
}

type ResolveLocaleInput = {
  persisted?: string;
  requestLocale?: string;
};

export function resolveLocale({
  persisted,
  requestLocale,
}: ResolveLocaleInput = {}): AppLocale {
  if (isAppLocale(persisted)) {
    return persisted;
  }

  if (isAppLocale(requestLocale)) {
    return requestLocale;
  }

  return DEFAULT_LOCALE;
}
