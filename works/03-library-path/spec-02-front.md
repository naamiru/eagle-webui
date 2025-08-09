# Library Path Discovery - Frontend Implementation

Implement library path fetching and global state management in the frontend to make Eagle's library path available throughout the application.

## Overview

The frontend needs to fetch the library path from the proxy service at application startup and make it available to all components via React Context. This path is essential for constructing proper file URLs for Eagle images.

## Current State

- Frontend fetches folders and items from proxy endpoints
- Uses TanStack Query for server state management
- Routes use loaders for data prefetching
- No library path discovery mechanism exists
- Items display placeholder images from Unsplash

## Proxy API Integration

### Library Info Endpoint
- **URL**: `http://localhost:57821/library/info`
- **Method**: GET
- **Response**: 
```json
{
  "path": "/Users/username/Library/Application Support/Eagle/Eagle.library"
}
```
- **Error Responses**:
  - `404`: No items found in Eagle library
  - `500`: Unable to determine library path
  - `503`: Eagle service not running

## Implementation Requirements

### 1. Create API Layer

**File**: `/front/src/api/library.ts`

**Purpose**: Provide functions and query options for fetching library information from the proxy service.

**Key Points**:
- Export `Library` interface with `path: string`
- `fetchLibrary()` function calls `GET /library/info`
- `libraryQueryOptions` with TanStack Query configuration:
  - Query key: `["library"]`
  - 24-hour stale time (library paths rarely change)
  - Limited retries (max 2) since library is critical
  - Don't retry on network errors

### 2. Add Type Definitions

**File**: `/front/src/types/item.ts`

- Add `Library` interface with `path: string`
- Export alongside existing types

### 3. Create Library Context

**File**: `/front/src/contexts/LibraryContext.tsx`

**Purpose**: Provide library path to all components without prop drilling.

**Key Points**:
- Create context with `Library | null` type
- Export `useLibrary()` custom hook
- Hook throws error if used outside provider
- Export default context for provider usage

### 4. Update Root Route

**File**: `/front/src/routes/__root.tsx`

**Required Changes**:
- Add `loader` to prefetch library data using `libraryQueryOptions`
- Create `RootComponent` that:
  - Uses `useSuspenseQuery(libraryQueryOptions)` to get library data
  - Wraps `<Outlet />` with `<LibraryContext.Provider>`
  - Provides library value to all child routes
- Add `errorComponent` for library loading failures
- Import necessary dependencies (library API and context)

## Data Flow

1. **Application Start**:
   - User navigates to any route
   - Root route loader triggers library fetch
   - TanStack Query caches the result

2. **Component Access**:
   - Components import `useLibrary` hook
   - Hook returns library object with path
   - Path used for constructing image URLs

3. **Error Handling**:
   - Proxy unavailable: Show connection error
   - Eagle offline: Show Eagle not running error
   - No items: Show empty library message

## Usage in Components

Components can access library path using the `useLibrary()` hook:
- Import from `~/contexts/LibraryContext`
- Call hook to get library object
- Access `library.path` for file path construction
- Hook throws if used outside context provider

## Testing Requirements

### Test File: `/front/src/contexts/LibraryContext.test.tsx`

**Test Cases**:

1. **Context Provider**:
   - Verify context provides library value
   - Test null handling

2. **useLibrary Hook**:
   - Test successful library access
   - Verify error when used outside provider
   - Type safety checks

### Integration Tests

1. **Root Route Loading**:
   - Verify library prefetch in loader
   - Test error boundary behavior
   - Check context provision to child routes

2. **Component Integration**:
   - Test components using useLibrary
   - Verify library path usage
   - Error state handling

## Implementation Checklist

- [ ] Create `/front/src/api/library.ts` with fetch function and query options
- [ ] Add Library interface to `/front/src/types/item.ts`
- [ ] Create `/front/src/contexts/LibraryContext.tsx` with provider and hook
- [ ] Update `/front/src/routes/__root.tsx` to fetch and provide library
- [ ] Add error handling for library loading failures
- [ ] Create tests for context and integration
- [ ] Update components to use library path (future task)

## Error States

### Proxy Unavailable
- **Trigger**: Network error or proxy not running
- **User Message**: "Cannot connect to proxy service"
- **Recovery**: Retry button to reload application

### Eagle Not Running
- **Trigger**: 503 response from proxy
- **User Message**: "Eagle is not running. Please start Eagle application."
- **Recovery**: Retry after starting Eagle

### Empty Library
- **Trigger**: 404 response from proxy
- **User Message**: "No items found in Eagle library"
- **Recovery**: Add items to Eagle and retry

### Invalid Library Path
- **Trigger**: 500 response from proxy
- **User Message**: "Unable to determine library path"
- **Recovery**: Check Eagle installation and retry

## Performance Considerations

- **Prefetching**: Library loaded at root level before any route renders
- **Caching**: 24-hour cache prevents unnecessary refetches
- **Suspense**: Using suspense for synchronous data access
- **Context**: Avoids prop drilling and re-renders

## Future Enhancements

- **Library Switching**: Detect and handle library path changes
- **Image URL Construction**: Use library path for direct file access
- **Fallback Handling**: Graceful degradation when library unavailable
- **Path Validation**: Verify library path accessibility from browser

## Dependencies

- **TanStack Query**: Server state management
- **React Context**: Global state distribution
- **TanStack Router**: Route loading and error boundaries
- **TypeScript**: Type safety for library interface

## Notes

- Library path is critical for future image serving features
- Context pattern chosen for global accessibility
- 24-hour cache assumes library rarely changes during use
- Error boundaries prevent app crashes from library issues