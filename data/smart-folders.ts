import { type SortContext, sortItems } from "./sort-items";
import {
  DEFAULT_GLOBAL_SORT_OPTIONS,
  type FolderSortMethod,
  type GlobalSortOptions,
  isFolderSortMethod,
} from "./sort-options";
import type { Folder, Item } from "./types";

type SmartFolderRuleTypeMethod = "equal" | "unequal";
type SmartFolderTextMethod =
  | "contain"
  | "uncontain"
  | "startWith"
  | "endWith"
  | "equal"
  | "empty"
  | "not-empty"
  | "regex";
type SmartFolderCollectionMethod =
  | "union"
  | "intersection"
  | "equal"
  | "identity"
  | "empty"
  | "not-empty";
type SmartFolderDateMethod = "before" | "after" | "between" | "on" | "within";
type SmartFolderNumberMethod = ">" | ">=" | "=" | "<" | "<=" | "between";

type SmartFolderTypeRule = {
  property: "type";
  method: SmartFolderRuleTypeMethod;
  value: string;
};

type SmartFolderTextRule = {
  property: "name" | "url" | "annotation" | "folderName" | "comments";
  method: SmartFolderTextMethod;
  value?: string;
  normalizedValue?: string;
  regex?: RegExp;
};

type SmartFolderCollectionRule = {
  property: "tags" | "folders";
  method: SmartFolderCollectionMethod;
  values?: Set<string>;
};

type SmartFolderColorRule = {
  property: "color";
  method: "similar" | "accuracy" | "grayscale";
  target?: [number, number, number];
};

type SmartFolderDateRule = {
  property: "createTime" | "mtime" | "btime";
  method: SmartFolderDateMethod;
  values: number[];
};

type SmartFolderNumberRule = {
  property: "width" | "height" | "fileSize" | "duration" | "bpm";
  method: SmartFolderNumberMethod;
  values: number[];
};

type SmartFolderShapeValue =
  | { kind: "landscape" }
  | { kind: "portrait" }
  | { kind: "square" }
  | { kind: "panoramic-landscape" }
  | { kind: "panoramic-portrait" }
  | { kind: "custom"; width: number; height: number };

type SmartFolderShapeRule = {
  property: "shape";
  method: "equal" | "unequal";
  value: SmartFolderShapeValue;
};

type SmartFolderRatingRule = {
  property: "rating";
  method: "equal" | "unequal" | "contain";
  value?: string;
};

type SmartFolderFontActivatedRule = {
  property: "fontActivated";
  method: "activate" | "deactivate";
};

export type SmartFolderRule =
  | SmartFolderTypeRule
  | SmartFolderTextRule
  | SmartFolderCollectionRule
  | SmartFolderColorRule
  | SmartFolderDateRule
  | SmartFolderNumberRule
  | SmartFolderShapeRule
  | SmartFolderRatingRule
  | SmartFolderFontActivatedRule;

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

export type SmartFolderBuildOptions = {
  folders?: Map<string, Folder>;
  now?: number;
};

type RuleContext = {
  now: number;
  folders: Map<string, Folder>;
  folderNames: Map<string, string>;
};

type BuildFolderParams = {
  raw: SmartFolderRaw;
  availableItems: Item[];
  globalSort: GlobalSortOptions;
  parentId?: string;
  ancestors: string[];
  itemIdMap: SmartFolderItemMap;
  context: RuleContext;
};

const DAY_MS = 86_400_000;
const COLOR_THRESHOLD_SIMILAR = 150;
const COLOR_THRESHOLD_ACCURACY = 100;

type BuildFolderResult = {
  folder: SmartFolder;
  itemIds: string[];
};

