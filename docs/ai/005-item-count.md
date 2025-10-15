# Item Count Display

## Goal
Display an item count next to every collection entry rendered by `MainLinkButton`.

## Data Targets
- Collections `All`, `Uncategorized`, and `Trash`: persist counts at `store.itemCounts.all`, `.uncategorized`, and `.trash`.
- Every folder record: persist the count on the folder object as `folder.itemCount`.

## When to Calculate
Recalculate counts immediately after an import finishes (once the complete `Item[]` is available), and store the results so the UI can react.

## How to Calculate
- Traverse the `Item[]` exactly once and derive all counts inside that loop.
- Do not call any `store.get*` helpers while counting; access the in-memory `Item[]` directly to avoid redundant lookups.
