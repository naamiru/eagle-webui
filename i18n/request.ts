import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { loadLocaleSetting } from "@/data/settings";
import { getPreferredLocale } from "./config";

export default getRequestConfig(async () => {
  const persisted = await loadLocaleSetting();

  const locale =
    persisted ?? getPreferredLocale((await headers()).get("accept-language"));
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages,
  };
});
