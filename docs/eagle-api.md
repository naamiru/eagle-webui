# Eagle API Documentation

Eagle provides a local HTTP API running on port 41595 for accessing library data and images.

**Tested with:** Eagle 4.0.0 Build7 (20241127)

## Base URL

```
http://localhost:41595
```

## Endpoints

### GET /api/folder/list

Returns all folders in the library with their hierarchy and sorting settings.

**Official Documentation:** https://api.eagle.cool/folder/list

**Request:**

```http
GET /api/folder/list
```

**Response:**

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
      "pinyin": "pinyin_name",
      "password": "",
      "passwordTips": "",
      "orderBy": "MANUAL",      // Optional - sorting method
      "sortIncrease": false     // Optional - sort direction
    }
  ]
}
```

**Fields:**

- `id` (string): Unique folder identifier
- `name` (string): Display name
- `description` (string): Folder description
- `children` (array): Array of child folders with same structure
- `modificationTime` (number): Unix timestamp in milliseconds
- `tags` (array): Tags associated with folder
- `extendTags` (array): Extended tags
- `pinyin` (string): Pinyin representation of name
- `password` (string): Folder password (encrypted or empty)
- `passwordTips` (string): Password hint
- `orderBy` (string, optional): Sort method - `GLOBAL`, `MANUAL`, `IMPORT`, `MTIME`, `BTIME`, `NAME`, `EXT`, `FILESIZE`, `RESOLUTION`, `RATING`, `DURATION`, `RANDOM`
- `sortIncrease` (boolean, optional): Sort direction - `true` for ascending, `false` for descending

### GET /api/item/list

Returns items (images/videos) with optional filtering.

**Official Documentation:** https://api.eagle.cool/item/list

**Request:**

```http
GET /api/item/list?folders=FOLDER_ID&limit=200
```

**Query Parameters:**

- `limit` (number): Number of items to return (default: 200)
- `offset` (number): Starting position (**unreliable** - may skip items, use higher limit instead)
- `folders` (string): Comma-separated folder IDs to filter
- `tags` (string): Comma-separated tags to filter
- `ext` (string): File extension filter
- `keyword` (string): Search keyword
- `orderBy` (string): **UNRELIABLE** - parameter changes order but not always as expected

**Response:**

```json
{
  "status": "success",
  "data": [
    {
      "id": "ITEM_ID",
      "name": "filename.png",
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

**Fields:**

- `id` (string): Unique item identifier
- `name` (string): Filename without path
- `size` (number): File size in bytes
- `btime` (number): Creation/import time (Unix timestamp, milliseconds)
- `mtime` (number): File modification time (Unix timestamp, milliseconds)
- `ext` (string): File extension (lowercase, no dot)
- `tags` (array): Array of tag strings
- `folders` (array): Array of folder IDs containing this item
- `isDeleted` (boolean): Deletion status
- `url` (string): External URL if linked
- `annotation` (string): User notes/description
- `modificationTime` (number): Last modified in Eagle (Unix timestamp, milliseconds)
- `width` (number): Image/video width in pixels
- `height` (number): Image/video height in pixels
- `lastModified` (number): File system modification time
- `star` (number, optional): Rating value 1-5
- `duration` (number, optional): Video duration in seconds (videos only)
- `order` (object, optional): Manual sort positions per folder
  - Keys are folder IDs
  - Values are high-precision timestamp strings for ordering
- `palettes` (array): Color palette data

**Important Notes:**

- Without `orderBy` parameter, items are returned in GLOBAL ascending order
- The `orderBy` parameter may change order but behavior is inconsistent
- The `offset` parameter is unreliable and may skip items
- Optional fields (`star`, `duration`, `order`) may not be present on all items

### GET /api/item/thumbnail

Returns the file path of the specified item's thumbnail.

**Official Documentation:** https://api.eagle.cool/item/thumbnail

**Request:**

```http
GET /api/item/thumbnail?id=ITEM_ID
```

**Query Parameters:**

- `id` (string, required): Item ID to get thumbnail path for

**Response:**

```json
{
  "status": "success",
  "data": "/path/to/library/images/ITEM_ID.info/filename_thumbnail.png"
}
```

**Fields:**

- `status` (string): Request status - `success` or `error`
- `data` (string): Full filesystem path to the thumbnail or original image file (falls back to original if thumbnail doesn't exist)

## File Access

Eagle stores files in a structured directory format:

```
LIBRARY_PATH/
├── images/
│   └── ITEM_ID.info/
│       ├── metadata.json
│       ├── FILENAME.ext           # Original file
│       └── FILENAME_thumbnail.png  # Thumbnail (may not exist for some items)
```

To access files directly:

1. Get the library path from Eagle
2. Navigate to `images/ITEM_ID.info/`
3. Access the original file or thumbnail (if available)

## Sorting Implementation

Since the API's `orderBy` parameter is non-functional, sorting must be implemented client-side:

### Sort Methods

| Method       | Sort By           | Field Used                              | Default Direction |
| ------------ | ----------------- | --------------------------------------- | ----------------- |
| `GLOBAL`     | Default order     | API response order                      | Ascending         |
| `MANUAL`     | User arrangement  | `order[folderId]` or `modificationTime` | Newest first\*    |
| `IMPORT`     | Import time       | `btime`                                 | Newest first\*    |
| `MTIME`      | Modification time | `mtime`                                 | Newest first\*    |
| `BTIME`      | Creation time     | `btime`                                 | Newest first\*    |
| `NAME`       | Filename          | `name`                                  | A-Z               |
| `EXT`        | Extension         | `ext`                                   | A-Z               |
| `FILESIZE`   | Size              | `size`                                  | Smallest first    |
| `RESOLUTION` | Pixel count       | `width * height`                        | Smallest first    |
| `RATING`     | Star rating       | `star`                                  | Lowest first      |
| `DURATION`   | Length            | `duration`                              | Shortest first    |
| `RANDOM`     | Random order      | Random shuffle                          | N/A               |

\*These methods use reversed logic where `sortIncrease=true` shows newest/highest first

### Manual Ordering Logic

For `MANUAL` sorting:

1. Check if item has `order[folderId]` value
2. If not present, use `modificationTime` as fallback
3. Both values are timestamps and directly comparable

### Name Sorting Logic (Eagle Custom)

For `NAME` sorting, Eagle uses a custom algorithm:

1. Split filename into segments of numbers ([0-9]) and non-numbers
2. Parse number segments as base 10 integers (e.g., "00-23c045" becomes [0, "-", 23, "c", 45])
3. Compare arrays element by element:
   - Numbers are compared numerically
   - Strings are compared lexicographically
   - Numbers sort before strings at the same position
