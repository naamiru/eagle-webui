import {
  type FolderSortMethod,
  type FolderSortOptions,
  NEWEST_FIRST_METHODS,
} from "./sort-options";
import type { Item } from "./types";

export type SortContext = FolderSortOptions & {
  folderId?: string;
};

export function sortItems(
  items: readonly Item[],
  context: SortContext,
): Item[] {
  const { orderBy, sortIncrease } = context;

  if (orderBy === "GLOBAL") {
    throw new Error("sortItems received unresolved GLOBAL orderBy");
  }

  const sorted = [...items];

  if (orderBy === "RANDOM") {
    shuffle(sorted);
    return sorted;
  }

  const direction = getDirectionMultiplier(orderBy, sortIncrease);

  sorted.sort((left, right) => {
    const comparison = compareByMethod(left, right, orderBy, context.folderId);
    if (comparison !== 0) {
      return comparison * direction;
    }

    return left.id.localeCompare(right.id, undefined, { sensitivity: "base" });
  });

  return sorted;
}

function compareByMethod(
  left: Item,
  right: Item,
  orderBy: Exclude<FolderSortMethod, "GLOBAL">,
  folderId?: string,
): number {
  switch (orderBy) {
    case "MANUAL":
      return compareNumbers(
        getManualPosition(left, folderId),
        getManualPosition(right, folderId),
      );
    case "IMPORT":
      return compareNumbers(left.modificationTime, right.modificationTime);
    case "MTIME":
      return compareNumbers(left.mtime, right.mtime);
    case "BTIME":
      return compareNumbers(left.btime, right.btime);
    case "FILESIZE":
      return compareNumbers(left.size, right.size);
    case "RESOLUTION":
      return compareNumbers(
        left.width * left.height,
        right.width * right.height,
      );
    case "RATING":
      return compareNumbers(left.star, right.star);
    case "DURATION":
      return compareNumbers(left.duration, right.duration);
    case "NAME":
      return compareStrings(left.nameForSort, right.nameForSort);
    case "EXT":
      return compareStrings(left.ext, right.ext);
    case "RANDOM":
      // Should be returned before reaching comparator.
      return 0;
    default:
      return 0;
  }
}

function getManualPosition(item: Item, folderId?: string): number {
  if (!folderId) {
    return item.modificationTime;
  }

  const manualValue = item.order[folderId];
  if (typeof manualValue === "number" && Number.isFinite(manualValue)) {
    return manualValue;
  }

  return item.modificationTime;
}

function compareNumbers(left: number, right: number): number {
  if (left === right) {
    return 0;
  }

  return left < right ? -1 : 1;
}

function compareStrings(left: string, right: string): number {
  return left.localeCompare(right, undefined, { sensitivity: "base" });
}

function getDirectionMultiplier(
  orderBy: FolderSortMethod,
  sortIncrease: boolean,
): number {
  if (NEWEST_FIRST_METHODS.has(orderBy)) {
    return sortIncrease ? -1 : 1;
  }

  return sortIncrease ? 1 : -1;
}

function shuffle<T>(list: T[]): void {
  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const temp = list[index];
    list[index] = list[swapIndex];
    list[swapIndex] = temp;
  }
}
