# Proxy Service Specification: Folder List Endpoint

## Overview
Implement `/folder/list` endpoint in the proxy service to fetch and transform folder data from Eagle API.

## Technical Requirements

### Endpoint Configuration
- **Path**: `GET /folder/list`
- **Port**: 57821
- **Host**: `::` (IPv6 and IPv4)
- **Response Type**: `application/json`
- **Timeout**: 30 seconds for Eagle API calls

### Data Flow
```
Frontend Request → Proxy → Eagle API → Transform Response → Return to Frontend
```

## Implementation Details

### 1. CORS Configuration
Install and configure in `proxy/src/app.ts`:
- Install `@fastify/cors` package
- Register with `origin: true` to allow all origins
- Configure appropriate headers

### 2. Type Definitions
Update types in `proxy/src/folder.ts`:
- Change `id` field from `number` to `string` in both `Item` and `Folder` interfaces
- Ensure types match between proxy and frontend

### 3. Eagle API Integration
- **Eagle Endpoint**: `http://localhost:41595/api/folder/list`
- **Method**: GET
- **Expected Response Structure**:
  - Status field: `"success"` or error status
  - Data field: Array of folder objects
  - Nested children in each folder

### 3. Data Transformation Logic
1. Extract `data` array from Eagle response
2. For each folder:
   - Map `id` (string) directly
   - Map `name` field
   - Recursively process `children` array if present
   - Initialize `items` as empty array
3. Handle missing or null fields with defaults
4. Preserve folder hierarchy depth

### 4. Error Handling Strategy
- **Eagle Not Running**: Return 503 Service Unavailable with descriptive message
- **Network Timeout**: Return 504 Gateway Timeout after 30 seconds
- **Invalid Response Format**: Return 502 Bad Gateway with error details
- **Eagle API Error**: Forward Eagle's error status and message
- **Unexpected Errors**: Return 500 with generic message, log full error

### 5. Logging Requirements
- Log all requests with timestamp and duration
- Log Eagle API response status
- Log transformation errors with context
- Use structured logging (pino)

## Test Specifications

### Unit Tests (`proxy/src/folder.test.ts`)

#### 1. Successful Response Tests
- **Test: Returns transformed folder list**
  - Mock Eagle API with valid response
  - Verify correct transformation of flat folder list
  - Check all fields are mapped correctly
  - Verify `items` array is initialized as empty

- **Test: Handles nested folder structure**
  - Mock Eagle API with deeply nested folders (3+ levels)
  - Verify recursive transformation preserves hierarchy
  - Check parent-child relationships maintained
  - Ensure no data loss in nested structures

- **Test: Handles empty folder list**
  - Mock Eagle API returning empty data array
  - Verify returns empty array without errors
  - Check response has correct structure

#### 2. Eagle API Response Variations
- **Test: Handles folders without children field**
  - Mock folders with missing `children` property
  - Verify defaults to empty children array
  - No errors thrown during transformation

- **Test: Handles additional Eagle fields**
  - Mock response with extra fields (description, tags, etc.)
  - Verify transformation ignores extra fields
  - Check core fields still mapped correctly

- **Test: Handles special characters in folder names**
  - Mock folders with Unicode, emojis, special chars
  - Verify names preserved without corruption
  - Check JSON encoding handles all characters

#### 3. Error Handling Tests
- **Test: Eagle service unavailable**
  - Mock connection refused error (ECONNREFUSED)
  - Verify returns 503 status
  - Check error message indicates Eagle not running
  - Confirm no unhandled promise rejection

- **Test: Eagle API timeout**
  - Mock request timeout after 30 seconds
  - Verify returns 504 status
  - Check timeout error message
  - Ensure request is properly aborted

- **Test: Eagle returns error status**
  - Mock Eagle response with `status: "error"`
  - Verify forwards appropriate error
  - Check error message from Eagle preserved
  - Confirm proper HTTP status code mapping

- **Test: Malformed JSON response**
  - Mock invalid JSON from Eagle
  - Verify returns 502 status
  - Check error indicates bad gateway
  - Ensure error logged with details

- **Test: Network error during request**
  - Mock network failure (ENETUNREACH)
  - Verify appropriate error status
  - Check error message is user-friendly
  - Confirm error details logged

#### 4. Data Validation Tests
- **Test: Missing required fields**
  - Mock folders missing `id` or `name`
  - Verify handles gracefully or returns error
  - Check validation error messages
  - Ensure partial data not returned

- **Test: Invalid data types**
  - Mock folders with wrong field types
  - Verify type coercion or error handling
  - Check response consistency

#### 5. CORS Tests
- **Test: CORS headers present in response**
  - Make request to `/folder/list`
  - Verify `Access-Control-Allow-Origin: *` header present
  - Check `Access-Control-Allow-Methods` includes GET
  - Confirm CORS headers on both success and error responses

- **Test: Preflight request handling**
  - Send OPTIONS request to `/folder/list`
  - Verify returns 204 No Content
  - Check CORS headers in preflight response
  - Confirm allowed headers are specified

### Test Utilities (`proxy/src/test-helper.ts`)
- Helper to build mock Fastify app instance
- Mock fetch responses for Eagle API
- Assertion helpers for folder structure validation
- Test data factories for various scenarios

## Performance Considerations
- Implement response caching (5-minute TTL)
- Stream large responses if over 10MB
- Connection pooling for Eagle API requests
- Implement circuit breaker for Eagle API failures

## Security Considerations
- Validate all input from Eagle API
- Sanitize error messages before sending to client
- No sensitive data in logs
- Rate limiting on endpoint (100 req/min)

## Future Enhancements
- WebSocket support for real-time updates
- Pagination for large folder lists
- Folder metadata enrichment
- Bulk folder operations
- Folder search/filter capabilities

## Success Metrics
- All tests passing (100% of defined test cases)
- Response time < 500ms for typical folder structures
- Error rate < 1% in production
- Graceful degradation when Eagle unavailable