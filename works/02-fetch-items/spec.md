# Feature: Fetch and Display Items from Eagle API

## Overview

Replace the stub data (`stubItems`) with live item data from the Eagle API, implementing infinite scroll for better performance with large image collections.

## Current State

- Frontend displays hardcoded stub items from `front/src/data/stub-items.ts`
- Proxy server already handles folder fetching from Eagle API
- ItemList component displays items in a grid with photoswipe gallery

## Implementation Requirements

### 1. Proxy Service (`/proxy`)

#### New Endpoint: GET /item/list

**Purpose:** Proxy the Eagle API's item/list endpoint and transform the response data

**Query Parameters (Initial Implementation):**
- `limit` (number): Number of items to return (default: 200)
- `offset` (number): Starting position for pagination (default: 0)

**Note:** The Eagle API supports additional parameters (`orderBy`, `keyword`, `ext`, `tags`, `folders`) that can be added in future iterations but are not required for the initial implementation.

**Implementation Details:**
1. Create new route file: `proxy/src/item.ts` following the pattern of `folder.ts`
2. Call Eagle API endpoint: `http://localhost:41595/api/item/list` with query parameters
3. Transform Eagle API response:
   - Map Eagle item structure to frontend `Item` interface
   - For initial implementation, use stub URLs for `original` and `thumbnail` fields:
     - Original: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600`
     - Thumbnail: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300`
   - All items will use the same placeholder image for now
4. Register route in `proxy/src/app.ts`

**Note:** Actual image proxying from Eagle's file system will be implemented in a future iteration.

### 2. Frontend (`/front`)

#### API Layer

Create `front/src/api/items.ts`:
- Implement `fetchItems` function with pagination support
- Create `infiniteItemsQueryOptions` using TanStack Query's `infiniteQuery`
- Handle pagination with `getNextPageParam` logic

#### New Component: InfiniteItemList

Create `front/src/components/InfiniteItemList/InfiniteItemList.tsx`:

**Features:**
- Use `useInfiniteQuery` hook for data fetching
- Implement infinite scroll using IntersectionObserver API
- Display loading indicator when fetching next page
- Handle error states (Eagle not running, proxy unavailable)
- Preserve existing ItemList styling and gallery functionality

**Key Implementation Points:**
1. Set up IntersectionObserver on a sentinel element at the bottom of the list
2. Trigger `fetchNextPage` when sentinel becomes visible
3. Flatten paginated data: `pages.flatMap(page => page.items)`
4. Reuse existing `ImageItem` component for rendering
5. Apply existing `styles.grid` class for consistent layout

#### Route Update

Modify `front/src/routes/index.tsx`:
1. Replace `<ItemList items={stubItems} />` with `<InfiniteItemList />`
2. Add query prefetching in the route loader if needed
3. Update loading and error states to handle item fetching

## Data Flow

1. User scrolls to bottom of item list
2. IntersectionObserver triggers `fetchNextPage`
3. Frontend calls proxy: `GET /item/list?limit=200&offset=400`
4. Proxy forwards to Eagle API with authentication
5. Proxy transforms response, replacing file paths with proxy URLs
6. Frontend receives items and appends to existing list
7. When user clicks an image, proxy serves the actual file via `/image/:id/:type`

## Testing Considerations

1. Verify infinite scroll functionality
2. Test error handling when Eagle is not running
3. Ensure placeholder images load correctly
4. Test pagination with different limit/offset values

## Future Enhancements (Out of Scope)

- Implement filtering UI for tags, folders, keywords
- Add sorting controls for different orderBy options
- Implement virtual scrolling for extremely large collections
- Add image caching strategy