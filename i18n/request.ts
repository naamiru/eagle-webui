import { getRequestConfig } from "next-intl/server";
import { resolveLocale } from "./config";

async function loadPersistedLocale(): Promise<string | undefined> {
  // Locale persistence will be introduced with the settings helpers.
  return undefined;
}

export default getRequestConfig(async ({ requestLocale }) => {
  const [persisted, request] = await Promise.all([
    loadPersistedLocale(),
    requestLocale,
  ]);
  const locale = resolveLocale({ persisted, requestLocale: request });
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
