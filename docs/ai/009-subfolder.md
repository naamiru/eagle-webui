**Goal**
- Replace the placeholder markup in `components/CollectionPage.tsx` with a working subfolder grid so folder pages surface their direct children ahead of the item list.

**Types and props**
- Create `components/SubfolderList.tsx` and export `type Subfolder = { id: string; name: string; coverId?: string }`.
- Extend `CollectionPageProps` with `subfolders: Subfolder[]`. Default to an empty array for routes that are not scoped to a folder (`/`, `/uncategorized`, `/trash`).

**Server data plumbing**
- In `app/folders/[folderId]/page.tsx`, build the `subfolders` array from the current folder’s `children` list. Preserve the order of `children` and skip ids that are missing from `store.folders`.
- For each child folder:
  - Prefer its `coverId`.
  - If `coverId` is falsy, call a new `store.getFirstFolderItem(childId)` helper and use the returned item’s `id` as the fallback cover. When the folder has no items (helper returns `undefined`), leave `coverId` undefined.
- Pass the resulting array to `<CollectionPage ... subfolders={subfolders} />`.

**Data helper**
- Add `getFirstFolderItem(folderId: string): Item | undefined` to `Store`. The helper should iterate `items.values()` and return the first non-deleted item whose `folders` array includes the given `folderId`. Avoid sorting or allocating additional arrays—return immediately on the first match. Export the method so the folder route can consume it.

**Subfolder list component**
- `SubfolderList` props: `{ libraryPath: string; subfolders: Subfolder[]; listScale: number; }`.
- Return `null` when `subfolders.length === 0`. The parent will render the section header.
- Reuse the list scale styling from `ItemList`: extract `computeGridStyle` (and the CSS variable contract) to a shared helper so both components stay in sync.
- Render a CSS grid (plain `div`, no `VirtuosoGrid`) with the same `grid-template-columns` as `ItemList`. Create a companion `SubfolderList.module.css` for the grid, tile, image, placeholder, and name styles.
- Each tile should be a `next/link` to `/folders/{id}` that wraps:
  - A square thumbnail area (`aspect-ratio: 1 / 1`). When `coverId` exists, use `getThumbnailUrl(coverId, libraryPath)` in an `<img>` with `alt={name}`. Otherwise show a neutral placeholder block (`background-color: var(--mantine-color-gray-4)` or similar) and set `aria-hidden="true"` on the placeholder.
  - A text label (`<Text size="sm">`) below the thumbnail showing the folder name with ellipsis overflow handling.

**CollectionPage render**
- Replace the hard-coded `subfolders` array with the `subfolders` prop and render `<SubfolderList>` before the item section.
- Add/adjust a `sectionTitle` style in `components/CollectionPage.module.css` (margin, font weight, dimmed color) so both the “Subfolders” and “Contents” headings match the app’s styling.
- Only render the “Subfolders (n)” header when the array is non-empty; the “Contents (n)” header should follow immediately after `SubfolderList`.

**QA checklist**
- Folder with children shows the subfolder grid, and tiles link to the correct folder routes.
- Folder with children but no covers still renders placeholders (no broken images).
- Folder without children hides the subfolder header entirely.
- Changing the list scale adjusts both the item grid and the subfolder grid widths.
