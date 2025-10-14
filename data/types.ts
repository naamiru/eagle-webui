export type Palette = {
  color: [number, number, number];
  ratio: number;
  $$hashKey?: string;
};

import type { SortMethod } from "./sort-options";

export type Folder = {
  id: string;
  name: string;
  description: string;
  children: string[];
  parentId?: string;
  manualOrder: number;
  modificationTime: number;
  tags: string[];
  password: string;
  passwordTips: string;
  coverId?: string;
  orderBy: SortMethod;
  sortIncrease: boolean;
};

export type Item = {
  id: string;
  name: string;
  size: number;
  btime: number;
  mtime: number;
  ext: string;
  tags: string[];
  folders: string[];
  isDeleted: boolean;
  url: string;
  annotation: string;
  modificationTime: number;
  height: number;
  width: number;
  noThumbnail: boolean;
  lastModified: number;
  palettes: Palette[];
  duration: number;
  star: number;
  order: Record<string, number>;
};
