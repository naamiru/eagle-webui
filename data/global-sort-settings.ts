import fs from "node:fs/promises";
import path from "node:path";

import ospath from "ospath";

import {
  DEFAULT_GLOBAL_SORT_OPTIONS,
  GLOBAL_SORT_METHODS,
  type GlobalSortMethod,
  type GlobalSortOptions,
} from "./sort-options";

const APPLICATION_ID = "naamiru.eagle-webui";
const SETTINGS_DIR = path.join(ospath.data(), APPLICATION_ID);
const SETTINGS_FILE = path.join(SETTINGS_DIR, "settings.json");
const SETTINGS_KEY = "globalSort";

type PersistedSettings = {
  [SETTINGS_KEY]?: {
    orderBy?: unknown;
    sortIncrease?: unknown;
  };
};

export async function loadGlobalSortSettings(): Promise<GlobalSortOptions> {
  try {
    const file = await readSettingsFile();
    const candidate = file?.[SETTINGS_KEY] ?? {};

    return {
      orderBy: sanitizeOrderBy(candidate.orderBy),
      sortIncrease: sanitizeSortIncrease(candidate.sortIncrease),
    };
  } catch (error) {
    if (isFileNotFoundError(error) || error instanceof SyntaxError) {
      return { ...DEFAULT_GLOBAL_SORT_OPTIONS };
    }
    throw error;
  }
}

export async function saveGlobalSortSettings(
  settings: GlobalSortOptions,
): Promise<void> {
  const normalized: GlobalSortOptions = {
    orderBy: sanitizeOrderBy(settings.orderBy),
    sortIncrease: sanitizeSortIncrease(settings.sortIncrease),
  };

  await fs.mkdir(SETTINGS_DIR, { recursive: true });

  const payload: PersistedSettings = {
    ...(await readSettingsFile().catch(() => ({}))),
    [SETTINGS_KEY]: normalized,
  };

  const contents = `${JSON.stringify(payload, null, 2)}\n`;
  await fs.writeFile(SETTINGS_FILE, contents, "utf8");
}

export function getGlobalSortSettingsPath(): string {
  return SETTINGS_FILE;
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

function isFileNotFoundError(error: unknown): error is NodeJS.ErrnoException {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT",
  );
}

async function readSettingsFile(): Promise<PersistedSettings> {
  const raw = await fs.readFile(SETTINGS_FILE, "utf8");
  return JSON.parse(raw) as PersistedSettings;
}

function isGlobalSortMethod(value: unknown): value is GlobalSortMethod {
  return (
    typeof value === "string" &&
    (GLOBAL_SORT_METHODS as readonly string[]).includes(value)
  );
}
