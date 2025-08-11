# Proxy URL Setting Feature Specification

## Overview
Enable users to configure the proxy server URL in the frontend application, allowing connection to Eagle proxy servers running on different hosts or ports.

## Current State
- Proxy URL is hardcoded as `http://localhost:57821` across multiple files
- No user interface to change the proxy URL
- No persistence mechanism for custom proxy settings

## Requirements

### Functional Requirements
1. Users must be able to configure the proxy server URL through the UI
2. The configured URL must persist across browser sessions
3. Application must use the configured URL for all API calls
4. System must provide a fallback to default URL if no custom URL is set
5. Users should be able to test the connection to verify the proxy URL works

### Non-Functional Requirements
1. Settings must persist indefinitely until explicitly changed
2. Configuration changes should take effect immediately without page reload
3. Solution must be simple and maintainable
4. Storage mechanism must work across all modern browsers

## Technical Design

### Storage Strategy
**localStorage** will be used for persistence because:
- Persists indefinitely (survives browser restarts)
- Simple synchronous API
- Sufficient storage capacity (5-10MB)
- Supported by all modern browsers
- No expiration unlike cookies

### Architecture

#### 1. Settings Service (`/front/app/services/settings.ts`)
```typescript
// Constants
export const STORAGE_KEY = 'eagle-proxy-url';
export const DEFAULT_PROXY_URL = 'http://localhost:57821';

// Functions
export function getProxyUrl(): string
export function setProxyUrl(url: string): void
export function hasStoredProxyUrl(): boolean  // Check if URL was ever validated/stored
export function validateProxyUrl(url: string): Promise<boolean>
export function resetToDefault(): void
```

#### 2. API Integration
All API modules will be updated to use the dynamic proxy URL:
- `/front/app/api/library.ts`
- `/front/app/api/folders.ts`
- `/front/app/api/items.ts`

Example update:
```typescript
import { getProxyUrl } from '~/services/settings';

export const fetchLibrary = async (): Promise<Library> => {
  const proxyUrl = getProxyUrl();
  const response = await fetch(`${proxyUrl}/library/info`);
  // ...
};
```

#### 3. Image URL Construction (`/front/app/utils/image.ts`)
Update utility functions to use dynamic proxy URL:
```typescript
import { getProxyUrl } from '~/services/settings';

export const getImageUrl = (path: string): string => {
  const proxyUrl = getProxyUrl();
  return `${proxyUrl}/image?path=${encodeURIComponent(path)}`;
};
```

### Route Structure Changes

#### Current Problem
`root.tsx` fetches library info in `clientLoader` before proxy URL validation, causing failures when the stored proxy URL is invalid or unavailable.

#### Solution: Layout Route Pattern
Create a layout route that validates the proxy URL before loading library data:

```
root.tsx (no library fetching)
├── _app.tsx (layout route - validates proxy & fetches library)
│   ├── _index.tsx (home page)
│   └── folder.$folderId.tsx (folder page)
└── settings.tsx (proxy configuration page)
```

#### Layout Route (`/front/app/routes/_app.tsx`)
```typescript
import { getProxyUrl, validateProxyUrl, hasStoredProxyUrl } from '~/services/settings';

export async function clientLoader() {
  const proxyUrl = getProxyUrl();
  
  // Validate current proxy URL
  const isValid = await validateProxyUrl(proxyUrl);
  
  if (!isValid) {
    // Check if this is first-time setup (never validated)
    if (!hasStoredProxyUrl()) {
      // First-time setup: redirect to settings
      throw redirect('/settings?initial=true');
    }
    
    // Previously validated URL is now invalid: show error
    throw new Response('Proxy server connection failed', {
      status: 503,
      statusText: `Cannot connect to proxy server at ${proxyUrl}. Please check if the Eagle proxy is running.`
    });
  }
  
  // Only fetch library after validation
  return getQueryClient().ensureQueryData(libraryQueryOptions);
}

export default function AppLayout() {
  const { data: library } = useSuspenseQuery(libraryQueryOptions);
  
  return (
    <LibraryContext.Provider value={library}>
      <Outlet />
    </LibraryContext.Provider>
  );
}
```

### User Interface

#### Settings Page Component
Location: `/front/app/routes/settings.tsx`

Features:
- Input field for proxy URL
- Test connection button
- Reset to default button
- Connection status indicator
- Validation feedback
- Auto-redirect to app after successful configuration

```typescript
interface SettingsPageProps {
  currentUrl: string;
  isValidating: boolean;
  connectionStatus: 'connected' | 'error' | 'unknown';
}
```

#### UI Flow

**First-time Setup (never validated)**:
1. User visits app for the first time
2. Layout detects no stored proxy URL and redirects to `/settings?initial=true`
3. Settings page shows "Initial Setup" message
4. User configures proxy URL and validates connection
5. If validation succeeds, URL is saved and user is redirected to app

