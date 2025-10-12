# Importing Library Metadata

Use this checklist when implementing the metadata import flow.

## Source Data
- Resolve `libraryPath` in `instrumentation.ts`, then load metadata from that directory.
- A sample data set lives at `../sample-library`:
  - `metadata.json` contains the library header plus a `folders` tree.
  - `mtime.json` is an index of item IDs to last-modified timestamps, plus an `"all"` count.
  - `images/<itemId>.info` holds per-item metadata and media files.

## Sample JSON Structure
- `metadata.json`
  ```ts
  type LibraryMetadata = {
    applicationVersion: string;
    modificationTime: number;
    folders: Folder[];
    smartFolders: unknown[];
    quickAccess: unknown[];
    tagsGroups: unknown[];
  };

  type Folder = {
    id: string;
    name?: string;
    description?: string;
    children?: Folder[];
    modificationTime?: number;
    tags?: string[];
    password?: string;
    passwordTips?: string;
    coverId?: string;
    orderBy?: string;      // e.g., "MANUAL"
    sortIncrease?: boolean;
  };
  ```
  - Source data nests child folders as full objects inside the parent `children` array (e.g., `animal` contains a `dog` child).
- `mtime.json`
  ```ts
  type MTimeIndex = {
    [itemId: string]: number; // unix ms timestamp
    all: number;              // total item count
  };
  ```
- `images/<itemId>.info/metadata.json`
  ```ts
  type ItemMetadata = {
    id: string;
    name?: string;
    size?: number;
    btime?: number;
    mtime?: number;
    ext?: string;
    tags?: string[];
    folders?: string[];
    isDeleted?: boolean;
    url?: string;
    annotation?: string;
    modificationTime?: number;
    height?: number;
    width?: number;
    noThumbnail?: boolean;
    lastModified?: number;
    palettes?: Array<{
      color: [number, number, number];
      ratio: number;
      $$hashKey?: string;
    }>;
  };
  ```
  - Only `id` is guaranteed by Eagle. All other fields may be missing and must be defaulted locally as described below.

## Validation and Failure Handling
- Validate every JSON file with AJV.
- If a folder, item, or other record fails validation, log the error and continue importing the remaining data.

## Application Metadata (`metadata.json`)
- Verify that `applicationVersion` exists and starts with `4.`. Abort the import and surface an error state if it does not.

## Folder Metadata (`metadata.json`)
- Load the `folders` array into `store.folders` as a `Map<string, Folder>`.
- Extend `Folder` with:
  - `manualOrder: number` to preserve the order supplied by the file.
  - `children: string[]` containing the IDs of child folders.
  - `parentId?: string` set when a folder appears inside another folder’s `children`.
- Treat every property except `id`, `parentId`, and `coverId` as required in our runtime model. Provide sensible defaults when the source omits a field:
  - Strings → `""`
  - Numbers → `0`
  - Arrays → `[]`
  - `orderBy` → `"GLOBAL"`
  - `sortIncrease` → `true`

## Item Index (`mtime.json`)
- Every key except `"all"` is an item ID. The corresponding values are timestamps but are not currently used.

## Item Metadata (`images/${itemId}.info/metadata.json`)
- For each item ID from `mtime.json`, load the item metadata file and add it to `store.items` as a `Map<string, Item>`.
- As with folders, treat only `id` as required in the source data. Provide default values (`""`, `0`, `[]`) for all other fields in the `Item` type so consumers can rely on non-optional properties.

## UI Behaviour During Import
- While importing, render a full-screen loader across all pages without changing the current URL.
- If any blocking error occurs (missing library, incompatible application version, unreadable JSON, etc.), show an error screen that offers to retry detection/import without redirecting.
- After a successful import, display the folder name list on the home page for debugging purposes.
