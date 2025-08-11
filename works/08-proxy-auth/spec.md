# Token Authentication for Eagle WebUI Proxy Service

## Overview
Add bearer token authentication between the frontend and proxy service to secure the API endpoints and prevent unauthorized access to the Eagle library.

## Proxy Service Specifications

### Token Generation
- Generate a cryptographically secure random token (32 bytes, hex encoded) when the proxy server starts
- Support `EAGLE_WEBUI_PROXY_TOKEN` environment variable for development/testing purposes
  - If set, use this value instead of generating a random token
  - Validate that the provided token meets minimum security requirements (min 16 characters)

### Server Startup
- On server startup at `proxy/src/server.ts`:
  1. Generate or load the authentication token
  2. Print a setup URL to the console with the following format:
     ```
     Eagle WebUI Ready! Visit this URL to start using the web interface:
     http://[local-ip]:5173/settings?url=http://[local-ip]:57821&token=[token-value]
     ```
  3. Use the actual local network IP address (not localhost/127.0.0.1) to enable cross-device access
  4. The frontend Vite server runs on port 5173, proxy on 57821

### Authentication Middleware
- Implement Fastify authentication plugin at `proxy/src/auth.ts`
- Apply to all routes except health check endpoint
- Validate `Authorization: Bearer [token]` header on incoming requests
- Return 401 Unauthorized for:
  - Missing Authorization header
  - Invalid bearer token format
  - Incorrect token value
- Exclude authentication for:
  - OPTIONS requests (CORS preflight)
  - `/health` endpoint (for basic connectivity checks)

### Health Check Endpoint
- Add `/health` endpoint that returns `{ status: "ok" }` without authentication
- Used for initial connectivity validation before token setup

## Frontend Specifications

### Settings Storage
- Extend `front/app/services/settings.ts`:
  - Add `STORAGE_TOKEN_KEY = "eagle-proxy-token"` constant
  - Add `getProxyToken()`, `setProxyToken()`, `hasStoredProxyToken()` functions
  - Store token securely in localStorage alongside proxy URL
  - Clear token when proxy URL changes or resets

### Settings Page Enhancement
- Update `front/app/routes/settings.tsx`:
  - Read `url` and `token` query parameters on mount
  - Auto-populate proxy URL field if `url` parameter exists
  - If both `url` and `token` parameters exist:
    1. Validate the proxy connection with token
    2. Save both URL and token on successful validation
    3. Auto-redirect to home page
  - Add token input field (password type) for manual configuration
  - Show/hide token toggle for visibility
  - Clear token when resetting to defaults

### API Client Authentication
- Update all API modules (`front/app/api/*.ts`):
  - Create shared `fetchWithAuth()` utility function
  - Add `Authorization: Bearer [token]` header to all requests
  - Handle 401 responses:
    - Clear stored token
    - Redirect to `/settings?initial=true`
    - Show authentication error message

### Connection Validation
- Update `validateProxyUrl()` in settings service:
  - First try `/health` endpoint without auth to verify connectivity
  - Then validate with token using `/library/info` endpoint
  - Return detailed error states:
    - "unreachable" - Cannot connect to proxy
    - "unauthorized" - Proxy reachable but token invalid
    - "connected" - Fully authenticated

## Security Considerations

### Token Requirements
- Minimum 16 characters for custom tokens
- Generated tokens: 32 bytes (64 hex characters)
- Tokens should be treated as secrets and never logged in production
- Use constant-time comparison to prevent timing attacks

### CORS Configuration
- Maintain existing CORS settings with `origin: true`
- Authentication headers must be allowed in CORS configuration

### Error Handling
- Never expose token values in error messages
- Log authentication failures with client IP for monitoring
- Rate limit authentication attempts per IP (optional enhancement)

## Migration Path

### Initial Setup Flow
1. User starts the proxy server
2. Server generates token and prints setup URL
3. User opens the setup URL in browser
4. Frontend validates and saves URL + token automatically
5. User is redirected to main application

### Existing Users
- If no token is stored but proxy URL exists:
  - Redirect to settings with message about authentication requirement
  - User must restart proxy to get new setup URL

### Development Workflow
- Set `EAGLE_WEBUI_PROXY_TOKEN=dev-token-12345678` for consistent token
- Frontend can be pre-configured with matching token
- Simplifies testing and debugging

## Testing Requirements

### Proxy Tests
- Token generation with and without environment variable
- Authentication middleware accepts valid tokens
- Authentication middleware rejects invalid/missing tokens
- Health endpoint accessible without authentication
- CORS preflight requests work without authentication

### Frontend Tests
- Token storage and retrieval functions
- API calls include authentication header
- 401 responses trigger re-authentication flow
- Settings page handles URL parameters correctly
- Connection validation with various error states

## Implementation Order

1. **Phase 1: Proxy Authentication**
   - Token generation and startup message
   - Authentication middleware
   - Health check endpoint
   - Update existing routes

2. **Phase 2: Frontend Token Storage**
   - Settings service token functions
   - Update settings page UI
   - Handle query parameters

3. **Phase 3: API Client Updates**
   - Add authentication headers
   - Handle 401 responses
   - Update connection validation

4. **Phase 4: Testing & Documentation**
   - Unit tests for new functionality
   - Integration tests for auth flow
   - Update README with setup instructions