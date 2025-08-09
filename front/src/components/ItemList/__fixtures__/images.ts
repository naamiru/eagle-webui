import type { Item } from "~/types/item";

export const mockImage1: Item = {
  id: 1,
  original: "https://example.com/image1.jpg",
  thumbnail: "https://example.com/thumb1.jpg",
  width: 1600,
  height: 1200,
};

export const mockImage2: Item = {
  id: 2,
  original: "https://example.com/image2.jpg",
  thumbnail: "https://example.com/thumb2.jpg",
  width: 800,
  height: 1200,
};

export const mockImage3: Item = {
  id: 3,
  original: "https://example.com/image3.jpg",
  thumbnail: "https://example.com/thumb3.jpg",
  width: 1920,
  height: 1080,
};

export const mockImages: Item[] = [mockImage1, mockImage2, mockImage3];
