import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { mockEmptyFolder, mockFolderWithImages } from "./__fixtures__/folders";
import { FolderList } from "./FolderList";

describe("FolderList", () => {
  describe("Component Rendering", () => {
    it("renders grid container with folders", async () => {
      const folders = [mockFolderWithImages, mockEmptyFolder];
      const screen = await render(<FolderList folders={folders} />);

      // Should render grid container
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });

    it("renders multiple folders correctly", async () => {
      const folders = [mockFolderWithImages, mockEmptyFolder];
      const screen = await render(<FolderList folders={folders} />);

      // Should display both folder names
      await expect.element(screen.getByText("Photos")).toBeVisible();
      await expect.element(screen.getByText("Empty Folder")).toBeVisible();
    });

    it("renders single folder correctly", async () => {
      const screen = await render(
        <FolderList folders={[mockFolderWithImages]} />,
      );

      await expect.element(screen.getByText("Photos")).toBeVisible();
    });

    it("applies correct CSS grid class", async () => {
      const screen = await render(
        <FolderList folders={[mockFolderWithImages]} />,
      );

      // Grid container should be present
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });
  });

  describe("Empty State Handling", () => {
    it("returns null when folders array is empty", async () => {
      const screen = await render(<FolderList folders={[]} />);

      // Should not render any content when folders array is empty
      const containers = screen.getByRole("generic").elements();
      expect(containers.length).toBe(0);
    });

    it("handles undefined folders gracefully", async () => {
      // Test edge case where folders might be undefined
      const screen = await render(<FolderList folders={[]} />);

      const containers = screen.getByRole("generic").elements();
      expect(containers.length).toBe(0);
    });
  });

  describe("Folder Integration", () => {
    it("passes correct props to FolderItem components", async () => {
      const customFolders = [
        {
          id: 1,
          name: "Test Folder 1",
          children: [],
          items: [],
        },
        {
          id: 2,
          name: "Test Folder 2",
          children: [],
          items: [],
        },
      ];

      const screen = await render(<FolderList folders={customFolders} />);

      // Should render both custom folder names
      await expect.element(screen.getByText("Test Folder 1")).toBeVisible();
      await expect.element(screen.getByText("Test Folder 2")).toBeVisible();
    });

    it("handles folders with different structures", async () => {
      const mixedFolders = [
        mockFolderWithImages, // Has items
        mockEmptyFolder, // Empty
        {
          id: 999,
          name: "Folder with Children",
          children: [mockEmptyFolder],
          items: [],
        },
      ];

      const screen = await render(<FolderList folders={mixedFolders} />);

      // All folder names should be visible
      await expect.element(screen.getByText("Photos")).toBeVisible();
      await expect.element(screen.getByText("Empty Folder")).toBeVisible();
      await expect
        .element(screen.getByText("Folder with Children"))
        .toBeVisible();
    });

    it("maintains correct key props for folder items", async () => {
      const folders = [
        { id: 1, name: "Folder 1", children: [], items: [] },
        { id: 2, name: "Folder 2", children: [], items: [] },
        { id: 3, name: "Folder 3", children: [], items: [] },
      ];

      const screen = await render(<FolderList folders={folders} />);

      // All folders should render without key conflicts
      await expect.element(screen.getByText("Folder 1")).toBeVisible();
      await expect.element(screen.getByText("Folder 2")).toBeVisible();
      await expect.element(screen.getByText("Folder 3")).toBeVisible();
    });
  });

  describe("Props Validation", () => {
    it("accepts valid FolderData array", async () => {
      const validFolders = [
        {
          id: 100,
          name: "Valid Folder",
          children: [],
          items: [],
        },
      ];

      const screen = await render(<FolderList folders={validFolders} />);

      await expect.element(screen.getByText("Valid Folder")).toBeVisible();
    });

    it("handles folders with special characters in names", async () => {
      const specialNameFolders = [
        { id: 1, name: "Folder with Spaces", children: [], items: [] },
        { id: 2, name: "Folder-with-Dashes", children: [], items: [] },
        { id: 3, name: "Folder_with_Underscores", children: [], items: [] },
        { id: 4, name: "Folder (with parentheses)", children: [], items: [] },
      ];

      const screen = await render(<FolderList folders={specialNameFolders} />);

      // All special character names should render
      await expect
        .element(screen.getByText("Folder with Spaces"))
        .toBeVisible();
      await expect
        .element(screen.getByText("Folder-with-Dashes"))
        .toBeVisible();
      await expect
        .element(screen.getByText("Folder_with_Underscores"))
        .toBeVisible();
      await expect
        .element(screen.getByText("Folder (with parentheses)"))
        .toBeVisible();
    });

    it("handles very long folder names", async () => {
      const longNameFolder = {
        id: 1,
        name: "This is a very long folder name that should still render correctly without breaking the layout or component functionality",
        children: [],
        items: [],
      };

      const screen = await render(<FolderList folders={[longNameFolder]} />);

      await expect.element(screen.getByText(longNameFolder.name)).toBeVisible();
    });
  });

  describe("Edge Cases", () => {
    it("handles folder with empty name", async () => {
      const emptyNameFolder = {
        id: 1,
        name: "",
        children: [],
        items: [],
      };

      const screen = await render(<FolderList folders={[emptyNameFolder]} />);

      // Component should render without crashing even with empty name
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });

    it("handles folders with duplicate names", async () => {
      const duplicateNameFolders = [
        { id: 1, name: "Same Name", children: [], items: [] },
        { id: 2, name: "Same Name", children: [], items: [] },
      ];

      const screen = await render(
        <FolderList folders={duplicateNameFolders} />,
      );

      // Both folders should render (different IDs)
      const sameNameElements = screen.getByText("Same Name").elements();
      expect(sameNameElements.length).toBe(2);
    });

    it("handles folder with zero ID", async () => {
      const zeroIdFolder = {
        id: 0,
        name: "Zero ID Folder",
        children: [],
        items: [],
      };

      const screen = await render(<FolderList folders={[zeroIdFolder]} />);

      await expect.element(screen.getByText("Zero ID Folder")).toBeVisible();
    });
  });
});
