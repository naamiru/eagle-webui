import type { Item } from "~/types/item";

export const mockImage1: Item = {
  id: "item-1",
  name: "Test Image 1",
  width: 1600,
  height: 1200,
};

export const mockImage2: Item = {
  id: "item-2",
  name: "Test Image 2",
  width: 800,
  height: 1200,
};

export const mockImage3: Item = {
  id: "item-3",
  name: "Test Image 3",
  width: 1920,
  height: 1080,
};

export const mockImages: Item[] = [mockImage1, mockImage2, mockImage3];
