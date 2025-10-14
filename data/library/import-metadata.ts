import fs from "node:fs/promises";
import path from "node:path";

import type { ErrorObject } from "ajv";
import Ajv from "ajv";

import { LibraryImportError } from "../errors";
import { computeNameForSort } from "../name-for-sort";
import { FOLDER_SORT_METHODS, type SortMethod } from "../sort-options";
import type { Folder, Item, Palette } from "../types";

type RawFolder = {
  id?: string;
  name?: string;
  description?: string;
  children?: RawFolder[];
  modificationTime?: number;
  tags?: unknown;
  password?: string;
  passwordTips?: string;
  coverId?: string;
  orderBy?: string;
  sortIncrease?: boolean;
};

type RawLibraryMetadata = {
  applicationVersion?: string;
  modificationTime?: number;
  folders?: RawFolder[];
  smartFolders?: unknown[];
  quickAccess?: unknown[];
  tagsGroups?: unknown[];
};

type RawMTimeIndex = Record<string, unknown>;

type RawPalette = {
  color?: unknown;
  ratio?: unknown;
  $$hashKey?: unknown;
};

type RawItemMetadata = {
  id?: string;
  name?: string;
  size?: unknown;
  btime?: unknown;
  mtime?: unknown;
  ext?: string;
  tags?: unknown;
  folders?: unknown;
  isDeleted?: unknown;
  url?: string;
  annotation?: string;
  modificationTime?: unknown;
  height?: unknown;
  width?: unknown;
  noThumbnail?: unknown;
  lastModified?: unknown;
  palettes?: RawPalette[];
  duration?: unknown;
  star?: unknown;
  order?: unknown;
};

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

const folderSchema = {
  $id: "https://eagle-webui.local/schema/folder.json",
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    description: { type: "string" },
    modificationTime: { type: "number" },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    password: { type: "string" },
    passwordTips: { type: "string" },
    coverId: { type: "string" },
    orderBy: { type: "string" },
    sortIncrease: { type: "boolean" },
    children: {
      type: "array",
      items: { $ref: "https://eagle-webui.local/schema/folder.json" },
    },
  },
  additionalProperties: true,
} as const;

ajv.addSchema(folderSchema);

const libraryMetadataSchema = {
  type: "object",
  required: ["applicationVersion"],
  properties: {
    applicationVersion: { type: "string" },
    modificationTime: { type: "number" },
    folders: {
      type: "array",
      items: { $ref: "https://eagle-webui.local/schema/folder.json" },
    },
    smartFolders: { type: "array" },
    quickAccess: { type: "array" },
    tagsGroups: { type: "array" },
  },
  additionalProperties: true,
} as const;

const mtimeSchema = {
  type: "object",
  propertyNames: {
    type: "string",
  },
  additionalProperties: {
    type: ["number", "integer"],
  },
} as const;

const paletteSchema = {
  type: "object",
  properties: {
    color: {
      type: "array",
      items: { type: "number" },
      minItems: 3,
      maxItems: 3,
    },
    ratio: { type: "number" },
    $$hashKey: { type: "string" },
  },
  additionalProperties: true,
} as const;

const itemMetadataSchema = {
  type: "object",
  required: ["id"],
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    size: { type: "number" },
    btime: { type: "number" },
    mtime: { type: "number" },
    ext: { type: "string" },
    tags: {
      type: "array",
      items: { type: "string" },
    },
    folders: {
      type: "array",
      items: { type: "string" },
    },
    isDeleted: { type: "boolean" },
    url: { type: "string" },
    annotation: { type: "string" },
    modificationTime: { type: "number" },
    height: { type: "number" },
    width: { type: "number" },
    noThumbnail: { type: "boolean" },
    lastModified: { type: "number" },
    palettes: {
      type: "array",
      items: paletteSchema,
    },
    duration: { type: "number" },
    star: { type: "number" },
    order: {
      type: "object",
      propertyNames: { type: "string" },
      additionalProperties: {
        anyOf: [{ type: "string" }, { type: "number" }],
      },
    },
  },
  additionalProperties: true,
} as const;

const validateLibraryMetadata = ajv.compile<RawLibraryMetadata>(
  libraryMetadataSchema,
);
const validateMTime = ajv.compile<RawMTimeIndex>(mtimeSchema);
const validateItemMetadata = ajv.compile<RawItemMetadata>(itemMetadataSchema);

