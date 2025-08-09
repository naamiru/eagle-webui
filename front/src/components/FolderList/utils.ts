import type { Folder, Item } from "~/types/item";

export function findFirstImage(folder: Folder): Item | undefined {
  // First, look for direct images in the folder
  if (folder.items.length > 0) {
    return folder.items[0];
  }

  // If no direct images found, recursively search child folders
  for (const child of folder.children) {
    const nestedImage = findFirstImage(child);
    if (nestedImage) {
      return nestedImage;
    }
  }

  return undefined;
}

export function getFolderThumbnail(folder: Folder): string | undefined {
  const firstImage = findFirstImage(folder);
  return firstImage?.thumbnail;
}
