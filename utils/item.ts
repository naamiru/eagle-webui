export function getImageUrl(itemId: string): string {
  const params = new URLSearchParams({
    id: itemId,
  });
  return `/api/items/image?${params.toString()}`;
}

export function getThumbnailUrl(itemId: string): string {
  const params = new URLSearchParams({
    id: itemId,
  });
  return `/api/items/thumbnail?${params.toString()}`;
}
