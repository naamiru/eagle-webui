import type { FolderSortMethod } from "./sort-options";

export type Palette = {
  color: [number, number, number];
  ratio: number;
  $$hashKey?: string;
};

export type FontMetas = {
  numGlyphs?: number;
};

export type Folder = {
  id: string;
  name: string;
  nameForSort: string;
  description: string;
  children: string[];
  parentId?: string;
  manualOrder: number;
  itemCount: number;
  modificationTime: number;
  tags: string[];
  password: string;
  passwordTips: string;
  coverId?: string;
  orderBy: FolderSortMethod;
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
  nameForSort: string;
  modificationTime: number;
  height: number;
  width: number;
  noThumbnail: boolean;
  lastModified: number;
  palettes: Palette[];
  duration: number;
  star: number;
  order: Record<string, number>;
  fontMetas?: FontMetas;
  bpm: number;
  medium: string;
};

export type ItemPreview = {
  id: string;
  duration: number;
  width: number;
  height: number;
  ext: string;
};

export type ItemCounts = {
  all: number;
  uncategorized: number;
  trash: number;
};
