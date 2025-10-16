import { describe, expect, it } from "vitest";

import { getLibraryName } from "./get-library-name";

describe("getLibraryName", () => {
  it("returns the folder name without .library suffix for posix paths", () => {
    expect(getLibraryName("/Users/demo/Pictures/sample.library")).toBe(
      "sample",
    );
  });

  it("returns the folder name without .library suffix for windows paths", () => {
    expect(
      getLibraryName("C:\\\\Users\\\\demo\\\\Pictures\\\\sample.library"),
    ).toBe("sample");
  });

  it("handles trailing path separators", () => {
    expect(getLibraryName("/Users/demo/Pictures/sample.library/")).toBe(
      "sample",
    );
  });

  it("returns the basename when suffix is missing", () => {
    expect(getLibraryName("/Users/demo/Pictures/fallback")).toBe("fallback");
  });

  it("returns the input when empty", () => {
    expect(getLibraryName("")).toBe("");
  });
});
