"use server";

import { revalidatePath } from "next/cache";
import { saveLocaleSetting } from "@/data/settings";
import { isAppLocale } from "@/i18n/config";

export type UpdateLocaleResult = { ok: true } | { ok: false; error: string };

export async function updateLocale(
  locale: string,
): Promise<UpdateLocaleResult> {
  if (!isAppLocale(locale)) {
    return { ok: false, error: "INVALID_LOCALE" };
  }

  try {
    await saveLocaleSetting(locale);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to update the locale preference.";
    return { ok: false, error: message };
  }
}
