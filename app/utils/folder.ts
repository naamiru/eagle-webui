import type { Folder } from "~/types/models";

export function findFolderById(
  folders: Folder[],
  targetId: string,
): Folder | undefined {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return folder;
    }
    if (folder.children && folder.children.length > 0) {
      const found = findFolderById(folder.children, targetId);
      if (found) {
        return found;
      }
    }
  }
}

export function findParentFolder(
  folders: Folder[],
  targetId: string,
  parent?: Folder,
): Folder | undefined {
  for (const folder of folders) {
    if (folder.id === targetId) {
      return parent;
    }
    if (folder.children && folder.children.length > 0) {
      const found = findParentFolder(folder.children, targetId, folder);
      if (found) {
        return found;
      }
    }
  }
}