export type LibraryImportPayload = {
  libraryPath: string;
  applicationVersion: string;
  folders: Map<string, Folder>;
  items: Map<string, Item>;
};

export async function importLibraryMetadata(
  libraryPath: string,
): Promise<LibraryImportPayload> {
  const metadataPath = path.join(libraryPath, "metadata.json");
  const metadata = await loadLibraryMetadata(metadataPath);

  assertApplicationVersion(metadata.applicationVersion);

  const folders = buildFolderMap(metadata.folders ?? []);

  const mtimePath = path.join(libraryPath, "mtime.json");
  const mtimeIndex = await loadMTimeIndex(mtimePath);

  const items = await loadItems(libraryPath, mtimeIndex);

  return {
    libraryPath,
    applicationVersion: metadata.applicationVersion ?? "4.x",
    folders,
    items,
  };
}

async function loadLibraryMetadata(
  metadataPath: string,
): Promise<RawLibraryMetadata> {
  try {
    const raw = await readJson(metadataPath);
    if (!validateLibraryMetadata(raw)) {
      throw new LibraryImportError(
        `metadata.json failed validation: ${formatAjvErrors(validateLibraryMetadata.errors)}`,
        { code: "METADATA_READ_FAILURE" },
      );
    }
    return raw;
  } catch (error) {
    if (error instanceof LibraryImportError) {
      throw error;
    }
    throw new LibraryImportError("Unable to read metadata.json", {
      cause: error instanceof Error ? error : undefined,
      code: "METADATA_READ_FAILURE",
    });
  }
}

async function loadMTimeIndex(mtimePath: string): Promise<RawMTimeIndex> {
  try {
    const raw = await readJson(mtimePath);
    if (!validateMTime(raw)) {
      throw new LibraryImportError(
        `mtime.json failed validation: ${formatAjvErrors(validateMTime.errors)}`,
        { code: "MTIME_READ_FAILURE" },
      );
    }
    return raw;
  } catch (error) {
    if (error instanceof LibraryImportError) {
      throw error;
    }
    throw new LibraryImportError("Unable to read mtime.json", {
      cause: error instanceof Error ? error : undefined,
      code: "MTIME_READ_FAILURE",
    });
  }
}

async function loadItems(
  libraryPath: string,
  mtimeIndex: RawMTimeIndex,
): Promise<Map<string, Item>> {
  const items = new Map<string, Item>();

  await Promise.all(
    Object.keys(mtimeIndex)
      .filter((key) => key !== "all")
      .map(async (itemId) => {
        const item = await loadItem(libraryPath, itemId);
        if (item) {
          items.set(item.id, item);
        }
      }),
  );

  return items;
}

async function loadItem(
  libraryPath: string,
  itemId: string,
): Promise<Item | null> {
  const itemMetadataPath = path.join(
    libraryPath,
    "images",
    `${itemId}.info`,
    "metadata.json",
  );

  try {
    const raw = await readJson(itemMetadataPath);
    if (!validateItemMetadata(raw)) {
      throw new Error(
        `item metadata failed validation: ${formatAjvErrors(validateItemMetadata.errors)}`,
      );
    }
    const normalized = normalizeItem(raw);
    return normalized;
  } catch (error) {
    console.error(
      `[library-import] Unable to import item ${itemId}:`,
      error instanceof Error ? error : new Error(String(error)),
    );
    return null;
  }
}

function normalizeItem(raw: RawItemMetadata): Item {
  const itemName = typeof raw.name === "string" ? raw.name : "";

  return {
    id: raw.id ?? "",
    name: itemName,
    nameForSort: computeNameForSort(itemName),
    size: toNumber(raw.size),
    btime: toNumber(raw.btime),
    mtime: toNumber(raw.mtime),
    ext: raw.ext ?? "",
    tags: toStringArray(raw.tags),
    folders: toStringArray(raw.folders),
    isDeleted: typeof raw.isDeleted === "boolean" ? raw.isDeleted : false,
    url: raw.url ?? "",
    annotation: raw.annotation ?? "",
    modificationTime: toNumber(raw.modificationTime),
    height: toNumber(raw.height),
    width: toNumber(raw.width),
    noThumbnail: typeof raw.noThumbnail === "boolean" ? raw.noThumbnail : false,
    lastModified: toNumber(raw.lastModified),
    palettes: Array.isArray(raw.palettes)
      ? raw.palettes.map(normalizePalette)
      : [],
    duration: toNumber(raw.duration),
    star: toNumber(raw.star),
    order: toOrderMap(raw.order),
  };
}

