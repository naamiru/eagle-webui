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
  getSettingsFilePath,
  loadLocaleSetting,
  loadSettings,
  type SettingsFile,
  saveLocaleSetting,
  saveSettings,
} from "./settings";

describe("settings helpers", () => {
  const settingsPath = getSettingsFilePath();
  const settingsDir = path.dirname(settingsPath);

  beforeEach(async () => {
    await fs.rm(sandboxRoot, { recursive: true, force: true });
  });

  afterEach(async () => {
    await fs.rm(sandboxRoot, { recursive: true, force: true });
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
    await saveSettings({});

    await fs.writeFile(
      settingsPath,
      `${JSON.stringify({ locale: DEFAULT_LOCALE }, null, 2)}\n`,
      "utf8",
    );

    expect(await loadLocaleSetting()).toBe(DEFAULT_LOCALE);
  });
});
