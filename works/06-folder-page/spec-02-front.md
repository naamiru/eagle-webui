# Frontend Implementation: Folder Page Navigation

## Overview

Create folder-specific pages using TanStack Router with the same layout pattern as the index page, enabling users to browse folder contents with dedicated URLs.

## Current State Analysis

**Existing Implementation**:
- **Index Page**: `front/src/routes/index.tsx` displays all folders and all items
- **Router**: TanStack Router with file-based routing, context provider for QueryClient
- **Components**: `FolderList` and `ItemList` reusable components with consistent styling
- **API Layer**: `fetchItems()` supports `limit` parameter, `fetchFolders()` gets all folders
- **Navigation**: Folders currently not clickable (no navigation implemented)

## Required Changes

### 1. API Layer Enhancement

**Update Items API** (`front/src/api/items.ts`):

**Enhance `fetchItems` Function**:
- Add optional `folderId?: string` parameter
- Update URL construction to include folder parameter when provided
- Maintain backward compatibility with existing `limit` parameter

**Implementation Pattern**:
```typescript
export const fetchItems = async (limit?: number, folderId?: string): Promise<Item[]> => {
  const url = new URL("http://localhost:57821/item/list")
  // Add limit parameter logic (existing)
  // Add folder parameter logic (NEW)
  if (folderId !== undefined && folderId.trim() !== "") {
    url.searchParams.set("folder", folderId)
  }
}
```

**Create Folder-Specific Query Options**:
- New function: `folderItemsQueryOptions(folderId: string, limit?: number)`
- Query key pattern: `["items", limit, folderId]` for proper cache separation
- Same error handling and retry logic as existing `itemsQueryOptions`
- Default limit of 100 items per folder page

### 2. Router Implementation

**Create Folder Route** (`front/src/routes/folders/$folderId.tsx`):

**Route Configuration**:
- Use TanStack Router file-based routing pattern
- URL pattern: `/folders/{folderId}` where folderId is dynamic parameter
- Route parameter validation: ensure folderId is non-empty string
- Loader pattern: preload both folder data and folder-specific items

**Route Structure**:
```typescript
export const Route = createFileRoute("/folders/$folderId")({
  loader: ({ context, params }) => Promise.all([
    context.queryClient.ensureQueryData(foldersQueryOptions),
    context.queryClient.ensureQueryData(folderItemsQueryOptions(params.folderId, 100))
  ]),
  component: FolderRouteComponent,
  errorComponent: FolderErrorComponent,
  pendingComponent: FolderLoadingComponent
})
```

**Component Logic**:
- Use `useSuspenseQuery` for both folders and folder items
- Filter subfolders from full folder list based on current folder ID
- Apply same layout and styling as index page
- Section titles: "サブフォルダー" for subfolders, "内容" for items

### 3. Component Integration

**Subfolder Filtering Logic**:
- Find current folder from full folder list using route parameter
- Extract `children` array as subfolders to display
- Handle case where folder ID not found (show error)
- Maintain folder hierarchy structure

**Layout Consistency**:
- Reuse exact same layout structure as `index.tsx`
- Same CSS classes and styling from `index.module.css`
- Same container structure and section titles
- Same error and loading component patterns

### 4. Navigation Enhancement

**Update FolderItem Component** (`front/src/components/FolderList/FolderItem.tsx`):

**Add Link Wrapper**:
- Import `Link` from `@tanstack/react-router`
- Wrap existing folder content in `<Link to="/folders/$folderId" params={{ folderId: folder.id }}>`
- Maintain all existing styling and structure
- Add cursor pointer and hover states for better UX

**Link Styling**:
- Ensure link wrapper doesn't interfere with existing CSS
- Maintain folder thumbnail and overlay styling
- Add subtle hover effect for better interaction feedback
- Preserve existing accessibility attributes

### 5. Error and Loading States

**Folder Error Component**:
- Handle invalid folder ID (folder not found in folder list)
- Handle network errors when fetching folder items
- Provide navigation back to index page
- Same error styling patterns as index page

**Folder Loading Component**:
- Same loading spinner and text as index page
- Loading message: "Loading folder contents..."
- Same CSS classes and styling consistency

**Error Scenarios**:
- Non-existent folder ID → Show "Folder not found" with back navigation
- Network timeout → Show retry button with specific error message
- Empty folder → Show subfolders section with empty items section (not an error)

## Testing Strategy

### Unit Tests: `front/src/routes/folders/$folderId.test.tsx`

#### Test Suite: Route Configuration

**1. Route Parameter Handling**:
- ✅ Should extract folderId from URL parameters
- ✅ Should validate folderId is non-empty string
- ✅ Should handle URL encoding in folder IDs
- ✅ Should navigate to correct folder page from folder links

**2. Loader Functionality**:
- ✅ Should preload folders and folder items in parallel
- ✅ Should pass correct folderId to folderItemsQueryOptions
- ✅ Should use default limit of 100 for folder items
- ✅ Should handle loader errors gracefully

#### Test Suite: Component Rendering

**1. Layout Consistency**:
- ✅ Should render same layout structure as index page
- ✅ Should display correct section titles ("サブフォルダー", "内容")
- ✅ Should apply same CSS classes and styling
- ✅ Should use same container structure

