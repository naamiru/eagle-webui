import { HttpResponse, http } from "msw";

export const handlers = [
  // Handle thumbnail requests
  http.get("http://localhost:57821/item/thumbnail", () => {
    // Return a 1x1 transparent PNG as base64
    const transparentPixel =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    return new HttpResponse(
      Uint8Array.from(atob(transparentPixel), (c) => c.charCodeAt(0)),
      {
        headers: {
          "Content-Type": "image/png",
        },
      },
    );
  }),

  // Handle original image requests
  http.get("http://localhost:57821/item/image", () => {
    // Return a 1x1 transparent PNG as base64
    const transparentPixel =
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";

    return new HttpResponse(
      Uint8Array.from(atob(transparentPixel), (c) => c.charCodeAt(0)),
      {
        headers: {
          "Content-Type": "image/png",
        },
      },
    );
  }),
];
