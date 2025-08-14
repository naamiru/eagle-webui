import "server-only";

import { getRequestConfig } from "next-intl/server";
import { osLocale } from "os-locale";

export default getRequestConfig(async () => {
  const lang = process.env.APP_LANG || (await osLocale()) || "";
  const locale = lang.split(/[-_]/)[0] === "ja" ? "ja" : "en";

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  };
});
