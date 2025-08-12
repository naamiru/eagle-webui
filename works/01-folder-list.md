# Fetch and Display Folders from Eagle API

## Objective
Replace stub folder data with live data from Eagle API in the home route loader.

## Eagle API Endpoint
**GET** `http://localhost:41595/api/folder/list`

### Actual Response Structure
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "children": "Folder[]",
      "modificationTime": "number",
      "tags": "string[]",
      "extendTags": "any[]",
      "pinyin": "string",
      "password": "string",
      "passwordTips": "string",
      "orderBy": "string?",       // Optional - "MANUAL" | "GLOBAL" | "NAME" | "FILESIZE" | etc.
      "sortIncrease": "boolean?"  // Optional - true for ascending, false for descending
    }
  ]
}
```

**Note**: `orderBy` and `sortIncrease` are optional fields. When absent, folders use GLOBAL ordering (default response order).

## Implementation Requirements

### Location
`app/routes/home.tsx` - loader function

### Data Transformation
Map Eagle API response to app's `Folder` interface:
- `id` → `id` (direct mapping)
- `name` → `name` (direct mapping)  
- `children` → `children` (recursive mapping)
- `orderBy` → `orderBy` (direct mapping, use "GLOBAL" if absent)
- `sortIncrease` → `sortIncrease` (direct mapping, use true if absent)

### Error Handling
- Handle network failures gracefully
- Return empty array on error
- Log errors for debugging

### Notes
- Eagle runs locally on port 41595
- Actual API response may include additional fields not documented
- Nested folders require recursive transformation