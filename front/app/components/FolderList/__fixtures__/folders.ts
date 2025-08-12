import type { Folder, Item } from "~/types/item";

export const mockImage1: Item = {
  id: "item-1",
  name: "Mock Image 1",
  width: 800,
  height: 600,
  size: 1024000,
  btime: 1640995200000,
  mtime: 1640995300000,
  ext: "jpg",
  star: 0,
  duration: 0,
  manualOrder: 1640995200000,
  globalOrder: 1,
};

export const mockImage2: Item = {
  id: "item-2",
  name: "Mock Image 2",
  width: 1200,
  height: 800,
  size: 2048000,
  btime: 1640995400000,
  mtime: 1640995500000,
  ext: "jpg",
  star: 0,
  duration: 0,
  manualOrder: 1640995400000,
  globalOrder: 2,
};

export const mockEmptyFolder: Folder = {
  id: "folder-101",
  name: "Empty Folder",
  children: [],
  items: [],
  orderBy: "GLOBAL",
  sortIncrease: true,
};

export const mockFolderWithImages: Folder = {
  id: "folder-102",
  name: "Photos",
  children: [],
  items: [],
  coverImage: mockImage1,
  orderBy: "GLOBAL",
  sortIncrease: true,
};

export const mockFolderWithoutCoverImage: Folder = {
  id: "folder-103",
  name: "Photos without Cover",
  children: [],
  items: [],
  coverImage: undefined,
  orderBy: "GLOBAL",
  sortIncrease: true,
};

export const mockLegacyFolder: Folder = {
  id: "folder-104",
  name: "Legacy Folder",
  children: [],
  items: [],
  orderBy: "GLOBAL",
  sortIncrease: true,
};
