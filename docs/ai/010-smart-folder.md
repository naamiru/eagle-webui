# Smart Folder Import & UI

## Goal
- Read smart folder definitions from `metadata.json` and expose them through the data store.
- Evaluate smart folder rules against locally imported items (excluding trashed items) to produce an up-to-date item list, count, and cover image for each folder.
- Surface smart folders in the navigation and provide a `/smartfolder/[smartFolderId]` collection view that mirrors the existing folder experience.

## Source Data
- `metadata.json` may include a top-level `smartFolders` array. Each entry can include nested `children` arrays, forming a tree.
- The raw structure is part of Eagle’s spec, so parsing must accept it as-is (e.g. `children` arrays of objects, `boolean` values expressed as `"TRUE"`/`"FALSE"`).
- Invalid entries **must not** stop the import: skip only the specific folder/condition/rule that fails validation and continue processing the rest.

## Raw JSON Structure
Parse Eagle’s data exactly as delivered while validating the required fields:

```
SmartFolderJSON := {
  id: string;                    // required, unique across all smart folders
  name?: string;                 // use id when empty
  orderBy?: string;              // defaults to "GLOBAL" during processing
  sortIncrease?: boolean;        // defaults to true
  imageCount?: number;           // recomputed locally
  coverId?: string;              // validated against matched items
  conditions?: SmartFolderConditionJSON[];
  children?: SmartFolderJSON[];
}

SmartFolderConditionJSON := {
  match?: "AND" | "OR";          // defaults to "AND"
  boolean?: "TRUE" | "FALSE";    // controls negation when present
  rules?: SmartFolderRuleJSON[];
}

SmartFolderRuleJSON := {
  property: "type" | "name";     // support these two in the first iteration
  method: string;
  value?: string;
}
```

- Preserve sibling ordering exactly as provided in JSON.
- When a folder is skipped (missing id, etc.), skip its entire subtree.
- Inside each condition, discard only the malformed rules; keep the rest. If every rule is discarded, treat the condition as `true`.

## Internal Model
After parsing, convert the JSON objects into an enriched tree that is convenient for the store and UI:

```
SmartFolder := {
  id: string;
  name: string;
  orderBy: FolderSortMethod;
  sortIncrease: boolean;
  conditions: SmartFolderCondition[];
  children: SmartFolder[];
  parentId?: string;
  itemIds: string[]; // precomputed, sorted item ids
  rawCoverId?: string;
}

SmartFolderCondition := {
  match: "AND" | "OR";
  boolean: "TRUE" | "FALSE";
  rules: SmartFolderRule[];
}
```

`SmartFolderRule` retains the JSON shape for supported properties while attaching any derived helpers needed for evaluation (e.g. precompiled regex). This internal type may be accompanied by helper data (e.g. cached previews), but the primary store structure is the tree of `SmartFolder` objects with precomputed `itemIds`.

## Rule Evaluation
- Evaluate rules against `Store.items`, ignoring any item where `isDeleted` is true.
- Condition groups:
  - Default `match` to `"AND"` and `boolean` to `"TRUE"` when missing.
  - Evaluate individual rules; if a rule cannot be parsed (unknown property/method combination, invalid regex, missing value when required), drop it.
  - For `"AND"`, require all remaining rules to succeed. For `"OR"`, require at least one success.
  - After evaluating the group, invert the result when `boolean === "FALSE"`.
- Folder membership:
  - An item belongs to a smart folder only if **all** condition groups evaluate to `true`. Absence of conditions means “match everything”.
- Child inheritance:
  - Children operate on the item set calculated for their parent. Start the root level with all non-deleted items.

### `type` rule
- `method`: `"equal"` | `"unequal"`.
- Interpret `value` literally (Eagle emits lower-case values and `item.ext` / `item.medium` are already lower-case):
  - `"font"` ➜ `item.fontMetas != undefined`.
  - `"video"` ➜ `item.duration > 0`.
  - `"audio"` ➜ `item.bpm > 0`.
  - `"youtube" | "vimeo" | "bilibili"` ➜ `item.medium === value`.
  - Any other value ➜ compare against `item.ext === value`.
- `"equal"` requires the derived type to match. `"unequal"` requires it to differ.

