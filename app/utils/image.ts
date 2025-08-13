export function getImageUrl(itemId: string, libraryPath: string): string {
  const params = new URLSearchParams({
    id: itemId,
    libraryPath: libraryPath,
  });
  return `/api/items/image?${params.toString()}`;
}

export function getThumbnailUrl(itemId: string, libraryPath: string): string {
  const params = new URLSearchParams({
    id: itemId,
    libraryPath: libraryPath,
  });
  return `/api/items/thumbnail?${params.toString()}`;
}
