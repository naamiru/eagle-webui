# Frontend Specification: Folder Data Integration

## Overview
Replace stub folder data with live data from the proxy service, implementing TanStack Query for state management and establishing the complete data flow from Eagle -> Proxy -> Frontend.

## Technical Requirements

### Current State Analysis
- **Route**: `front/src/routes/index.tsx` uses `stubFolders` from `front/src/data/stub-items.ts`
- **Types**: `front/src/types/item.ts` has `id: number` (needs to change to `string`)
- **Framework**: TanStack Router + TanStack Query already installed
- **Components**: `FolderList` component expects `Folder[]` prop

## Implementation Details

### 1. Type System Updates
Update `front/src/types/item.ts`:
- Change `id` field from `number` to `string` in both `Item` and `Folder` interfaces
- Ensure consistency with proxy service types
- Update all dependent components and test fixtures

### 2. API Layer Implementation
Create `front/src/api/folders.ts`:
```typescript
export const fetchFolders = async (): Promise<Folder[]> => {
  const response = await fetch('http://localhost:57821/folder/list');
  if (!response.ok) {
    throw new Error(`Failed to fetch folders: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

export const foldersQueryOptions = queryOptions({
  queryKey: ['folders'],
  queryFn: fetchFolders,
  staleTime: 5 * 60 * 1000, // 5 minutes
  retry: (failureCount, error) => {
    // Don't retry if proxy service is unavailable
    if (error.message.includes('Failed to fetch')) return false;
    return failureCount < 3;
  },
});
```

### 3. Route Integration with TanStack Query
Update `front/src/routes/index.tsx`:

#### 3.1 Route Configuration
- Add route loader with `context.queryClient.ensureQueryData()`
- Configure prefetching for optimal UX
- Handle loading and error states

#### 3.2 Component Implementation
```typescript
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FolderList } from "~/components/FolderList/FolderList";
import { ItemList } from "~/components/ItemList/ItemList";
import { stubItems } from "~/data/stub-items";
import { foldersQueryOptions } from "~/api/folders";
import styles from "./index.module.css";

export const Route = createFileRoute("/")({
  loader: ({ context }) => 
    context.queryClient.ensureQueryData(foldersQueryOptions),
  component: RouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: LoadingComponent,
});

