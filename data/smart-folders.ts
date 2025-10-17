import { type SortContext, sortItems } from "./sort-items";
import {
  DEFAULT_GLOBAL_SORT_OPTIONS,
  type FolderSortMethod,
  type GlobalSortOptions,
  isFolderSortMethod,
} from "./sort-options";
import type { Item } from "./types";

type SmartFolderRuleTypeMethod = "equal" | "unequal";
export type SmartFolderNameRuleMethod =
  | "contain"
  | "uncontain"
  | "startWith"
  | "endWith"
  | "equal"
  | "empty"
  | "not-empty"
  | "regex";

export type SmartFolderRule =
  | {
      property: "type";
      method: SmartFolderRuleTypeMethod;
      value: string;
    }
  | {
      property: "name";
      method: SmartFolderNameRuleMethod;
      value?: string;
      regex?: RegExp;
    };

export type SmartFolderCondition = {
  match: "AND" | "OR";
  boolean: "TRUE" | "FALSE";
  rules: SmartFolderRule[];
};

export type SmartFolder = {
  id: string;
  name: string;
  orderBy: FolderSortMethod;
  sortIncrease: boolean;
  itemCount: number;
  coverId?: string;
  conditions: SmartFolderCondition[];
  children: SmartFolder[];
  parentId?: string;
};

export type SmartFolderItemMap = Map<string, string[]>;

type SmartFolderBuildResult = {
  smartFolders: SmartFolder[];
  itemIdMap: SmartFolderItemMap;
};

type SmartFolderRaw = Record<string, unknown>;

type BuildFolderParams = {
  raw: SmartFolderRaw;
  availableItems: Item[];
  globalSort: GlobalSortOptions;
  parentId?: string;
  ancestors: string[];
  itemIdMap: SmartFolderItemMap;
};

const TRUE_FALSE_VALUES = new Set(["TRUE", "FALSE"]);

type BuildFolderResult = {
  folder: SmartFolder;
  itemIds: string[];
};

export function buildSmartFolderTree(
  rawInput: unknown,
  items: Map<string, Item>,
  globalSort: GlobalSortOptions = DEFAULT_GLOBAL_SORT_OPTIONS,
): SmartFolderBuildResult {
  const rawFolders = Array.isArray(rawInput) ? rawInput : [];
  const activeItems = Array.from(items.values()).filter(
    (item) => !item.isDeleted,
  );

  const smartFolders: SmartFolder[] = [];
  const itemIdMap: SmartFolderItemMap = new Map();

  rawFolders.forEach((entry, index) => {
    const raw =
      typeof entry === "object" && entry !== null
        ? (entry as SmartFolderRaw)
        : null;

    if (!raw) {
      logIssue(["root", `#${index}`], "Skipping non-object smart folder entry");
      return;
    }

    const result = buildFolder({
      raw,
      availableItems: activeItems,
      globalSort,
      parentId: undefined,
      ancestors: [],
      itemIdMap,
    });

    if (result) {
      smartFolders.push(result.folder);
    }
  });

  return { smartFolders, itemIdMap };
}