### `name` rule
- All comparisons are case-insensitive. Lowercase both `item.name` and the rule value before evaluating (except when running a regex).
- Supported methods:
  - `"contain"` / `"uncontain"` ➜ substring match.
  - `"startWith"`, `"endWith"`, `"equal"`.
  - `"empty"` / `"not-empty"` ➜ ignore `value`, check `item.name.length`.
  - `"regex"` ➜ compile a case-insensitive `RegExp`. If compilation fails, drop the rule. Run `test` on the raw name.

## Derived Fields
- Precompute and cache a sorted `itemIds` array for every smart folder. Use the folder’s resolved sort order (fall back to global sort when `orderBy === "GLOBAL"`).
- Derive `imageCount` as `itemIds.length` whenever needed.
- Determine cover images dynamically from `itemIds[0]` (if present) or, when available, prefer the `rawCoverId` captured from metadata if that id still exists in the array.
- Build lightweight preview objects (see below) to avoid repeated traversal in the UI.

### Smart Folder Preview Model

Expose a compact preview shape for client components:

```
SmartFolderPreview := {
  id: string;
  name: string;
  itemCount: number;
  coverId?: string;
  children: SmartFolderPreview[];
}
```

- Derive `itemCount` and `coverId` from the associated `SmartFolder.itemIds` when constructing previews.
- Generate previews alongside the smart folder tree so navigation components can consume them without additional computation.

## Store API
Extend the data layer as follows while keeping the public smart folder objects shape-compatible with Eagle:

- Update `importLibraryMetadata` to return `{ smartFolders: SmartFolder[] }` alongside existing data. Perform normalization, populate defaults, and log (`console.error`) for skipped entries.
- Extend `Item` with:
  - `fontMetas?: { numGlyphs?: number };` (default `numGlyphs` to `0` when absent)
  - `bpm: number;` (default `0`)
  - `medium: string;` (default `""`)
- Add helper utilities (e.g. `data/smart-folders.ts`) to:
  - Traverse the raw tree, clone/sanitize nodes into `SmartFolder`, and build lookup maps keyed by id when helpful for internal processing.
  - Evaluate membership and precompute sorted `itemIds` for each folder.
- Update `Store` to:
  - Accept smart folders in the constructor.
  - Expose `getSmartFolders(): SmartFolder[]` (top-level array with nested children) and `getSmartFolder(id: string)`.
  - Provide `getSmartFolderItemPreviews(id: string)` and `getFirstSmartFolderItem(id: string)` mirroring folder APIs, using precomputed `itemIds`.
  - Expose `getSmartFolderPreviews(): SmartFolderPreview[]` (matching the tree structure) for UI consumption.
  - Optionally cache derived evaluation results (e.g. `SmartFolderPreview` objects), but a dedicated map of folders by id is not required; simple traversal is acceptable due to the expected small size.

## UI Integration
1. **App layout**
   - Pass smart folder previews (see below) into `AppLayout` and `AppNavbar`.
2. **Navigation**
   - Insert a “Smart Folders (N)” section above “Folders (N)”.
   - Present the tree using the same `Tree` component. Display the derived `itemCount` on the right; when a node has collapsed children, sum the counts of all descendants for the badge.
   - Clicking a node navigates to `/smartfolder/[id]`.
3. **Collection page**
   - Create `app/smartfolder/[smartFolderId]/page.tsx` that:
     - Loads the store and list scale.
     - Looks up the smart folder by id; call `notFound()` if missing.
     - Retrieves sorted items and builds child cards (id, name, coverId) using preview data.
     - Renders `CollectionPage` with a new `sortState` variant `{ kind: "smart-folder"; value: FolderSortOptions }` that is read-only (no update action).
   - Update `SubfolderList` so the caller can provide the link base path (`/folders/` vs `/smartfolder/`).

## Error Handling
- Log skipped folders, conditions, or rules with enough context for debugging (`console.error`), but continue processing.
- Ensure the importer and store gracefully handle the absence of any smart folders.

## Translations & Styling
- Add `navbar.smartFolders` (and supporting strings) to every locale JSON file with English fallback.
- Reuse Mantine tokens and existing navbar styles; introduce minimal CSS tweaks only if necessary for layout.

## Testing Strategy
- Unit tests for:
  - Smart folder normalization (defaults, skipping invalid nodes while keeping child structure).
  - Rule evaluation combinations (`type`, `name`, boolean `"FALSE"`, hierarchy filtering).
  - Preview generation from `itemIds` (counts, cover selection).
  - `Store.getSmartFolderItemPreviews` including sort fallback.
- Integration-style test extending `import-metadata.test.ts` to ensure smart folders import and invalid nodes are skipped without aborting.
