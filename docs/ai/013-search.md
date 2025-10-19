**Goal**

- Add a usable search box to `CollectionPage` so the query lives in the `search` URL parameter and the item grid renders only the entries that match.

**URL contract**

- Normalise the `search` parameter once and reuse it everywhere.
  - Create `utils/search-query.ts` exporting `resolveSearchQuery(input: unknown): string`. Accept strings or `string[]`, trim whitespace, return `""` for everything else.
  - Import that helper in every collection route: `app/page.tsx`, `app/uncategorized/page.tsx`, `app/trash/page.tsx`, `app/folders/[folderId]/page.tsx`, `app/smartfolder/[smartFolderId]/page.tsx`.
  - Update each route signature to accept `{ searchParams }` (App Router contract) and call `const search = resolveSearchQuery(searchParams?.search);`.
  - Pass `search` into the store getter (`getItemPreviews`, `getFolderItemPreviews`, etc.) and into `<CollectionPage search={search} />`.

**Store filtering**

- Extend the `Store` API so every item getter can take an optional `search?: string`.
  - Methods: `getItems`, `getItemPreviews`, `getUncategorizedItems`, `getUncategorizedItemPreviews`, `getTrashItems`, `getTrashItemPreviews`, `getFolderItems`, `getFolderItemPreviews`, `getSmartFolderItemPreviews`.
  - Leave the existing call sites working by default; the parameter should be optional and default to returning the full, sorted result.
- Add two private helpers inside `Store`:
  - `parseSearchTerms(search: string): string[]` → lowercase, split on `/\s+/`, filter out empty tokens.
  - `matchesSearch(item: Item, terms: string[]): boolean` → gather all of the searchable haystacks once, lowercase them, and ensure **every** term has a partial (`includes`) match in at least one haystack.
- Haystacks to cover:
  - `item.name`
  - Each folder `name` and `description` for folders the item belongs to (look up through `this.folders`)
  - `item.ext`
  - Each tag in `item.tags`
  - `item.url`
  - `item.annotation`
  - Every `comment.annotation` (skip when there are no comments)
- Keep the original ordering by filtering the already-sorted arrays; do not resort. Return the unfiltered array when `terms.length === 0`.

**Search UI**

- Create `components/CollectionControls/SearchControl.tsx` (client component).
  - Props: `{ search: string }`. Use it only for the initial `useState` value.
  - Pull translations with `useTranslations("collection.controls")`; add a `searchPlaceholder` key (see “Translations” below).
  - Render a Mantine `TextInput size="sm"` with:
    - `leftSection={<IconSearch size={16} />}` (`pointerEvents="none"`).
    - `aria-label={t("searchPlaceholder")}` and `placeholder={t("searchPlaceholder")}`.
    - A clear affordance on the right: when the current value is non-empty, show a subtle `CloseButton` with `IconCircleXFilled size={14}` that resets the field and immediately updates the URL.
  - Use `usePathname`, `useSearchParams`, and `useRouter` from `next/navigation`.
    - Create a debounced updater (`useDebouncedCallback`, 300 ms) that clones the current params, sets or deletes `search`, and calls `router.replace(`${pathname}?${params}`, { scroll: false })`.
    - When clearing, call `debouncedUpdate.cancel()` (or `flush()` depending on the Mantine hook) so the empty string propagates immediately.
  - Desktop layout only for now; no additional mobile-specific styling is required. We’ll introduce a dedicated mobile search treatment later.

**CollectionPage integration**

- Extend `CollectionPageProps` with `search: string`.
- Replace the inline `TextInput` stub with `<SearchControl search={search} />`.
- Drop the now-unused icon imports from `CollectionPage.tsx`.
- Import the new component from `./CollectionControls/SearchControl`.
- Keep the control grouped with `ScaleControl` and `CollectionSortControls`; the search field should remain the right-most element in the header.

**Translations**

- Add `collection.controls.searchPlaceholder` set to `"Search items"` in every file under `i18n/messages/` (`en.json`, `ja.json`, `ko.json`, `zh-cn.json`, `zh-tw.json`). It’s acceptable to reuse the English text for now if you do not have localized copy on hand.

**Testing**

- Expand `data/store.test.ts`:
  - Update `createItem` to accept a `comments` override so tests can cover comment matches.
  - Add focused tests for `getItemPreviews`, `getFolderItemPreviews`, `getUncategorizedItemPreviews`, `getTrashItemPreviews`, and `getSmartFolderItemPreviews` to confirm search filtering honours all sources (name, tags, URL, annotation, comments, folder metadata).
  - Verify multi-term queries require an AND match and that matching is case-insensitive.
  - Assert that an empty or whitespace-only search returns the full, sorted list.

**QA checklist**

- Typing in the header updates the `search` query parameter without breaking the current route.
- Debounced input behaviour feels responsive (no history spam thanks to `router.replace`).
- Clearing the field removes the `search` parameter and repopulates the grid.
- Search results match expectations for folder names, tags, URLs, annotations, and comments.