**Normal Settings Access**:
1. User navigates to settings page manually
2. Current proxy URL is displayed in input field
3. User modifies the URL and validates
4. If validation succeeds, URL is saved and user can navigate back

**Previously Valid URL Becomes Invalid**:
1. Layout detects stored proxy URL is now invalid
2. Error boundary shows connection error with troubleshooting tips
3. User can navigate to settings to reconfigure
4. Error page provides direct link to settings

### Validation Logic

#### Strategy: TanStack Query Integration
Leverage existing TanStack Query infrastructure for validation to:
- Reuse library cache if validation succeeds
- Maintain consistent error handling
- Avoid duplicate requests when possible
- Integrate with existing query system

#### Validation Implementation

```typescript
// services/settings.ts
import { getQueryClient } from '~/integrations/tanstack-query';
import { libraryQueryOptions } from '~/api/library';

export async function validateProxyUrl(url: string): Promise<boolean> {
  try {
    // Basic URL format validation
    new URL(url);
    
    const queryClient = getQueryClient();
    
    // If this is the current proxy URL and we have fresh cached data, it's valid
    if (url === getProxyUrl()) {
      const cachedData = queryClient.getQueryData(libraryQueryOptions.queryKey);
      const queryState = queryClient.getQueryState(libraryQueryOptions.queryKey);
      if (cachedData && queryState && !queryState.isStale) {
        return true; // Cache hit - URL is definitely valid
      }
    }
    
    // Create validation query based on existing library query
    const validationQuery = {
      ...libraryQueryOptions,
      queryKey: ["library", "validation", url],
      queryFn: async () => {
        const response = await fetch(`${url}/library/info`);
        if (!response.ok) {
          throw new Error(`Failed to fetch library info: ${response.status} ${response.statusText}`);
        }
        return response.json();
      },
      retry: false, // Don't retry for validation
      staleTime: 0,  // Always fresh for validation
    };
    
    // Use fetchQuery to test the connection
    await queryClient.fetchQuery(validationQuery);
    
    return true;
  } catch (error) {
    return false;
  }
}
```

#### Validation Steps
1. **URL Format Check**: Validate using `new URL()` constructor
2. **Cache Optimization**: Check if current URL has fresh cached data
3. **Network Test**: Use TanStack Query's `fetchQuery` with `/library/info` endpoint
4. **Response Validation**: Ensure successful response and JSON parsing
5. **Error Handling**: Return `false` for any failure (network, parsing, etc.)

#### Benefits Over Direct Fetch
- **Cache Reuse**: Successful validation populates cache for immediate app use
- **Consistent Error Handling**: Same retry/error logic as app queries
- **Network Optimization**: Avoids duplicate requests when cache is fresh
- **Query Invalidation**: Can leverage existing query invalidation patterns

### Error Handling

1. **Invalid URL Format**: Show validation error in UI
2. **First-time Connection Failed**: Keep user on settings page with error message
3. **Previously Valid URL Now Invalid**: Show error boundary with troubleshooting tips and settings link
4. **localStorage Unavailable**: Fall back to in-memory storage with warning
5. **Proxy Unreachable**: Distinguish between first-time setup and recurring connection issues

### Migration Strategy

Since this is a new feature, no data migration is needed. The system will:
1. Check localStorage for existing settings
2. If not found, use default URL
3. Continue normal operation

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create settings service with localStorage integration
2. Add proxy URL getter/setter functions with constants
3. Implement validation and reset functions

### Phase 2: Route Restructuring
1. Remove library fetching from `root.tsx`
2. Create `_app.tsx` layout route with proxy validation
3. Move existing index and folder routes under the layout
4. Ensure LibraryContext is provided by layout route

### Phase 3: API Integration
1. Update all API modules to use settings service
2. Update image URL utilities
3. Ensure all hardcoded URLs are replaced

### Phase 4: User Interface
1. Create settings route and component
2. Implement URL input with validation
3. Add connection testing functionality
4. Include auto-redirect after successful configuration

### Phase 5: Polish
1. Polish UI with proper error messages and loading states
2. Add user feedback and status indicators
3. Ensure smooth transitions between validation states

## Security Considerations

1. **URL Validation**: Sanitize and validate URLs to prevent injection attacks
2. **HTTPS Support**: Allow both HTTP and HTTPS proxy URLs
3. **CORS**: Proxy server must handle CORS appropriately
4. **No Sensitive Data**: Only store proxy URL, no credentials

## Future Enhancements

1. Multiple proxy profiles for different Eagle instances
2. Auto-discovery of proxy servers on local network
3. Connection health monitoring with automatic fallback
4. Import/export settings functionality
5. Proxy authentication support (if needed)

## Success Criteria

1. Users can successfully configure custom proxy URL
2. Settings persist across browser sessions
3. All API calls use the configured URL
4. Clear feedback when proxy is unreachable
5. No breaking changes to existing functionality
6. Smooth first-time setup experience
7. Proper error handling for connection issues