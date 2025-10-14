## Lightweight item payloads

### Problem
- Hydrating client components with full `Item` objects pulls megabytes of data across the server/client boundary and blocks initial render.
- The UI only needs an item id to locate media; any additional metadata can be fetched lazily.

### Goal
Limit client props to minimal metadata while keeping media grids and sliders functional.

### Plan
1. **Server → client contract**
   - Update `CollectionPage`, `ItemList`, `ItemSlider`, and `MobileItemSlider` to accept item previews shaped as `{ id, duration }` instead of full `Item` objects.
   - Keep `initialItemId` and `totalItemCount` props where needed for selection state and counters.
   - On server routes (`app/page.tsx`, `app/folders/[folderId]/page.tsx`) call `store` helpers that emit lightweight items for the relevant scope.
2. **Rendering with ids**
   - Use `item.id` anywhere we previously rendered `item.name` (e.g. `alt={item.id}`) so image components stay accessible without extra metadata.
   - Keep everything else driven by `item.id` and `libraryPath`; no metadata endpoint is required.
3. **Image endpoints**
   - Remove the `libraryPath` search param from `getImageUrl` / `getThumbnailUrl`. Only send `id`.
   - In `/api/items/(image|thumbnail)`, call `getStore()` to look up `libraryPath` and verify the item exists before streaming the file.

### Acceptance
- Inspect `CollectionPage` props in React DevTools and confirm only `{ id, duration }` crosses the RSC boundary as the `ItemPreview` type.
- Grid thumbnails and sliders still render item names and media.
- Inspect the image markup in devtools and confirm `alt` attributes equal the item id.