function RouteComponent() {
  const { data: folders } = useSuspenseQuery(foldersQueryOptions);
  
  return (
    <div className={styles.container}>
      <h4 className={styles.folderListTitle}>フォルダー</h4>
      <FolderList folders={folders} />
      <h4 className={styles.itemListTitle}>すべて</h4>
      <ItemList items={stubItems} />
    </div>
  );
}
```

### 4. Error Handling Strategy

#### 4.1 Error States
- **Proxy Service Unavailable**: Show user-friendly message with retry option
- **Eagle Service Unavailable**: Display message indicating Eagle is not running
- **Network Errors**: Generic network error with retry functionality
- **Data Validation Errors**: Log to console, show fallback UI

#### 4.2 Error Component
```typescript
function ErrorComponent({ error }: { error: Error }) {
  const isProxyUnavailable = error.message.includes('Failed to fetch');
  const isEagleUnavailable = error.message.includes('503');
  
  return (
    <div className={styles.errorContainer}>
      {isEagleUnavailable ? (
        <div>
          <h3>Eagle is not running</h3>
          <p>Please start Eagle application and try again.</p>
        </div>
      ) : isProxyUnavailable ? (
        <div>
          <h3>Connection Error</h3>
          <p>Cannot connect to proxy service. Please check if the proxy is running.</p>
        </div>
      ) : (
        <div>
          <h3>Failed to load folders</h3>
          <p>{error.message}</p>
        </div>
      )}
      <button onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}
```

#### 4.3 Loading Component
```typescript
function LoadingComponent() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} />
      <p>Loading folders...</p>
    </div>
  );
}
```

### 5. Data Fixtures Updates
Update test fixtures in component directories:
- `front/src/components/FolderList/__fixtures__/folders.ts`
- `front/src/components/ItemList/__fixtures__/images.ts`
- `front/src/data/stub-items.ts`

Change all `id` fields from `number` to `string`:
```typescript
// Before: id: 1
// After: id: "folder-1"
```

### 6. Component Updates
Update components that reference folder/item IDs:
- `front/src/components/FolderList/FolderItem.tsx`
- `front/src/components/FolderList/FolderList.tsx`
- `front/src/components/FolderList/utils.ts`
- `front/src/components/ItemList/ImageItem.tsx`
- `front/src/components/ItemList/ItemList.tsx`

Ensure all key props and ID comparisons use string values.

## Testing Strategy

### 1. API Layer Tests (`front/src/api/folders.test.ts`)

#### Success Scenarios
- **Test: fetchFolders returns parsed JSON**
  - Mock successful fetch response
  - Verify correct URL called (http://localhost:57821/folder/list)
  - Check JSON parsing works correctly
  - Confirm return type matches Folder[]

- **Test: Query options configuration**
  - Verify queryKey is ['folders']
  - Check staleTime is set to 5 minutes
  - Confirm retry logic for different error types

#### Error Scenarios
- **Test: Network failure handling**
  - Mock fetch rejection (network error)
  - Verify error is thrown with appropriate message
  - Check retry logic prevents infinite retries

- **Test: HTTP error responses**
  - Mock 404, 500, 503 responses from proxy
  - Verify appropriate error messages
  - Check error details preserved

- **Test: Invalid JSON response**
  - Mock response with malformed JSON
  - Verify JSON parsing error handled
  - Check error message is descriptive

### 2. Route Integration Tests (`front/src/routes/index.test.tsx`)

#### Data Loading Tests
- **Test: Route loader prefetches folders**
  - Mock queryClient.ensureQueryData
  - Verify foldersQueryOptions passed correctly
  - Check loader completes before component render

- **Test: Component receives folder data**
  - Mock successful query response
  - Verify useSuspenseQuery returns correct data
  - Check FolderList receives folders prop

#### Error Handling Tests
- **Test: Error component displays for API failures**
  - Mock API error scenarios
  - Verify ErrorComponent renders with correct props
  - Check appropriate error messages shown

- **Test: Loading component shows during fetch**
  - Mock delayed API response
  - Verify LoadingComponent renders initially
  - Check transitions to main component on success

### 3. Component Integration Tests

#### FolderList Component
- **Test: Renders live folder data correctly**
  - Provide API response data to component
  - Verify folder hierarchy displays properly
  - Check all folder properties rendered

- **Test: Handles empty folder list**
  - Pass empty array from API
  - Verify no errors thrown
  - Check appropriate empty state

#### Type Safety Tests
- **Test: String IDs work throughout component tree**
  - Use string IDs in test data
  - Verify no TypeScript errors
  - Check key props work with string values

### 4. End-to-End Scenarios

#### Happy Path
1. User navigates to home route
2. Route loader prefetches folder data
3. Proxy service fetches from Eagle API
4. Folder hierarchy displays correctly
5. User can interact with folders

#### Error Recovery
1. Eagle service is stopped
2. Error component shows appropriate message
3. User clicks retry button
4. Eagle service is started
5. Folders load successfully

## Performance Considerations

### 1. Query Configuration
- **Stale Time**: 5 minutes to balance freshness and performance
- **Cache Time**: Use TanStack Query defaults (5 minutes inactive)
- **Background Refetch**: Enable for data freshness
- **Retry Strategy**: Limited retries to prevent infinite loops

### 2. Loading Optimization
- **Suspense**: Use React Suspense for smooth loading states
- **Prefetching**: Route loader ensures data ready before render
- **Error Boundaries**: Prevent error propagation to parent routes

### 3. Bundle Size
- Tree shake unused TanStack Query features
- Lazy load error components if needed
- Minimize API layer dependencies

## Security Considerations

### 1. API Security
- Validate response structure before using
- Sanitize folder names before display
- Handle malicious data gracefully
- Log security-relevant errors

### 2. Error Information
- Don't expose sensitive proxy URLs in error messages
- Sanitize error messages shown to users
- Log full error details securely for debugging

## Migration Strategy

### Phase 1: Type Updates
1. Update `front/src/types/item.ts` (breaking change)
2. Update all fixtures with string IDs
3. Fix TypeScript errors in components
4. Run tests to ensure no regressions

### Phase 2: API Integration
1. Create `front/src/api/folders.ts`
2. Add unit tests for API layer
3. Update route with query integration
4. Test error scenarios

### Phase 3: Component Integration
1. Remove stubFolders usage
2. Update error handling components
3. Add loading states
4. Comprehensive testing

## Success Criteria
- [ ] All TypeScript errors resolved after ID type change
- [ ] Route displays live folder data from proxy service
- [ ] Error states handled gracefully with user-friendly messages  
- [ ] Loading states show appropriate feedback
- [ ] No breaking changes to ItemList component functionality
- [ ] All tests passing with >90% coverage
- [ ] Performance: Initial load < 2 seconds on local network
- [ ] Error recovery: Users can retry failed requests

## Future Enhancements
- Real-time folder updates with WebSocket connection
- Infinite scrolling for large folder lists
- Folder search and filtering capabilities
- Offline support with service worker caching
- Folder thumbnail previews
- Keyboard navigation support
- Accessibility improvements for screen readers