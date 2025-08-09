# Feature: Render Actual Images from Eagle Library

## Overview

Replace placeholder Unsplash images with actual Eagle images by implementing image serving endpoints in the proxy and updating the frontend to use dynamic URLs instead of static `original` and `thumbnail` fields.

## Current State

- Items currently use placeholder Unsplash URLs for both `original` and `thumbnail` fields
- Frontend ImageItem component displays `image.thumbnail` as the img src and passes both URLs to PhotoSwipe gallery
- Library path discovery is implemented and available via `useLibrary()` hook
- Item interface contains static `original` and `thumbnail` string fields

## Problem Statement

The current implementation uses the same placeholder image for all items, making it impossible to distinguish between different images. Users need to see actual thumbnails and full-resolution images from their Eagle library.

## Eagle File System Structure

Eagle stores images in a predictable directory structure:
- **Thumbnail**: `${LIBRARY_PATH}/images/${ITEM_ID}.info/${ITEM_NAME}_thumbnail.${ITEM_EXT}`
- **Original**: `${LIBRARY_PATH}/images/${ITEM_ID}.info/${ITEM_NAME}.${ITEM_EXT}`

Where `ITEM_NAME` and `ITEM_EXT` are stored in `${LIBRARY_PATH}/images/${ITEM_ID}.info/metadata.json`, but for performance optimization, we can derive the original filename from the thumbnail filename by removing the `_thumbnail` suffix.

## Implementation Requirements

### 1. Proxy Service (`/proxy`)

#### Create Image Serving Endpoints

Create `/proxy/src/image.ts` with two new endpoints:

**GET /item/thumbnail**
- **Purpose**: Stream thumbnail images from Eagle's file system
- **Query Parameters**: 
  - `id` (string): Eagle item ID
  - `libraryPath` (string): Eagle library path
- **Response**: Image file stream with appropriate Content-Type header

**GET /item/image**  
- **Purpose**: Stream original images from Eagle's file system
- **Query Parameters**:
  - `id` (string): Eagle item ID  
  - `libraryPath` (string): Eagle library path
- **Response**: Image file stream with appropriate Content-Type header

#### Implementation Details

1. **File Path Construction**: 
   - Find thumbnail file using glob pattern: `${libraryPath}/images/${id}.info/*_thumbnail.*`
   - Derive original filename by removing `_thumbnail` suffix from thumbnail filename
   - Construct full file paths for both thumbnail and original

2. **File Streaming**:
   - Use `fs.createReadStream()` for efficient file streaming
   - Use `mime/lite` for MIME type detection from file extension
   - Set appropriate `Content-Type` header

3. **Error Handling**:
   - Return 404 if image file doesn't exist
   - Return 400 for invalid parameters
   - Handle file system errors gracefully

#### Register Routes

Update `/proxy/src/app.ts` to import and register image routes:
```typescript
import imageRoutes from "./image";
// ...
app.register(imageRoutes);
```

### 2. Frontend (`/front`)

#### Update Item Type Definition

Modify `/front/src/types/item.ts` to remove static image fields:
```typescript
export interface Item {
  id: string;
  // Remove: original: string;
  // Remove: thumbnail: string; 
  width: number;
  height: number;
}
```

#### Update Proxy Item Interface

Modify `/proxy/src/item.ts` to match frontend changes:
- Remove `original` and `thumbnail` fields from Item interface
- Update `transformEagleItem()` function to remove URL assignments
- Return only `id`, `width`, and `height` fields

#### Update ImageItem Component

Modify `/front/src/components/ItemList/ImageItem.tsx` to construct dynamic URLs:

```typescript
import { useLibrary } from "~/contexts/LibraryContext";

export function ImageItem({ image }: ImageItemProps) {
  const library = useLibrary();
  
  const thumbnailUrl = `http://localhost:57821/item/thumbnail?id=${image.id}&libraryPath=${encodeURIComponent(library.path)}`;
  const originalUrl = `http://localhost:57821/item/image?id=${image.id}&libraryPath=${encodeURIComponent(library.path)}`;

  return (
    <GalleryItem
      original={originalUrl}
      thumbnail={thumbnailUrl}
      width={image.width}
      height={image.height}
      cropped
    >
      {({ ref, open }) => (
        <img
          ref={ref}
          onClick={open}
          src={thumbnailUrl}
          alt={`${image.id}`}
          className={styles.thumbnail}
        />
      )}
    </GalleryItem>
  );
}
```

## Data Flow

1. User navigates to item list page
2. Frontend constructs dynamic image URLs using item ID and library path
3. ImageItem component displays thumbnail via proxy endpoint
4. When user clicks image, PhotoSwipe gallery opens with original image via proxy endpoint
5. Proxy endpoints:
   - Receive item ID and library path as query parameters
   - Locate thumbnail/original files in Eagle's directory structure
   - Stream image files directly to browser with appropriate headers

## Implementation Steps

1. **Create Image Serving Endpoints**:
   - Implement `/proxy/src/image.ts` with thumbnail and image endpoints
   - Add file path resolution logic using glob patterns
   - Implement file streaming with proper MIME type headers
   - Register routes in app.ts

2. **Update Type Definitions**:
   - Remove `original` and `thumbnail` fields from Item interfaces in both proxy and frontend
   - Update `transformEagleItem()` function in proxy
   - Ensure TypeScript compilation succeeds

3. **Update Frontend Image Rendering**:
   - Modify ImageItem component to construct dynamic URLs
   - Use `useLibrary()` hook to access library path
   - Update img src and PhotoSwipe gallery URLs

4. **Test Image Loading**:
   - Verify thumbnails load correctly in item grid
   - Test original images in PhotoSwipe gallery
   - Ensure proper error handling for missing images

## Testing Considerations

### Proxy Tests (`/proxy/src/image.test.ts`)

1. **File Resolution**: Test thumbnail and original file path construction
2. **File Streaming**: Mock fs.createReadStream() responses  
3. **MIME Types**: Verify correct Content-Type headers for different image formats
4. **Error Cases**: Test missing files, invalid paths, file system errors
5. **Parameter Validation**: Test missing or invalid query parameters

### Frontend Tests

1. **URL Construction**: Test dynamic URL generation with various item IDs and library paths
2. **URL Encoding**: Verify proper encoding of library path with special characters
3. **Context Integration**: Test useLibrary() hook usage
4. **Loading States**: Test image loading and error states

### Integration Tests

1. **End-to-End**: Verify actual images display in browser
2. **PhotoSwipe Gallery**: Test gallery functionality with real images
3. **Different Image Formats**: Test JPEG, PNG, WebP support
4. **Large Images**: Test performance with high-resolution images

## Success Criteria

- [ ] Proxy endpoints `/item/thumbnail` and `/item/image` serve actual Eagle images
- [ ] Frontend displays real thumbnails instead of placeholder images
- [ ] PhotoSwipe gallery shows real full-resolution images
- [ ] Item interface no longer contains `original` and `thumbnail` fields
- [ ] Images load efficiently using file streaming
- [ ] Proper error handling for missing or invalid images
- [ ] MIME types are correctly detected and set
- [ ] No breaking changes to existing gallery functionality

## Future Considerations

- **Image Caching**: Add caching headers to reduce server load
- **Image Optimization**: Implement dynamic image resizing for better performance  
- **Lazy Loading**: Add intersection observer for better performance with large lists
- **Error Fallbacks**: Display placeholder images when actual images fail to load
- **Progressive Enhancement**: Show low-quality images first, then enhance with full quality