function normalizePalette(raw: RawPalette): Palette {
  const colorArray = Array.isArray(raw.color) ? raw.color : [];
  const color: [number, number, number] = [
    toNumber(colorArray[0]),
    toNumber(colorArray[1]),
    toNumber(colorArray[2]),
  ];

  return {
    color,
    ratio: toNumber(raw.ratio),
    $$hashKey: typeof raw.$$hashKey === "string" ? raw.$$hashKey : undefined,
  };
}

function buildFolderMap(rawFolders: RawFolder[]): Map<string, Folder> {
  const folders = new Map<string, Folder>();
  traverseFolders(rawFolders, folders);
  return folders;
}

function traverseFolders(
  rawFolders: RawFolder[],
  collection: Map<string, Folder>,
  parentId?: string,
): void {
  rawFolders.forEach((raw, index) => {
    const folderId = raw.id;
    if (!folderId) {
      console.error(
        `[library-import] Encountered folder without id under ${parentId ?? "root"}`,
      );
      return;
    }

    const childFolders = Array.isArray(raw.children) ? raw.children : [];
    const childIds = childFolders
      .map((child) => child.id)
      .filter((id): id is string => typeof id === "string" && id.length > 0);

    const folderName = typeof raw.name === "string" ? raw.name : "";
    const folder: Folder = {
      id: folderId,
      name: folderName,
      nameForSort: computeNameForSort(folderName),
      description: typeof raw.description === "string" ? raw.description : "",
      children: childIds,
      parentId,
      manualOrder: index,
      modificationTime: toNumber(raw.modificationTime),
      tags: toStringArray(raw.tags),
      password: typeof raw.password === "string" ? raw.password : "",
      passwordTips:
        typeof raw.passwordTips === "string" ? raw.passwordTips : "",
      coverId: typeof raw.coverId === "string" ? raw.coverId : undefined,
      orderBy: sanitizeFolderOrderBy(raw.orderBy),
      sortIncrease:
        typeof raw.sortIncrease === "boolean" ? raw.sortIncrease : true,
    };

    collection.set(folderId, folder);
    traverseFolders(childFolders, collection, folderId);
  });
}

async function readJson(filePath: string): Promise<unknown> {
  const rawJson = await fs.readFile(filePath, "utf8");
  return JSON.parse(rawJson) as unknown;
}

function assertApplicationVersion(version: string | undefined): void {
  if (!version || !version.startsWith("4.")) {
    throw new LibraryImportError(
      `Eagle library requires application version 4.x (found "${version ?? "unknown"}")`,
      { code: "INVALID_APPLICATION_VERSION" },
    );
  }
}

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors?.length) {
    return "Unknown validation error";
  }

  return errors
    .map((error) => {
      if ("instancePath" in error && error.instancePath) {
        return `${error.instancePath} ${error.message ?? ""}`.trim();
      }
      return error.message ?? "Validation error";
    })
    .join("; ");
}

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function toOrderMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const entries = Object.entries(value as Record<string, unknown>).filter(
    ([key]) => typeof key === "string" && key.length > 0,
  );

  if (entries.length === 0) {
    return {};
  }

  const orderMap: Record<string, number> = {};

  for (const [folderId, rawValue] of entries) {
    const parsed =
      typeof rawValue === "number"
        ? rawValue
        : typeof rawValue === "string"
          ? Number.parseFloat(rawValue)
          : Number.NaN;

    if (Number.isFinite(parsed)) {
      orderMap[folderId] = parsed;
    }
  }

  return orderMap;
}

function sanitizeFolderOrderBy(value: unknown): SortMethod {
  if (
    typeof value === "string" &&
    (FOLDER_SORT_METHODS as readonly string[]).includes(value)
  ) {
    return value as SortMethod;
  }

  return "GLOBAL";
}
