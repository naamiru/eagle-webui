# Proxy Service Implementation: Folder-Specific Items

## Overview

Enhance the existing `/item/list` endpoint to support folder-specific item filtering by adding an optional `folder` query parameter.

## Current State Analysis

**Existing Implementation** (`proxy/src/item.ts`):
- Endpoint: `GET /item/list`
- Query Parameters: `limit?: number`
- Eagle API Call: `GET http://localhost:41595/api/item/list?limit={limit}`
- Returns: `Item[]` with all items from library

## Required Changes

### 1. Interface Updates

**ItemListQuery Interface**:
```typescript
interface ItemListQuery {
  limit?: number;     // existing
  folder?: string;    // NEW: folder ID for filtering
}
```

**No changes to**:
- `Item` interface
- `EagleItem` interface  
- `transformEagleItem()` function
- Response format

### 2. Query Parameter Processing

**Parameter Extraction**:
- Extract `folder` from request query string
- Validate `folder` is non-empty string if provided
- Maintain existing `limit` parameter handling
- Apply same default `limit = 1000` when not provided

**URL Construction Logic**:
```typescript
// Base Eagle API URL
const baseUrl = '/api/item/list'

// Always include limit parameter
const params = new URLSearchParams({
  limit: limit.toString()
})

// Conditionally add folders parameter
if (folder) {
  params.set('folders', folder)  // Eagle API uses 'folders' not 'folder'
}

// Final URL: /api/item/list?limit=1000&folders={folderId}
const url = `${baseUrl}?${params.toString()}`
```

### 3. Eagle API Integration

**Parameter Mapping**:
- Frontend `folder` → Eagle API `folders` parameter
- Eagle API expects folder ID as string value
- Multiple folder IDs supported (comma-separated) but not used in this feature

**API Call Pattern**:
- **All items**: `GET /api/item/list?limit=1000`
- **Folder items**: `GET /api/item/list?limit=1000&folders={folderId}`
- Use existing `callEagleApi<EagleItem[]>()` utility
- Maintain existing error handling and logging

### 4. Data Processing

**No Changes Required**:
- Item transformation logic unchanged
- Response format unchanged
- Error handling unchanged
- Logging pattern unchanged

**Response Behavior**:
- **Without folder**: Returns all items (existing behavior)
- **With valid folder**: Returns items from specified folder only
- **With invalid folder**: Returns empty array (Eagle API behavior)
- **With non-existent folder**: Returns empty array (Eagle API behavior)

## Testing Strategy

### Unit Tests: `proxy/src/item.test.ts`

#### Test Suite: Folder Parameter Handling

**1. Parameter Processing**:
- ✅ Should accept folder parameter and pass to Eagle API
- ✅ Should work without folder parameter (existing behavior)
- ✅ Should handle empty folder parameter (ignore it)
- ✅ Should handle whitespace-only folder parameter (ignore it)
- ✅ Should URL-encode special characters in folder ID

**2. URL Construction**:
- ✅ Should build correct Eagle API URL with folder parameter
- ✅ Should build correct Eagle API URL without folder parameter
- ✅ Should maintain limit parameter when folder is provided
- ✅ Should use default limit when both folder and limit provided
- ✅ Should handle folder IDs with special characters

**3. Eagle API Integration**:
- ✅ Should call Eagle API with folders parameter
- ✅ Should handle Eagle API response for specific folder
- ✅ Should handle empty response from Eagle API (invalid folder)
- ✅ Should maintain existing error handling for API failures

**4. Data Transformation**:
- ✅ Should transform folder-specific items correctly
- ✅ Should return empty array for non-existent folders
- ✅ Should maintain item structure consistency
- ✅ Should preserve all existing transformation logic

#### Test Suite: Backward Compatibility

**1. Existing Behavior Preserved**:
- ✅ Should work exactly as before when no folder parameter provided
- ✅ Should maintain same response format
- ✅ Should preserve existing error handling
- ✅ Should maintain same logging patterns

**2. Query Parameter Combinations**:
- ✅ Should handle limit only (existing behavior)
- ✅ Should handle folder only (use default limit)
- ✅ Should handle both limit and folder parameters
- ✅ Should ignore invalid parameter types

#### Mock Data Requirements

**Test Scenarios**:
- Eagle API responses for specific folders (with items)
- Eagle API responses for empty folders
- Eagle API responses for invalid folder IDs
- Eagle API error responses
- Various folder ID formats (alphanumeric, special characters)

**Test Utilities**:
- Mock `callEagleApi` with configurable folder responses
- Helper functions for testing URL construction
- Assertion helpers for validating API calls

## Implementation Steps

### Phase 1: Interface Updates
1. Update `ItemListQuery` interface to include optional `folder` parameter
2. Validate TypeScript compilation
3. Update route type definitions

### Phase 2: Query Processing
1. Extract folder parameter from request query
2. Add parameter validation logic
3. Update URL construction logic
4. Test parameter extraction

### Phase 3: Eagle API Integration
1. Modify Eagle API call to include folders parameter when provided
2. Test API call construction
3. Verify Eagle API response handling
4. Test error scenarios

### Phase 4: Testing
1. Write unit tests for new functionality
2. Verify backward compatibility tests pass
3. Test edge cases and error conditions
4. Perform integration testing

### Phase 5: Documentation
1. Update API documentation
2. Add code comments explaining parameter mapping
3. Document Eagle API parameter differences

## Integration Points

**No Breaking Changes**:
- Endpoint URL unchanged: `GET /item/list`
- Existing query parameters unchanged
- Response format unchanged
- Error handling unchanged

**Dependencies**:
- Existing `callEagleApi()` utility
- Existing `transformEagleItem()` function
- Existing Fastify route registration
- Existing error handling middleware

**Frontend Integration**:
- Frontend can call with or without folder parameter
- Existing API calls continue to work unchanged
- New folder-specific calls supported

## Success Criteria

- [ ] Endpoint accepts optional `folder` query parameter
- [ ] Folder parameter correctly filters items from Eagle API
- [ ] All existing functionality preserved (backward compatibility)
- [ ] Invalid folder IDs handled gracefully (empty response)
- [ ] URL construction correctly maps frontend to Eagle API parameters
- [ ] All unit tests pass with >95% coverage
- [ ] Integration with frontend folder page works correctly
- [ ] API documentation updated with new parameter
- [ ] No performance regression for existing use cases

## Edge Cases

**Parameter Handling**:
- Empty string folder parameter → ignore, fetch all items
- Whitespace-only folder parameter → ignore, fetch all items
- Very long folder ID → pass through to Eagle API
- Special characters in folder ID → URL encode properly

**Eagle API Behavior**:
- Non-existent folder ID → returns empty array
- Folder with no items → returns empty array
- Eagle API timeout → existing error handling applies
- Invalid response format → existing error handling applies