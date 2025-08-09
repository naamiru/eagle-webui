# Proxy Service Specification - Image Serving Feature

## Overview

Implement image serving endpoints in the proxy service to stream actual Eagle images instead of using placeholder URLs. This involves creating two new endpoints that serve thumbnail and original images directly from Eagle's file system.

## Current Dependencies

### Required Packages
- `fastify` and `fastify-plugin` for route registration (already installed)
- `node:fs/promises` (Node.js built-in) for file operations and glob pattern matching
- `node:path` (Node.js built-in) for path manipulation
- `mime/lite` (needs installation) for MIME type detection

### New Dependencies to Install
```bash
npm install -w proxy mime
```

## Implementation Details

### 1. Route Module: `proxy/src/image.ts`

#### Type Definitions

```typescript
import type { FastifyInstance, FastifyPluginAsync } from "fastify";

interface ImageQuery {
  id: string;
  libraryPath: string;
}

interface ImageFileInfo {
  filePath: string;
  mimeType: string;
  exists: boolean;
}
```

#### File System Structure Understanding

Eagle stores images in the following structure:
- **Directory**: `${libraryPath}/images/${itemId}.info/`
- **Thumbnail**: `${itemName}_thumbnail.${extension}`
- **Original**: `${itemName}.${extension}`

Where `itemName` and `extension` can be derived from the thumbnail filename by removing the `_thumbnail` suffix.

#### Core Functions

**1. Thumbnail Path Resolution Function**

```typescript
import { glob } from "node:fs/promises";

async function resolveThumbnailPath(libraryPath: string, itemId: string): Promise<string | null>
```

**Purpose**: Find thumbnail file path using Node.js built-in glob patterns
**Logic**:
- Use `glob()` from `node:fs/promises` to find files matching: `${libraryPath}/images/${itemId}.info/*_thumbnail.*`
- Return first matching file path or null if no matches found
- No existence check needed - glob only returns existing files

**2. Original Path Resolution Function**

```typescript
async function resolveOriginalPath(libraryPath: string, itemId: string): Promise<string | null>
```

**Purpose**: Find original file path by deriving from thumbnail filename
**Logic**:
- First call `resolveThumbnailPath()` to get thumbnail file path
- Extract filename from thumbnail path and remove `_thumbnail` suffix
- Construct original file path with derived filename
- Return constructed path or null if no thumbnail found

**3. MIME Type Detection Function**

```typescript
function getMimeType(filePath: string): string
```

**Purpose**: Determine Content-Type header from file extension
**Logic**:
- Use `mime/lite` library for standard image types
- Default to `application/octet-stream` for unknown types
- Support common formats: jpg, jpeg, png, gif, webp, svg

**4. File Streaming Function**

```typescript
import { access, createReadStream } from "node:fs/promises";

async function streamImageFile(
  fastify: FastifyInstance, 
  reply: FastifyReply, 
  filePath: string
): Promise<void>
```

**Purpose**: Stream image file with appropriate headers
**Logic**:
- Check file exists using `access()` from `node:fs/promises`
- Set Content-Type header
- Create read stream using `createReadStream()` 
- Handle stream errors
- Set appropriate cache headers

#### Endpoint Implementations

**Endpoint 1: GET /item/thumbnail**

**Query Parameters**:
- `id` (required): Eagle item ID
- `libraryPath` (required): Eagle library path

**Processing Steps**:
1. Validate required query parameters
2. Call `resolveThumbnailPath()` to get file path
3. Return 404 if no thumbnail file found
4. Determine MIME type from extension
5. Stream file with appropriate headers

**Error Handling**:
- 400: Missing required parameters
- 404: Thumbnail file not found
- 500: File system errors, stream errors

**Endpoint 2: GET /item/image**

**Query Parameters**:
- `id` (required): Eagle item ID  
- `libraryPath` (required): Eagle library path

**Processing Steps**:
1. Validate required query parameters
2. Call `resolveOriginalPath()` to get file path
3. Return 404 if no original file found
4. Determine MIME type from extension
5. Stream file with appropriate headers

**Error Handling**:
- 400: Missing required parameters
- 404: Original file not found
- 500: File system errors, stream errors

#### Response Headers

Both endpoints should set:
- `Content-Type`: Detected MIME type
- `Cache-Control`: `public, max-age=86400` (24 hours)
- `Last-Modified`: File modification time

### 2. App Registration: `proxy/src/app.ts`

Add the new image routes to the main application:

```typescript
import imageRoutes from "./image";

// In the build function:
app.register(imageRoutes);
```

### 3. Item Interface Updates: `proxy/src/item.ts`

Remove static image URL fields from the Item interface:

```typescript
interface Item {
  id: string;
  // Remove: original: string;
  // Remove: thumbnail: string;
  width: number;
  height: number;
}
```

Update the `transformEagleItem` function:

```typescript
function transformEagleItem(eagleItem: EagleItem): Item {
  return {
    id: eagleItem.id,
    // Remove: original: "...",
    // Remove: thumbnail: "...",
    width: eagleItem.width,
    height: eagleItem.height,
  };
}
```

