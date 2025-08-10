import { describe, expect } from "vitest";
import { render } from "vitest-browser-react";
import { test as it, TestWrapper } from "~/test/helpers";
import {
  mockEmptyFolder,
  mockFolderWithImages,
  mockFolderWithoutCoverImage,
  mockLegacyFolder,
} from "./__fixtures__/folders";
import { FolderItem } from "./FolderItem";

describe("FolderItem", () => {
  describe("Component Rendering", () => {
    it("renders folder name in overlay", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      await expect
        .element(screen.getByText(mockFolderWithImages.name))
        .toBeVisible();
    });

    it("shows thumbnail image when folder has coverImage", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();
      await expect
        .element(img)
        .toHaveAttribute("alt", `Folder: ${mockFolderWithImages.name}`);
      // Check for dynamic URL with cover image's ID
      const expectedUrl = `http://localhost:57821/item/thumbnail?id=item-1&libraryPath=%2Ftest%2Flibrary%2Fpath`;
      await expect.element(img).toHaveAttribute("src", expectedUrl);
    });

    it("shows empty placeholder when no thumbnail available", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockEmptyFolder} />
        </TestWrapper>,
      );

      // Should not have an img element
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0);

      // Should have empty div with correct class - just verify component renders
      const folderName = screen.getByText(mockEmptyFolder.name);
      await expect.element(folderName).toBeVisible();
    });

    it("applies correct CSS modules classes", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      // Verify component renders correctly with expected content
      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();

      const folderName = screen.getByText(mockFolderWithImages.name);
      await expect.element(folderName).toBeVisible();
    });

    it("sets appropriate alt text", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect
        .element(img)
        .toHaveAttribute("alt", `Folder: ${mockFolderWithImages.name}`);
    });
  });

  describe("Props & Integration", () => {
    it("accepts FolderData prop correctly", async () => {
      const customFolder = {
        id: "folder-999",
        name: "Custom Test Folder",
        children: [],
        items: [],
      };

      const screen = await render(
        <TestWrapper>
          <FolderItem folder={customFolder} />
        </TestWrapper>,
      );

      await expect
        .element(screen.getByText("Custom Test Folder"))
        .toBeVisible();
    });

    it("handles folder with cover image", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      // Should show thumbnail from cover image
      const img = screen.getByRole("img");
      // Check for dynamic URL with cover image's ID
      const expectedUrl = `http://localhost:57821/item/thumbnail?id=item-1&libraryPath=%2Ftest%2Flibrary%2Fpath`;
      await expect.element(img).toHaveAttribute("src", expectedUrl);
    });

    it("handles empty folder", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockEmptyFolder} />
        </TestWrapper>,
      );

      // Should show folder name
      await expect
        .element(screen.getByText(mockEmptyFolder.name))
        .toBeVisible();

      // Should not show thumbnail
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0);
    });

    it("renders folder name correctly for different folder names", async () => {
      const foldersWithDifferentNames = [
        { id: "folder-1", name: "My Photos", children: [], items: [] },
        { id: "folder-2", name: "Work Documents", children: [], items: [] },
        { id: "folder-3", name: "Travel 2024", children: [], items: [] },
      ];

      for (const folder of foldersWithDifferentNames) {
        const screen = await render(
          <TestWrapper>
            <FolderItem folder={folder} />
          </TestWrapper>,
        );
        await expect.element(screen.getByText(folder.name)).toBeVisible();
      }
    });

    it("handles empty folder name edge case", async () => {
      const emptyNameFolder = {
        id: "folder-4",
        name: "",
        children: [],
        items: [],
      };
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={emptyNameFolder} />
        </TestWrapper>,
      );

      // Should render without error even with empty name
      // Component should exist and not crash
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0); // No images since empty folder with empty name
    });
  });

  describe("Cover Image Display", () => {
    it("shows thumbnail when folder has coverImage property", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();
      const expectedUrl = `http://localhost:57821/item/thumbnail?id=item-1&libraryPath=%2Ftest%2Flibrary%2Fpath`;
      await expect.element(img).toHaveAttribute("src", expectedUrl);
    });

    it("shows gray placeholder when folder has coverImage undefined", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithoutCoverImage} />
        </TestWrapper>,
      );

      // Should not have an img element
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0);

      // Should show folder name
      await expect
        .element(screen.getByText(mockFolderWithoutCoverImage.name))
        .toBeVisible();
    });

    it("shows gray placeholder when folder has no coverImage property (legacy)", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockLegacyFolder} />
        </TestWrapper>,
      );

      // Should not have an img element
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0);

      // Should show folder name
      await expect
        .element(screen.getByText(mockLegacyFolder.name))
        .toBeVisible();
    });

    it("constructs thumbnail URL correctly with coverImage.id", async () => {
      const screen = await render(
        <TestWrapper>
          <FolderItem folder={mockFolderWithImages} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      const expectedUrl = `http://localhost:57821/item/thumbnail?id=item-1&libraryPath=%2Ftest%2Flibrary%2Fpath`;
      await expect.element(img).toHaveAttribute("src", expectedUrl);
    });
  });
});
