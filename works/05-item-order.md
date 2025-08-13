# Item Ordering Implementation Specification

## Problem

The Eagle API `/api/item/list` ignores the `orderBy` parameter - all sorting must be implemented client-side.

## Requirements

### 1. Extend Item Type
Add fields to `app/types/models.ts`:
- `globalOrder`: number - Position in API response (for GLOBAL sorting)
- `manualOrder`: number - Custom position value (for MANUAL sorting)

### 2. Process API Response
When fetching items from `/api/item/list`:
- Preserve response order by assigning `globalOrder` (1, 2, 3...)
- For each item, set `manualOrder`:
  - If response has `order[folderId]`: parse as float (`parseFloat(order[folderId])`)
  - Otherwise: use response's `modificationTime` as fallback

### 3. Implement Sort Function
Create `sortItems()` in `app/utils/folder.ts`:

**Input:**
- items: Item[]
- orderBy: string (GLOBAL, MANUAL, NAME, SIZE, IMPORT, MTIME, etc.)
- sortIncrease: boolean (true=ascending, false=descending)

**Sorting Logic:**

Primary sort by specified field:
- GLOBAL: Sort by `globalOrder` only (no secondary sort)
- MANUAL: Sort by `manualOrder`
- NAME: Sort by `name` (alphanumeric)
- SIZE: Sort by `size` (bytes)
- IMPORT/BTIME: Sort by `btime`
- MTIME: Sort by `mtime`
- RATING: Sort by `star`
- RESOLUTION: Sort by `width * height`
- DURATION: Sort by `duration`
- EXT: Sort by `ext`

Secondary sort (except for GLOBAL):
- Use `globalOrder` as tiebreaker when primary values are equal
- Apply same direction as primary sort

**Direction:**
- Apply `sortIncrease` to determine ascending/descending
- Note: MANUAL, IMPORT, BTIME, MTIME use inverted logic (true=newest first)

### 4. Apply Sorting
In folder item list view:
- Get folder's `orderBy` and `sortIncrease` settings
- Call `sortItems()` before rendering
- Default to GLOBAL if `orderBy` is undefined