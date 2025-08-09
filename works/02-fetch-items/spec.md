# Feature: Fetch and Display Items from Eagle API

## Overview

Replace the stub data (`stubItems`) with live item data from the Eagle API using a simple list approach with the existing ItemList component.

## Current State

- Frontend displays hardcoded stub items from `front/src/data/stub-items.ts`
- Proxy server already handles folder fetching from Eagle API
- ItemList component displays items in a grid with photoswipe gallery

## Implementation Requirements

### 1. Proxy Service (`/proxy`) - ✅ Completed

#### Endpoint: GET /item/list

**Purpose:** Proxy the Eagle API's item/list endpoint and transform the response data

**Query Parameters:**
- `limit` (number): Number of items to return (default: 1000)

**Note:** The Eagle API has unreliable offset behavior, so pagination is not implemented. Instead, use a larger limit value to fetch more items at once.

**Implementation Details:**
1. ✅ Created route file: `proxy/src/item.ts` following the pattern of `folder.ts`
2. ✅ Calls Eagle API endpoint: `http://localhost:41595/api/item/list` with limit parameter only
3. ✅ Transforms Eagle API response:
   - Maps Eagle item structure to frontend `Item` interface
   - Uses stub URLs for `original` and `thumbnail` fields:
     - Original: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600`
     - Thumbnail: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300`
   - All items use the same placeholder image for now
4. ✅ Registered route in `proxy/src/app.ts`
5. ✅ Added comment explaining Eagle API offset limitations

### 2. Frontend (`/front`)

#### API Layer

Create `front/src/api/items.ts`:
- Implement `fetchItems` function that calls `/item/list` with limit parameter
- Create `itemsQueryOptions` using TanStack Query's standard `query` (not `infiniteQuery`)
- Handle errors (Eagle not running, proxy unavailable)

#### Route Update

Modify `front/src/routes/index.tsx`:
1. Keep existing `<ItemList items={...} />` component - no new component needed
2. Add items query to the route loader to prefetch items with `limit=100`
3. Replace `stubItems` with real data from the items query
4. Update error states to handle item fetching failures
5. Update loading state to show loading indicator while items are being fetched

## Data Flow

1. User navigates to index page
2. Route loader calls `fetchItems(100)` via TanStack Query
3. Frontend calls proxy: `GET /item/list?limit=100`
4. Proxy forwards to Eagle API: `GET /api/item/list?limit=100`
5. Proxy transforms response with placeholder image URLs
6. Frontend receives items and passes them to existing `<ItemList />` component
7. ItemList displays up to 100 items in the grid with photoswipe gallery

## Implementation Steps

1. Create `front/src/api/items.ts` with:
   - `fetchItems(limit?: number)` function
   - `itemsQueryOptions(limit?: number)` query options
   
2. Update `front/src/routes/index.tsx`:
   - Import items query options
   - Add items query to loader with `limit=100`
   - Replace `stubItems` with items from query
   - Update error handling

## Testing Considerations

1. Test error handling when Eagle is not running
2. Ensure placeholder images load correctly  
3. Verify 100 items are displayed on the index page
4. Test that existing ItemList functionality (photoswipe gallery) still works

## Future Enhancements (Out of Scope)

- Implement actual image proxying from Eagle's file system
- Add pagination controls for viewing more than 100 items
- Implement filtering UI for tags, folders, keywords
- Add sorting controls for different orderBy options