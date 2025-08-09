import type { Folder, Item } from "~/types/item";

export const mockImage1: Item = {
  id: "item-1",
  original: "https://example.com/image1.jpg",
  thumbnail: "https://example.com/thumb1.jpg",
  width: 800,
  height: 600,
};

export const mockImage2: Item = {
  id: "item-2",
  original: "https://example.com/image2.jpg",
  thumbnail: "https://example.com/thumb2.jpg",
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
  items: [mockImage1, mockImage2],
};
