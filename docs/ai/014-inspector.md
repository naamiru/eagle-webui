**Goal**
- Ship a production-ready `ItemInspector` that mirrors Eagle’s metadata panel. The component must surface the selected item’s core details inside the desktop aside and mobile drawer without leaving implementers to guess the data contract, formatting rules, or UI layout.

**API: GET /api/items/[id]**
- Keep the existing validation and error handling (400 when `id` is missing, 404 when the item is absent or marked as deleted, 500 on unexpected failures).
- After retrieving the item from the store, build an ordered list of folder descriptors that correspond to `item.folders`.
  - Each descriptor is `{ id: string; name: string }`.
  - Skip folder IDs that no longer exist; preserve the original order for the rest.
- Return the JSON body as `ItemDetails`: spread the original `Item` fields and append `folderSummaries` (see “Shared types”).
- Add `app/api/items/[id]/route.test.ts` that mocks `getStore` and asserts the handler emits `folderSummaries` with the expected names and ordering, ignoring missing folder entries.

**Shared types**
- Extend `data/types.ts` with:
  - `export type ItemFolderSummary = { id: string; name: string };`
  - `export type ItemDetails = Item & { folderSummaries: ItemFolderSummary[] };`
- Update every consumer that casts `fetch("/api/items/...").json()` to `Item` (`ItemSlider` and `MobileItemSlider`) so they import `ItemDetails` instead. The rest of their logic stays the same.

**Formatting helpers**
- Create `utils/item-details.ts` exporting:
  - `formatFileSize(bytes: number): string`
    - Treat the input as bytes; return an empty string when the value is `<= 0` or not finite.
    - Use a 1024 base and choose the largest unit among B, KB, MB, GB.
    - Format KB/MB/GB with `toFixed(2)` and append the unit (e.g. `"12.34 MB"`). Bytes render as an integer followed by `" B"`.
  - `formatDimensions(width: number, height: number): string`
    - Return an empty string unless both numbers are positive integers.
    - Otherwise render `"${width} x ${height}"`.
  - `formatDateTime(timestamp: number, locale: string): string`
    - Return an empty string when the timestamp is `<= 0` or not finite.
    - Use `Intl.DateTimeFormat(locale, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })` to produce strings like `"2024/03/18 09:42"`.
  - `formatDuration(duration: number): string`
    - Accept the duration in seconds.
    - Return an empty string when the value is `<= 0` or not finite.
    - Otherwise format as `mm:ss` with zero-padded minutes and seconds (e.g. `02:07`).
- Add `utils/item-details.test.ts` covering the edge cases above (zero/negative values, unit thresholds, locale-aware formatting).

**ItemInspector component**
- Convert `components/ItemInspector.tsx` into a client component (`"use client"`). Props remain `{ itemId: string }`.
- Local state:
  - `state` with union `{ status: "loading" | "error" | "ready"; item: ItemDetails | null }`.
  - Initialise to `{ status: "loading", item: null }`.
  - Refetch whenever `itemId` changes; use an `AbortController` so rapid selection changes do not leak requests.
- Leave the existing parents (`AppLayout`, `MobileItemSlider`) untouched; the inspector must render correctly through the current `<ItemInspector itemId={…} />` usage.
- Fetch logic:
  - `fetch(`/api/items/${itemId}`)` with the controller signal.
  - On non-OK responses, throw to enter the error branch.
  - On success, parse as `ItemDetails` and set `{ status: "ready", item: data }`.
  - On failure, log the error and set `{ status: "error", item: null }`.
  - Return early in the effect cleanup by aborting the controller.
