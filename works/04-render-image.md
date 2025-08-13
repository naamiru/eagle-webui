# Image Serving Specification

## Objective
Serve actual Eagle library images through Express endpoints, replacing placeholder images.

## API Endpoints

### GET `/api/items/image`
**Purpose**: Serve original image files  
**Query Parameters**: 
- `id`: Item ID (required)
- `libraryPath`: Path to Eagle library (required)

**Response**: Original image file or 404 if not found

### GET `/api/items/thumbnail`
**Purpose**: Serve thumbnail images with fallback  
**Query Parameters**: 
- `id`: Item ID (required)
- `libraryPath`: Path to Eagle library (required)

**Response**: Thumbnail if exists, otherwise original image, or 404 if neither found

## File System Structure

Eagle stores images at: `${LIBRARY_PATH}/images/${ITEM_ID}.info/`

**File Detection Rules**:
- Files containing `_thumbnail.` → Thumbnail images
- Files without `_thumbnail.` (excluding `metadata.json`) → Original images
- Some items lack thumbnails and only have original + metadata

## Frontend Implementation

### Image URL Utilities
**Location**: `app/utils/image.ts`

**Functions**:
- `getImageUrl(itemId, libraryPath)`: Returns original image URL
- `getThumbnailUrl(itemId, libraryPath)`: Returns thumbnail URL

### Component Updates
- Pass `libraryPath` from routes to components
- Update `FolderItem` and `ItemItem` components to use dynamic URLs via utility functions
- Remove hardcoded Unsplash placeholder URLs

## Error Handling
- Invalid item ID → 404
- Missing library path → 400
- File not found → 404
- File read errors → 500