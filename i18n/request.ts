import { getRequestConfig } from "next-intl/server";
import { loadLocaleSetting } from "@/data/settings";
import { resolveLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const [persisted, request] = await Promise.all([
    loadLocaleSetting(),
    requestLocale,
  ]);
  const locale = resolveLocale({ persisted, requestLocale: request });
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
