# Feature: Discover and Access Eagle Library Path

## Overview

Implement library path discovery functionality to enable access to Eagle's image files. The library path is needed to construct proper file URLs for serving images from Eagle's local storage.

## Current State

- Frontend and proxy services are running with folder and item fetching capabilities
- Items currently use placeholder URLs from Unsplash instead of actual Eagle image files
- No mechanism exists to discover the current Eagle library path

## Problem Statement

To serve actual image files from Eagle, we need to know the current library path. Eagle API doesn't provide a direct endpoint for library information, but the library path can be extracted from item thumbnail paths.

## Eagle API Reference

### Item List Endpoint
- **Endpoint**: `GET http://localhost:41595/api/item/list`
- **Documentation**: https://api.eagle.cool/item/list
- **Query Parameters**: 
  - `limit` (number): Number of items to return
- **Response Structure**:
  ```json
  {
    "status": "success", 
    "data": [
      {
        "id": "LIFKJZNPSU5T4",
        "name": "image.jpg",
        "size": 2048576,
        "ext": "jpg",
        "tags": ["nature", "landscape"],
        "folders": ["folder_id"],
        "url": "https://example.com/reference-url.jpg",
        "height": 1080,
        "width": 1920
      }
    ]
  }
  ```

### Item Thumbnail Endpoint
- **Endpoint**: `GET http://localhost:41595/api/item/thumbnail`
- **Documentation**: https://api.eagle.cool/item/thumbnail
- **Query Parameters**: 
  - `id` (string): Item ID from the item list
- **Response Structure**:
  ```json
  {
    "status": "success",
    "data": "/Users/username/Library/Application Support/Eagle/Eagle.library/images/LIFKJZNPSU5T4.info/image_thumbnail.png"
  }
  ```

### Library Path Extraction Strategy

The thumbnail API returns the actual file path. The library path can be extracted by:
1. Fetching an item ID from `/api/item/list`
2. Calling `/api/item/thumbnail` with that item ID
3. Extracting the library path from the returned thumbnail path

**Example**:
- Get item ID: `LIFKJZNPSU5T4`
- Thumbnail path: `/Users/username/Library/Application Support/Eagle/Eagle.library/images/LIFKJZNPSU5T4.info/image_thumbnail.png`
- Library Path: `/Users/username/Library/Application Support/Eagle/Eagle.library`

## Implementation Requirements

### 1. Proxy Service (`/proxy`)

#### Create Library Route: `/proxy/src/library.ts`

**Purpose**: Discover and return the current Eagle library path by fetching a single item and extracting the path from its URL.

**Interface**:
```typescript
interface Library {
  path: string;
}
```

**Implementation Details**:
1. Create endpoint `GET /library/info` returning `Library`
2. Call Eagle API `GET /api/item/list?limit=1` to get one item
3. Call Eagle API `GET /api/item/thumbnail?id={itemId}` to get thumbnail path
4. Extract library path from the thumbnail path:
   - Find the `.library` directory in the path
   - Extract everything up to and including `.library`
5. Return `{ path: libraryPath }`
6. Handle edge cases:
   - No items in library (return error with helpful message)
   - Eagle not running (existing error handling applies)
   - Malformed thumbnail paths (return error)

**Error Handling**:
- **No Items**: Return 404 with message "No items found in Eagle library"
- **Invalid Path**: Return 500 with message "Unable to determine library path from thumbnail URL"
- **Eagle Offline**: Use existing EagleApiError handling

#### Register Route

Update `/proxy/src/app.ts` to import and register the library routes:
```typescript
import libraryRoutes from "./library";
// ...
app.register(libraryRoutes);
```

### 2. Frontend (`/front`)

#### Create API Layer: `/front/src/api/library.ts`

Following the established pattern from folders.ts and items.ts:

```typescript
import { queryOptions } from "@tanstack/react-query";

export interface Library {
  path: string;
}

export const fetchLibrary = async (): Promise<Library> => {
  const response = await fetch("http://localhost:57821/library/info");
  
  if (!response.ok) {
    throw new Error(
      `Failed to fetch library info: ${response.status} ${response.statusText}`,
    );
  }
  
  return response.json();
};

export const libraryQueryOptions = queryOptions({
  queryKey: ["library"],
  queryFn: fetchLibrary,
  staleTime: 24 * 60 * 60 * 1000, // 24 hours (library path rarely changes)
  retry: (failureCount, error) => {
    // Don't retry if proxy service is unavailable
    if (error.message.includes("Failed to fetch")) return false;
    return failureCount < 2; // Fewer retries since library is critical
  },
});
```

