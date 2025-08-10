# Feature: Folder Cover Images

Display representative thumbnail images for folders in the folder list.

## Overview

Currently folders show gray placeholders. This feature adds cover images by selecting a representative image from each folder's contents.

## Implementation

### Proxy Service (`/proxy`)

**Enhance folder list endpoint** (`GET /folder/list`):

1. **Extend Folder interface** - Add optional `coverImage?: Item` property
2. **Post-process folders** after fetching from Eagle API:
   - Check folder's `descendantImageCount` (from Eagle response)
   - If > 0, fetch a representative image using item list API
   - Attach image as `coverImage` property

**Cover image selection logic**:
- **No descendants**: No cover image (keep `coverImage` undefined) 
- **Has child images**: Fetch from direct children (`folders=FOLDER_ID`)
- **Has descendant images only**: Fetch from all descendants (`folders=DESCENDANT1_ID,DESCENDANT2_ID,...`)

**Item fetching**:
- **Endpoint**: `GET http://localhost:41595/api/item/list?limit=1&folders={folder_ids}`
- Use first returned item as cover image
- Transform to match existing `Item` interface

### Frontend (`/front`)

**Update FolderItem component**:
- Replace `getFirstFolderImage(folder)` logic with `folder.coverImage`
- Display `folder.coverImage` thumbnail if present
- Keep existing gray placeholder when `coverImage` is undefined
- No changes to styling or layout

## Success Criteria

- [ ] Folders with images show representative thumbnails
- [ ] Folders without images show gray placeholders (unchanged behavior)  
- [ ] No performance impact on folder loading
- [ ] Existing folder navigation remains functional
