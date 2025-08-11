import type { Folder, Item } from "~/types/item";

export const mockImage1: Item = {
  id: "item-1",
  name: "Mock Image 1",
  width: 800,
  height: 600,
};

export const mockImage2: Item = {
  id: "item-2",
  name: "Mock Image 2",
  width: 1200,
  height: 800,
};

export const mockEmptyFolder: Folder = {
  id: "folder-101",
  name: "Empty Folder",
  children: [],
  items: [],
};

export const mockFolderWithImages: Folder = {
  id: "folder-102",
  name: "Photos",
  children: [],
  items: [],
  coverImage: mockImage1,
};

export const mockFolderWithoutCoverImage: Folder = {
  id: "folder-103",
  name: "Photos without Cover",
  children: [],
  items: [],
  coverImage: undefined,
};

export const mockLegacyFolder: Folder = {
  id: "folder-104",
  name: "Legacy Folder",
  children: [],
  items: [],
};
