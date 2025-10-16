import acceptLanguage from "accept-language";

export const SUPPORTED_LOCALES = ["en", "zh-cn", "zh-tw", "ja", "ko"] as const;
export const DEFAULT_LOCALE = "en";

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

acceptLanguage.languages(Array.from(SUPPORTED_LOCALES));

export function isAppLocale(locale: unknown): locale is AppLocale {
  return (
    typeof locale === "string" &&
    SUPPORTED_LOCALES.includes(locale as AppLocale)
  );
}

export function getPreferredLocale(header?: string | null): AppLocale {
  const matched = acceptLanguage.get(header);

  if (isAppLocale(matched)) {
    return matched;
  }

  return DEFAULT_LOCALE;
}