function buildFolder({
  raw,
  availableItems,
  globalSort,
  parentId,
  ancestors,
  itemIdMap,
}: BuildFolderParams): BuildFolderResult | null {
  const idValue = raw.id;
  if (typeof idValue !== "string" || idValue.length === 0) {
    logIssue([...ancestors, "(unknown)"], "Skipping smart folder without id");
    return null;
  }

  const id = idValue;
  const path = [...ancestors, id];

  const name =
    typeof raw.name === "string" && raw.name.length > 0 ? raw.name : id;

  const orderBy = readFolderOrderBy(raw.orderBy);
  const sortIncrease = readSortIncrease(raw.sortIncrease, orderBy, globalSort);
  const rawCoverId =
    typeof raw.coverId === "string" && raw.coverId.length > 0
      ? raw.coverId.toLowerCase()
      : undefined;

  const rawConditions = Array.isArray(raw.conditions) ? raw.conditions : [];
  const conditions = rawConditions
    .map((condition, index) =>
      parseCondition(condition, [...path, `condition#${index}`]),
    )
    .filter(
      (condition): condition is SmartFolderCondition => condition !== null,
    );

  const matchedItems = applyConditions(availableItems, conditions);

  const normalizedOrderBy = orderBy ?? "GLOBAL";
  const resolvedOrderBy =
    normalizedOrderBy === "GLOBAL" ? globalSort.orderBy : normalizedOrderBy;
  const resolvedContext: SortContext = {
    orderBy: resolvedOrderBy,
    sortIncrease,
    folderId: id,
  };

  let sortedItems: Item[];
  try {
    sortedItems = sortItems(matchedItems, resolvedContext);
  } catch (error) {
    logIssue(
      path,
      `Failed to sort smart folder items (${String(
        (error as Error)?.message ?? error,
      )}); defaulting to original order`,
    );
    sortedItems = [...matchedItems];
  }

  const itemIds = sortedItems.map((item) => item.id);
  itemIdMap.set(id, itemIds);

  const rawChildren = Array.isArray(raw.children) ? raw.children : [];
  const childFolders: SmartFolder[] = [];

  rawChildren.forEach((child, index) => {
    if (!child || typeof child !== "object") {
      logIssue(
        [...path, `child#${index}`],
        "Skipping non-object smart folder child",
      );
      return;
    }

    const childResult = buildFolder({
      raw: child as SmartFolderRaw,
      availableItems: matchedItems,
      globalSort,
      parentId: id,
      ancestors: path,
      itemIdMap,
    });

    if (childResult) {
      childFolders.push(childResult.folder);
    }
  });

  const coverId =
    itemIds.length === 0
      ? undefined
      : rawCoverId && itemIds.includes(rawCoverId)
        ? rawCoverId
        : itemIds[0];

  const folder: SmartFolder = {
    id,
    name,
    orderBy: normalizedOrderBy,
    sortIncrease,
    itemCount: itemIds.length,
    coverId,
    conditions,
    children: childFolders,
    parentId,
  };

  return { folder, itemIds };
}

function parseCondition(
  raw: unknown,
  path: string[],
): SmartFolderCondition | null {
  if (!raw || typeof raw !== "object") {
    logIssue(path, "Skipping invalid smart folder condition");
    return null;
  }

  const record = raw as Record<string, unknown>;
  const match =
    record.match === "OR" || record.match === "AND"
      ? (record.match as "AND" | "OR")
      : "AND";
  const boolean =
    typeof record.boolean === "string" && TRUE_FALSE_VALUES.has(record.boolean)
      ? (record.boolean as "TRUE" | "FALSE")
      : "TRUE";

  const rawRules = Array.isArray(record.rules) ? record.rules : [];
  const rules = rawRules
    .map((rule, index) => parseRule(rule, [...path, `rule#${index}`]))
    .filter((rule): rule is SmartFolderRule => rule !== null);

  if (rules.length === 0) {
    return { match, boolean, rules: [] };
  }

  return { match, boolean, rules };
}

