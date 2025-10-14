/**
 * @vitest-environment node
 */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import { LibraryImportError } from "../errors";
import { computeNameForSort } from "../name-for-sort";
import { importLibraryMetadata } from "./import-metadata";

const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {
  // Silence expected errors during tests.
});

const tempDirs: string[] = [];

describe("importLibraryMetadata", () => {
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  afterEach(async () => {
    consoleErrorSpy.mockClear();

    while (tempDirs.length > 0) {
      const dir = tempDirs.pop();
      if (dir) {
        await fs.rm(dir, { recursive: true, force: true });
      }
    }
  });

  it("imports folders and items from the generated library", async () => {
    const libraryPath = await createSampleLibrary();
    const data = await importLibraryMetadata(libraryPath);

    expect(data.applicationVersion).toBe("4.0.0");

    const video = data.folders.get("FOLDER_VIDEO");
    expect(video).toBeDefined();
    expect(video?.manualOrder).toBe(0);
    expect(video?.children).toHaveLength(0);
    expect(video?.orderBy).toBe("GLOBAL");
    expect(video?.nameForSort).toBe(computeNameForSort("video"));

    const animal = data.folders.get("FOLDER_ANIMAL");
    expect(animal).toBeDefined();
    expect(animal?.manualOrder).toBe(1);
    expect(animal?.children).toEqual(["FOLDER_DOG"]);
    expect(animal?.orderBy).toBe("GLOBAL");

    const dog = data.folders.get("FOLDER_DOG");
    expect(dog).toBeDefined();
    expect(dog?.parentId).toBe("FOLDER_ANIMAL");
    expect(dog?.manualOrder).toBe(0);
    expect(dog?.orderBy).toBe("MANUAL");
    expect(dog?.nameForSort).toBe(computeNameForSort("dog"));

    expect(data.items.size).toBeGreaterThanOrEqual(1);
    const item = data.items.get("ITEM_BIRD");
    expect(item).toBeDefined();
    expect(item?.tags).toEqual(["Animal", "Bird"]);
    expect(item?.palettes[0]?.color).toEqual([221, 218, 210]);
    expect(item?.nameForSort).toBe(computeNameForSort("Bird"));

    // Missing item metadata files are reported but do not stop import.
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it("throws when the Eagle application version is incompatible", async () => {
    const libraryPath = await createLibrary({
      metadata: {
        applicationVersion: "3.9.0",
        modificationTime: 0,
        folders: [],
        smartFolders: [],
        quickAccess: [],
        tagsGroups: [],
      },
      mtime: { all: 0 },
      items: {},
    });

    await expect(importLibraryMetadata(libraryPath)).rejects.toBeInstanceOf(
      LibraryImportError,
    );
  });
});

type LibraryDefinition = {
  metadata: Record<string, unknown>;
  mtime: Record<string, unknown>;
  items: Record<string, Record<string, unknown>>;
};

async function createSampleLibrary(): Promise<string> {
  return createLibrary({
    metadata: {
      applicationVersion: "4.0.0",
      modificationTime: 1760231728179,
      smartFolders: [],
      quickAccess: [],
      tagsGroups: [],
      folders: [
        {
          id: "FOLDER_VIDEO",
          name: "video",
          description: "",
          children: [],
          modificationTime: 1759876345810,
          tags: [],
          password: "",
          passwordTips: "",
        },
        {
          id: "FOLDER_ANIMAL",
          name: "animal",
          description: "",
          modificationTime: 1759876356012,
          tags: [],
          password: "",
          passwordTips: "",
          children: [
            {
              id: "FOLDER_DOG",
              name: "dog",
              description: "",
              children: [],
              modificationTime: 1760228305814,
              tags: [],
              password: "",
              passwordTips: "",
              coverId: "ITEM_BIRD",
              orderBy: "MANUAL",
              sortIncrease: true,
            },
          ],
        },
      ],
    },
    mtime: {
      ITEM_BIRD: 1760228119055,
      ITEM_MISSING: 1760228119056,
      all: 2,
    },
    items: {
      ITEM_BIRD: {
        id: "ITEM_BIRD",
        name: "Bird",
        size: 63785,
        btime: 1756571097667,
        mtime: 1756571097667,
        ext: "jpg",
        tags: ["Animal", "Bird"],
        folders: ["FOLDER_ANIMAL"],
        isDeleted: false,
        url: "",
        annotation: "",
        modificationTime: 1760228118908,
        height: 960,
        width: 640,
        noThumbnail: true,
        lastModified: 1760232756999,
        palettes: [
          { color: [221, 218, 210], ratio: 51, $$hashKey: "object:668" },
          { color: [170, 148, 109], ratio: 16 },
        ],
      },
    },
  });
}

async function createLibrary(definition: LibraryDefinition): Promise<string> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "eagle-import-"));
  tempDirs.push(tmpDir);

  await writeJson(path.join(tmpDir, "metadata.json"), definition.metadata);
  await writeJson(path.join(tmpDir, "mtime.json"), definition.mtime);

  const imagesDir = path.join(tmpDir, "images");
  await fs.mkdir(imagesDir, { recursive: true });

  await Promise.all(
    Object.entries(definition.items).map(async ([itemId, metadata]) => {
      const infoDir = path.join(imagesDir, `${itemId}.info`);
      await fs.mkdir(infoDir, { recursive: true });
      await writeJson(path.join(infoDir, "metadata.json"), metadata);
    }),
  );

  return tmpDir;
}

async function writeJson(filePath: string, data: Record<string, unknown>) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
