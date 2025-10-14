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

export type SortMethod = (typeof FOLDER_SORT_METHODS)[number];

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

export type SortOptions = {
  orderBy: SortMethod;
  sortIncrease: boolean;
};

export type GlobalSortOptions = {
  orderBy: GlobalSortMethod;
  sortIncrease: boolean;
};

export const DEFAULT_GLOBAL_SORT_OPTIONS: GlobalSortOptions = {
  orderBy: "IMPORT",
  sortIncrease: true,
};

export const NEWEST_FIRST_METHODS = new Set<SortMethod>([
  "MANUAL",
  "IMPORT",
  "MTIME",
  "BTIME",
]);
