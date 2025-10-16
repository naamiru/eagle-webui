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