function parseRule(raw: unknown, path: string[]): SmartFolderRule | null {
  if (!raw || typeof raw !== "object") {
    logIssue(path, "Skipping invalid smart folder rule");
    return null;
  }

  const record = raw as Record<string, unknown>;
  const property = record.property;
  if (property === "type") {
    const method = record.method;
    if (method !== "equal" && method !== "unequal") {
      logIssue(path, `Unsupported type rule method "${String(method)}"`);
      return null;
    }
    const value = record.value;
    if (typeof value !== "string" || value.length === 0) {
      logIssue(path, "Type rule must provide a non-empty string value");
      return null;
    }
    return {
      property: "type",
      method,
      value: value.toLowerCase(),
    };
  }

  if (property === "name") {
    const method = record.method;
    if (
      method !== "contain" &&
      method !== "uncontain" &&
      method !== "startWith" &&
      method !== "endWith" &&
      method !== "equal" &&
      method !== "empty" &&
      method !== "not-empty" &&
      method !== "regex"
    ) {
      logIssue(path, `Unsupported name rule method "${String(method)}"`);
      return null;
    }

    if (method === "empty" || method === "not-empty") {
      return { property: "name", method };
    }

    const value = record.value;
    if (typeof value !== "string") {
      logIssue(
        path,
        `Name rule method "${method}" requires a string value; received ${typeof value}`,
      );
      return null;
    }

    if (method === "regex") {
      try {
        const regex = new RegExp(value, "i");
        return { property: "name", method, value, regex };
      } catch (error) {
        logIssue(
          path,
          `Invalid regex pattern "${value}": ${String(
            (error as Error)?.message ?? error,
          )}`,
        );
        return null;
      }
    }

    return { property: "name", method, value: value.toLowerCase() };
  }

  logIssue(
    path,
    `Unsupported smart folder rule property "${String(property)}"`,
  );
  return null;
}

function applyConditions(
  items: Item[],
  conditions: SmartFolderCondition[],
): Item[] {
  if (conditions.length === 0) {
    return items;
  }

  return items.filter((item) =>
    conditions.every((condition) => {
      const baseResult =
        condition.match === "AND"
          ? evaluateConditionAll(condition.rules, item)
          : evaluateConditionAny(condition.rules, item);
      return condition.boolean === "FALSE" ? !baseResult : baseResult;
    }),
  );
}

function evaluateConditionAll(rules: SmartFolderRule[], item: Item): boolean {
  if (rules.length === 0) {
    return true;
  }

  return rules.every((rule) => evaluateRule(rule, item));
}

function evaluateConditionAny(rules: SmartFolderRule[], item: Item): boolean {
  if (rules.length === 0) {
    return true;
  }
  return rules.some((rule) => evaluateRule(rule, item));
}

function evaluateRule(rule: SmartFolderRule, item: Item): boolean {
  if (rule.property === "type") {
    const matches = matchesType(item, rule.value);
    return rule.method === "equal" ? matches : !matches;
  }

  const itemName = item.name.toLowerCase();
  switch (rule.method) {
    case "contain":
      return rule.value ? itemName.includes(rule.value) : false;
    case "uncontain":
      return rule.value ? !itemName.includes(rule.value) : true;
    case "startWith":
      return rule.value ? itemName.startsWith(rule.value) : false;
    case "endWith":
      return rule.value ? itemName.endsWith(rule.value) : false;
    case "equal":
      return rule.value ? itemName === rule.value : false;
    case "empty":
      return item.name.length === 0;
    case "not-empty":
      return item.name.length > 0;
    case "regex":
      return rule.regex ? rule.regex.test(item.name) : false;
    default:
      return false;
  }
}

function matchesType(item: Item, value: string): boolean {
  switch (value) {
    case "font":
      return item.fontMetas !== undefined;
    case "video":
      return item.duration > 0;
    case "audio":
      return item.bpm > 0;
    case "youtube":
    case "vimeo":
    case "bilibili":
      return item.medium === value;
    default:
      return item.ext === value;
  }
}

function readFolderOrderBy(value: unknown): FolderSortMethod | undefined {
  if (isFolderSortMethod(value)) {
    return value;
  }
  return undefined;
}

function readSortIncrease(
  value: unknown,
  folderOrderBy: FolderSortMethod | undefined,
  globalSort: GlobalSortOptions,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (folderOrderBy === "GLOBAL" || folderOrderBy === undefined) {
    return globalSort.sortIncrease;
  }

  return true;
}

function logIssue(path: string[], message: string): void {
  const location = path.length > 0 ? path.join(" > ") : "root";
  console.error(`[smart-folders] ${location}: ${message}`);
}
