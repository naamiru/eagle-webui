# Library Path Discovery - Proxy Implementation

Add library path discovery functionality to the proxy service to extract and return Eagle's current library path for frontend consumption.

## Overview

The proxy service needs to discover Eagle's library path by fetching a single item from Eagle API and extracting the library path from the item's file URL. This path is essential for serving actual Eagle images instead of placeholder URLs.

## Eagle API Integration

### Step 1: Get Item ID
- **URL**: `http://localhost:41595/api/item/list`
- **Method**: GET
- **Query Parameters**: `limit=1` (fetch minimal data needed)
- **Expected Response**:
```json
{
  "status": "success",
  "data": [
    {
      "id": "LIFKJZNPSU5T4",
      "name": "image.jpg",
      "size": 2048576,
      "ext": "jpg", 
      "tags": ["nature"],
      "folders": ["folder_id"],
      "url": "https://example.com/reference-url.jpg",
      "height": 1080,
      "width": 1920
    }
  ]
}
```

### Step 2: Get Thumbnail Path
- **URL**: `http://localhost:41595/api/item/thumbnail`
- **Method**: GET
- **Query Parameters**: `id={item_id}`
- **Expected Response**:
```json
{
  "status": "success",
  "data": "/Users/username/Library/Application Support/Eagle/Eagle.library/images/LIFKJZNPSU5T4.info/image_thumbnail.png"
}
```

**Note**: Path format varies by platform:
- **macOS/Linux**: `/Users/username/Eagle.library/images/...`
- **Windows**: `C:\\Users\\username\\Eagle.library\\images\\...`

### Library Path Extraction Logic

From the thumbnail API response, extract the library path:

**Examples by Platform**:
- **macOS/Linux**: `/Users/username/Eagle.library/images/LIFKJZNPSU5T4.info/image_thumbnail.png` → `/Users/username/Eagle.library`
- **Windows**: `C:\\Users\\username\\Eagle.library\\images\\LIFKJZNPSU5T4.info\\image_thumbnail.png` → `C:\\Users\\username\\Eagle.library`

**Extraction Steps**:
1. **Input**: Platform-specific thumbnail path
2. **Search for pattern**: Look for `.library` followed by path separator
3. **Extract base path**: Everything up to and including `.library`

**Cross-Platform Implementation**:
```typescript
import path from "path";

function extractLibraryPath(thumbnailPath: string): string {
  // Search for .library followed by path separator to ensure exact directory match
  const searchPattern = `.library${path.sep}`;
  const libraryIndex = thumbnailPath.indexOf(searchPattern);
  
  if (libraryIndex === -1) {
    throw new Error('Invalid Eagle thumbnail path: .library directory not found');
  }
  
  // Extract path up to and including .library (without the trailing separator)
  return thumbnailPath.substring(0, libraryIndex + '.library'.length);
}
```

## Implementation Requirements

### 1. Create Library Route File

**File**: `/proxy/src/library.ts`

**Interfaces**:
```typescript
interface Library {
  path: string;
}

interface EagleItem {
  id: string;
  name: string;
  size: number;
  ext: string;
  tags: string[];
  folders: string[];
  url: string;
  height: number;
  width: number;
}
```

**Route Implementation**:
```typescript
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import path from "path";
import { callEagleApi } from "./eagle-api";

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get<{
    Reply: {
      200: Library;
      404: { error: string };
      500: { error: string };
    };
  }>("/library/info", async () => {
    fastify.log.info("Discovering Eagle library path");

    // Step 1: Fetch single item to get item ID
    const items = await callEagleApi<EagleItem[]>("/api/item/list?limit=1");
    
    if (items.length === 0) {
      fastify.log.warn("No items found in Eagle library");
      throw new Error("No items found in Eagle library");
    }

    const firstItem = items[0];
    fastify.log.info({ itemId: firstItem.id }, "Fetching thumbnail path for item");

    // Step 2: Get thumbnail path using item ID
    const thumbnailPath = await callEagleApi<string>(`/api/item/thumbnail?id=${firstItem.id}`);
    
    fastify.log.info({ itemId: firstItem.id, thumbnailPath }, "Extracting library path from thumbnail");

    try {
      const libraryPath = extractLibraryPath(thumbnailPath);
      fastify.log.info({ libraryPath }, "Successfully discovered library path");
      
      return { path: libraryPath };
    } catch (error) {
      fastify.log.error({ error, thumbnailPath }, "Failed to extract library path");
      throw new Error("Unable to determine library path from thumbnail URL");
    }
  });
};

function extractLibraryPath(thumbnailPath: string): string {
  // Search for .library followed by path separator to ensure exact directory match
  const searchPattern = `.library${path.sep}`;
  const libraryIndex = thumbnailPath.indexOf(searchPattern);
  
  if (libraryIndex === -1) {
    throw new Error('Invalid Eagle thumbnail path: .library directory not found');
  }
  
  // Extract path up to and including .library (without the trailing separator)
  return thumbnailPath.substring(0, libraryIndex + '.library'.length);
}

export default fp(routes);
```

