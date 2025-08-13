# Library Path Discovery

## Purpose
Automatically discover Eagle's library path to serve image files from Eagle's local storage.

## Implementation Location
`app/api/library.ts` - `fetchLibraryPath()`

## Discovery Method

### 1. Get Sample Item
- Call Eagle API: `GET http://localhost:41595/api/item/list?limit=1`
- Extract first item's ID from response

### 2. Get Thumbnail Path
- Call Eagle API: `GET http://localhost:41595/api/item/thumbnail?id={itemId}`
- Response contains full filesystem path to thumbnail

### 3. Extract Library Path
Parse thumbnail path to extract library root:
- Thumbnail path format: `{libraryPath}/images/{itemId}.info/{filename}`
- Library path ends with `.library`

### Example
```
Thumbnail: /Users/name/Pictures/test.library/images/KBKE04X.info/image.jpg
Library:   /Users/name/Pictures/test.library
```

## Return Value
- Success: String containing absolute library path
- Failure: Throw error with descriptive message

## Error Handling
- No items in library
- API connection failure
- Invalid path format