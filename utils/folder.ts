import type { Folder, Item, FolderOrderBy } from "@/types/models";

type NameSegment = string | number;

function parseNameForSorting(name: string): NameSegment[] {
  const segments: NameSegment[] = [];
  let current = "";
  let isNumber = false;

  for (let i = 0; i < name.length; i++) {
    const char = name[i];
    const charIsNumber = /[0-9]/.test(char);

    if (charIsNumber !== isNumber) {
      if (current) {
        segments.push(isNumber ? parseInt(current, 10) : current);
      }
      current = char;
      isNumber = charIsNumber;
    } else {
      current += char;
    }
  }

  if (current) {
    segments.push(isNumber ? parseInt(current, 10) : current);
  }

  return segments;
}

function compareNameSegments(a: NameSegment[], b: NameSegment[]): number {
  const maxLength = Math.max(a.length, b.length);

  for (let i = 0; i < maxLength; i++) {
    const segA = a[i];
    const segB = b[i];

    if (segA === undefined) return -1;
    if (segB === undefined) return 1;

    const aIsNumber = typeof segA === "number";
    const bIsNumber = typeof segB === "number";

    if (aIsNumber && bIsNumber) {
      const diff = segA - segB;
      if (diff !== 0) return diff;
    } else if (aIsNumber && !bIsNumber) {
      return -1;
    } else if (!aIsNumber && bIsNumber) {
      return 1;
    } else {
      const diff = (segA as string).localeCompare(segB as string);
      if (diff !== 0) return diff;
    }
  }

  return 0;
}

export function findFolderById(
  folders: Folder[],
  targetId: string
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
  parent?: Folder
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
  sortIncrease: boolean
): Item[] {
  const sorted = [...items];

  if (orderBy === "GLOBAL") {
    sorted.sort((a, b) =>
      sortIncrease
        ? a.globalOrder - b.globalOrder
        : b.globalOrder - a.globalOrder
    );
    return sorted;
  }

  if (orderBy === "RANDOM") {
    return sorted.sort(() => Math.random() - 0.5);
  }

  const getCompareFunction = (): ((a: Item, b: Item) => number) => {
    const primaryCompare = (() => {
      switch (orderBy) {
        case "MANUAL":
          return (a: Item, b: Item) => b.manualOrder - a.manualOrder;
        case "NAME":
          return (a: Item, b: Item) => {
            const segmentsA = parseNameForSorting(a.name);
            const segmentsB = parseNameForSorting(b.name);
            return compareNameSegments(segmentsA, segmentsB);
          };
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

export function sortFolders(
  folders: Folder[],
  orderBy: FolderOrderBy,
  sortIncrease: boolean
): Folder[] {
  const sorted = [...folders];

  if (orderBy === "RANDOM") {
    return sorted.sort(() => Math.random() - 0.5);
  }

  const getCompareFunction = (): ((a: Folder, b: Folder) => number) => {
    const primaryCompare = (() => {
      switch (orderBy) {
        case "NAME":
          return (a: Folder, b: Folder) => {
            const segmentsA = parseNameForSorting(a.name);
            const segmentsB = parseNameForSorting(b.name);
            return compareNameSegments(segmentsA, segmentsB);
          };
        case "IMPORT":
          return (a: Folder, b: Folder) => b.modificationTime - a.modificationTime;
        case "DEFAULT":
        default:
          return (a: Folder, b: Folder) => a.defaultOrder - b.defaultOrder;
      }
    })();

    return (a: Folder, b: Folder) => {
      const primary = primaryCompare(a, b);
      if (primary !== 0) {
        return sortIncrease ? primary : -primary;
      }
      // Secondary sort by defaultOrder if primary is equal
      const secondary = a.defaultOrder - b.defaultOrder;
      return sortIncrease ? secondary : -secondary;
    };
  };

  sorted.sort(getCompareFunction());
  return sorted;
}
