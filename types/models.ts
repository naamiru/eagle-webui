export const LAYOUTS = ["grid-3", "grid-4", "grid-6", "grid-8"] as const;
export type Layout = (typeof LAYOUTS)[number];

export const FOLDER_ORDER_BY = ["DEFAULT", "NAME", "IMPORT", "RANDOM"] as const;
export type FolderOrderBy = (typeof FOLDER_ORDER_BY)[number];

export const ITEM_ORDER_BY = [
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
export type ItemOrderBy = (typeof ITEM_ORDER_BY)[number];

export interface Order<OrderBy extends string> {
  orderBy: OrderBy;
  sortIncrease: boolean;
}

export interface Item {
  id: string;
  name: string;
  width: number;
  height: number;
  size: number;
  btime: number;
  mtime: number;
  ext: string;
  star: number;
  duration: number;
  globalOrder: number;
  manualOrder: number;
}

export interface Folder {
  id: string;
  name: string;
  children: Folder[];
  orderBy: ItemOrderBy;
  sortIncrease: boolean;
  coverItem?: Item;
  defaultOrder: number;
  modificationTime: number;
}

export interface Library {
  path: string;
}