export function buildSmartFolderTree(
  rawInput: unknown,
  items: Map<string, Item>,
  globalSort: GlobalSortOptions = DEFAULT_GLOBAL_SORT_OPTIONS,
  options: SmartFolderBuildOptions = {},
): SmartFolderBuildResult {
  const rawFolders = Array.isArray(rawInput) ? rawInput : [];
  const activeItems = Array.from(items.values()).filter(
    (item) => !item.isDeleted,
  );

  const folders = options.folders ?? new Map<string, Folder>();
  const folderNames = new Map<string, string>();
  folders.forEach((folder, id) => {
    const name =
      typeof folder.name === "string" && folder.name.length > 0
        ? folder.name
        : id;
    folderNames.set(id, name);
  });

  const context: RuleContext = {
    now: typeof options.now === "number" ? options.now : Date.now(),
    folders,
    folderNames,
  };

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
      context,
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
  context,
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

  const matchedItems = applyConditions(availableItems, conditions, context);

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
      context,
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
  const boolean: "TRUE" | "FALSE" =
    record.boolean === "FALSE"
      ? "FALSE"
      : record.boolean === "TRUE"
        ? "TRUE"
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
    const value = toStringValue(record.value);
    if (!value) {
      logIssue(path, "Type rule must provide a non-empty value");
      return null;
    }
    return { property: "type", method, value: value.toLowerCase() };
  }

  if (
    property === "name" ||
    property === "url" ||
    property === "annotation" ||
    property === "folderName" ||
    property === "comments"
  ) {
    return parseTextRule(property, record, path);
  }

  if (property === "tags" || property === "folders") {
    return parseCollectionRule(property, record, path);
  }

  if (property === "color") {
    return parseColorRule(record, path);
  }

  if (
    property === "createTime" ||
    property === "mtime" ||
    property === "btime"
  ) {
    return parseDateRule(property, record, path);
  }

  if (
    property === "width" ||
    property === "height" ||
    property === "fileSize" ||
    property === "duration" ||
    property === "bpm"
  ) {
    return parseNumberRule(property, record, path);
  }

  if (property === "shape") {
    return parseShapeRule(record, path);
  }

  if (property === "rating") {
    return parseRatingRule(record, path);
  }

  if (property === "fontActivated") {
    return parseFontActivatedRule(record, path);
  }

  logIssue(
    path,
    `Unsupported smart folder rule property "${String(property)}"`,
  );
  return null;
}

const TEXT_METHODS = new Set<SmartFolderTextMethod>([
  "contain",
  "uncontain",
  "startWith",
  "endWith",
  "equal",
  "empty",
  "not-empty",
  "regex",
]);

const COLLECTION_METHODS = new Set<SmartFolderCollectionMethod>([
  "union",
  "intersection",
  "equal",
  "identity",
  "empty",
  "not-empty",
]);

const DATE_METHODS = new Set<SmartFolderDateMethod>([
  "before",
  "after",
  "between",
  "on",
  "within",
]);

const NUMBER_METHODS = new Set<SmartFolderNumberMethod>([
  ">",
  ">=",
  "=",
  "<",
  "<=",
  "between",
]);

function isTextMethod(value: unknown): value is SmartFolderTextMethod {
  return (
    typeof value === "string" &&
    TEXT_METHODS.has(value as SmartFolderTextMethod)
  );
}

function isCollectionMethod(
  value: unknown,
): value is SmartFolderCollectionMethod {
  return (
    typeof value === "string" &&
    COLLECTION_METHODS.has(value as SmartFolderCollectionMethod)
  );
}

function isDateMethod(value: unknown): value is SmartFolderDateMethod {
  return (
    typeof value === "string" &&
    DATE_METHODS.has(value as SmartFolderDateMethod)
  );
}

function isNumberMethod(value: unknown): value is SmartFolderNumberMethod {
  return (
    typeof value === "string" &&
    NUMBER_METHODS.has(value as SmartFolderNumberMethod)
  );
}

