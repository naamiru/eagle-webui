# Fetch and Display Items from Eagle API

## Objective
Replace stub item data with live data from Eagle API in the folder route loader.

## Eagle API Endpoint
**GET** `http://localhost:41595/api/item/list`

### Query Parameters
- `folders`: Comma-separated folder IDs to filter (required for folder view)
- `limit`: Maximum items to return (use 2000 to fetch all items)

### Response Structure
See `works/eagle-sorting-spec.md` for complete response format. Key fields:
```json
{
  "status": "success",
  "data": [
    {
      "id": "string",
      "name": "string",
      "size": "number",
      "btime": "number",
      "mtime": "number",
      "ext": "string",
      "width": "number",
      "height": "number",
      "star": "number?",        // Optional - rating 1-5
      "duration": "number?"     // Optional - video duration in seconds
    }
  ]
}
```

## Implementation Requirements

### Location
`app/api/item-list.ts` - `fetchFolderItems` function

### Data Transformation
Map Eagle API response to app's `Item` interface:
- `id` → `id` (direct mapping)
- `name` → `name` (direct mapping)
- `size` → `size` (direct mapping)
- `btime` → `btime` (direct mapping)
- `mtime` → `mtime` (direct mapping)
- `ext` → `ext` (direct mapping)
- `width` → `width` (direct mapping)
- `height` → `height` (direct mapping)
- `star` → `star` (use 0 if absent)
- `duration` → `duration` (use 0 if absent)

### Error Handling
- Let errors throw naturally
- React Router will handle error boundaries

### Notes
- Eagle runs locally on port 41595
- Client-side sorting will be required (API orderBy parameter is non-functional)
- Fetch all items at once with high limit to avoid unreliable offset pagination