### 2. Register Route in App

**File**: `/proxy/src/app.ts`

Add import and registration:
```typescript
import libraryRoutes from "./library";

// Register in the app
app.register(libraryRoutes);
```

### 3. Error Handling

**Expected Errors**:

1. **Eagle Offline**: Handled by existing `callEagleApi` error handling
   - Returns 503 with "Eagle service is not running" message

2. **No Items in Library**: 
   - Custom error when Eagle returns empty array
   - Should return meaningful error message for frontend

3. **Invalid Thumbnail Path Format**:
   - When thumbnail path doesn't contain `.library` directory
   - Indicates corrupted Eagle data or unexpected file structure

**Error Response Format**:
```typescript
// No items found
{
  "error": "No items found in Eagle library",
  "statusCode": 404
}

// Invalid thumbnail path format  
{
  "error": "Unable to determine library path from thumbnail URL",
  "statusCode": 500
}
```

## API Specification

### Endpoint: GET /library/info

**Description**: Discovers and returns the current Eagle library path

**Parameters**: None

**Responses**:

**200 OK**:
```json
{
  "path": "/Users/username/Library/Application Support/Eagle/Eagle.library"
}
```

**Platform Examples**:
- **macOS/Linux**: `{"path": "/Users/username/Eagle.library"}`
- **Windows**: `{"path": "C:\\Users\\username\\Eagle.library"}`

**404 Not Found** - No items in library:
```json
{
  "error": "No items found in Eagle library",
  "statusCode": 404
}
```

**500 Internal Server Error** - Path extraction failed:
```json
{
  "error": "Unable to determine library path from thumbnail URL", 
  "statusCode": 500
}
```

**503 Service Unavailable** - Eagle offline:
```json
{
  "error": "Eagle service is not running. Please ensure Eagle is running on port 41595",
  "statusCode": 503
}
```

## Testing Requirements

### Test File: `/proxy/src/library.test.ts`

**Test Cases**:

1. **Happy Path - Valid Item with Library Path**:
   - Mock Eagle API to return item with valid thumbnail path
   - Verify library path is correctly extracted from thumbnail path
   - Confirm 200 response with proper library path structure

2. **No Items in Library**:
   - Mock Eagle API to return empty array from item list
   - Verify 404 response with "No items found in Eagle library" message
   - Ensure appropriate error logging occurs

3. **Invalid Thumbnail Path Format**:
   - Mock Eagle API with malformed thumbnail path (missing .library)
   - Verify 500 response with path extraction error message
   - Test extraction function throws appropriate error

4. **Eagle Service Offline**:
   - Mock Eagle API connection failure
   - Verify 503 response using existing error handling
   - Confirm proper error propagation from callEagleApi utility

5. **Cross-Platform Path Handling**:
   - Test Unix/macOS paths: `/Users/username/Eagle.library/...`
   - Test Windows paths: `C:\\Users\\username\\Eagle.library\\...`
   - Test edge cases like `/path/to/file.libraryextra/something` (should not match)
   - Verify search pattern `.library${path.sep}` prevents false positives
   - Ensure returned path maintains original platform format

**Mock Data Examples**:
```typescript
const validEagleItem = {
  id: "LIFKJZNPSU5T4",
  name: "test.jpg",
  size: 1024,
  ext: "jpg",
  tags: [],
  folders: [],
  url: "https://example.com/reference-url.jpg",
  height: 100,
  width: 100
};

// Cross-platform thumbnail path examples
const unixThumbnailPath = "/Users/test/Eagle.library/images/LIFKJZNPSU5T4.info/test_thumbnail.png";
const windowsThumbnailPath = "C:\\Users\\test\\Eagle.library\\images\\LIFKJZNPSU5T4.info\\test_thumbnail.png";

// Edge case examples
const falsePositivePath = "/Users/test/file.libraryextra/images/test_thumbnail.png"; // should NOT match
const invalidThumbnailPath = "/invalid/path/without/library/test_thumbnail.png";
```

## Performance Considerations

- **Caching**: Consider caching library path in memory since it rarely changes
- **Minimal Data**: Only fetch 1 item to minimize Eagle API load
- **Error Handling**: Fast fail for common error cases
- **Logging**: Comprehensive logging for debugging path extraction issues

## Success Criteria

- [ ] Endpoint `/library/info` successfully extracts library path from Eagle items
- [ ] Proper error handling for all edge cases (no items, invalid URLs, Eagle offline)
- [ ] Library path extraction works with cross-platform path formats (Windows, macOS, Linux)
- [ ] Comprehensive test coverage for all scenarios
- [ ] Appropriate logging for debugging and monitoring
- [ ] Route properly registered in main application

## Future Enhancements

- **Path Caching**: Cache discovered library path to reduce Eagle API calls
- **Path Validation**: Verify extracted path exists and is accessible
- **Multiple Libraries**: Handle Eagle library switching scenarios
- **Performance Monitoring**: Track response times and error rates