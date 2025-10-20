/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  formatDateTime,
  formatDimensions,
  formatDuration,
  formatFileSize,
} from "./item-details";

describe("formatFileSize", () => {
  it("returns empty string for zero or invalid values", () => {
    expect(formatFileSize(0)).toBe("");
    expect(formatFileSize(-10)).toBe("");
    expect(formatFileSize(Number.NaN)).toBe("");
  });

  it("formats bytes without decimals", () => {
    expect(formatFileSize(512)).toBe("512 B");
  });

  it("formats larger units with two decimals", () => {
    expect(formatFileSize(1536)).toBe("1.50 KB");
    expect(formatFileSize(1048576)).toBe("1.00 MB");
    expect(formatFileSize(1073741824)).toBe("1.00 GB");
  });
});

describe("formatDimensions", () => {
  it("returns empty string for invalid dimensions", () => {
    expect(formatDimensions(0, 100)).toBe("");
    expect(formatDimensions(100, -1)).toBe("");
  });

  it("formats width and height", () => {
    expect(formatDimensions(1920, 1080)).toBe("1920 x 1080");
  });
});

describe("formatDateTime", () => {
  it("returns empty string for invalid timestamps", () => {
    expect(formatDateTime(0, "en-US")).toBe("");
    expect(formatDateTime(Number.NaN, "en-US")).toBe("");
  });

  it("formats timestamps as yyyy/mm/dd hh:mm", () => {
    const date = new Date();
    date.setFullYear(2024);
    date.setMonth(2); // March
    date.setDate(18);
    date.setHours(9, 42, 0, 0);

    const result = formatDateTime(date.getTime(), "en-US");
    expect(result).toMatch(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
  });
});

describe("formatDuration", () => {
  it("returns empty string for invalid duration", () => {
    expect(formatDuration(0)).toBe("");
    expect(formatDuration(-5)).toBe("");
  });

  it("formats seconds into mm:ss", () => {
    expect(formatDuration(5)).toBe("00:05");
    expect(formatDuration(125)).toBe("02:05");
    expect(formatDuration(3600)).toBe("60:00");
  });
});
