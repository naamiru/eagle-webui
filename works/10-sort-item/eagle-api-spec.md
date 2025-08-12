# Eagle API Specification

## API Endpoints

### GET /api/folder/list

Returns all folders in the library with their settings and hierarchy.

**Response Structure:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "FOLDER_ID",
      "name": "Folder Name",
      "description": "",
      "children": [...],
      "modificationTime": 1743125347821,
      "tags": [],
      "extendTags": [],
      "pinyin": "PINYIN_NAME",
      "password": "",
      "passwordTips": "",
      "orderBy": "MANUAL",      // Optional - sorting method
      "sortIncrease": false     // Optional - sort direction
    }
  ]
}
```

**Folder Fields:**
- `id`: Unique folder identifier
- `name`: Display name
- `description`: Folder description
- `children`: Array of child folders (same structure)
- `modificationTime`: Unix timestamp (milliseconds)
- `tags`: Array of tags
- `extendTags`: Extended tags
- `pinyin`: Pinyin representation of name
- `password`: Folder password (encrypted/empty)
- `passwordTips`: Password hint
- `orderBy`: Sort method (optional) - see Sort Methods section
- `sortIncrease`: Sort direction (optional)
  - `true`: Ascending order
  - `false`: Descending order

### GET /api/item/list

Returns items (images/videos) with optional filtering.

**Query Parameters:**
- `limit`: Number of items to return (default: 200)
- `offset`: Starting position (unreliable - may skip items)
- `folders`: Comma-separated folder IDs to filter
- `tags`: Comma-separated tags to filter
- `ext`: File extension filter
- `keyword`: Search keyword
- `orderBy`: **NOT FUNCTIONAL** - parameter is accepted but ignored

**Response Structure:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "ITEM_ID",
      "name": "filename",
      "size": 1217099,
      "btime": 1753679416615,
      "mtime": 1753679417077,
      "ext": "png",
      "tags": ["tag1", "tag2"],
      "folders": ["FOLDER_ID"],
      "isDeleted": false,
      "url": "",
      "annotation": "Description text",
      "modificationTime": 1753679417087,
      "height": 1216,
      "width": 832,
      "lastModified": 1753679417226,
      "star": 3,                // Optional - rating (1-5)
      "duration": 4.283333,     // Optional - video duration in seconds
      "order": {                // Optional - manual order positions
        "FOLDER_ID": "1741805527397.12674753289473684207"
      },
      "palettes": [...]
    }
  ]
}
```

**Item Fields:**
- `id`: Unique item identifier
- `name`: Filename without path
- `size`: File size in bytes
- `btime`: Birth/creation time (Unix timestamp, milliseconds)
- `mtime`: Modification time (Unix timestamp, milliseconds)
- `ext`: File extension (lowercase, no dot)
- `tags`: Array of tag strings
- `folders`: Array of folder IDs containing this item
- `isDeleted`: Deletion status
- `url`: External URL if linked
- `annotation`: User notes/description
- `modificationTime`: Last modified in Eagle (Unix timestamp, milliseconds)
- `width`: Image/video width in pixels
- `height`: Image/video height in pixels
- `lastModified`: File system modification time
- `star`: Rating value 1-5 (optional)
- `duration`: Video duration in seconds (optional, videos only)
- `order`: Manual sort positions per folder (optional)
  - Object with folder IDs as keys
  - Values are high-precision timestamp strings
- `palettes`: Color palette data

## Sort Methods

Folders can specify `orderBy` to determine item display order:

| Method | Sort By | Field Used | Notes |
|--------|---------|------------|-------|
| `GLOBAL` | Default order | Response order | Default when `orderBy` absent |
| `MANUAL` | User arrangement | `order[folderId]` or `btime` | Compound sort |
| `IMPORT` | Import time | `btime` | When added to Eagle |
| `MTIME` | Modification time | `mtime` | File modification |
| `BTIME` | Creation time | `btime` | Same as IMPORT |
| `NAME` | Filename | `name` | Alphanumeric |
| `EXT` | Extension | `ext` | File type |
| `FILESIZE` | Size | `size` | In bytes |
| `RESOLUTION` | Pixel count | `width * height` | Total pixels |
| `RATING` | Star rating | `star` | 1-5, optional field |
| `DURATION` | Length | `duration` | Videos only, in seconds |

## Important API Behaviors

### Item List Ordering
- **Default behavior**: Returns items in GLOBAL descending order
- **orderBy parameter**: Accepted but **NOT FUNCTIONAL**
- **Client-side sorting required**: All sorting must be implemented client-side
- **Preserve response order**: Required for GLOBAL sorting

### Manual Ordering Logic
MANUAL uses compound sorting:
1. If item has `order[folderId]`: Use that timestamp value
2. Otherwise: Use `btime` as fallback
3. Both are timestamps and directly comparable

### Offset Parameter Issues
The `offset` parameter in `/api/item/list` is unreliable:
- May return empty results even when more items exist
- May skip items unexpectedly
- **Recommendation**: Fetch all items with higher `limit` instead of pagination

### Optional Fields
Not all items have all fields:
- `star`: Only present if item has been rated
- `duration`: Only present for video files
- `order`: Only present if item was manually positioned in folders

## Example API Calls

```bash
# Get all folders
GET http://localhost:41595/api/folder/list

# Get items from specific folder
GET http://localhost:41595/api/item/list?folders=FOLDER_ID&limit=1000

# Get items with multiple filters
GET http://localhost:41595/api/item/list?folders=ID1,ID2&tags=tag1,tag2&ext=png
```

## Image Access

Images and thumbnails are served directly:

```bash
# Original image
GET http://localhost:41595/images/ITEM_ID.EXT

# Thumbnail
GET http://localhost:41595/thumbnail/ITEM_ID.EXT
```