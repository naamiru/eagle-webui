export const FOLDER_SORT_METHODS = [
  "GLOBAL",
  "MANUAL",
  "IMPORT",
  "MTIME",
  "BTIME",
  "NAME",
  "EXT",
  "FILESIZE",
  "RESOLUTION",
  "RATING",
  "DURATION",
  "RANDOM",
] as const;

export type FolderSortMethod = (typeof FOLDER_SORT_METHODS)[number];

export const GLOBAL_SORT_METHODS = [
  "IMPORT",
  "MTIME",
  "BTIME",
  "NAME",
  "EXT",
  "FILESIZE",
  "RESOLUTION",
  "RATING",
  "DURATION",
  "RANDOM",
] as const;

export type GlobalSortMethod = (typeof GLOBAL_SORT_METHODS)[number];

export type SortOptions<SortMethod extends string> = {
  orderBy: SortMethod;
  sortIncrease: boolean;
};

export type FolderSortOptions = SortOptions<FolderSortMethod>;
export type GlobalSortOptions = SortOptions<GlobalSortMethod>;

export const DEFAULT_GLOBAL_SORT_OPTIONS: GlobalSortOptions = {
  orderBy: "IMPORT",
  sortIncrease: true,
};

export const NEWEST_FIRST_METHODS = new Set<FolderSortMethod>([
  "MANUAL",
  "IMPORT",
  "MTIME",
  "BTIME",
]);

export function isFolderSortMethod(value: unknown): value is FolderSortMethod {
  return (
    typeof value === "string" &&
    (FOLDER_SORT_METHODS as readonly string[]).includes(value)
  );
}

export function isGlobalSortMethod(value: unknown): value is GlobalSortMethod {
  return (
    typeof value === "string" &&
    (GLOBAL_SORT_METHODS as readonly string[]).includes(value)
  );
}