## Test Specifications

### Unit Tests: `proxy/src/image.test.ts`

#### Test Suite 1: Thumbnail Path Resolution

**1. Thumbnail File Discovery**
- **Test**: Should find thumbnail file using glob pattern
- **Setup**: Create temporary directory with Eagle library structure and actual thumbnail files
- **Checks**:
  - Glob pattern correctly constructed: `${libraryPath}/images/${itemId}.info/*_thumbnail.*`
  - Thumbnail file path returned when file exists
  - Null returned when no thumbnail file found
  - Handles multiple matching files (returns first match)
  - No additional existence check needed (glob only returns existing files)

**2. Glob Pattern Handling**
- **Test**: Should handle various glob pattern scenarios
- **Setup**: Create temporary directories with various file structures and naming patterns
- **Checks**:
  - Correct pattern construction with special characters in paths
  - Handles empty results gracefully
  - Returns first match when multiple files exist
  - Works with different file extensions (.jpg, .png, .webp)

#### Test Suite 2: Original Path Resolution

**1. Original File Path Derivation**
- **Test**: Should derive original filename from thumbnail filename
- **Setup**: Create temporary directory with thumbnail and original files in Eagle structure
- **Checks**:
  - Correctly removes `_thumbnail` suffix from filename
  - Preserves file extension
  - Handles various filename formats (spaces, special characters)
  - Constructs correct full path with library path and item ID
  - Returns actual path that points to existing original file

**2. Thumbnail Dependency**
- **Test**: Should handle cases where thumbnail resolution fails
- **Setup**: Create temporary directory with missing thumbnail files
- **Checks**:
  - Returns null when no thumbnail file exists
  - Doesn't attempt path construction without valid thumbnail
  - Properly handles directory structure without `.info` folder

#### Test Suite 3: MIME Type Detection

**1. Standard Image Formats**
- **Test**: Should detect MIME types for common image formats
- **Checks**:
  - `.jpg` and `.jpeg` return `image/jpeg`
  - `.png` returns `image/png`
  - `.gif` returns `image/gif`
  - `.webp` returns `image/webp`
  - `.svg` returns `image/svg+xml`

**2. Unknown Extensions**
- **Test**: Should handle unknown file extensions
- **Checks**:
  - Returns `application/octet-stream` for unknown extensions
  - Doesn't throw errors for missing extensions

**3. Case Insensitivity**
- **Test**: Should handle file extensions with different cases
- **Checks**:
  - `.JPG` returns same as `.jpg`
  - `.PNG` returns same as `.png`

#### Test Suite 4: GET /item/thumbnail Endpoint

**1. Successful Thumbnail Serving**
- **Test**: Should serve thumbnail file successfully
- **Setup**: Create temporary directory with actual Eagle library structure and thumbnail image files
- **Checks**:
  - Returns 200 status code
  - Sets correct `Content-Type` header based on actual file extension
  - Sets appropriate cache headers
  - Streams actual file content correctly
  - Response contains actual image data

**2. Parameter Validation**
- **Test**: Should validate required query parameters
- **Checks**:
  - Returns 400 when `id` parameter missing
  - Returns 400 when `libraryPath` parameter missing
  - Returns 400 when parameters are empty strings
  - Accepts valid parameters

**3. File Not Found Handling**
- **Test**: Should handle missing thumbnail files
- **Setup**: Create temporary directory with Eagle structure but no thumbnail files
- **Checks**:
  - Returns 404 status code
  - Error message indicates thumbnail not found
  - No file stream created

**4. File System Error Handling**
- **Test**: Should handle file system errors
- **Setup**: Mock file access errors
- **Checks**:
  - Returns 500 status code for permission errors
  - Returns 500 status code for IO errors
  - Error messages are appropriate

**5. Stream Error Handling**
- **Test**: Should handle stream errors gracefully
- **Setup**: Create file with restricted permissions or corrupt file
- **Checks**:
  - Catches stream errors
  - Closes response appropriately
  - Doesn't leave hanging connections

#### Test Suite 5: GET /item/image Endpoint

**1. Successful Original Image Serving**
- **Test**: Should serve original file successfully
- **Setup**: Create temporary directory with Eagle structure containing both thumbnail and original files
- **Checks**:
  - Returns 200 status code
  - Sets correct `Content-Type` header based on actual file extension
  - Sets appropriate cache headers
  - Streams actual original file content correctly

**2. Parameter Validation**
- **Test**: Should validate required query parameters
- **Checks**:
  - Returns 400 when `id` parameter missing
  - Returns 400 when `libraryPath` parameter missing
  - Returns 400 when parameters are empty strings

**3. File Resolution Chain**
- **Test**: Should resolve original file through thumbnail-based derivation
- **Setup**: Create temporary directory with thumbnail file but missing original file
- **Checks**:
  - Finds thumbnail file correctly
  - Derives original filename correctly
  - Returns 404 when original file doesn't exist even though thumbnail does
  - Error message indicates original image not found