#### Type Definitions

Add Library interface to `/front/src/types/item.ts`:
```typescript
export interface Library {
  path: string;
}
```

#### Integration with Root Route and Context

Since library path is needed across all pages, it should be fetched at the root route level and made available through context.

**Update Router Context**:

Update `/front/src/routes/__root.tsx` to include library in context and prefetch it:
```typescript
import type { QueryClient } from "@tanstack/react-query";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { libraryQueryOptions } from "~/api/library";
import LibraryContext from "~/contexts/LibraryContext";
import "~/styles/pico.css";

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  loader: ({ context }) => 
    context.queryClient.ensureQueryData(libraryQueryOptions),
  component: RootComponent,
});

function RootComponent() {
  const { data: library } = useSuspenseQuery(libraryQueryOptions);
  
  return (
    <LibraryContext.Provider value={library}>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </LibraryContext.Provider>
  );
}
```

**Create Library Context**:

Create `/front/src/contexts/LibraryContext.tsx`:
```typescript
import { createContext, useContext } from "react";
import type { Library } from "~/api/library";

const LibraryContext = createContext<Library | null>(null);

export const useLibrary = () => {
  const library = useContext(LibraryContext);
  if (!library) {
    throw new Error("useLibrary must be used within LibraryContext.Provider");
  }
  return library;
};

export default LibraryContext;
```

**Usage in Components**:

Any component can now access the library path using the context hook:
```typescript
import { useLibrary } from "~/contexts/LibraryContext";

function SomeComponent() {
  const library = useLibrary();
  // library.path is available for constructing image URLs
  
  return <div>Library path: {library.path}</div>;
}
```

## Data Flow

1. User navigates to the application
2. Root route loader prefetches library info via TanStack Query
3. Frontend calls proxy: `GET /library/info`  
4. Proxy calls Eagle API: `GET /api/item/list?limit=1`
5. Proxy calls Eagle API: `GET /api/item/thumbnail?id={itemId}`
6. Proxy extracts library path from thumbnail path
7. Proxy returns `{ path: "/path/to/Eagle.library" }`
8. Frontend caches library path and makes it available via context

## Implementation Steps

1. **Create Proxy Library Route**:
   - Implement `/proxy/src/library.ts` with library path extraction logic
   - Add comprehensive error handling for edge cases
   - Register route in app.ts

2. **Create Frontend API Layer**:
   - Implement `/front/src/api/library.ts` following established patterns
   - Add Library interface to type definitions
   - Configure appropriate caching strategy (24hr stale time)

3. **Integrate with Application**:
   - Add library query to root route loader for global prefetching
   - Create React context to make library path available throughout the app
   - Update root route to provide library context to all child routes

4. **Testing**:
   - Test library path extraction with various thumbnail path formats
   - Test error handling when no items exist
   - Test two-step API call process (item list → thumbnail)
   - Test integration with existing error boundaries

## Testing Considerations

### Proxy Tests (`/proxy/src/library.test.ts`)

1. **Happy Path**: Mock both Eagle APIs with valid item and thumbnail path
2. **No Items**: Mock Eagle API returning empty array from item list
3. **Invalid Thumbnail Path**: Mock thumbnail API with malformed paths
4. **Eagle Offline**: Test existing error handling integration
5. **Path Extraction**: Test library path extraction with various thumbnail path formats

### Frontend Tests

1. **API Integration**: Mock proxy responses for library endpoint
2. **Error Handling**: Test error states in query options
3. **Caching**: Verify appropriate stale time and retry logic

## Success Criteria

- [ ] Proxy endpoint `/library/info` successfully discovers Eagle library path
- [ ] Library path extraction works with various Eagle thumbnail path formats  
- [ ] Frontend caches library information with appropriate TTL
- [ ] Graceful error handling when Eagle has no items
- [ ] Library path is available throughout the application
- [ ] Comprehensive test coverage for all scenarios

## Future Considerations

- **Image Serving**: Use discovered library path to serve actual Eagle images instead of placeholders
- **Multiple Libraries**: Handle Eagle library switching (path updates)
- **Path Validation**: Verify library path exists and is accessible
- **Performance**: Consider caching library path in proxy to reduce Eagle API calls

## Notes

- Library path discovery is a prerequisite for serving actual Eagle images
- This implementation assumes Eagle stores images in the standard `.library` directory structure
- The 24-hour cache TTL assumes library paths change infrequently