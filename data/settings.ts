import fs from "node:fs/promises";
import path from "node:path";

import ospath from "ospath";

import { type AppLocale, isAppLocale } from "@/i18n/config";
import {
  DEFAULT_GLOBAL_SORT_OPTIONS,
  GLOBAL_SORT_METHODS,
  type GlobalSortMethod,
  type GlobalSortOptions,
} from "./sort-options";

const APPLICATION_ID = "naamiru.eagle-webui";
const SETTINGS_DIR = path.join(ospath.data(), APPLICATION_ID);
const SETTINGS_FILE = path.join(SETTINGS_DIR, "settings.json");

export type SettingsFile = {
  globalSort?: Partial<GlobalSortOptions>;
  locale?: AppLocale;
  listScale?: number;
};

let cachedSettings: SettingsFile | null = null;
let pendingSettings: Promise<SettingsFile> | null = null;

export function getSettingsFilePath(): string {
  return SETTINGS_FILE;
}

export async function loadSettings(): Promise<SettingsFile> {
  if (cachedSettings) {
    // Treat the returned object as read-only; mutate via saveSettings instead.
    return cachedSettings;
  }

  if (!pendingSettings) {
    pendingSettings = readSettingsFromDisk().then((settings) => {
      cachedSettings = settings;
      pendingSettings = null;
      return settings;
    });
  }

  const settings = await pendingSettings;
  return settings;
}

export async function saveSettings(
  partial: Partial<SettingsFile>
): Promise<void> {
  await fs.mkdir(SETTINGS_DIR, { recursive: true });

  const current = await loadSettings();
  const next = { ...current, ...partial };
  const contents = `${JSON.stringify(next, null, 2)}\n`;
  await fs.writeFile(SETTINGS_FILE, contents, "utf8");
  cachedSettings = next;
  pendingSettings = null;
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

export async function loadGlobalSortSettings(): Promise<GlobalSortOptions> {
  const settings = await loadSettings();
  const candidate = settings.globalSort ?? {};

  return {
    orderBy: sanitizeOrderBy(candidate.orderBy),
    sortIncrease: sanitizeSortIncrease(candidate.sortIncrease),
  };
}

export async function saveGlobalSortSettings(
  settings: GlobalSortOptions
): Promise<void> {
  const normalized: GlobalSortOptions = {
    orderBy: sanitizeOrderBy(settings.orderBy),
    sortIncrease: sanitizeSortIncrease(settings.sortIncrease),
  };

  await saveSettings({ globalSort: normalized });
}

const DEFAULT_LIST_SCALE = 50;
const MIN_LIST_SCALE = 0;
const MAX_LIST_SCALE = 100;

export async function loadListScaleSetting(): Promise<number> {
  const settings = await loadSettings();
  return sanitizeListScale(settings.listScale);
}

export async function saveListScaleSetting(scale: number): Promise<void> {
  await saveSettings({ listScale: sanitizeListScale(scale) });
}

export function __resetSettingsCacheForTests(): void {
  cachedSettings = null;
  pendingSettings = null;
}

function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

async function readSettingsFromDisk(): Promise<SettingsFile> {
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

function sanitizeOrderBy(value: unknown): GlobalSortMethod {
  if (isGlobalSortMethod(value)) {
    return value;
  }
  return DEFAULT_GLOBAL_SORT_OPTIONS.orderBy;
}

function sanitizeSortIncrease(value: unknown): boolean {
  return typeof value === "boolean"
    ? value
    : DEFAULT_GLOBAL_SORT_OPTIONS.sortIncrease;
}

function sanitizeListScale(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    const clamped = Math.min(Math.max(rounded, MIN_LIST_SCALE), MAX_LIST_SCALE);
    return clamped;
  }
  return DEFAULT_LIST_SCALE;
}

function isGlobalSortMethod(value: unknown): value is GlobalSortMethod {
  return (
    typeof value === "string" &&
    (GLOBAL_SORT_METHODS as readonly string[]).includes(value)
  );
}
