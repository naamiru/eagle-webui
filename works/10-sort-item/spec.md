# Item Sorting Implementation Specification

## Overview

Implement client-side sorting for folder items based on folder sort settings. The Eagle API `/api/item/list` doesn't respect `orderBy` parameter, requiring client-side implementation.

Reference: `eagle-api-spec.md` for detailed API behavior.

## Proxy Service Changes

### 1. Folder Interface Extensions

Add missing fields to proxy `Folder` interface:

```typescript
interface Folder {
  id: string;
  name: string;
  children: Folder[];
  items: Item[];
  coverImage?: Item;
  // Add these:
  orderBy: string;      // Default: "GLOBAL"
  sortIncrease: boolean; // Default: true
}
```

**Transform logic:**
- `orderBy`: Use Eagle folder's `orderBy` field, default to `"GLOBAL"` if missing
- `sortIncrease`: Use Eagle folder's `sortIncrease` field, default to `true` if missing

### 2. Item Interface Extensions

Add missing fields to proxy `Item` interface:

```typescript
interface Item {
  id: string;
  name: string;
  width: number;
  height: number;
  // Add these:
  size: number;           // File size in bytes
  btime: number;          // Birth/creation time (ms timestamp)
  mtime: number;          // Modification time (ms timestamp)
  ext: string;            // File extension
  star: number;           // Rating 1-5, default 0
  duration: number;       // Video duration in seconds, default 0
  manualOrder: number;    // Simplified order value
}
```

**Transform logic:**
- Most fields: Direct copy from Eagle API response
- `star`: Use `eagleItem.star || 0` (default 0 if missing)
- `duration`: Use `eagleItem.duration || 0` (default 0 if missing)
- `manualOrder`: Convert Eagle's complex `order` object:
  - If `eagleItem.order?.[folderId]` exists: parse as float
  - Else: use `eagleItem.btime`
  - This enables MANUAL sorting with single numeric field

## Frontend Changes

### 1. Query Function Enhancement

Modify `folderItemsQueryOptions` queryFn to add `globalOrder`:

```typescript
queryFn: async () => {
  const items = await fetchItems(1000, folderId);
  // Add globalOrder to preserve Eagle API response order
  // Response order is GLOBAL DESC, so reverse index
  return items.map((item, index) => ({
    ...item,
    globalOrder: items.length - index
  }));
}
```

**Rationale:**
- Eagle API returns items in GLOBAL DESC order
- `globalOrder` preserves this for GLOBAL sorting
- Higher `globalOrder` = earlier in Eagle's default order

### 2. Sorting Implementation

Add sorting logic in `FolderPage` component:

```typescript
const sortedItems = useMemo(() => {
  if (!items || !currentFolder) return items;
  
  const { orderBy, sortIncrease } = currentFolder;
  
  // Get comparison function based on sort method
  const getCompareFunction = () => {
    switch (orderBy) {
      case "MANUAL":
        return sortIncrease 
          ? (a, b) => a.manualOrder - b.manualOrder
          : (a, b) => b.manualOrder - a.manualOrder;
      case "NAME":
        return sortIncrease 
          ? (a, b) => a.name.localeCompare(b.name)
          : (a, b) => b.name.localeCompare(a.name);
      case "FILESIZE":
        return sortIncrease 
          ? (a, b) => a.size - b.size
          : (a, b) => b.size - a.size;
      case "RESOLUTION":
        return sortIncrease 
          ? (a, b) => (a.width * a.height) - (b.width * b.height)
          : (a, b) => (b.width * b.height) - (a.width * a.height);
      case "RATING":
        return sortIncrease 
          ? (a, b) => a.star - b.star
          : (a, b) => b.star - a.star;
      case "DURATION":
        return sortIncrease 
          ? (a, b) => a.duration - b.duration
          : (a, b) => b.duration - a.duration;
      case "EXT":
        return sortIncrease 
          ? (a, b) => a.ext.localeCompare(b.ext)
          : (a, b) => b.ext.localeCompare(a.ext);
      case "IMPORT":
      case "BTIME":
        return sortIncrease 
          ? (a, b) => a.btime - b.btime
          : (a, b) => b.btime - a.btime;
      case "MTIME":
        return sortIncrease 
          ? (a, b) => a.mtime - b.mtime
          : (a, b) => b.mtime - a.mtime;
      default:
        return sortIncrease 
          ? (a, b) => a.globalOrder - b.globalOrder
          : (a, b) => b.globalOrder - a.globalOrder;
    }
  };
  
  return [...items].sort(getCompareFunction());
}, [items, currentFolder]);
```

**Usage:**
- Replace `{items && <ItemList items={items} />}` 
- With `{sortedItems && <ItemList items={sortedItems} />}`

## Sort Method Details

| orderBy | Sorts By | Field Used | Notes |
|---------|----------|------------|-------|
| `GLOBAL` | Eagle default order | `globalOrder` | Preserved from API response |
| `MANUAL` | User arrangement | `manualOrder` | Compound: order[folderId] or btime |
| `NAME` | Filename | `name` | Locale-aware string comparison |
| `FILESIZE` | File size | `size` | Bytes |
| `RESOLUTION` | Pixel count | `width * height` | Total pixels |
| `RATING` | Star rating | `star` | 0-5 rating, default 0 |
| `DURATION` | Video length | `duration` | Seconds, default 0 for non-videos |
| `EXT` | File extension | `ext` | Locale-aware string comparison |
| `IMPORT`/`BTIME` | Import time | `btime` | Creation timestamp |
| `MTIME` | Modification | `mtime` | Modification timestamp |

## Implementation Notes

### Missing Values Handling
- **RATING**: Default `0` in proxy transform (no conditionals needed)
- **DURATION**: Default `0` in proxy transform (no conditionals needed)
- All fields are guaranteed to exist after proxy transformation

### Performance Considerations  
- Use `useMemo` to prevent unnecessary re-sorting
- Dependencies: `[items, currentFolder]`

### Testing Approach
1. Test each sort method with mixed data
2. Verify GLOBAL order preservation
3. Test ascending/descending directions
4. Test folders without orderBy/sortIncrease fields