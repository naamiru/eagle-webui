# Image Authentication with Service Worker

## Problem

The proxy server requires `Authorization: Bearer [token]` headers for all endpoints, including image URLs (`/item/thumbnail` and `/item/image`). However, HTML `<img>` tags cannot include authentication headers, causing images to fail loading.

## Solution Overview

Implement a Service Worker that intercepts image requests and transforms authentication tokens from URL query parameters to proper Authorization headers.

## Implementation Specifications

### 1. Service Worker Lifecycle Management

**Registration** (already implemented in `app/root.tsx`):

- Service worker is registered via `vite-pwa` plugin on app initialization
- Uses `skipWaiting()` for immediate activation

**Activation Waiting** (to be added in `app/routes/_app.tsx`):

- Before loading the app layout, check if service worker is active
- If not active, wait for activation before proceeding
- This ensures all subsequent image requests will be intercepted

### 2. Image URL Modification

**Modify `buildImageUrl` function** in `app/utils/image.ts`:

- Retrieve the auth token from `getProxyToken()`
- Append token as query parameter: `&token=[token]`
- Only add token parameter if token exists

### 3. Service Worker Request Interception

**Update `app/service-worker.ts`** fetch event listener:

- Intercept only image endpoint requests (`/item/thumbnail` and `/item/image`)
- Check if URL contains `token` query parameter
- If token exists:
  - Extract token from URL
  - Remove token from query parameters
  - Create new Request with cleaned URL
  - Add `Authorization: Bearer [token]` header
  - Forward modified request
- Pass through all other requests unchanged

## Security Considerations

- Token appears briefly in URL but is immediately removed by service worker
- Service worker runs in secure context (HTTPS or localhost)
- Token is not logged or stored in browser history
- Fallback: If service worker fails, images won't load (fail-secure)
