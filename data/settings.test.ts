/**
 * @vitest-environment node
 */
import fs from "node:fs/promises";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sandboxRoot = vi.hoisted(() => {
  const nodePath = require("node:path") as typeof import("node:path");
  const nodeOs = require("node:os") as typeof import("node:os");
  return nodePath.join(nodeOs.tmpdir(), "eagle-webui-settings-tests");
}) as string;

vi.mock("ospath", () => ({
  default: {
    data: () => sandboxRoot,
  },
}));

import { DEFAULT_LOCALE } from "@/i18n/config";
import {
  __resetSettingsCacheForTests,
  getSettingsFilePath,
  loadGlobalSortSettings,
  loadLocaleSetting,
  loadSettings,
  type SettingsFile,
  saveGlobalSortSettings,
  saveLocaleSetting,
  saveSettings,
} from "./settings";
import { DEFAULT_GLOBAL_SORT_OPTIONS } from "./sort-options";

describe("settings helpers", () => {
  const settingsPath = getSettingsFilePath();
  const settingsDir = path.dirname(settingsPath);

  beforeEach(async () => {
    await fs.rm(sandboxRoot, { recursive: true, force: true });
    __resetSettingsCacheForTests();
  });

  afterEach(async () => {
    await fs.rm(sandboxRoot, { recursive: true, force: true });
    __resetSettingsCacheForTests();
  });

  it("returns an empty object when the file is missing", async () => {
    expect(await loadSettings()).toEqual({});
  });

  it("returns an empty object when the file contains invalid JSON", async () => {
    await fs.mkdir(settingsDir, { recursive: true });
    await fs.writeFile(settingsPath, "{ invalid", "utf8");

    expect(await loadSettings()).toEqual({});
  });

  it("merges settings when saving partial updates", async () => {
    await saveSettings({
      globalSort: {
        orderBy: "NAME",
        sortIncrease: false,
      },
    });

    await saveSettings({
      locale: "ja",
    });

    const raw = await fs.readFile(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as SettingsFile;

    expect(parsed.locale).toBe("ja");
    expect(parsed.globalSort).toEqual({
      orderBy: "NAME",
      sortIncrease: false,
    });
  });

  it("returns undefined for unsupported persisted locales", async () => {
    await fs.mkdir(settingsDir, { recursive: true });
    await fs.writeFile(
      settingsPath,
      `${JSON.stringify({ locale: "fr" }, null, 2)}\n`,
      "utf8",
    );

    expect(await loadLocaleSetting()).toBeUndefined();
  });

  it("persists supported locales", async () => {
    await saveLocaleSetting("ja");
    expect(await loadLocaleSetting()).toBe("ja");
  });

  it("reads the default locale when it is stored", async () => {
    await saveLocaleSetting(DEFAULT_LOCALE);
    expect(await loadLocaleSetting()).toBe(DEFAULT_LOCALE);
  });

  it("returns default global sort settings when missing", async () => {
    expect(await loadGlobalSortSettings()).toEqual(DEFAULT_GLOBAL_SORT_OPTIONS);
  });

  it("normalizes persisted global sort settings", async () => {
    await saveSettings({
      globalSort: {
        orderBy: "UNKNOWN",
        sortIncrease: "nope" as unknown as boolean,
      },
    });

    expect(await loadGlobalSortSettings()).toEqual(DEFAULT_GLOBAL_SORT_OPTIONS);

    await saveGlobalSortSettings({
      orderBy: "MTIME",
      sortIncrease: false,
    });

    expect(await loadGlobalSortSettings()).toEqual({
      orderBy: "MTIME",
      sortIncrease: false,
    });
  });
});
