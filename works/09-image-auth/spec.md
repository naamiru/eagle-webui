# Image Authentication with Service Worker

## Problem Statement

After implementing token-based authentication in iteration 08, images fail to load because HTML `<img>` tags cannot include authentication headers. The proxy server now requires `Authorization: Bearer [token]` headers for all endpoints, including `/item/thumbnail` and `/item/image`.

## Current Limitation

Currently, image endpoints (`/item/thumbnail` and `/item/image`) require authentication but browser `<img>` tags cannot send the Authorization header. This causes all images to return 401 Unauthorized.

## Proposed Solution: Service Worker

Use a Service Worker to intercept image requests and add authentication headers transparently.

### How It Works

1. **Service Worker Registration**: Register a service worker when the app loads
2. **Request Interception**: Service worker intercepts all fetch requests
3. **Header Injection**: For requests to proxy server image endpoints, add Authorization header
4. **Transparent Operation**: Images load normally in `<img>` tags with authentication

### Implementation Plan

#### 1. Create Service Worker (`front/public/sw.js`)

```javascript
let authToken = null;

// Listen for token updates from main thread
self.addEventListener('message', (event) => {
  if (event.data.type === 'SET_TOKEN') {
    authToken = event.data.token;
  }
});

// Intercept fetch requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Check if this is an image request to our proxy
  if (url.pathname.match(/^\/(item\/(thumbnail|image))/) && authToken) {
    // Clone the request and add auth header
    const modifiedRequest = new Request(event.request, {
      headers: new Headers({
        ...event.request.headers,
        'Authorization': `Bearer ${authToken}`
      })
    });
    
    event.respondWith(fetch(modifiedRequest));
  }
});
```

#### 2. Service Worker Manager (`front/app/services/sw-manager.ts`)

- Register service worker on app initialization
- Update token when user authenticates
- Handle service worker lifecycle
- Clear token on logout

#### 3. Integration Points

- **Root component**: Register service worker
- **Settings page**: Send token to service worker after validation
- **Logout/Reset**: Clear token from service worker

### Benefits

✅ **Security**: Token never appears in URLs or logs  
✅ **Compatibility**: Works with existing `<img>` tags  
✅ **Performance**: Native browser caching still works  
✅ **Simplicity**: No changes needed to existing components  

### Alternative Solutions Considered

1. **URL Query Parameters**: Less secure, tokens exposed in logs
2. **Cookie Authentication**: Would require proxy changes, CORS complexity
3. **Proxy Through Frontend**: Performance overhead, memory usage
4. **Session-Based Auth**: Additional complexity on proxy side

### Testing Requirements

- Service worker registration and activation
- Token update messaging
- Request interception for image URLs
- Non-image requests pass through unchanged
- Token clearing on logout
- Offline behavior

### Browser Compatibility

Service Workers are supported in all modern browsers:
- Chrome 40+
- Firefox 44+
- Safari 11.1+
- Edge 17+

### Security Considerations

- Token stored in service worker memory only (not persisted)
- Service worker scope limited to application origin
- HTTPS required in production (localhost exception for development)
- Token cleared on service worker update/termination

## Implementation Priority

This should be implemented in the next iteration to complete the authentication feature. Without this, the application cannot display images when authentication is enabled.