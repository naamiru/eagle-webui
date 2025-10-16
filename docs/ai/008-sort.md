Goal: wire up sorting for `CollectionPage` so `ListSortControl` reflects and updates the active sort order.

Inputs required by `CollectionPage`
- accept either `{ kind: "folder"; folderId: string; value: FolderSortOptions }` or `{ kind: "global"; value: GlobalSortOptions }` as props.
- handle `ListSortControl.onChange` internally; no external callback prop is needed.
- surface sort labels via `useTranslations("collection.sortLabels")` so the UI stays localized.
- avoid duplicating sort state in React; call the server action then `router.refresh()` to pull the updated values.

Folder collections (`/folders/[folderId]`)
- Pass `{ kind: "folder", folderId, value: { orderBy, sortIncrease } }` into `CollectionPage`.
- Render `FolderListSortControl`.
- On change: update the folder’s sort fields, persist the change through the store update path, and trigger a route refresh so the list re-reads from the store.

Global collections (`/`, `/uncategorized`, `/trash`)
- Load the global sort settings via `loadGlobalSortSettings`.
- Render `GlobalListSortControl`.
- On change: call a server action that saves the new settings to `settings.json`, refresh the route, and ensure the store re-imports items using the updated global sort.

Route refresh
- after every successful sort update, revalidate the current route (client or server) so the list re-renders with the new order.
