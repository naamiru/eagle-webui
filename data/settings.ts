import fs from "node:fs/promises";
import path from "node:path";

import ospath from "ospath";

import { type AppLocale, isAppLocale } from "@/i18n/config";

const APPLICATION_ID = "naamiru.eagle-webui";
const SETTINGS_DIR = path.join(ospath.data(), APPLICATION_ID);
const SETTINGS_FILE = path.join(SETTINGS_DIR, "settings.json");

export type SettingsFile = {
  globalSort?: {
    orderBy?: unknown;
    sortIncrease?: unknown;
  };
  locale?: AppLocale;
};

export function getSettingsFilePath(): string {
  return SETTINGS_FILE;
}

export async function loadSettings(): Promise<SettingsFile> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, "utf8");
    return JSON.parse(raw) as SettingsFile;
  } catch (error) {
    if (isFileNotFoundError(error) || error instanceof SyntaxError) {
      return {};
    }
    throw error;
  }
}

export async function saveSettings(
  partial: Partial<SettingsFile>,
): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });

  const current = await loadSettings();
  const next = { ...current, ...partial };
  const contents = `${JSON.stringify(next, null, 2)}\n`;
  await fs.writeFile(SETTINGS_FILE, contents, "utf8");
}

export async function loadLocaleSetting(): Promise<AppLocale | undefined> {
  const settings = await loadSettings();

  if (isAppLocale(settings.locale)) {
    return settings.locale;
  }

  return undefined;
}

export async function saveLocaleSetting(locale: AppLocale): Promise<void> {
  await saveSettings({ locale });
}

function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT",
  );
}
