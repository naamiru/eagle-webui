import {
  getSettingsFilePath,
  loadSettings,
  type SettingsFile,
  saveSettings,
} from "./settings";
import {
  DEFAULT_GLOBAL_SORT_OPTIONS,
  GLOBAL_SORT_METHODS,
  type GlobalSortMethod,
  type GlobalSortOptions,
} from "./sort-options";

const SETTINGS_KEY = "globalSort";

type PersistedGlobalSortSettings = NonNullable<
  SettingsFile[typeof SETTINGS_KEY]
>;

export async function loadGlobalSortSettings(): Promise<GlobalSortOptions> {
  const file = await loadSettings();
  const candidate: PersistedGlobalSortSettings | undefined =
    file?.[SETTINGS_KEY];

  const source = candidate ?? {};

  return {
    orderBy: sanitizeOrderBy(source.orderBy),
    sortIncrease: sanitizeSortIncrease(source.sortIncrease),
  };
}

export async function saveGlobalSortSettings(
  settings: GlobalSortOptions,
): Promise<void> {
  const normalized: GlobalSortOptions = {
    orderBy: sanitizeOrderBy(settings.orderBy),
    sortIncrease: sanitizeSortIncrease(settings.sortIncrease),
  };

  await saveSettings({ [SETTINGS_KEY]: normalized });
}

export function getGlobalSortSettingsPath(): string {
  return getSettingsFilePath();
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

function isGlobalSortMethod(value: unknown): value is GlobalSortMethod {
  return (
    typeof value === "string" &&
    (GLOBAL_SORT_METHODS as readonly string[]).includes(value)
  );
}
