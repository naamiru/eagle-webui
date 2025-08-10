# Feature: Folder Page

Display folder-specific content with the same layout as the index page, showing subfolders and items within the selected folder.

## Overview

Currently, folders in the folder list are not navigable. This feature adds folder navigation by creating dedicated folder pages that display:
- **Subfolders** section (title: "サブフォルダー") - Child folders of the current folder
- **Items** section (title: "内容") - Images directly within the current folder

## Implementation

### Proxy Service (`/proxy`)

**Enhance item list endpoint** (`GET /item/list`):

1. **Add query parameter**: 
   - `folder?: string` - Filter items by specific folder ID
   - Pass through to Eagle API as `folders` parameter

2. **Eagle API integration**:
   - Endpoint: `GET http://localhost:41595/api/item/list?folders={folderId}&limit={limit}`
   - Transform Eagle response to existing `Item` interface
   - Maintain existing error handling and logging

### Frontend (`/front`)

**Create folder page route** (`/front/src/routes/folders/$folderId.tsx`):

1. **Route structure**:
   - URL: `/folders/{folderId}`
   - Reuse existing layout pattern from index page
   - Add route parameter validation and error handling

2. **API layer** (`/front/src/api/items.ts`):
   - Extend `fetchItems()` to accept optional `folderId` parameter
   - Create `folderItemsQueryOptions(folderId: string, limit?: number)`

3. **Component integration**:
   - Use existing `FolderList` component for subfolders
   - Use existing `ItemList` component for folder items
   - Filter subfolders from full folder tree based on current folder
   - Apply same section titles and styling as index page

**Update folder navigation** (`/front/src/components/FolderList/FolderItem.tsx`):

1. **Add navigation**: Wrap folder items in `Link` components
2. **Route**: Link to `/folders/{folder.id}`
3. **Maintain existing styling and interaction**

## Data Flow

1. User clicks folder in folder list → Navigate to `/folders/{folderId}`
2. Route loader:
   - Fetch all folders (for subfolder filtering)
   - Fetch folder-specific items: `GET /item/list?folder={folderId}`
3. Component renders:
   - Filter and display child folders in "サブフォルダー" section
   - Display folder items in "内容" section

## Success Criteria

- Clicking folders navigates to dedicated folder pages
- Folder pages show same layout as index page
- Subfolders section displays direct children only
- Items section shows images from current folder only
- Navigation preserves existing folder hierarchy
- Error handling for invalid folder IDs