function toStringValue(value: unknown): string | null {
  if (typeof value === "string") {
    return value.length > 0 ? value : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return null;
}

function normalizeText(value: string | number): string {
  if (typeof value === "string") {
    return value.toLowerCase();
  }
  return String(value).toLowerCase();
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const result: string[] = [];
  value.forEach((entry) => {
    if (typeof entry === "string") {
      if (entry.length > 0) {
        result.push(entry);
      }
      return;
    }
    if (typeof entry === "number" && Number.isFinite(entry)) {
      result.push(String(entry));
    }
  });
  return result;
}

function toStringSet(values: string[]): Set<string> {
  return new Set(values);
}

function hasIntersection<T>(a: Set<T>, b: Set<T>): boolean {
  for (const value of a) {
    if (b.has(value)) {
      return true;
    }
  }
  return false;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return null;
}

function readNumberList(value: unknown): number[] {
  if (Array.isArray(value)) {
    const numbers: number[] = [];
    value.forEach((entry) => {
      const num = coerceNumber(entry);
      if (num !== null) {
        numbers.push(num);
      }
    });
    return numbers;
  }

  const single = coerceNumber(value);
  return single !== null ? [single] : [];
}

function parseTextRule(
  property: SmartFolderTextRule["property"],
  record: Record<string, unknown>,
  path: string[],
): SmartFolderTextRule | null {
  const method = record.method;
  if (!isTextMethod(method)) {
    logIssue(path, `Unsupported ${property} rule method "${String(method)}"`);
    return null;
  }

  if (method === "empty" || method === "not-empty") {
    return { property, method };
  }

  const rawValue = record.value;
  const stringValue = toStringValue(rawValue);
  if (!stringValue) {
    logIssue(
      path,
      `${property} rule method "${method}" requires a string value`,
    );
    return null;
  }

  if (method === "regex") {
    try {
      const regex = new RegExp(stringValue, "i");
      return { property, method, value: stringValue, regex };
    } catch (error) {
      logIssue(
        path,
        `Invalid regex pattern "${stringValue}": ${String(
          (error as Error)?.message ?? error,
        )}`,
      );
      return null;
    }
  }

  return {
    property,
    method,
    value: stringValue,
    normalizedValue: normalizeText(stringValue),
  };
}

function parseCollectionRule(
  property: SmartFolderCollectionRule["property"],
  record: Record<string, unknown>,
  path: string[],
): SmartFolderCollectionRule | null {
  const method = record.method;
  if (!isCollectionMethod(method)) {
    logIssue(path, `Unsupported ${property} rule method "${String(method)}"`);
    return null;
  }

  if (method === "empty" || method === "not-empty") {
    return { property, method };
  }

  const values = normalizeStringArray(record.value);
  if (values.length === 0) {
    logIssue(path, `${property} rule method "${method}" requires values`);
    return null;
  }

  return { property, method, values: toStringSet(values) };
}

function parseColorRule(
  record: Record<string, unknown>,
  path: string[],
): SmartFolderColorRule | null {
  const method = record.method;
  if (method === "grayscale") {
    return { property: "color", method };
  }

  if (method !== "similar" && method !== "accuracy") {
    logIssue(path, `Unsupported color rule method "${String(method)}"`);
    return null;
  }

  const stringValue = toStringValue(record.value);
  if (!stringValue) {
    logIssue(path, `Color rule method "${method}" requires a value`);
    return null;
  }

  const color = parseHexColor(stringValue);
  if (!color) {
    logIssue(path, `Color rule received invalid hex value "${stringValue}"`);
    return null;
  }

  return { property: "color", method, target: color };
}

function parseDateRule(
  property: SmartFolderDateRule["property"],
  record: Record<string, unknown>,
  path: string[],
): SmartFolderDateRule | null {
  const method = record.method;
  if (!isDateMethod(method)) {
    logIssue(path, `Unsupported ${property} rule method "${String(method)}"`);
    return null;
  }

  const values = readNumberList(record.value);
  if (method === "within") {
    if (values.length === 0) {
      logIssue(path, `${property} within rule requires a numeric value`);
      return null;
    }
    return { property, method, values: [values[0] ?? 0] };
  }

  if (values.length === 0) {
    logIssue(
      path,
      `${property} rule method "${method}" requires numeric values`,
    );
    return null;
  }

  if (method === "between") {
    if (values.length < 2) {
      logIssue(path, `${property} between rule requires at least two values`);
      return null;
    }
    const start = values[0] ?? 0;
    const end = values[1] ?? 0;
    if (start > end) {
      logIssue(path, `${property} between rule has start greater than end`);
      return null;
    }
    return { property, method, values: [start, end] };
  }

  return { property, method, values: [values[0] ?? 0] };
}

function parseNumberRule(
  property: SmartFolderNumberRule["property"],
  record: Record<string, unknown>,
  path: string[],
): SmartFolderNumberRule | null {
  const method = record.method;
  if (!isNumberMethod(method)) {
    logIssue(path, `Unsupported ${property} rule method "${String(method)}"`);
    return null;
  }

  const values = readNumberList(record.value);
  if (method === "between") {
    if (values.length < 2) {
      logIssue(path, `${property} between rule requires at least two values`);
      return null;
    }
  } else if (values.length === 0) {
    logIssue(
      path,
      `${property} rule method "${method}" requires a numeric value`,
    );
    return null;
  }

  switch (property) {
    case "fileSize": {
      const unitValue =
        typeof record.unit === "string" ? record.unit.toLowerCase() : "";
      const multiplier =
        unitValue === "kb"
          ? 1024
          : unitValue === "mb"
            ? 1024 * 1024
            : unitValue === "gb"
              ? 1024 * 1024 * 1024
              : null;
      if (!multiplier) {
        logIssue(path, "fileSize rule requires unit to be kb, mb, or gb");
        return null;
      }
      const scaled = values.map((value) => value * multiplier);
      return {
        property,
        method,
        values: method === "between" ? scaled.slice(0, 2) : [scaled[0] ?? 0],
      };
    }
    case "duration": {
      const unitValue =
        typeof record.unit === "string" ? record.unit.toLowerCase() : "";
      const multiplier =
        unitValue === "h"
          ? 3600
          : unitValue === "m"
            ? 60
            : unitValue === "s"
              ? 1
              : null;
      if (!multiplier) {
        logIssue(path, "duration rule requires unit to be s, m, or h");
        return null;
      }
      const scaled = values.map((value) => value * multiplier);
      return {
        property,
        method,
        values: method === "between" ? scaled.slice(0, 2) : [scaled[0] ?? 0],
      };
    }
    default: {
      return {
        property,
        method,
        values: method === "between" ? values.slice(0, 2) : [values[0] ?? 0],
      };
    }
  }
}

function parseShapeRule(
  record: Record<string, unknown>,
  path: string[],
): SmartFolderShapeRule | null {
  const method = record.method;
  if (method !== "equal" && method !== "unequal") {
    logIssue(path, `Unsupported shape rule method "${String(method)}"`);
    return null;
  }

  const value = record.value;
  if (typeof value !== "string") {
    logIssue(path, "Shape rule requires a string value");
    return null;
  }

  switch (value) {
    case "landscape":
    case "portrait":
    case "square":
    case "panoramic-landscape":
    case "panoramic-portrait":
      return { property: "shape", method, value: { kind: value } };
    case "custom": {
      const width = coerceNumber(record.width);
      const height = coerceNumber(record.height);
      if (width === null || height === null) {
        logIssue(path, "Shape custom rule requires width and height numbers");
        return null;
      }
      return {
        property: "shape",
        method,
        value: { kind: "custom", width, height },
      };
    }
    default:
      logIssue(path, `Unsupported shape value "${value}"`);
      return null;
  }
}

function parseRatingRule(
  record: Record<string, unknown>,
  path: string[],
): SmartFolderRatingRule | null {
  const method = record.method;
  if (method !== "equal" && method !== "unequal" && method !== "contain") {
    logIssue(path, `Unsupported rating rule method "${String(method)}"`);
    return null;
  }

  if (method === "equal" || method === "unequal" || method === "contain") {
    const stringValue = toStringValue(record.value);
    if (!stringValue) {
      logIssue(path, `Rating rule method "${method}" requires a value`);
      return null;
    }
    return { property: "rating", method, value: stringValue };
  }

  return { property: "rating", method };
}

function parseFontActivatedRule(
  record: Record<string, unknown>,
  path: string[],
): SmartFolderFontActivatedRule | null {
  const method = record.method;
  if (method !== "activate" && method !== "deactivate") {
    logIssue(path, `Unsupported fontActivated rule method "${String(method)}"`);
    return null;
  }

  logIssue(
    path,
    `fontActivated ${method} rule cannot be evaluated; treating as font presence`,
  );

  return { property: "fontActivated", method };
}

function parseHexColor(value: string): [number, number, number] | null {
  const match = value.match(/^\s*#?([0-9a-fA-F]{6})\s*$/);
  if (!match) {
    return null;
  }
  const hex = match[1] ?? "";
  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  return [r, g, b];
}

function matchesTextRule(
  rule: SmartFolderTextRule,
  candidate: string,
): boolean {
  switch (rule.method) {
    case "empty":
      return candidate.length === 0;
    case "not-empty":
      return candidate.length > 0;
    case "regex":
      return rule.regex ? rule.regex.test(candidate) : false;
    case "contain":
      return rule.normalizedValue
        ? candidate.toLowerCase().includes(rule.normalizedValue)
        : false;
    case "uncontain":
      return rule.normalizedValue
        ? !candidate.toLowerCase().includes(rule.normalizedValue)
        : true;
    case "startWith":
      return rule.normalizedValue
        ? candidate.toLowerCase().startsWith(rule.normalizedValue)
        : false;
    case "endWith":
      return rule.normalizedValue
        ? candidate.toLowerCase().endsWith(rule.normalizedValue)
        : false;
    case "equal":
      return rule.normalizedValue
        ? candidate.toLowerCase() === rule.normalizedValue
        : false;
    default:
      return false;
  }
}

function matchesFolderNameRule(
  rule: SmartFolderTextRule,
  item: Item,
  context: RuleContext,
): boolean {
  const folderIds = Array.isArray(item.folders) ? item.folders : [];
  const names = folderIds
    .map((id) => context.folderNames.get(id))
    .filter((name): name is string => typeof name === "string");

  if (rule.method === "empty") {
    return names.length === 0;
  }
  if (rule.method === "not-empty") {
    return names.length > 0;
  }

  return names.some((name) => matchesTextRule(rule, name));
}

function matchesCommentRule(rule: SmartFolderTextRule, item: Item): boolean {
  const comments = item.comments ?? [];
  if (rule.method === "empty") {
    return comments.length === 0;
  }
  if (rule.method === "not-empty") {
    return comments.length > 0;
  }

  return comments.some((comment) =>
    matchesTextRule(rule, comment.annotation ?? ""),
  );
}

function matchesCollectionRule(
  rule: SmartFolderCollectionRule,
  source: string[],
): boolean {
  if (rule.method === "empty") {
    return source.length === 0;
  }
  if (rule.method === "not-empty") {
    return source.length > 0;
  }

  if (!rule.values || rule.values.size === 0) {
    return false;
  }

  const itemSet = toStringSet(source);

  switch (rule.method) {
    case "union":
      return hasIntersection(rule.values, itemSet);
    case "intersection":
      for (const value of rule.values) {
        if (!itemSet.has(value)) {
          return false;
        }
      }
      return true;
    case "equal":
      if (itemSet.size !== rule.values.size) {
        return false;
      }
      for (const value of rule.values) {
        if (!itemSet.has(value)) {
          return false;
        }
      }
      return true;
    case "identity":
      for (const value of rule.values) {
        if (itemSet.has(value)) {
          return false;
        }
      }
      return true;
    default:
      return false;
  }
}

function matchesColorRule(rule: SmartFolderColorRule, item: Item): boolean {
  const palettes = Array.isArray(item.palettes) ? item.palettes : [];
  if (palettes.length === 0) {
    return false;
  }

  if (rule.method === "grayscale") {
    return palettes.every((palette) => {
      if (!palette || !Array.isArray(palette.color)) {
        return false;
      }
      const [r, g, b] = palette.color as [number, number, number];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      return max - min <= 8;
    });
  }

  const target = rule.target;
  if (!target) {
    return false;
  }

  let totalWeight = 0;
  let weightedDistance = 0;

  palettes.forEach((palette) => {
    if (!palette || !Array.isArray(palette.color)) {
      return;
    }
    const [r, g, b] = palette.color as [number, number, number];
    const ratio = coerceNumber(palette.ratio);
    if (ratio === null) {
      return;
    }
    const weight = Math.max(0, Math.min(1, ratio / 100));
    if (weight <= 0) {
      return;
    }

    const distance = redmeanDistance(target, [r, g, b]);
    totalWeight += weight;
    weightedDistance += distance * weight;
  });

  if (totalWeight <= 0) {
    return false;
  }

  const threshold =
    rule.method === "similar"
      ? COLOR_THRESHOLD_SIMILAR
      : rule.method === "accuracy"
        ? COLOR_THRESHOLD_ACCURACY
        : Infinity;

  return weightedDistance < threshold;
}

function matchesDateRule(
  rule: SmartFolderDateRule,
  subject: number,
  context: RuleContext,
): boolean {
  if (!Number.isFinite(subject)) {
    return false;
  }

  switch (rule.method) {
    case "before":
      return subject < (rule.values[0] ?? 0) + DAY_MS;
    case "after":
      return subject >= (rule.values[0] ?? 0);
    case "between": {
      const start = rule.values[0] ?? 0;
      const end = rule.values[1] ?? start;
      return subject >= start && subject < end + DAY_MS;
    }
    case "on": {
      const day = rule.values[0] ?? 0;
      return subject >= day && subject < day + DAY_MS;
    }
    case "within": {
      const days = rule.values[0] ?? 0;
      if (!Number.isFinite(days)) {
        return false;
      }
      if (days <= 0) {
        return true;
      }
      const cutoff = context.now - days * DAY_MS;
      return subject >= cutoff;
    }
    default:
      return false;
  }
}

function matchesNumberRule(
  rule: SmartFolderNumberRule,
  subject: number,
): boolean {
  if (!Number.isFinite(subject)) {
    return false;
  }

  if (
    (rule.property === "duration" || rule.property === "bpm") &&
    subject <= 0
  ) {
    return false;
  }

  return compareNumber(rule.method, subject, rule.values);
}

function matchesShapeRule(rule: SmartFolderShapeRule, item: Item): boolean {
  const width = item.width;
  const height = item.height;
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return false;
  }

  const baseResult = shapeMatches(rule.value, width, height);
  return rule.method === "equal" ? baseResult : !baseResult;
}

function shapeMatches(
  value: SmartFolderShapeValue,
  width: number,
  height: number,
): boolean {
  switch (value.kind) {
    case "landscape":
      return width > height;
    case "portrait":
      return height > width;
    case "square":
      return Math.abs(width - height) <= 1;
    case "panoramic-landscape":
      return width >= height * 2;
    case "panoramic-portrait":
      return height >= width * 2;
    case "custom":
      return width === value.width && height === value.height;
    default:
      return false;
  }
}

function matchesRatingRule(rule: SmartFolderRatingRule, item: Item): boolean {
  const itemValue = String(item.star ?? "");
  const ruleValue = rule.value ?? "";

  switch (rule.method) {
    case "equal":
      return ruleValue.length > 0 && itemValue === ruleValue;
    case "unequal":
      return ruleValue.length > 0 && itemValue !== ruleValue;
    case "contain":
      return ruleValue.length > 0 ? itemValue.includes(ruleValue) : false;
    default:
      return false;
  }
}

function matchesFontActivatedRule(
  _rule: SmartFolderFontActivatedRule,
  item: Item,
): boolean {
  return item.fontMetas !== undefined;
}

function compareNumber(
  method: SmartFolderNumberMethod,
  subject: number,
  values: number[],
): boolean {
  const first = values[0] ?? 0;
  switch (method) {
    case ">":
      return subject > first;
    case ">=":
      return subject >= first;
    case "=":
      return subject === first;
    case "<":
      return subject < first;
    case "<=":
      return subject <= first;
    case "between": {
      const second = values[1] ?? first;
      const min = Math.min(first, second);
      const max = Math.max(first, second);
      return subject >= min && subject <= max;
    }
    default:
      return false;
  }
}

function redmeanDistance(
  target: [number, number, number],
  candidate: [number, number, number],
): number {
  const [r1, g1, b1] = target;
  const [r2, g2, b2] = candidate;
  const rBar = (r1 + r2) / 2;
  const deltaR = r1 - r2;
  const deltaG = g1 - g2;
  const deltaB = b1 - b2;
  return Math.sqrt(
    (2 + rBar / 256) * deltaR * deltaR +
      4 * deltaG * deltaG +
      (2 + (255 - rBar) / 256) * deltaB * deltaB,
  );
}

function applyConditions(
  items: Item[],
  conditions: SmartFolderCondition[],
  context: RuleContext,
): Item[] {
  if (conditions.length === 0) {
    return items;
  }

  return items.filter((item) =>
    conditions.every((condition) => {
      const baseResult =
        condition.match === "AND"
          ? evaluateConditionAll(condition.rules, item, context)
          : evaluateConditionAny(condition.rules, item, context);
      return condition.boolean === "FALSE" ? !baseResult : baseResult;
    }),
  );
}

function evaluateConditionAll(
  rules: SmartFolderRule[],
  item: Item,
  context: RuleContext,
): boolean {
  if (rules.length === 0) {
    return true;
  }

  return rules.every((rule) => evaluateRule(rule, item, context));
}

function evaluateConditionAny(
  rules: SmartFolderRule[],
  item: Item,
  context: RuleContext,
): boolean {
  if (rules.length === 0) {
    return true;
  }
  return rules.some((rule) => evaluateRule(rule, item, context));
}
function evaluateRule(
  rule: SmartFolderRule,
  item: Item,
  context: RuleContext,
): boolean {
  switch (rule.property) {
    case "type": {
      const matches = matchesType(item, rule.value);
      return rule.method === "equal" ? matches : !matches;
    }
    case "name":
      return matchesTextRule(rule, item.name);
    case "url":
      return matchesTextRule(rule, item.url ?? "");
    case "annotation":
      return matchesTextRule(rule, item.annotation ?? "");
    case "folderName":
      return matchesFolderNameRule(rule, item, context);
    case "comments":
      return matchesCommentRule(rule, item);
    case "tags":
      return matchesCollectionRule(rule, item.tags ?? []);
    case "folders":
      return matchesCollectionRule(rule, item.folders ?? []);
    case "color":
      return matchesColorRule(rule, item);
    case "createTime":
      return matchesDateRule(rule, item.modificationTime, context);
    case "mtime":
      return matchesDateRule(rule, item.mtime, context);
    case "btime":
      return matchesDateRule(rule, item.btime, context);
    case "width":
      return matchesNumberRule(rule, item.width);
    case "height":
      return matchesNumberRule(rule, item.height);
    case "fileSize":
      return matchesNumberRule(rule, item.size);
    case "duration":
      return matchesNumberRule(rule, item.duration);
    case "bpm":
      return matchesNumberRule(rule, item.bpm);
    case "shape":
      return matchesShapeRule(rule, item);
    case "rating":
      return matchesRatingRule(rule, item);
    case "fontActivated":
      return matchesFontActivatedRule(rule, item);
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
