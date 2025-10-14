# Library Discovery Design

The web UI must resolve the Eagle desktop library location (`libraryPath`) before any asset queries run. Resolution happens once during store initialization and the result is cached in memory.

## Resolution Order

1. **Environment override** – if the `EAGLE_LIBRARY_PATH` environment variable is defined, use it directly (no filesystem validation).
2. **Eagle HTTP API** – otherwise derive the path via the Eagle REST API hosted at `EAGLE_API_URL` (defaults to `http://localhost:41595`).

If neither source yields a valid path, throw a `LibraryImportError` with the code `LIBRARY_PATH_NOT_FOUND`.

### Error contract

- Implement the error using `LibraryImportError` and the `LibraryImportErrorCode` union in `data/errors/library-import-error.ts`.
- Use the `LIBRARY_PATH_NOT_FOUND` code whenever discovery fails. The shared error helper maps codes to user-facing messages.

## Deriving The Path From Eagle

1. Request a single item from the active library:  
   `GET {EAGLE_API_URL}/api/item/list?limit=1` (docs: <https://api.eagle.cool/item/list>)  
   - Response shape: `{ "status": "success", "data": [ { "id": "KB91GNOPDDVTH", ... } ] }`.  
   - Reject the response if `status !== "success"` or `data` is empty; treat both as “library unavailable” and raise `LibraryImportError` with the `LIBRARY_PATH_NOT_FOUND` code.
2. Use the item identifier to fetch its thumbnail metadata:  
   `GET {EAGLE_API_URL}/api/item/thumbnail?id={itemId}` (docs: <https://api.eagle.cool/item/thumbnail>)  
   - Response shape: `{ "status": "success", "data": "/Users/alex/Pictures/team.library/images/KB..." }`.  
   - Reject the response if `status !== "success"` or `data` is not a string path.
3. Extract the directory that ends with the `.library` suffix. Everything after that directory (for example, `/images/...`) is discarded.  
   - Implementation note: rely on `path.sep` as the canonical separator (the Eagle desktop app and Node server run on the same host). Use `path.join`/`path.parse` when composing or inspecting segments.

## Store Integration

- `data/store.ts` exposes an `async function getStore(): Store`.
- If `libraryPath` is unset when `getStore` runs, perform the discovery flow above and cache the resolved path on the returned store instance.
- Subsequent `getStore` invocations must reuse the cached `libraryPath` rather than repeating the lookup.

## Testing Requirements

Use **Vitest** to cover the discovery logic:
- Environment preference: when `EAGLE_LIBRARY_PATH` is set, the API is not called.
- API fallback: simulate both populated and empty `/api/item/list` responses.
- Path extraction: ensure `.library` detection works for POSIX and Windows style paths (mock the separator in unit tests when running on a different host OS).
- Error handling: verify a missing library raises `LibraryImportError` with the `LIBRARY_PATH_NOT_FOUND` code.
