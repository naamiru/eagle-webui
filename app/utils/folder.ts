import type { Folder, Item } from '@/app/types/models';

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

export function sortItems(
  items: Item[],
  orderBy: string,
  sortIncrease: boolean,
): Item[] {
  const sorted = [...items];

  if (orderBy === "GLOBAL") {
    sorted.sort((a, b) =>
      sortIncrease
        ? a.globalOrder - b.globalOrder
        : b.globalOrder - a.globalOrder,
    );
    return sorted;
  }

  const getCompareFunction = (): ((a: Item, b: Item) => number) => {
    const primaryCompare = (() => {
      switch (orderBy) {
        case "MANUAL":
          return (a: Item, b: Item) => b.manualOrder - a.manualOrder;
        case "NAME":
          return (a: Item, b: Item) => a.name.localeCompare(b.name);
        case "SIZE":
        case "FILESIZE":
          return (a: Item, b: Item) => a.size - b.size;
        case "RESOLUTION":
          return (a: Item, b: Item) => a.width * a.height - b.width * b.height;
        case "RATING":
          return (a: Item, b: Item) => a.star - b.star;
        case "DURATION":
          return (a: Item, b: Item) => a.duration - b.duration;
        case "EXT":
          return (a: Item, b: Item) => a.ext.localeCompare(b.ext);
        case "IMPORT":
        case "BTIME":
          return (a: Item, b: Item) => b.btime - a.btime;
        case "MTIME":
          return (a: Item, b: Item) => b.mtime - a.mtime;
        default:
          return (a: Item, b: Item) => a.globalOrder - b.globalOrder;
      }
    })();

    return (a: Item, b: Item) => {
      const primary = primaryCompare(a, b);
      if (primary !== 0) {
        return sortIncrease ? primary : -primary;
      }
      const secondary = a.globalOrder - b.globalOrder;
      return sortIncrease ? secondary : -secondary;
    };
  };

  sorted.sort(getCompareFunction());
  return sorted;
}