**4. File Not Found Handling**
- **Test**: Should handle missing original files
- **Setup**: Create temporary directory with no files at all
- **Checks**:
  - Returns 404 status code when no thumbnail exists (can't derive original)
  - Error message indicates original image not found

#### Test Suite 6: Integration Tests

**1. Path Security**
- **Test**: Should prevent directory traversal attacks
- **Setup**: Create temporary directories with various path structures
- **Checks**:
  - Rejects paths containing `../`
  - Rejects absolute paths pointing outside library
  - Validates library path format
  - Doesn't serve files outside intended directory structure

**2. Concurrent Requests**
- **Test**: Should handle multiple simultaneous requests
- **Setup**: Create temporary directory with multiple image files, make concurrent requests
- **Checks**:
  - All requests complete successfully
  - No file handle leaks
  - Performance remains acceptable
  - Each request gets correct image data

**3. Large File Handling**
- **Test**: Should stream large files efficiently
- **Setup**: Create temporary directory with actual large image files (10MB+)
- **Checks**:
  - Files stream without loading entirely into memory
  - Appropriate response times
  - Memory usage remains stable
  - Complete file data is transmitted correctly

**4. Error Boundary Integration**
- **Test**: Should integrate with existing error handling
- **Checks**:
  - Uses existing `EagleApiError` when appropriate
  - Error responses match application format
  - Logs errors appropriately

#### Test Suite 7: Cache Header Tests

**1. Cache Headers**
- **Test**: Should set appropriate cache headers
- **Setup**: Create temporary directory with actual files having specific modification times
- **Checks**:
  - Sets `Cache-Control: public, max-age=86400`
  - Sets `Last-Modified` header with actual file mtime
  - Headers match for same file across requests
  - Different files have different `Last-Modified` headers

**2. Conditional Requests**
- **Test**: Should handle conditional GET requests (future enhancement)
- **Setup**: Create temporary files, make requests with `If-Modified-Since` header using actual file timestamps
- **Checks**:
  - Returns 304 for unchanged files
  - Returns 200 for modified files

### Test Setup Requirements

#### Test Environment Setup

**1. Temporary Directory Management**
- Use Node.js `fs.mkdtemp()` to create isolated test directories
- Create realistic Eagle library directory structures: `${tempDir}/images/${itemId}.info/`
- Generate actual test image files (small PNG/JPEG files for faster tests)
- Clean up temporary directories after each test

**2. Test File Creation**
- Create actual thumbnail files with `_thumbnail` suffix: `image_thumbnail.jpg`
- Create corresponding original files: `image.jpg`
- Use different file extensions to test MIME type detection
- Include files with special characters in names for edge case testing

**3. Fastify Testing**
- Use Fastify's built-in testing capabilities
- Inject actual HTTP requests to endpoints
- Test route registration with real temporary file paths

**4. Minimal Mocking Strategy**
- Only mock external services that can't be easily tested with real files
- Mock `createReadStream()` only for specific error scenarios (permission errors, corrupt files)
- Use real file operations wherever possible for more accurate testing

#### Test Environment

**1. Test File Management**
- Use `os.tmpdir()` for temporary directory base path
- Create unique test directories per test suite
- Generate small test image files (1KB PNG files for speed)
- Set specific file permissions for permission error testing

**2. Test Configuration**
- Point library paths to temporary test directories
- Use actual file extensions for realistic MIME type testing
- Configure test logging to capture file operation logs

## Performance Considerations

### Streaming Efficiency
- Use `createReadStream()` from Node.js with appropriate buffer sizes
- Set stream high water marks for optimal throughput
- Implement proper error handling to prevent memory leaks

### Caching Strategy
- Set appropriate cache headers for browser caching
- Consider implementing server-side caching for frequently accessed images
- Monitor memory usage with large files

### Error Recovery
- Implement circuit breaker pattern for file system errors
- Add request timeouts for long-running streams
- Graceful degradation when files are temporarily unavailable

## Security Considerations

### Path Validation
- Sanitize library path and item ID parameters
- Prevent directory traversal attacks
- Validate that resolved paths remain within library bounds

### Rate Limiting
- Consider implementing rate limiting for image requests
- Monitor concurrent stream connections
- Implement request size limits

## Implementation Order

1. Install required dependencies (`mime` only - `node:fs/promises` is built-in)
2. Create core file resolution functions using `glob()` from `node:fs/promises`
3. Implement MIME type detection
4. Create thumbnail endpoint with basic functionality
5. Add comprehensive error handling
6. Implement original image endpoint
7. Update Item interface in existing code
8. Add cache headers and performance optimizations
9. Write and run unit tests for each component
10. Perform integration testing
11. Register routes in main application

## Success Criteria

- [ ] Both endpoints serve actual image files from Eagle library
- [ ] Proper MIME type detection and headers
- [ ] Efficient file streaming without memory bloat
- [ ] Comprehensive error handling (400, 404, 500)
- [ ] All unit tests pass with >95% coverage
- [ ] Integration tests pass
- [ ] Performance benchmarks meet requirements
- [ ] Security validation passes
- [ ] Item interface successfully updated without breaking changes