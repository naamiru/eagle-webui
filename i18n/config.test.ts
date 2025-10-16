/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  getPreferredLocale,
  isAppLocale,
  SUPPORTED_LOCALES,
} from "./config";

describe("isAppLocale", () => {
  it("returns true for supported locales", () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(isAppLocale(locale)).toBe(true);
    });
  });

  it("returns false for unsupported values", () => {
    expect(isAppLocale("fr")).toBe(false);
    expect(isAppLocale(null)).toBe(false);
    expect(isAppLocale(123)).toBe(false);
  });
});

describe("getPreferredLocale", () => {
  it("returns the requested locale when header matches", () => {
    expect(getPreferredLocale("ja")).toBe("ja");
  });

  it("falls back to the best matching locale based on weighting", () => {
    expect(getPreferredLocale("ja, en;q=0.8")).toBe("ja");
  });

  it("uses the default locale when neither value is supported", () => {
    expect(getPreferredLocale("it")).toBe(DEFAULT_LOCALE);
  });

  it("uses the default locale when inputs are missing", () => {
    expect(getPreferredLocale()).toBe(DEFAULT_LOCALE);
  });

  it("honors Accept-Language weighting", () => {
    expect(getPreferredLocale("es;q=0.7, zh-CN;q=0.9, en;q=0.5")).toBe("zh-cn");
  });

  it("falls back to the default locale when only unsupported values are present", () => {
    expect(getPreferredLocale("fr-CA, fr;q=0.8")).toBe(DEFAULT_LOCALE);
  });
});
