**Goal**
- Remember which folders and smart folders are expanded in the navbar so the tree keeps its open state across reloads. Persist the state in `settings.json` and hydrate it on first render.

**Settings schema**
- Define and export `NavbarExpandedState = { folders: string[]; smartFolders: string[] }`.
- Extend `SettingsFile` with an optional `navbarExpandedState?: Partial<NavbarExpandedState>`. When reading from disk, fall back to `{ folders: [], smartFolders: [] }`.
- Add helpers in `data/settings.ts`:
  - `loadNavbarExpandedState()` reads `navbarExpandedState`, strips non-string entries, trims whitespace, drops empty strings, and deduplicates while preserving order.
  - `saveNavbarExpandedState(partial)` merges with the existing state, sanitises the inputs the same way, sorts the final arrays for deterministic writes, and stores them back under the same key via `saveSettings`.
- Update `data/settings.test.ts` to cover the sanitisation and merge behaviours (invalid values ignored, duplicates removed, partial updates merge correctly).

**Server wiring**
- In `ImportReadyLayout` (`app/layout.tsx`), load the expanded state alongside the store with `Promise.all`. Pass the full `NavbarExpandedState` object into `AppLayout` as `initialNavbarExpandedState`.
- Thread that state through `AppLayout` → `AppNavbar`, reusing the same type for the prop. Within `AppNavbar`, destructure the two arrays and pass them straight into `FolderSection`/`SmartFolderSection` as initial values; no additional client state tracking is required.

**Navigation tree handling**
- Update `NavigationTree` to accept two required props: `initialExpandedIds: string[]` and `onExpandedChange: (expandedIds: string[]) => void`.
- Call `const tree = useTree({ initialExpandedState, onNodeExpand, onNodeCollapse })`, where `initialExpandedState` comes from `getTreeExpandedState(data, initialExpandedIds)`, and pass it into `<Tree tree={tree} ... />`.
- Leave the existing `tree.toggleExpanded` logic untouched so the UI keeps working.
- In both `onNodeExpand` and `onNodeCollapse`, read the current `tree.expandedState`, collect ids with `true`, sort them, and forward the array via `onExpandedChange`. Rely entirely on Mantine’s state; do not add extra React state or refs.

**Folder section integration**
- `FolderSection` should accept `initialExpandedIds` and wire them into `NavigationTree`.
- Debounce persistence work by ~300 ms; when the tree notifies about expansion changes, call the server action with `{ area: "folders", expandedIds }` without additional filtering — the action performs its own sanitisation.

**Smart folder section**
- Mirror the folder integration: accept `initialExpandedIds`, pass them to `NavigationTree`, and debounce persistence via `{ area: "smart-folders", expandedIds }`.

**Server action**
- Create `actions/updateNavbarExpandedState.ts` (name can vary) that accepts `{ area: "folders" | "smart-folders"; expandedIds: unknown }`.
- Validate the payload (array of non-empty strings). On success, call `saveNavbarExpandedState` with the relevant partial (either `folders` or `smartFolders`). Return `{ ok: true }` / `{ ok: false, error }`, logging failures in the caller.

**Client persistence hook-up**
- Import the server action into both sections. Use `useDebouncedCallback` from `@mantine/hooks` to debounce writes by ~300 ms. The callback should re-check the latest expanded IDs before invoking the action to avoid stale state.
- If an action call fails, log the error to `console.error` but leave the UI state unchanged.

**Testing**
- Extend `data/settings.test.ts` with cases for the new helpers (loading invalid data, merging partial updates, ensuring arrays are sorted/deduped).
- Add a component-level test (or Storybook interaction test) to confirm that toggling a folder calls the debounced persistence function with the expected IDs.
