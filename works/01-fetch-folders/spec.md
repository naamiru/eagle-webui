# Feature: Fetch and Display Folders from Eagle API

## Overview
Replace stub data with live folder data from Eagle API, establishing the data flow from Eagle -> Proxy -> Frontend.

## Eagle API Reference
- **Endpoint**: `GET http://localhost:41595/api/folder/list`
- **Documentation**: https://api.eagle.cool/folder/list
- **Response**: JSON containing folder hierarchy with metadata
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "folder_id",
        "name": "Folder Name",
        "description": "Optional description",
        "imageCount": 10,
        "descendantImageCount": 25,
        "modificationTime": 1234567890,
        "children": [/* nested folders */]
      }
    ]
  }
  ```

## Implementation Plan

### 1. Proxy Service (`/proxy`)

#### Current State
- **Endpoint**: `GET /folder/list` (stub implementation exists in `proxy/src/folder.ts`)
- **Port**: 57821
- **Returns**: Hardcoded `Folder[]` with test data

#### Required Changes
1. Update `id` field type from `number` to `string` in both `Folder` and `Item` interfaces (proxy and frontend)
2. Update `proxy/src/folder.ts` to fetch from Eagle API (`http://localhost:41595/api/folder/list`)
3. Pass through Eagle's response structure directly (no ID conversion needed)
4. Recursively process `children` array for nested folders
5. Set `items: []` for now (will be populated in future feature)
6. Handle errors (Eagle not running, API failures)

### 2. Frontend (`/front`)

#### API Integration
Create `front/src/api/folders.ts`:
```typescript
export const fetchFolders = async (): Promise<Folder[]> => {
  const response = await fetch('http://localhost:57821/folder/list');
  if (!response.ok) throw new Error('Failed to fetch folders');
  return response.json();
}
```

#### TanStack Query Setup
Update `front/src/routes/index.tsx`:
1. Add route loader with TanStack Query
2. Use `queryOptions` to define the folders query
3. Prefetch folders in `loader` function
4. Use `useSuspenseQuery` in component

```typescript
const foldersQuery = queryOptions({
  queryKey: ['folders'],
  queryFn: fetchFolders,
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => 
    context.queryClient.ensureQueryData(foldersQuery),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: folders } = useSuspenseQuery(foldersQuery);
  // Use `folders` instead of `stubFolders`
}
```

#### Error Handling
- Display loading state while fetching
- Show error message if Eagle is not running
- Fallback to empty folder list on error

### 3. Testing Strategy

#### Proxy Tests
- Test file exists: `proxy/src/folder.test.ts`
- Mock Eagle API responses
- Test error scenarios (Eagle offline, malformed response)
- Verify correct data transformation

#### Frontend Tests
- Mock proxy API calls
- Test loading states
- Verify folder hierarchy rendering

## Success Criteria
- [ ] Proxy endpoint fetches from Eagle API instead of returning stub data
- [ ] Frontend displays live folder data from proxy endpoint
- [ ] Nested folder structure is preserved
- [ ] Error states are handled gracefully
- [ ] No breaking changes to existing ItemList component

## Future Considerations
- Caching strategy for folder data
- Real-time updates when folders change in Eagle
- Pagination for large folder lists
- Folder icons and metadata display