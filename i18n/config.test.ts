/**
 * @vitest-environment node
 */
import { describe, expect, it } from "vitest";
import {
  DEFAULT_LOCALE,
  isAppLocale,
  resolveLocale,
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

describe("resolveLocale", () => {
  it("prefers the persisted locale when available", () => {
    expect(resolveLocale({ persisted: "ja", requestLocale: "en" })).toBe("ja");
  });

  it("falls back to the request locale when persisted is invalid", () => {
    expect(resolveLocale({ persisted: "fr", requestLocale: "ja" })).toBe("ja");
  });

  it("uses the default locale when neither value is supported", () => {
    expect(resolveLocale({ persisted: "fr", requestLocale: "it" })).toBe(
      DEFAULT_LOCALE,
    );
  });

  it("uses the default locale when inputs are missing", () => {
    expect(resolveLocale()).toBe(DEFAULT_LOCALE);
  });
});