- Rendering:
  - The parent containers already provide scrolling; render the inspector as a full-height flex column (`className={classes.root}` with `height: 100%`, `display: flex`, `flexDirection: "column"`, and `padding: var(--mantine-spacing-md)`) without introducing a nested `ScrollArea`.
  - Inject `useTranslations("itemInspector")` and `useLocale()` to support localisation.
  - Loading state: show a `Loader` (size `"sm"`) with `Text` beneath reading `t("status.loading")`.
  - Error state: show a `Paper` with `t("status.error")` and a subtle `Button` labelled `t("actions.retry")` that reruns the fetch.
  - Ready state:
    - Header section (`Stack gap="xs"`) renders only when there is a name or extension to show:
      - If `item.name` is truthy, render `Title order={4}` with that value.
      - If `item.name` is falsy but `item.url` exists, use the URL instead.
      - Render the uppercased extension (`item.ext.toUpperCase()`) in a dimmed `Text size="xs"` only when `item.ext` is non-empty.
    - Details section:
      - Render the section wrapper (`t("sections.details")`) only when at least one field below is present.
      - Use a definition list (`<dl>`) with rows that appear conditionally:
        - `Name`: show only when `item.name` is non-empty.
        - `Note`: show only when `item.annotation.trim().length > 0`; render with `white-space: pre-wrap`.
        - `URL`: show only when `item.url.trim().length > 0`; render via `Anchor` (`target="_blank"`, `rel="noopener"`) with `IconExternalLink`.
        - `Tags`: show only when trimmed tags exist; render each tag inside a light `Badge size="sm"` inside a wrapping `Group gap="xs"`.
        - `Folders`: show only when trimmed folder names exist; render each summary as `NextLink` (`href={`/folders/${summary.id}`}`) styled like an `Anchor`.
    - Comments section:
      - Render the section (`t("sections.comments")`) only when trimmed comment annotations exist.
      - Display each comment annotation inside a `Paper radius="sm" withBorder`.
    - Properties section:
      - Always render the section (`t("sections.properties")`) because rating is always available.
      - Use a two-column `Table verticalSpacing="xs"`. Include rows in this order when their data exists:
        1. `t("properties.rating")` → display `String(item.star ?? 0)`.
        2. `t("properties.duration")` when `formatDuration(item.duration)` returns a non-empty string.
        3. `t("properties.bpm")` when `item.bpm > 0`.
        4. `t("properties.dimensions")` when `formatDimensions(item.width, item.height)` returns a non-empty string.
        5. `t("properties.size")` when `formatFileSize(item.size)` returns a non-empty string.
        6. `t("properties.type")` when `item.ext.trim().length > 0`.
        7. `t("properties.dateImported")` when `formatDateTime(item.modificationTime, locale)` returns a non-empty string.
        8. `t("properties.dateCreated")` when `formatDateTime(item.btime, locale)` returns a non-empty string.
        9. `t("properties.dateModified")` when `formatDateTime(item.mtime, locale)` returns a non-empty string.
      - Labels use `classes.propertyLabel` (dimmed, uppercase), values use `classes.propertyValue`.
- Create `components/ItemInspector.module.css` with helpers for the layout described above (`root`, `header`, `section`, `sectionTitle`, `definitionList`, `label`, `value`, `link`, `tagGroup`, `commentStack`, `commentCard`, `propertiesTable`, `propertyLabel`, `propertyValue`, `multilineText`).

**Translations**
- Add an `itemInspector` namespace to every locale file under `i18n/messages/` (`en.json`, `ja.json`, `ko.json`, `zh-cn.json`, `zh-tw.json`). English copy:
  ```json
  {
    "itemInspector": {
      "status": {
        "loading": "Loading item…",
        "error": "Unable to load item."
      },
      "actions": {
        "retry": "Retry"
      },
      "sections": {
        "details": "Details",
        "comments": "Comments",
        "properties": "Properties"
      },
      "fields": {
        "name": "Name",
        "annotation": "Note",
        "url": "URL",
        "tags": "Tags",
        "folders": "Folders"
      },
      "properties": {
        "rating": "Rating",
        "duration": "Duration",
        "bpm": "BPM",
        "dimensions": "Dimensions",
        "size": "File size",
        "type": "Type",
        "dateImported": "Date Imported",
        "dateCreated": "Date Created",
        "dateModified": "Date Modified"
      }
    }
  }
  ```
- For the other locales, reuse the English strings until proper translations exist.

**Manual QA checklist**
- Desktop: select an item, expand the inspector aside, confirm folder links navigate correctly and that each property matches the Eagle desktop app.
- Mobile: open the drawer inspector from the slider, ensure the layout scrolls and retry handling works when toggling airplane mode.
- Items with no metadata (no tags, blank annotation, zero rating) drop the related sections entirely instead of rendering placeholders; rating still shows as `0`.
