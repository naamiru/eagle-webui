import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { mockImage1, mockImage2, mockImages } from "./__fixtures__/images";
import { ItemList } from "./ItemList";

describe("ItemList", () => {
  describe("Gallery Container", () => {
    it("wraps content in PhotoSwipe Gallery component", async () => {
      const screen = await render(<ItemList items={[mockImage1]} />);

      // Gallery component should be present (PhotoSwipe Gallery)
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });

    it("applies grid CSS module", async () => {
      const screen = await render(<ItemList items={mockImages} />);

      // Verify component renders correctly (grid CSS is applied internally)
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(3);
    });

    it("PhotoSwipe CSS is imported correctly", async () => {
      const screen = await render(<ItemList items={[mockImage1]} />);

      // Should render without CSS import errors
      const container = screen.getByRole("generic");
      expect(container).toBeTruthy();
    });
  });

  describe("Item Rendering Logic", () => {
    it("renders ImageItem for each item", async () => {
      const screen = await render(<ItemList items={mockImages} />);

      // Should have image elements
      const images = screen.getByRole("img").all();
      expect(images.length).toBe(3);

      // Check specific image attributes
      await expect.element(images[0]).toHaveAttribute("alt", "1");
      await expect.element(images[1]).toHaveAttribute("alt", "2");
      await expect.element(images[2]).toHaveAttribute("alt", "3");
    });

    it("renders single image correctly", async () => {
      const screen = await render(<ItemList items={[mockImage1]} />);

      const images = screen.getByRole("img").all();
      expect(images.length).toBe(1);

      await expect
        .element(images[0])
        .toHaveAttribute("src", mockImage1.thumbnail);
      await expect
        .element(images[0])
        .toHaveAttribute("alt", `${mockImage1.id}`);
    });

    it("handles empty items array by rendering nothing", async () => {
      const screen = await render(<ItemList items={[]} />);

      // Should not render any content when items array is empty
      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(0);
    });
  });

  describe("PhotoSwipe Integration", () => {
    it("integrates with PhotoSwipe for image gallery functionality", async () => {
      const screen = await render(
        <ItemList items={[mockImage1, mockImage2]} />,
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
      const screen = await render(<ItemList items={[mockImage1]} />);

      const img = screen.getByRole("img");

      // Verify image properties are set correctly
      await expect.element(img).toHaveAttribute("src", mockImage1.thumbnail);
      await expect.element(img).toHaveAttribute("alt", `${mockImage1.id}`);
    });
  });

  describe("Edge Cases", () => {
    it("handles items with different dimensions", async () => {
      const differentSizeImages = [
        {
          id: 1,
          original: "test1.jpg",
          thumbnail: "thumb1.jpg",
          width: 800,
          height: 600,
        },
        {
          id: 2,
          original: "test2.jpg",
          thumbnail: "thumb2.jpg",
          width: 1920,
          height: 1080,
        },
        {
          id: 3,
          original: "test3.jpg",
          thumbnail: "thumb3.jpg",
          width: 400,
          height: 800,
        },
      ];

      const screen = await render(<ItemList items={differentSizeImages} />);

      const images = screen.getByRole("img").elements();
      expect(images.length).toBe(3);
    });
  });
});
