# Sort Items Spec

Implement consistent sorting for item collections regardless of where they are displayed.

## Sorting configuration

- **Folder collections** (items shown inside a folder) read `folder.orderBy` and `folder.sortIncrease`. Defaults: `orderBy="GLOBAL"`, `sortIncrease=true`.
  - When `orderBy="GLOBAL"`, ignore `folder.sortIncrease` and delegate to the global sort settings.
  - When `orderBy="MANUAL"`, use the per-item manual ordering described below.
- **Global collections** (e.g. `All`, `Uncategorized`) ignore folder settings and always use the global sort settings stored on disk.

## Global sort settings

- Persist a JSON file at `<ospath.data()>/naamiru.eagle-webui/settings.json`.
- Schema:
  ```json
  {
    "globalSort": {
      "orderBy": "IMPORT",
      "sortIncrease": true
    }
  }
  ```
- Defaults when the file or values are missing: `orderBy="IMPORT"`, `sortIncrease=true`.
- Only expose sort methods that make sense globally; omit `GLOBAL` and `MANUAL`.

## Sort methods

| Method       | Sort by           | Field or calculation                    | `sortIncrease=true` |
| ------------ | ----------------- | --------------------------------------- | ------------------- |
| `GLOBAL`     | Delegated order   | Uses global `orderBy`/`sortIncrease`    | — (folders only)    |
| `MANUAL`     | Manual positions  | `item.order[folderId]` or fallback `modificationTime` | Newest first       |
| `IMPORT`     | Import time       | `modificationTime`                      | Newest first        |
| `MTIME`      | Modification time | `mtime`                                 | Newest first        |
| `BTIME`      | Creation time     | `btime`                                 | Newest first        |
| `NAME`       | Filename          | `name`                                  | A → Z               |
| `EXT`        | Extension         | `ext`                                   | A → Z               |
| `FILESIZE`   | File size         | `size`                                  | Smallest first      |
| `RESOLUTION` | Pixel count       | `width * height`                        | Smallest first      |
| `RATING`     | Star rating       | `star`                                  | Lowest first        |
| `DURATION`   | Media duration    | `duration`                              | Shortest first      |
| `RANDOM`     | Random shuffle    | Randomize once per sort operation       | N/A                 |

For methods marked “Newest first”, treat `sortIncrease=true` as descending (newest/highest first) and `false` as ascending (oldest/lowest first). For alphabetical/numeric sorts, `sortIncrease=true` means ascending.

## Manual ordering

Items can include an `order` map in their metadata, e.g. `"order": { "MGH4XZ1OQCGZD": "1759876940271.5" }`. Keys are folder IDs, values are decimal strings representing manual positions. Parse them as numbers for sorting. If an item lacks an entry for the active folder, fall back to `modificationTime`.

## Implementation plan

1. Create a utility to load/save the global sort settings JSON under the `globalSort` key and expose the current `orderBy`/`sortIncrease`.
2. Add a shared sorter that accepts a list of items plus `orderBy`/`sortIncrease` and returns a sorted array; cover all methods (including manual and random).
3. Update `store.getItems()` to apply the global sorting before returning results.
4. Update `store.getFolderItems(folderId)` to resolve folder-level settings, fall back to global settings when required, and return sorted items.
