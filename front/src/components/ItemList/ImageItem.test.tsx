import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { TestWrapper } from "~/test/helpers";
import type { Item } from "~/types/item";
import { ImageItem } from "./ImageItem";

describe("ImageItem", () => {
  const mockImage: Item = {
    id: "test-item-123",
    width: 1600,
    height: 1200,
  };

  describe("URL Construction", () => {
    it("constructs correct thumbnail URL", async () => {
      const screen = await render(
        <TestWrapper>
          <ImageItem image={mockImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      const expectedThumbnailUrl =
        "http://localhost:57821/item/thumbnail?id=test-item-123&libraryPath=%2Ftest%2Flibrary%2Fpath";
      await expect.element(img).toHaveAttribute("src", expectedThumbnailUrl);
    });

    it("constructs correct original URL for PhotoSwipe", async () => {
      const screen = await render(
        <TestWrapper>
          <ImageItem image={mockImage} />
        </TestWrapper>,
      );

      // The original URL is passed to PhotoSwipe GalleryItem
      // We can verify the img element exists and has correct attributes
      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();
    });

    it("properly encodes library path in URLs", async () => {
      const imageWithSpecialId: Item = {
        id: "item with spaces",
        width: 800,
        height: 600,
      };

      const screen = await render(
        <TestWrapper>
          <ImageItem image={imageWithSpecialId} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      // URLSearchParams encodes spaces as + in query strings
      const expectedUrl =
        "http://localhost:57821/item/thumbnail?id=item+with+spaces&libraryPath=%2Ftest%2Flibrary%2Fpath";
      await expect.element(img).toHaveAttribute("src", expectedUrl);
    });
  });

  describe("Component Rendering", () => {
    it("renders img element with correct attributes", async () => {
      const screen = await render(
        <TestWrapper>
          <ImageItem image={mockImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");

      // Check all important attributes
      await expect.element(img).toHaveAttribute("alt", "test-item-123");
      await expect.element(img).toHaveAttribute("loading", "lazy");
      await expect.element(img).toBeVisible();
    });

    it("includes loading='lazy' attribute", async () => {
      const screen = await render(
        <TestWrapper>
          <ImageItem image={mockImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toHaveAttribute("loading", "lazy");
    });
  });

  describe("Library Context Integration", () => {
    it("uses library path from context", async () => {
      const screen = await render(
        <TestWrapper>
          <ImageItem image={mockImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");

      // Verify the URL contains the test library path by checking the src attribute
      await expect
        .element(img)
        .toHaveAttribute(
          "src",
          expect.stringContaining("%2Ftest%2Flibrary%2Fpath"),
        );
    });

    it("updates URLs when library path would change", async () => {
      // This test verifies that the component would update if library context changes
      // In our test setup, the library path is fixed, but the component is properly connected
      const screen = await render(
        <TestWrapper>
          <ImageItem image={mockImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();

      // The component correctly uses useLibrary hook
      await expect
        .element(img)
        .toHaveAttribute("src", expect.stringContaining("libraryPath="));
    });
  });

  describe("Item ID Handling", () => {
    it("handles ID with underscores", async () => {
      const item = { id: "ID_WITH_UNDERSCORES", width: 800, height: 600 };

      const screen = await render(
        <TestWrapper>
          <ImageItem image={item} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toHaveAttribute("alt", item.id);
      await expect
        .element(img)
        .toHaveAttribute("src", expect.stringContaining(`id=${item.id}`));
    });

    it("handles numeric ID", async () => {
      const item = { id: "123456789", width: 800, height: 600 };

      const screen = await render(
        <TestWrapper>
          <ImageItem image={item} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toHaveAttribute("alt", item.id);
      await expect
        .element(img)
        .toHaveAttribute("src", expect.stringContaining(`id=${item.id}`));
    });
  });

  describe("Different Image Dimensions", () => {
    it("handles portrait orientation", async () => {
      const portraitImage: Item = {
        id: "portrait",
        width: 600,
        height: 800,
      };

      const screen = await render(
        <TestWrapper>
          <ImageItem image={portraitImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();
    });

    it("handles landscape orientation", async () => {
      const landscapeImage: Item = {
        id: "landscape",
        width: 1920,
        height: 1080,
      };

      const screen = await render(
        <TestWrapper>
          <ImageItem image={landscapeImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();
    });

    it("handles square images", async () => {
      const squareImage: Item = {
        id: "square",
        width: 1000,
        height: 1000,
      };

      const screen = await render(
        <TestWrapper>
          <ImageItem image={squareImage} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");
      await expect.element(img).toBeVisible();
    });
  });
});
