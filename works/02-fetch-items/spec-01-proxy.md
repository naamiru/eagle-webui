# Proxy Service Specification - Item List Feature ✅ COMPLETED

## Overview

Add item listing functionality to the proxy service to fetch and transform Eagle API item data for frontend consumption.

## Implementation Details ✅ COMPLETED

### 1. Route Module: `proxy/src/item.ts` ✅ COMPLETED

Created a new route module following the existing pattern from `folder.ts`.

#### Dependencies

- `fastify` and `fastify-plugin` for route registration
- `callEagleApi` utility from `./eagle-api` for API communication
- Type definitions for Item interfaces

#### Type Definitions

```typescript
// Frontend Item interface (already exists in proxy/src/folder.ts)
interface Item {
  id: string;
  original: string;
  thumbnail: string;
  width: number;
  height: number;
}

// Eagle API response for single item
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
  // Additional fields exist but not needed for initial implementation
}

// Query parameters for the endpoint
interface ItemListQuery {
  limit?: number;
}
```

#### Endpoint Implementation ✅ COMPLETED

**Route:** `GET /item/list`

**Query Parameters:**

- `limit` (optional): Number of items to return
  - Type: number
  - Default: 1000
  - Validation: Must be positive integer

**Note:** The `offset` parameter was removed due to Eagle API's unreliable offset behavior. Eagle API may return empty results at certain offset values even when more items exist. For better reliability, we only use the `limit` parameter and fetch items from the beginning.

**Processing Steps:**

1. ✅ Extract and validate query parameters (limit only)
2. ✅ Build Eagle API URL with parameters: `/api/item/list?limit={limit}`
3. ✅ Call Eagle API using `callEagleApi` utility
4. ✅ Transform each Eagle item to frontend format:
   - Map `id` directly
   - Set `original` to stub URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600`
   - Set `thumbnail` to stub URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300`
   - Map `width` and `height` directly
5. ✅ Return transformed array

**Error Handling:**

- All errors are handled by the existing shared error handler in `error-handler.ts`
- The route throws appropriate errors that the handler can process

### 2. App Registration: `proxy/src/app.ts` ✅ COMPLETED

Added the new route to the main application:

```typescript
import itemRoutes from "./item";

// In the build function:
app.register(itemRoutes);
```

## Test Specifications ✅ COMPLETED

### Unit Tests: `proxy/src/item.test.ts` ✅ COMPLETED

#### Test Suite: GET /item/list

**1. Successful item fetching ✅ COMPLETED**

- **Test:** Should return transformed items with default parameters
- **Checks:**
  - ✅ Returns 200 status code
  - ✅ Response is an array
  - ✅ Each item has required fields: id, original, thumbnail, width, height
  - ✅ Stub URLs are correctly set
  - ✅ Default limit (1000) is used in Eagle API call

**2. Query parameter handling ✅ COMPLETED**

- **Test:** Should accept and forward limit parameter
- **Checks:**
  - ✅ Limit parameter is passed to Eagle API
  - ✅ Response respects the limit

- **Test:** Should use default values when parameters not provided
- **Checks:**
  - ✅ Default limit=1000 is used

**3. Data transformation ✅ COMPLETED**

- **Test:** Should transform Eagle item structure to frontend format
- **Checks:**
  - ✅ Eagle item fields are correctly mapped
  - ✅ Unnecessary Eagle fields are excluded
  - ✅ All items use the same stub image URLs

- **Test:** Should handle empty item list from Eagle
- **Checks:**
  - ✅ Returns empty array
  - ✅ No errors thrown

## Implementation Order ✅ COMPLETED

1. ✅ Create type definitions in `item.ts`
2. ✅ Implement basic route with default parameters
3. ✅ Add query parameter extraction and validation (limit only)
4. ✅ Implement Eagle API call with parameters
5. ✅ Add data transformation logic
6. ✅ Register route in `app.ts`
7. ✅ Write and run unit tests
8. ✅ Perform integration testing

## Success Criteria ✅ ALL COMPLETED

- ✅ Endpoint returns items from Eagle API
- ✅ Query parameters work correctly (limit parameter only)
- ✅ Data is transformed to match frontend Item interface
- ✅ All items use stub image URLs
- ✅ Error handling works for common scenarios
- ✅ All unit tests pass
- ✅ Integration with frontend works
- ✅ Added documentation about Eagle API offset limitations

## Final Implementation Notes

- **Eagle API Limitation:** Offset parameter removed due to unreliable pagination behavior
- **Default Limit:** Changed from 200 to 1000 to accommodate larger collections
- **Comment Added:** Included explanation of Eagle API offset behavior in the code
- **All Tests Updated:** Tests reflect the new parameter structure (limit only)
- **Lint Compliant:** All code passes linting checks