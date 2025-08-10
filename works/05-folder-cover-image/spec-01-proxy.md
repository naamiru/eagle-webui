# Proxy Service Implementation: Folder Cover Images

## Overview

Enhance the existing `/folder/list` endpoint to include cover images for folders that contain images.

## Current State Analysis

**Existing Implementation** (`proxy/src/folder.ts`):
- Endpoint: `GET /folder/list`
- Calls Eagle API: `GET http://localhost:41595/api/folder/list`
- Returns: `Folder[]` with `id`, `name`, `children[]`, `items[]` (always empty)
- Missing: Eagle's `imageCount`, `descendantImageCount` metadata

## Required Changes

### 1. Interface Updates

**EagleFolder Interface**:
- Add `imageCount: number` - direct child images
- Add `descendantImageCount: number` - total images in subtree
- Keep existing `id`, `name`, `children?`

**Folder Interface**:
- Add `coverImage?: Item` - representative image for folder
- Keep existing `id`, `name`, `children`, `items`

### 2. Cover Image Logic

**Implementation Strategy**:
1. Fetch folder list from Eagle API (existing logic)
2. For each folder with `descendantImageCount > 0`:
   - Determine target folder IDs for item search
   - Fetch single item using item list API
   - Transform Eagle item to `Item` format
   - Attach as `coverImage` property
3. Return enhanced folder list

**Target Folder Selection**:
- **Priority 1**: If `imageCount > 0` → search current folder only
- **Priority 2**: If `imageCount = 0` but `descendantImageCount > 0` → search all descendant folders
- **No images**: Leave `coverImage` undefined

**Descendant Folder Collection**:
- Implement recursive function `collectDescendantIds(folder: EagleFolder): string[]`
- Traverse `children` array depth-first
- Return flat array of all descendant folder IDs

### 3. Item Fetching

**API Call**:
- Endpoint: `GET http://localhost:41595/api/item/list`
- Query parameters:
  - `limit=1` (single representative image)
  - `folders={folder_id1,folder_id2,...}` (comma-separated)
- Use existing `callEagleApi<EagleItem[]>()` utility

**Error Handling**:
- Empty response → skip cover image (no crash)
- API error → log warning, continue processing other folders
- Invalid item data → skip cover image

**Item Transformation**:
- Use existing `transformEagleItem()` function from `item.ts`
- Ensure consistent `Item` interface structure

### 4. Performance Considerations

**Batching Strategy**:
- Process folders sequentially (avoid overwhelming Eagle API)
- Consider implementing parallel processing with rate limiting if needed
- Skip item fetching for folders with `descendantImageCount = 0`

**Caching**:
- No caching required (folder structure changes infrequently)
- Rely on frontend query caching via TanStack Query

## Testing Strategy

### Unit Tests: `proxy/src/folder.test.ts`

#### Test Suite: Enhanced Folder Processing

**1. Cover Image Assignment**:
- ✅ Folder with direct images gets cover image
- ✅ Folder with only descendant images gets cover image  
- ✅ Folder with no images has undefined cover image
- ✅ Empty descendant list handled gracefully

**2. Descendant Collection**:
- ✅ Single level descendants collected correctly
- ✅ Multi-level nested descendants collected correctly
- ✅ Empty children array handled gracefully
- ✅ Circular reference protection (edge case)

**3. Item Fetching Integration**:
- ✅ Successful item fetch returns transformed item
- ✅ Empty item response handled gracefully
- ✅ Eagle API error handled gracefully
- ✅ Invalid item data handled gracefully

**4. API Query Construction**:
- ✅ Single folder ID creates correct query string
- ✅ Multiple folder IDs create comma-separated query string
- ✅ Special characters in folder IDs handled correctly

**5. Error Resilience**:
- ✅ One folder's item fetch failure doesn't affect others
- ✅ Invalid Eagle folder data doesn't crash processing
- ✅ Network timeout handled gracefully

#### Test Suite: Backward Compatibility

**1. Existing Behavior Preserved**:
- ✅ Folder transformation maintains existing structure
- ✅ No cover image folders work exactly as before
- ✅ Nested folder hierarchy preserved
- ✅ Response format matches existing `Folder[]` interface

#### Mock Data Requirements

**Eagle API Responses**:
- Folder list with mixed `imageCount`/`descendantImageCount` values
- Item list responses (success, empty, error cases)
- Nested folder structures (2-3 levels deep)

**Test Utilities**:
- Mock `callEagleApi` with configurable responses
- Helper functions for creating test folder structures
- Assertion helpers for validating cover image assignment

## Integration Points

**Dependencies**:
- Existing `callEagleApi()` utility
- Existing `transformEagleItem()` from `item.ts`
- Existing Fastify route registration

**No Breaking Changes**:
- Endpoint URL unchanged: `GET /folder/list`
- Response structure extended (additive only)
- Frontend compatibility maintained

## Success Criteria

- [ ] All folders with images have `coverImage` property set
- [ ] Folders without images have `coverImage: undefined`
- [ ] Cover image selection prioritizes direct children over descendants
- [ ] API errors don't crash the endpoint
- [ ] Response time remains acceptable (< 2s for typical libraries)
- [ ] All unit tests pass with >95% coverage
- [ ] Backward compatibility maintained