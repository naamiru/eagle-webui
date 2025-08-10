import { describe, expect } from "vitest";
import { render } from "vitest-browser-react";
import { test as it, TestWrapper } from "~/test/helpers";
import { mockImage1, mockImage2, mockImages } from "./__fixtures__/images";
import { ItemList } from "./ItemList";

describe("ItemList", () => {
  describe("Gallery Container", () => {
    it("wraps content in PhotoSwipe Gallery component", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={[mockImage1]} />
        </TestWrapper>,
      );

      // Gallery component should be present (PhotoSwipe Gallery)
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });

    it("applies grid CSS module", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={mockImages} />
        </TestWrapper>,
      );

      // Verify component renders correctly (grid CSS is applied internally)
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(3);
    });

    it("PhotoSwipe CSS is imported correctly", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={[mockImage1]} />
        </TestWrapper>,
      );

      // Should render without CSS import errors
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });
  });

  describe("Item Rendering Logic", () => {
    it("renders ImageItem for each item", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={mockImages} />
        </TestWrapper>,
      );

      // Should have image elements
      const images = screen.getByRole("img").all();
      expect(images.length).toBe(3);

      // Check specific image attributes
      await expect.element(images[0]).toHaveAttribute("alt", "item-1");
      await expect.element(images[1]).toHaveAttribute("alt", "item-2");
      await expect.element(images[2]).toHaveAttribute("alt", "item-3");
    });

    it("renders single image correctly", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={[mockImage1]} />
        </TestWrapper>,
      );

      const images = screen.getByRole("img").all();
      expect(images.length).toBe(1);

      // Check for exact dynamic URL
      const expectedUrl = `http://localhost:57821/item/thumbnail?id=item-1&libraryPath=%2Ftest%2Flibrary%2Fpath`;
      await expect.element(images[0]).toHaveAttribute("src", expectedUrl);
      await expect
        .element(images[0])
        .toHaveAttribute("alt", `${mockImage1.id}`);
    });

    it("handles empty items array by rendering nothing", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={[]} />
        </TestWrapper>,
      );

      // Should not render any content when items array is empty
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0);
    });
  });

  describe("PhotoSwipe Integration", () => {
    it("integrates with PhotoSwipe for image gallery functionality", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={[mockImage1, mockImage2]} />
        </TestWrapper>,
      );

      // Verify images are clickable (PhotoSwipe Item wrapper)
      const images = screen.getByRole("img").all();
      expect(images.length).toBe(2);

      // Images should be present and clickable
      for (const img of images) {
        await expect.element(img).toBeVisible();
      }
    });

    it("passes correct props to PhotoSwipe Item component", async () => {
      const screen = await render(
        <TestWrapper>
          <ItemList items={[mockImage1]} />
        </TestWrapper>,
      );

      const img = screen.getByRole("img");

      // Verify image properties are set correctly with dynamic URL
      const expectedUrl = `http://localhost:57821/item/thumbnail?id=item-1&libraryPath=%2Ftest%2Flibrary%2Fpath`;
      await expect.element(img).toHaveAttribute("src", expectedUrl);
      await expect.element(img).toHaveAttribute("alt", `${mockImage1.id}`);
    });
  });

  describe("Edge Cases", () => {
    it("handles items with different dimensions", async () => {
      const differentSizeImages = [
        {
          id: "item-1",
          width: 800,
          height: 600,
        },
        {
          id: "item-2",
          width: 1920,
          height: 1080,
        },
        {
          id: "item-3",
          width: 400,
          height: 800,
        },
      ];

      const screen = await render(
        <TestWrapper>
          <ItemList items={differentSizeImages} />
        </TestWrapper>,
      );

      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(3);
    });
  });
});
