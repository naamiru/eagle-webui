# Proxy Service Specification - Item List Feature

## Overview

Add item listing functionality to the proxy service to fetch and transform Eagle API item data for frontend consumption.

## Implementation Details

### 1. Route Module: `proxy/src/item.ts`

Create a new route module following the existing pattern from `folder.ts`.

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

// Eagle API response wrapper
interface EagleItemListResponse {
  status: "success";
  data: EagleItem[];
}

// Query parameters for the endpoint
interface ItemListQuery {
  limit?: number;
  offset?: number;
}
```

#### Endpoint Implementation

**Route:** `GET /item/list`

**Query Parameters:**

- `limit` (optional): Number of items to return
  - Type: number
  - Default: 200
  - Validation: Must be positive integer
- `offset` (optional): Starting position for pagination
  - Type: number
  - Default: 0
  - Validation: Must be non-negative integer

**Processing Steps:**

1. Extract and validate query parameters
2. Build Eagle API URL with parameters: `/api/item/list?limit={limit}&offset={offset}`
3. Call Eagle API using `callEagleApi` utility
4. Transform each Eagle item to frontend format:
   - Map `id` directly
   - Set `original` to stub URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600`
   - Set `thumbnail` to stub URL: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300`
   - Map `width` and `height` directly
5. Return transformed array

**Error Handling:**

- All errors are handled by the existing shared error handler in `error-handler.ts`
- The route should throw appropriate errors that the handler can process

### 2. App Registration: `proxy/src/app.ts`

Add the new route to the main application:

```typescript
import itemRoutes from "./item";

// In the build function:
app.register(itemRoutes);
```

## Test Specifications

### Unit Tests: `proxy/src/item.test.ts`

#### Test Suite: GET /item/list

**1. Successful item fetching**

- **Test:** Should return transformed items with default parameters
- **Checks:**
  - Returns 200 status code
  - Response is an array
  - Each item has required fields: id, original, thumbnail, width, height
  - Stub URLs are correctly set
  - Default limit (200) and offset (0) are used in Eagle API call

**2. Query parameter handling**

- **Test:** Should accept and forward limit parameter
- **Checks:**
  - Limit parameter is passed to Eagle API
  - Response respects the limit

- **Test:** Should accept and forward offset parameter
- **Checks:**
  - Offset parameter is passed to Eagle API
  - Pagination works correctly

- **Test:** Should use default values when parameters not provided
- **Checks:**
  - Default limit=200 is used
  - Default offset=0 is used

**3. Data transformation**

- **Test:** Should transform Eagle item structure to frontend format
- **Checks:**
  - Eagle item fields are correctly mapped
  - Unnecessary Eagle fields are excluded
  - All items use the same stub image URLs

- **Test:** Should handle empty item list from Eagle
- **Checks:**
  - Returns empty array
  - No errors thrown

## Implementation Order

1. Create type definitions in `item.ts`
2. Implement basic route with default parameters
3. Add query parameter extraction and validation
4. Implement Eagle API call with parameters
5. Add data transformation logic
6. Register route in `app.ts`
7. Write and run unit tests
8. Perform integration testing

## Success Criteria

- [ ] Endpoint returns items from Eagle API
- [ ] Query parameters work correctly
- [ ] Data is transformed to match frontend Item interface
- [ ] All items use stub image URLs
- [ ] Error handling works for common scenarios
- [ ] All unit tests pass
- [ ] Integration with frontend works
