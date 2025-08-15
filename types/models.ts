export const LAYOUTS = ["grid-3", "grid-4", "grid-6", "grid-8"] as const;
export type Layout = typeof LAYOUTS[number];

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
  orderBy: string;
  sortIncrease: boolean;
  coverItem?: Item;
}

export interface Library {
  path: string;
}