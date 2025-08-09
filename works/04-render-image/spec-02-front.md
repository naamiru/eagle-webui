# Frontend Specification - Image Rendering Feature

## Overview

Update the frontend to display actual Eagle images by constructing dynamic URLs for thumbnails and original images. This replaces the current placeholder Unsplash images with real images from the user's Eagle library by utilizing the new proxy endpoints.

## Implementation Details

### 1. Type Updates: `front/src/types/item.ts`

#### Updated Item Interface

```typescript
export interface Item {
  id: string;
  // Remove: original: string;
  // Remove: thumbnail: string;
  width: number;
  height: number;
}
```

**Rationale**: Image URLs will be dynamically constructed based on item ID and library path, eliminating the need for static URL fields.

### 2. Component Updates: `front/src/components/ItemList/ImageItem.tsx`

#### Current Implementation Analysis

The current `ImageItem` component:
- Receives an `Item` object as props
- Displays `image.thumbnail` as the img src
- Passes `original` and `thumbnail` to PhotoSwipe gallery
- Uses static URLs from the Item object

#### Updated Component Implementation

**Required imports:**
- Add `import { useLibrary } from "~/contexts/LibraryContext"`

**Inside component:**
1. Call `useLibrary()` hook to get library context
2. Construct dynamic URLs:
   ```typescript
   const baseUrl = "http://localhost:57821";
   const thumbnailUrl = `${baseUrl}/item/thumbnail?id=${image.id}&libraryPath=${encodeURIComponent(library.path)}`;
   const originalUrl = `${baseUrl}/item/image?id=${image.id}&libraryPath=${encodeURIComponent(library.path)}`;
   ```
3. Update `GalleryItem` props to use dynamic URLs instead of `image.original` and `image.thumbnail`
4. Update `img` src to use `thumbnailUrl` instead of `image.thumbnail`
5. Add `loading="lazy"` attribute to img element

## Test Specifications

### Unit Tests: `front/src/components/ItemList/ImageItem.test.tsx`

#### Test Suite 1: URL Construction

**1. Dynamic URL Generation**
- **Test**: Should construct correct thumbnail and original URLs
- **Setup**: Mock `useLibrary` hook with test library path
- **Checks**:
  - Thumbnail URL contains `/item/thumbnail` endpoint
  - Original URL contains `/item/image` endpoint
  - Both URLs include item ID as query parameter
  - Both URLs include encoded library path
  - Base URL is correct (`http://localhost:57821`)

**2. Library Path Encoding**
- **Test**: Should properly encode library paths with special characters
- **Setup**: Provide library paths with spaces, special characters, Unicode
- **Checks**:
  - Spaces encoded as `%20`
  - Special characters properly URL-encoded
  - Unicode characters handled correctly
  - Path separators preserved

**3. Item ID Handling**
- **Test**: Should handle various item ID formats
- **Setup**: Test with different ID formats (UUIDs, alphanumeric, special chars)
- **Checks**:
  - IDs properly included in query string
  - Special characters in IDs encoded
  - Long IDs handled without truncation

#### Test Suite 2: Component Rendering

**1. Image Element Rendering**
- **Test**: Should render img element with correct attributes
- **Setup**: Render component with mock item data
- **Checks**:
  - `src` attribute points to thumbnail URL
  - `alt` attribute includes item ID
  - `loading="lazy"` attribute present
  - CSS class applied correctly
  - Click handler attached

**2. PhotoSwipe Gallery Integration**
- **Test**: Should pass correct props to GalleryItem
- **Setup**: Render component and inspect GalleryItem props
- **Checks**:
  - `original` prop contains original image URL
  - `thumbnail` prop contains thumbnail URL
  - `width` and `height` props passed correctly
  - `cropped` prop is true
  - Gallery opens on click

**3. Library Context Integration**
- **Test**: Should use library path from context
- **Setup**: Provide library context with test path
- **Checks**:
  - `useLibrary` hook called
  - Library path used in URL construction
  - Component re-renders when library path changes

### Integration Tests: `front/src/components/ItemList/ItemList.test.tsx`

#### Test Suite 1: List Rendering

**1. Multiple Items**
- **Test**: Should render grid of ImageItem components
- **Setup**: Provide array of test items
- **Checks**:
  - All items rendered
  - Each item has unique URL
  - Grid layout applied correctly
  - Performance acceptable with many items

**2. Empty State**
- **Test**: Should handle empty item list
- **Checks**:
  - No errors with empty array
  - Appropriate empty state message
  - Component remains interactive

#### Test Suite 2: Data Flow

**1. API Integration**
- **Test**: Should display items from API response
- **Setup**: Mock API response with test items
- **Checks**:
  - Items without `original`/`thumbnail` fields handled
  - Dynamic URLs constructed for each item
  - Gallery functions with all items

**2. Real-time Updates**
- **Test**: Should update when items change
- **Setup**: Simulate item list updates
- **Checks**:
  - New items appear with correct URLs
  - Removed items disappear
  - URLs update if library path changes

## Implementation Order

1. **Update Type Definition**
   - Modify `Item` interface in `front/src/types/item.ts`
   - Remove `original` and `thumbnail` fields
   - Ensure TypeScript compilation passes

2. **Update ImageItem Component**
   - Import `useLibrary` hook
   - Implement dynamic URL construction
   - Add URL encoding for library path
   - Keep native `loading="lazy"` attribute
   - Update img src and GalleryItem props

3. **Write Unit Tests**
   - Test URL construction logic
   - Test component rendering
   - Test context integration

4. **Integration Testing**
   - Test with ItemList component
   - Verify data flow from API
   - Test gallery functionality

## Security Considerations

### URL Construction

1. **Input Validation**
   - Validate item IDs before URL construction
   - Sanitize library paths
   - Prevent XSS via URL manipulation

2. **CORS Handling**
   - Proxy handles CORS headers
   - Frontend trusts proxy endpoint
   - No direct Eagle API access