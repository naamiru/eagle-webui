import type { UseQueryResult } from "@tanstack/react-query";
import { describe, expect, vi } from "vitest";
import { render } from "vitest-browser-react";
import { test as it, TestWrapper } from "~/test/helpers";
import type { Folder, Item } from "~/types/item";
import { FolderPage } from "./FolderPage";

// Mock the query hook
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

const { useQuery } = await import("@tanstack/react-query");

const createMockFolder = (
  id: string,
  name: string,
  orderBy = "GLOBAL",
  sortIncrease = true,
): Folder => ({
  id,
  name,
  children: [],
  items: [],
  orderBy,
  sortIncrease,
});

const createMockItem = (
  id: string,
  name: string,
  overrides: Partial<Item> = {},
): Item => ({
  id,
  name,
  width: 1920,
  height: 1080,
  size: 1024000,
  btime: 1640995200000,
  mtime: 1640995300000,
  ext: "jpg",
  star: 0,
  duration: 0,
  manualOrder: 1640995200000,
  globalOrder: 1,
  ...overrides,
});

describe("FolderPage sorting", async () => {
  it("sorts items by NAME ascending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "NAME", true);
    const items = [
      createMockItem("1", "zebra.jpg"),
      createMockItem("2", "apple.jpg"),
      createMockItem("3", "banana.jpg"),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    // Items should be rendered in alphabetical order by their IDs (since alt uses item.id)
    // The items should be sorted by name, so we expect IDs in the order: 2, 3, 1
    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // apple.jpg, banana.jpg, zebra.jpg
  });

  it("sorts items by NAME descending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "NAME", false);
    const items = [
      createMockItem("1", "apple.jpg"),
      createMockItem("2", "zebra.jpg"),
      createMockItem("3", "banana.jpg"),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // zebra.jpg, banana.jpg, apple.jpg
  });

  it("sorts items by FILESIZE ascending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "FILESIZE", true);
    const items = [
      createMockItem("1", "large.jpg", { size: 3000000 }),
      createMockItem("2", "small.jpg", { size: 1000000 }),
      createMockItem("3", "medium.jpg", { size: 2000000 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // small.jpg, medium.jpg, large.jpg
  });

  it("sorts items by RESOLUTION descending", async () => {
    const folder = createMockFolder(
      "folder1",
      "Test Folder",
      "RESOLUTION",
      false,
    );
    const items = [
      createMockItem("1", "hd.jpg", { width: 1920, height: 1080 }),
      createMockItem("2", "4k.jpg", { width: 3840, height: 2160 }),
      createMockItem("3", "sd.jpg", { width: 640, height: 480 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "1", "3"]); // 4k.jpg, hd.jpg, sd.jpg
  });

  it("sorts items by RATING ascending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "RATING", true);
    const items = [
      createMockItem("1", "excellent.jpg", { star: 5 }),
      createMockItem("2", "unrated.jpg", { star: 0 }),
      createMockItem("3", "good.jpg", { star: 3 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // unrated.jpg, good.jpg, excellent.jpg
  });

  it("sorts items by DURATION descending", async () => {
    const folder = createMockFolder(
      "folder1",
      "Test Folder",
      "DURATION",
      false,
    );
    const items = [
      createMockItem("1", "short.mp4", { duration: 30 }),
      createMockItem("2", "long.mp4", { duration: 300 }),
      createMockItem("3", "medium.mp4", { duration: 120 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // long.mp4, medium.mp4, short.mp4
  });

  it("sorts items by EXT ascending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "EXT", true);
    const items = [
      createMockItem("1", "video.mp4", { ext: "mp4" }),
      createMockItem("2", "image.jpg", { ext: "jpg" }),
      createMockItem("3", "picture.png", { ext: "png" }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "1", "3"]); // image.jpg, video.mp4, picture.png
  });

  it("sorts items by BTIME ascending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "BTIME", true);
    const items = [
      createMockItem("1", "newest.jpg", { btime: 1640995300000 }),
      createMockItem("2", "oldest.jpg", { btime: 1640995100000 }),
      createMockItem("3", "middle.jpg", { btime: 1640995200000 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // oldest.jpg, middle.jpg, newest.jpg
  });

  it("sorts items by IMPORT (same as BTIME)", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "IMPORT", true);
    const items = [
      createMockItem("1", "newest.jpg", { btime: 1640995300000 }),
      createMockItem("2", "oldest.jpg", { btime: 1640995100000 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "1"]); // oldest.jpg, newest.jpg
  });

  it("sorts items by MTIME descending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "MTIME", false);
    const items = [
      createMockItem("1", "old-mod.jpg", { mtime: 1640995100000 }),
      createMockItem("2", "new-mod.jpg", { mtime: 1640995300000 }),
      createMockItem("3", "mid-mod.jpg", { mtime: 1640995200000 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // new-mod.jpg, mid-mod.jpg, old-mod.jpg
  });

  it("sorts items by MANUAL ascending", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "MANUAL", true);
    const items = [
      createMockItem("1", "third.jpg", { manualOrder: 3.0 }),
      createMockItem("2", "first.jpg", { manualOrder: 1.0 }),
      createMockItem("3", "second.jpg", { manualOrder: 2.0 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "3", "1"]); // first.jpg, second.jpg, third.jpg
  });

  it("sorts items by GLOBAL using globalOrder", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "GLOBAL", true);
    const items = [
      createMockItem("1", "second.jpg", { globalOrder: 2 }),
      createMockItem("2", "third.jpg", { globalOrder: 3 }),
      createMockItem("3", "first.jpg", { globalOrder: 1 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["3", "1", "2"]); // first.jpg, second.jpg, third.jpg
  });

  it("handles unknown orderBy with globalOrder fallback", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "UNKNOWN", true);
    const items = [
      createMockItem("1", "second.jpg", { globalOrder: 2 }),
      createMockItem("2", "first.jpg", { globalOrder: 1 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    const itemNames = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "")
      .map((img) => (img as HTMLImageElement).alt);
    expect(itemNames).toEqual(["2", "1"]); // first.jpg, second.jpg
  });

  it("handles missing globalOrder gracefully", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "GLOBAL", true);
    const items = [
      createMockItem("1", "no-global.jpg", { globalOrder: undefined }),
      createMockItem("2", "has-global.jpg", { globalOrder: 1 }),
    ];

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: items,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    // Should not crash and render both items
    const imageElements = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "");
    expect(imageElements).toHaveLength(2);
  });

  it("does not sort when items or currentFolder is null", async () => {
    const folder = createMockFolder("folder1", "Test Folder", "NAME", true);

    (useQuery as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      error: null,
      isLoading: false,
    } as unknown as UseQueryResult<Item[], Error>);

    const screen = await render(
      <TestWrapper>
        <FolderPage folders={[folder]} folderId="folder1" />
      </TestWrapper>,
    );

    // Should not crash when data is null
    const imageElements = screen
      .getByRole("img")
      .elements()
      .filter((img) => (img as HTMLImageElement).alt && (img as HTMLImageElement).alt !== "");
    expect(imageElements).toHaveLength(0);
  });
});