**2. Data Display**:
- ✅ Should display subfolders filtered from current folder
- ✅ Should display items specific to current folder
- ✅ Should handle folder with no subfolders (empty section)
- ✅ Should handle folder with no items (empty section)

**3. Subfolder Filtering**:
- ✅ Should find current folder from folder list by ID
- ✅ Should extract children array as subfolders
- ✅ Should handle deeply nested folder hierarchies
- ✅ Should maintain folder hierarchy structure

#### Test Suite: Navigation Integration

**1. Folder Link Functionality**:
- ✅ FolderItem should render as clickable link
- ✅ Link should navigate to correct folder page URL
- ✅ Should preserve existing folder styling and layout
- ✅ Should add appropriate hover states and cursor pointer

**2. URL Generation**:
- ✅ Should generate correct URLs for folder navigation
- ✅ Should handle special characters in folder IDs
- ✅ Should work with deeply nested folder navigation
- ✅ Should maintain browser back/forward functionality

#### Test Suite: Error Handling

**1. Invalid Folder Scenarios**:
- ✅ Should show error for non-existent folder ID
- ✅ Should provide navigation back to index page
- ✅ Should handle URL manipulation gracefully
- ✅ Should display appropriate error messages

**2. Network Error Handling**:
- ✅ Should handle proxy service unavailable
- ✅ Should handle Eagle API errors
- ✅ Should provide retry functionality
- ✅ Should maintain consistent error styling

### API Tests: `front/src/api/items.test.ts`

#### Test Suite: Enhanced Items API

**1. Folder Parameter Handling**:
- ✅ Should include folder parameter in request URL
- ✅ Should work without folder parameter (existing behavior)
- ✅ Should handle empty or whitespace-only folder IDs
- ✅ Should URL-encode folder IDs properly

**2. Query Options**:
- ✅ folderItemsQueryOptions should create correct query key
- ✅ Should include folderId in cache key for proper separation
- ✅ Should use correct default limit for folder pages
- ✅ Should maintain same error handling patterns

### Integration Tests: `front/src/components/FolderList/FolderItem.test.tsx`

#### Test Suite: Navigation Enhancement

**1. Link Integration**:
- ✅ Should render FolderItem as Link component
- ✅ Should navigate to correct folder page when clicked
- ✅ Should maintain existing component structure and styling
- ✅ Should preserve accessibility attributes

**2. Visual Consistency**:
- ✅ Should not change existing folder thumbnail display
- ✅ Should preserve hover effects and interactions
- ✅ Should maintain grid layout in FolderList
- ✅ Should keep existing CSS module classes

## Implementation Steps

### Phase 1: API Enhancement
1. Update `fetchItems()` function to accept optional folderId parameter
2. Create `folderItemsQueryOptions()` function with proper cache keys
3. Write unit tests for enhanced API functions
4. Verify backward compatibility with existing API usage

### Phase 2: Route Creation
1. Create folder route file with proper TanStack Router patterns
2. Implement loader function with parallel data fetching
3. Create component with subfolder filtering logic
4. Apply same layout and styling as index page

### Phase 3: Component Integration
1. Update FolderItem component to include Link wrapper
2. Ensure navigation preserves existing styling
3. Test folder navigation throughout the application
4. Verify proper URL generation and routing

### Phase 4: Error Handling
1. Implement error components for various failure scenarios
2. Add loading states with consistent styling
3. Test edge cases (invalid IDs, network failures)
4. Ensure graceful degradation

### Phase 5: Testing and Validation
1. Write comprehensive unit and integration tests
2. Perform visual regression testing
3. Test with real Eagle API data
4. Validate accessibility and performance

## Success Criteria

- [ ] Clicking folders navigates to dedicated folder pages with URLs `/folders/{folderId}`
- [ ] Folder pages display same layout and styling as index page
- [ ] Subfolders section shows direct children of current folder only
- [ ] Items section shows images from current folder only
- [ ] Navigation preserves browser back/forward functionality
- [ ] Error handling works for invalid folder IDs and network failures
- [ ] All existing functionality preserved (backward compatibility)
- [ ] TypeScript compilation passes without errors
- [ ] All unit tests pass with >95% coverage
- [ ] Visual consistency maintained across all folder pages
- [ ] Performance comparable to index page loading
- [ ] Accessibility standards maintained

## Performance Considerations

**Query Optimization**:
- Separate cache keys for different folders prevent unnecessary refetches
- Parallel loading of folders and items in route loader
- Stale-while-revalidate pattern for better perceived performance
- Folder list cache shared between index and folder pages

**Memory Management**:
- Query cache automatically handles cleanup of unused folder item data
- No memory leaks from folder navigation
- Efficient subfolder filtering without deep copying

## Edge Cases

**URL and Navigation**:
- Folder IDs with special characters (URL encoding)
- Very long folder IDs (should work with proper encoding)
- Direct URL access to folder pages (should work with loader)
- Browser back/forward navigation (handled by TanStack Router)

**Data Scenarios**:
- Empty folders (both subfolders and items empty)
- Folders with only subfolders or only items
- Deeply nested folder hierarchies
- Folders that exist in folder list but return no items from API

**Error Recovery**:
- Network intermittency during folder navigation
- Eagle API returning different data than folder list
- Folder deleted between folder list load and folder page access