import type { Item } from '@/app/types/models';
import { EAGLE_API_URL } from '@/app/constants';

interface EagleItemResponse {
  id: string;
  name: string;
  width: number;
  height: number;
  size: number;
  btime: number;
  mtime: number;
  ext: string;
  star?: number;
  duration?: number;
  tags?: string[];
  folders?: string[];
  isDeleted?: boolean;
  url?: string;
  annotation?: string;
  modificationTime?: number;
  lastModified?: number;
  order?: Record<string, string>;
  palettes?: unknown[];
}

interface EagleItemApiResponse {
  status: string;
  data: EagleItemResponse[];
}

export async function fetchFolderItems(
  folderId: string,
  limit = 2000
): Promise<Item[]> {
  const response = await fetch(
    `${EAGLE_API_URL}/api/item/list?folders=${folderId}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch items: ${response.statusText}`);
  }

  const json: EagleItemApiResponse = await response.json();

  if (json.status !== 'success') {
    throw new Error('Eagle API returned error status');
  }

  return json.data.map((item, index) => {
    let manualOrder = item.modificationTime || item.mtime;
    if (item.order?.[folderId]) {
      const parsed = parseFloat(item.order[folderId]);
      if (!Number.isNaN(parsed)) {
        manualOrder = parsed;
      }
    }

    return {
      id: item.id,
      name: item.name,
      width: item.width,
      height: item.height,
      size: item.size,
      btime: item.btime,
      mtime: item.mtime,
      ext: item.ext,
      star: item.star || 0,
      duration: item.duration || 0,
      globalOrder: index + 1,
      manualOrder,
    };
  });
}